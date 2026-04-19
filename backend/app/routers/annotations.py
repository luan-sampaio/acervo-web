from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import database
from .. import models
from .. import schemas
from .auth import get_current_user
from .books import get_book_or_404

router = APIRouter(prefix="/books/{book_id}/annotation", tags=["Reading annotations"])


def ensure_book_can_be_annotated(book: models.Book) -> None:
    if book.status_leitura != "lido":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Para registrar nota, resenha ou período de leitura, marque o livro como lido",
        )


def get_annotation_or_404(
    book_id: int,
    user_id: int,
    db: Session,
) -> models.ReadingAnnotation:
    db_annotation = (
        db.query(models.ReadingAnnotation)
        .filter(
            models.ReadingAnnotation.book_id == book_id,
            models.ReadingAnnotation.user_id == user_id,
        )
        .first()
    )
    if db_annotation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anotação não encontrada",
        )
    return db_annotation


@router.post(
    "",
    response_model=schemas.ReadingAnnotationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_annotation(
    book_id: int,
    annotation: schemas.ReadingAnnotationCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_book = get_book_or_404(book_id, current_user.id, db)
    ensure_book_can_be_annotated(db_book)
    existing_annotation = (
        db.query(models.ReadingAnnotation)
        .filter(
            models.ReadingAnnotation.book_id == book_id,
            models.ReadingAnnotation.user_id == current_user.id,
        )
        .first()
    )
    if existing_annotation is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este livro já possui uma anotação",
        )

    db_annotation = models.ReadingAnnotation(
        **annotation.model_dump(),
        book_id=book_id,
        user_id=current_user.id,
    )
    db.add(db_annotation)
    db.commit()
    db.refresh(db_annotation)
    return db_annotation


@router.get("", response_model=schemas.ReadingAnnotationResponse)
def get_annotation(
    book_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    get_book_or_404(book_id, current_user.id, db)
    return get_annotation_or_404(book_id, current_user.id, db)


@router.put("", response_model=schemas.ReadingAnnotationResponse)
def update_annotation(
    book_id: int,
    annotation: schemas.ReadingAnnotationUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_book = get_book_or_404(book_id, current_user.id, db)
    ensure_book_can_be_annotated(db_book)
    db_annotation = get_annotation_or_404(book_id, current_user.id, db)

    annotation_data = annotation.model_dump(exclude_unset=True)
    for field, value in annotation_data.items():
        setattr(db_annotation, field, value)

    db.commit()
    db.refresh(db_annotation)
    return db_annotation


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_annotation(
    book_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    get_book_or_404(book_id, current_user.id, db)
    db_annotation = get_annotation_or_404(book_id, current_user.id, db)

    db.delete(db_annotation)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
