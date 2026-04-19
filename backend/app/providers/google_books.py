import httpx

from .. import schemas

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes"


def parse_volume(item: dict, already_in_library: bool = False) -> schemas.BookSearchResult | None:
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


async def request_books(
    client: httpx.AsyncClient,
    params: dict,
) -> list[schemas.BookSearchResult]:
    response = await client.get(GOOGLE_BOOKS_URL, params=params)
    response.raise_for_status()
    data = response.json()
    return [
        result
        for result in (parse_volume(item) for item in data.get("items", []))
        if result is not None
    ]
