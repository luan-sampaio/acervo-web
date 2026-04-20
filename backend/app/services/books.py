from typing import Literal

from sqlalchemy import and_, func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from .book_identity import build_book_identity


class BookNotFoundError(Exception):
    pass


class DuplicateBookError(Exception):
    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail


class InvalidBookStateError(Exception):
    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail


TITLE_AUTHOR_DUPLICATE_MESSAGE = "Ja existe um livro com esse titulo e autor no seu acervo"
EXTERNAL_ID_DUPLICATE_MESSAGE = "Esse livro ja foi adicionado ao seu acervo"
BOOK_WITH_ANNOTATION_NOT_READ_MESSAGE = (
    "Remova a anotação de leitura antes de alterar o status para nao lido"
)
TITLE_AUTHOR_UNIQUE_INDEX = "ix_books_user_title_author_unique"
EXTERNAL_ID_UNIQUE_INDEX = "ix_books_user_external_id_unique"


def get_book_or_raise(book_id: int, user_id: int, db: Session) -> models.Book:
    db_book = (
        db.query(models.Book)
        .options(joinedload(models.Book.annotation))
        .filter(
            models.Book.id == book_id,
            models.Book.user_id == user_id,
        )
        .first()
    )
    if db_book is None:
        raise BookNotFoundError
    return db_book


def create_book(
    book: schemas.BookCreate,
    user_id: int,
    db: Session,
) -> models.Book:
    duplicate_book = get_duplicate_book_by_title_author(
        titulo=book.titulo,
        autor=book.autor,
        user_id=user_id,
        db=db,
    )
    if duplicate_book is not None:
        raise DuplicateBookError(TITLE_AUTHOR_DUPLICATE_MESSAGE)

    if book.external_id:
        existing_book = (
            db.query(models.Book)
            .filter(
                models.Book.user_id == user_id,
                models.Book.external_id == book.external_id,
            )
            .first()
        )
        if existing_book is not None:
            raise DuplicateBookError(EXTERNAL_ID_DUPLICATE_MESSAGE)

    db_book = models.Book(**book.model_dump(), user_id=user_id)
    db.add(db_book)
    try:
        db.commit()
    except IntegrityError as exc:
        _raise_duplicate_from_integrity_error(exc, db)
    db.refresh(db_book)
    return db_book


def delete_book(book_id: int, user_id: int, db: Session) -> None:
    db_book = get_book_or_raise(book_id, user_id, db)
    db.delete(db_book)
    db.commit()


