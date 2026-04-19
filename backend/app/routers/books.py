from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from .. import database
from .. import models
from .. import schemas
from ..services import books as book_service
from .auth import get_current_user

router = APIRouter(prefix="/books", tags=["Books"])


def get_book_or_404(book_id: int, user_id: int, db: Session) -> models.Book:
    try:
        return book_service.get_book_or_raise(book_id, user_id, db)
    except book_service.BookNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado")


@router.post("", response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(
    book: schemas.BookCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        return book_service.create_book(book, current_user.id, db)
    except book_service.DuplicateBookError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=exc.detail) from exc


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        book_service.delete_book(book_id, current_user.id, db)
    except book_service.BookNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado")
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
    return book_service.list_books(
        user_id=current_user.id,
        db=db,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_order=sort_order,
        search=search,
        status_leitura=status_leitura,
        favorito_only=favorito_only,
    )


@router.get("/stats", response_model=schemas.BookStatsResponse)
def get_book_stats(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    return book_service.get_book_stats(current_user.id, db)


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
    try:
        return book_service.update_book(book_id, book, current_user.id, db)
    except book_service.BookNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Livro não encontrado")
    except book_service.DuplicateBookError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=exc.detail) from exc
    except book_service.InvalidBookStateError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=exc.detail) from exc
