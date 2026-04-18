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

    published_date = info.get("publishedDate")
    publisher = info.get("publisher")
    page_count = info.get("pageCount")
    language = info.get("language")

    return schemas.BookSearchResult(
        external_id=item["id"],
        titulo=titulo,
        autor=", ".join(autores),
        isbn=isbn,
        cover_url=cover_url,
        descricao=descricao or None,
        published_date=published_date or None,
        publisher=publisher or None,
        page_count=page_count if isinstance(page_count, int) and page_count > 0 else None,
        language=language or None,
        already_in_library=already_in_library,
    )


@router.get("", response_model=list[schemas.BookSearchResult])
async def search_books(
    q: str = Query(min_length=2, max_length=255),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not settings.GOOGLE_BOOKS_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Busca externa indisponivel: configure GOOGLE_BOOKS_API_KEY no backend",
        )

    params = {
        "q": q,
        "maxResults": 12,
        "langRestrict": "pt",
        "printType": "books",
        "key": settings.GOOGLE_BOOKS_API_KEY,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(GOOGLE_BOOKS_URL, params=params)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code in {400, 401, 403}:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Google Books recusou a requisicao: verifique a chave da API",
                )
            if exc.response.status_code == 429:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Google Books indisponivel no momento por limite de requisicoes",
                )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Erro ao consultar Google Books: {exc.response.status_code}",
            )
        except httpx.RequestError:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Nao foi possivel conectar ao Google Books",
            )

    data = response.json()
    items = data.get("items", [])
    external_ids = [item.get("id") for item in items if item.get("id")]
    normalized_pairs = []

    for item in items:
        info = item.get("volumeInfo", {})
        titulo = info.get("title", "").strip()
        autores = info.get("authors", [])
        if titulo and autores:
            normalized_pairs.append((titulo.lower(), ", ".join(autores).strip().lower()))

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
    for item in items:
        info = item.get("volumeInfo", {})
        titulo = info.get("title", "").strip()
        autores = info.get("authors", [])
        normalized_pair = None
        if titulo and autores:
            normalized_pair = (titulo.lower(), ", ".join(autores).strip().lower())

        results.append(
            _parse_volume(
                item,
                already_in_library=(
                    item.get("id") in existing_external_ids
                    or normalized_pair in existing_title_author_pairs
                ),
            )
        )

    return [r for r in results if r is not None]
