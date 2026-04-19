from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session, joinedload

from .. import database
from .. import models
from .. import schemas
from .auth import get_current_user

router = APIRouter(prefix="/books", tags=["Books"])


def get_book_or_404(book_id: int, user_id: int, db: Session) -> models.Book:
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado")
    return db_book


def get_duplicate_book_by_title_author(
    titulo: str,
    autor: str,
    user_id: int,
    db: Session,
    exclude_book_id: int | None = None,
) -> models.Book | None:
    query = db.query(models.Book).filter(
        models.Book.user_id == user_id,
        func.lower(func.btrim(models.Book.titulo)) == titulo.strip().lower(),
        func.lower(func.btrim(models.Book.autor)) == autor.strip().lower(),
    )

    if exclude_book_id is not None:
        query = query.filter(models.Book.id != exclude_book_id)

    return query.first()


@router.post("", response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(
    book: schemas.BookCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    duplicate_book = get_duplicate_book_by_title_author(
        titulo=book.titulo,
        autor=book.autor,
        user_id=current_user.id,
        db=db,
    )
    if duplicate_book is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe um livro com esse titulo e autor no seu acervo",
        )

    if book.external_id:
        existing_book = (
            db.query(models.Book)
            .filter(
                models.Book.user_id == current_user.id,
                models.Book.external_id == book.external_id,
            )
            .first()
        )
        if existing_book is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Esse livro ja foi adicionado ao seu acervo",
            )

    db_book = models.Book(**book.model_dump(), user_id=current_user.id)
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_book = get_book_or_404(book_id, current_user.id, db)
    db.delete(db_book)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("", response_model=schemas.BookListResponse)
def list_books(
    limit: int = Query(default=6, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    sort_by: Literal["created_at", "titulo", "autor"] = Query(default="created_at"),
    sort_order: Literal["asc", "desc"] = Query(default="desc"),
    search: str = Query(default="", min_length=0, max_length=255),
    status_leitura: schemas.ReadingStatus | None = Query(default=None),
    favorito_only: bool = Query(default=False),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    sort_column = getattr(models.Book, sort_by)
    order_by_clause = sort_column.asc() if sort_order == "asc" else sort_column.desc()
    normalized_search = search.strip()
    filters = [models.Book.user_id == current_user.id]

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
    total = aggregates.total or 0
    latest_created_at = aggregates.latest_created_at

    return {
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset,
        "sort_by": sort_by,
        "sort_order": sort_order,
        "search": normalized_search,
        "status_leitura": status_leitura,
        "favorito_only": favorito_only,
        "latest_created_at": latest_created_at,
    }


@router.get("/stats", response_model=schemas.BookStatsResponse)
def get_book_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
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
                models.ReadingAnnotation.user_id == current_user.id,
            ),
        )
        .filter(models.Book.user_id == current_user.id)
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


@router.get("/{book_id}", response_model=schemas.BookResponse)
def get_book(
    book_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    return get_book_or_404(book_id, current_user.id, db)


@router.put("/{book_id}", response_model=schemas.BookResponse)
def update_book(
    book_id: int,
    book: schemas.BookUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_book = get_book_or_404(book_id, current_user.id, db)
    next_titulo = book.titulo if book.titulo is not None else db_book.titulo
    next_autor = book.autor if book.autor is not None else db_book.autor

    duplicate_book = get_duplicate_book_by_title_author(
        titulo=next_titulo,
        autor=next_autor,
        user_id=current_user.id,
        db=db,
        exclude_book_id=book_id,
    )
    if duplicate_book is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe um livro com esse titulo e autor no seu acervo",
        )

    book_data = book.model_dump(exclude_unset=True)
    for field, value in book_data.items():
        setattr(db_book, field, value)

    db.commit()
    db.refresh(db_book)
    return db_book
