from fastapi import APIRouter, Depends, HTTPException, Response, status
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


@router.get("", response_model=list[schemas.BookResponse])
def list_books(db: Session = Depends(database.get_db)):
    return db.query(models.Book).all()


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