def list_books(
    user_id: int,
    db: Session,
    limit: int,
    offset: int,
    sort_by: Literal["created_at", "titulo", "autor"],
    sort_order: Literal["asc", "desc"],
    search: str,
    status_leitura: schemas.ReadingStatus | None,
    favorito_only: bool,
) -> dict:
    sort_column = getattr(models.Book, sort_by)
    order_by_clause = sort_column.asc() if sort_order == "asc" else sort_column.desc()
    normalized_search = search.strip()
    filters = [models.Book.user_id == user_id]

    if normalized_search:
        like_pattern = f"%{normalized_search}%"
        filters.append(
            or_(
                models.Book.titulo.ilike(like_pattern),
                models.Book.autor.ilike(like_pattern),
            )
        )

    if status_leitura is not None:
        filters.append(models.Book.status_leitura == status_leitura)

    if favorito_only:
        filters.append(models.Book.favorito.is_(True))

    base_query = (
        db.query(models.Book)
        .options(joinedload(models.Book.annotation))
        .filter(*filters)
    )
    aggregate_query = db.query(
        func.count(models.Book.id).label("total"),
        func.max(models.Book.created_at).label("latest_created_at"),
    ).filter(*filters)

    items = (
        base_query
        .order_by(order_by_clause, models.Book.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    aggregates = aggregate_query.one()

    return {
        "items": items,
        "total": aggregates.total or 0,
        "limit": limit,
        "offset": offset,
        "sort_by": sort_by,
        "sort_order": sort_order,
        "search": normalized_search,
        "status_leitura": status_leitura,
        "favorito_only": favorito_only,
        "latest_created_at": aggregates.latest_created_at,
    }


def get_book_stats(user_id: int, db: Session) -> dict:
    stats = (
        db.query(
            func.count(models.Book.id).label("total_books"),
            func.count(models.Book.id)
            .filter(models.Book.favorito.is_(True))
            .label("favorite_count"),
            func.count(models.Book.id)
            .filter(models.Book.status_leitura == "lendo")
            .label("reading_now_count"),
            func.count(models.Book.id)
            .filter(models.Book.status_leitura == "lido")
            .label("finished_count"),
            func.count(models.Book.id)
            .filter(models.Book.status_leitura == "quero_ler")
            .label("want_to_read_count"),
            func.count(models.ReadingAnnotation.id).label("annotation_count"),
            func.avg(models.ReadingAnnotation.rating)
            .filter(models.ReadingAnnotation.rating.is_not(None))
            .label("average_rating"),
            func.count(models.ReadingAnnotation.id)
            .filter(
                or_(
                    models.ReadingAnnotation.started_at.is_not(None),
                    models.ReadingAnnotation.finished_at.is_not(None),
                )
            )
            .label("dated_reading_count"),
            func.count(models.ReadingAnnotation.id)
            .filter(
                and_(
                    models.ReadingAnnotation.review.is_not(None),
                    func.length(func.btrim(models.ReadingAnnotation.review)) > 0,
                )
            )
            .label("review_count"),
        )
        .outerjoin(
            models.ReadingAnnotation,
            and_(
                models.ReadingAnnotation.book_id == models.Book.id,
                models.ReadingAnnotation.user_id == user_id,
            ),
        )
        .filter(models.Book.user_id == user_id)
        .one()
    )

    return {
        "total_books": stats.total_books or 0,
        "favorite_count": stats.favorite_count or 0,
        "reading_now_count": stats.reading_now_count or 0,
        "finished_count": stats.finished_count or 0,
        "want_to_read_count": stats.want_to_read_count or 0,
        "annotation_count": stats.annotation_count or 0,
        "average_rating": float(stats.average_rating) if stats.average_rating is not None else None,
        "dated_reading_count": stats.dated_reading_count or 0,
        "review_count": stats.review_count or 0,
    }


def update_book(
    book_id: int,
    book: schemas.BookUpdate,
    user_id: int,
    db: Session,
) -> models.Book:
    db_book = get_book_or_raise(book_id, user_id, db)
    next_titulo = book.titulo if book.titulo is not None else db_book.titulo
    next_autor = book.autor if book.autor is not None else db_book.autor

    duplicate_book = get_duplicate_book_by_title_author(
        titulo=next_titulo,
        autor=next_autor,
        user_id=user_id,
        db=db,
        exclude_book_id=book_id,
    )
    if duplicate_book is not None:
        raise DuplicateBookError(TITLE_AUTHOR_DUPLICATE_MESSAGE)

    if (
        book.status_leitura is not None
        and book.status_leitura != "lido"
        and db_book.annotation is not None
    ):
        raise InvalidBookStateError(BOOK_WITH_ANNOTATION_NOT_READ_MESSAGE)

    book_data = book.model_dump(exclude_unset=True)
    for field, value in book_data.items():
        setattr(db_book, field, value)

    try:
        db.commit()
    except IntegrityError as exc:
        _raise_duplicate_from_integrity_error(exc, db)
    db.refresh(db_book)
    return db_book


def _raise_duplicate_from_integrity_error(exc: IntegrityError, db: Session) -> None:
    db.rollback()
    error_text = str(getattr(exc, "orig", exc))

    if EXTERNAL_ID_UNIQUE_INDEX in error_text:
        raise DuplicateBookError(EXTERNAL_ID_DUPLICATE_MESSAGE) from exc

    if TITLE_AUTHOR_UNIQUE_INDEX in error_text:
        raise DuplicateBookError(TITLE_AUTHOR_DUPLICATE_MESSAGE) from exc

    raise exc


def get_duplicate_book_by_title_author(
    titulo: str,
    autor: str,
    user_id: int,
    db: Session,
    exclude_book_id: int | None = None,
) -> models.Book | None:
    target_identity = build_book_identity(titulo, autor)
    query = db.query(models.Book).filter(models.Book.user_id == user_id)

    if exclude_book_id is not None:
        query = query.filter(models.Book.id != exclude_book_id)

    for existing_book in query.all():
        if build_book_identity(existing_book.titulo, existing_book.autor) == target_identity:
            return existing_book

    return None
