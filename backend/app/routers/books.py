from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import database
from .. import models
from .. import schemas

router = APIRouter(prefix="/books", tags=["Books"])


@router.post("", response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(book: schemas.BookCreate, db: Session = Depends(database.get_db)):
    db_book = models.Book(titulo=book.titulo, autor=book.autor)
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, db: Session = Depends(database.get_db)):
    db_book = db.get(models.Book, book_id)
    if db_book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado")

    db.delete(db_book)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("", response_model=schemas.BookListResponse)
def list_books(
    limit: int = Query(default=6, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    sort_by: Literal["created_at", "titulo", "autor"] = Query(default="created_at"),
    sort_order: Literal["asc", "desc"] = Query(default="desc"),
    db: Session = Depends(database.get_db),
):
    sort_column = getattr(models.Book, sort_by)
    order_by_clause = sort_column.asc() if sort_order == "asc" else sort_column.desc()

    items = (
        db.query(models.Book)
        .order_by(order_by_clause, models.Book.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    total = db.query(func.count(models.Book.id)).scalar() or 0
    latest_created_at = db.query(func.max(models.Book.created_at)).scalar()

    return {
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset,
        "sort_by": sort_by,
        "sort_order": sort_order,
        "latest_created_at": latest_created_at,
    }


@router.get("/{book_id}", response_model=schemas.BookResponse)
def get_book(book_id: int, db: Session = Depends(database.get_db)):
    db_book = db.get(models.Book, book_id)
    if db_book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado")
    return db_book


@router.put("/{book_id}", response_model=schemas.BookResponse)
def update_book(book_id: int, book: schemas.BookUpdate, db: Session = Depends(database.get_db)):
    db_book = db.get(models.Book, book_id)
    if db_book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado")

    book_data = book.model_dump(exclude_unset=True)
    for field, value in book_data.items():
        setattr(db_book, field, value)

    db.commit()
    db.refresh(db_book)
    return db_book
