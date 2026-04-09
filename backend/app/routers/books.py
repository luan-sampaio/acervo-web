from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from .. import database
from .. import models
from .. import schemas

router = APIRouter(prefix="/books", tags=["Books"])


def get_book_or_404(book_id: int, db: Session) -> models.Book:
    db_book = db.get(models.Book, book_id)
    if db_book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado")
    return db_book


@router.post("", response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(book: schemas.BookCreate, db: Session = Depends(database.get_db)):
    db_book = models.Book(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, db: Session = Depends(database.get_db)):
    db_book = get_book_or_404(book_id, db)
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
    author: str = Query(default="", min_length=0, max_length=255),
    status_leitura: schemas.ReadingStatus | None = Query(default=None),
    favorito_only: bool = Query(default=False),
    db: Session = Depends(database.get_db),
):
    sort_column = getattr(models.Book, sort_by)
    order_by_clause = sort_column.asc() if sort_order == "asc" else sort_column.desc()
    normalized_search = search.strip()
    normalized_author = author.strip()
    filters = []

    if normalized_search:
        like_pattern = f"%{normalized_search}%"
        filters.append(
            or_(
                models.Book.titulo.ilike(like_pattern),
                models.Book.autor.ilike(like_pattern),
            )
        )

    if normalized_author:
        author_like_pattern = f"%{normalized_author}%"
        filters.append(models.Book.autor.ilike(author_like_pattern))

    if status_leitura is not None:
        filters.append(models.Book.status_leitura == status_leitura)

    if favorito_only:
        filters.append(models.Book.favorito.is_(True))

    base_query = db.query(models.Book)
    aggregate_query = db.query(
        func.count(models.Book.id).label("total"),
        func.max(models.Book.created_at).label("latest_created_at"),
    )

    if filters:
        base_query = base_query.filter(*filters)
        aggregate_query = aggregate_query.filter(*filters)

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
        "author": normalized_author,
        "status_leitura": status_leitura,
        "favorito_only": favorito_only,
        "latest_created_at": latest_created_at,
    }


@router.get("/{book_id}", response_model=schemas.BookResponse)
def get_book(book_id: int, db: Session = Depends(database.get_db)):
    return get_book_or_404(book_id, db)


@router.put("/{book_id}", response_model=schemas.BookResponse)
def update_book(book_id: int, book: schemas.BookUpdate, db: Session = Depends(database.get_db)):
    db_book = get_book_or_404(book_id, db)

    book_data = book.model_dump(exclude_unset=True)
    for field, value in book_data.items():
        setattr(db_book, field, value)

    db.commit()
    db.refresh(db_book)
    return db_book
