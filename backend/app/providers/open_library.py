import httpx

from .. import schemas

OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"


def parse_doc(
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


async def request_books(
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
        for result in (parse_doc(doc) for doc in data.get("docs", []))
        if result is not None
    ]
