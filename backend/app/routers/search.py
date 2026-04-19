from fastapi import APIRouter, Depends, HTTPException, Query, status
import httpx
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import database
from .. import models, schemas
from ..config import settings
from ..routers.auth import get_current_user

router = APIRouter(prefix="/search", tags=["Search"])

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes"
OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"


def _parse_volume(item: dict, already_in_library: bool = False) -> schemas.BookSearchResult | None:
    info = item.get("volumeInfo", {})
    titulo = info.get("title", "").strip()
    autores = info.get("authors", [])
    if not titulo or not autores:
        return None

    isbn = None
    for identifier in info.get("industryIdentifiers", []):
        if identifier.get("type") in ("ISBN_13", "ISBN_10"):
            isbn = identifier["identifier"]
            if identifier["type"] == "ISBN_13":
                break

    cover_url = None
    image_links = info.get("imageLinks", {})
    raw = image_links.get("thumbnail") or image_links.get("smallThumbnail")
    if raw:
        cover_url = raw.replace("http://", "https://")

    descricao = info.get("description", "")
    if descricao and len(descricao) > 500:
        descricao = descricao[:497] + "..."

    return schemas.BookSearchResult(
        external_id=item["id"],
        titulo=titulo,
        autor=", ".join(autores),
        isbn=isbn,
        cover_url=cover_url,
        descricao=descricao or None,
        already_in_library=already_in_library,
    )


def _parse_open_library_doc(
    doc: dict,
    already_in_library: bool = False,
) -> schemas.BookSearchResult | None:
    titulo = (doc.get("title") or "").strip()
    autores = [autor.strip() for autor in doc.get("author_name", []) if autor and autor.strip()]
    external_id = (doc.get("key") or "").strip()
    if not titulo or not autores or not external_id:
        return None

    isbn = next((value for value in doc.get("isbn", []) if value), None)
    cover_id = doc.get("cover_i")
    cover_url = None
    if cover_id:
        cover_url = f"https://covers.openlibrary.org/b/id/{cover_id}-M.jpg"

    return schemas.BookSearchResult(
        external_id=external_id.removeprefix("/works/"),
        titulo=titulo,
        autor=", ".join(autores),
        isbn=isbn,
        cover_url=cover_url,
        descricao=None,
        already_in_library=already_in_library,
    )


async def _request_google_books(
    client: httpx.AsyncClient,
    params: dict,
) -> httpx.Response:
    response = await client.get(GOOGLE_BOOKS_URL, params=params)
    response.raise_for_status()
    return response


async def _request_open_library(
    client: httpx.AsyncClient,
    q: str,
) -> list[schemas.BookSearchResult]:
    response = await client.get(
        OPEN_LIBRARY_SEARCH_URL,
        params={
            "title": q,
            "language": "por",
            "limit": 12,
        },
    )
    response.raise_for_status()
    data = response.json()
    return [
        result
        for result in (_parse_open_library_doc(doc) for doc in data.get("docs", []))
        if result is not None
    ]


@router.get("", response_model=list[schemas.BookSearchResult])
async def search_books(
    q: str = Query(min_length=2, max_length=255),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    params = {
        "q": q,
        "maxResults": 12,
        "langRestrict": "pt",
        "printType": "books",
    }
    if settings.GOOGLE_BOOKS_API_KEY:
        params["key"] = settings.GOOGLE_BOOKS_API_KEY

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await _request_google_books(client, params)
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code in {400, 401, 403} and "key" in params:
                fallback_params = {k: v for k, v in params.items() if k != "key"}
                try:
                    response = await _request_google_books(client, fallback_params)
                except httpx.HTTPStatusError as fallback_exc:
                    google_status = fallback_exc.response.status_code
                    try:
                        parsed_results = await _request_open_library(client, q)
                    except (httpx.HTTPStatusError, httpx.RequestError):
                        if google_status == 429:
                            raise HTTPException(
                                status_code=status.HTTP_502_BAD_GATEWAY,
                                detail="Google Books indisponivel no momento por limite de requisicoes",
                            )
                        raise HTTPException(
                            status_code=status.HTTP_502_BAD_GATEWAY,
                            detail=f"Erro ao consultar Google Books: {google_status}",
                        )
                except httpx.RequestError:
                    try:
                        parsed_results = await _request_open_library(client, q)
                    except (httpx.HTTPStatusError, httpx.RequestError):
                        raise HTTPException(
                            status_code=status.HTTP_502_BAD_GATEWAY,
                            detail="Nao foi possivel conectar ao Google Books",
                        )
            else:
                google_status = exc.response.status_code
                try:
                    parsed_results = await _request_open_library(client, q)
                except (httpx.HTTPStatusError, httpx.RequestError):
                    if google_status == 429:
                        raise HTTPException(
                            status_code=status.HTTP_502_BAD_GATEWAY,
                            detail="Google Books indisponivel no momento por limite de requisicoes",
                        )
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Erro ao consultar Google Books: {google_status}",
                    )
        except httpx.RequestError:
            try:
                parsed_results = await _request_open_library(client, q)
            except (httpx.HTTPStatusError, httpx.RequestError):
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Nao foi possivel consultar os provedores de busca externa",
                )
        else:
            data = response.json()
            parsed_results = [
                result
                for result in (_parse_volume(item) for item in data.get("items", []))
                if result is not None
            ]

    external_ids = [result.external_id for result in parsed_results if result.external_id]
    normalized_pairs = [
        (result.titulo.strip().lower(), result.autor.strip().lower())
        for result in parsed_results
        if result.titulo and result.autor
    ]

    existing_external_ids = set()
    if external_ids:
        existing_external_ids = {
            external_id
            for (external_id,) in (
                db.query(models.Book.external_id)
                .filter(
                    models.Book.user_id == current_user.id,
                    models.Book.external_id.in_(external_ids),
                )
                .all()
            )
            if external_id
        }

    existing_title_author_pairs = set()
    if normalized_pairs:
        existing_title_author_pairs = {
            (titulo, autor)
            for titulo, autor in (
                db.query(
                    func.lower(func.btrim(models.Book.titulo)),
                    func.lower(func.btrim(models.Book.autor)),
                )
                .filter(models.Book.user_id == current_user.id)
                .all()
            )
            if (titulo, autor) in normalized_pairs
        }

    results = []
    for result in parsed_results:
        normalized_pair = (result.titulo.strip().lower(), result.autor.strip().lower())
        results.append(
            result.model_copy(
                update={
                    "already_in_library": (
                        result.external_id in existing_external_ids
                        or normalized_pair in existing_title_author_pairs
                    )
                }
            )
        )

    return results
