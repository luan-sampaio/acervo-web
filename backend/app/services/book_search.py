import httpx
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import settings
from ..providers import google_books, open_library


class ExternalBookSearchError(Exception):
    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail


async def search_external_books(
    q: str,
    user_id: int,
    db: Session,
) -> list[schemas.BookSearchResult]:
    parsed_results = await _fetch_external_results(q)
    return _mark_existing_books(parsed_results, user_id, db)


async def _fetch_external_results(q: str) -> list[schemas.BookSearchResult]:
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
            return await google_books.request_books(client, params)
        except httpx.HTTPStatusError as exc:
            return await _handle_google_status_error(client, q, params, exc)
        except httpx.RequestError:
            try:
                return await open_library.request_books(client, q)
            except (httpx.HTTPStatusError, httpx.RequestError) as exc:
                raise ExternalBookSearchError(
                    "Nao foi possivel consultar os provedores de busca externa",
                ) from exc


async def _handle_google_status_error(
    client: httpx.AsyncClient,
    q: str,
    params: dict,
    exc: httpx.HTTPStatusError,
) -> list[schemas.BookSearchResult]:
    google_status = exc.response.status_code

    if google_status in {400, 401, 403} and "key" in params:
        fallback_params = {key: value for key, value in params.items() if key != "key"}
        try:
            return await google_books.request_books(client, fallback_params)
        except httpx.HTTPStatusError as fallback_exc:
            return await _fallback_to_open_library(
                client,
                q,
                fallback_exc.response.status_code,
            )
        except httpx.RequestError as request_exc:
            try:
                return await open_library.request_books(client, q)
            except (httpx.HTTPStatusError, httpx.RequestError):
                raise ExternalBookSearchError(
                    "Nao foi possivel conectar ao Google Books",
                ) from request_exc

    return await _fallback_to_open_library(client, q, google_status)


async def _fallback_to_open_library(
    client: httpx.AsyncClient,
    q: str,
    google_status: int,
) -> list[schemas.BookSearchResult]:
    try:
        return await open_library.request_books(client, q)
    except (httpx.HTTPStatusError, httpx.RequestError) as exc:
        if google_status == 429:
            raise ExternalBookSearchError(
                "Google Books indisponivel no momento por limite de requisicoes",
            ) from exc
        raise ExternalBookSearchError(
            f"Erro ao consultar Google Books: {google_status}",
        ) from exc


def _mark_existing_books(
    parsed_results: list[schemas.BookSearchResult],
    user_id: int,
    db: Session,
) -> list[schemas.BookSearchResult]:
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
                    models.Book.user_id == user_id,
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
                .filter(models.Book.user_id == user_id)
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
