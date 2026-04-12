from fastapi import APIRouter, Depends, HTTPException, Query, status
import httpx

from .. import models, schemas
from ..config import settings
from ..routers.auth import get_current_user

router = APIRouter(prefix="/search", tags=["Search"])

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes"


def _parse_volume(item: dict) -> schemas.BookSearchResult | None:
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
    )


@router.get("", response_model=list[schemas.BookSearchResult])
async def search_books(
    q: str = Query(min_length=2, max_length=255),
    _: models.User = Depends(get_current_user),
):
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
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Erro ao consultar Google Books: {exc.response.status_code}",
            )
        except httpx.RequestError:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Não foi possível conectar ao Google Books",
            )

    data = response.json()
    items = data.get("items", [])
    results = [_parse_volume(item) for item in items]
    return [r for r in results if r is not None]
