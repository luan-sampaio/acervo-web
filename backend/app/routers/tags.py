from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import database, models, schemas
from ..routers.auth import get_current_user

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.get("", response_model=list[schemas.TagResponse])
def list_tags(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Tag)
        .filter(models.Tag.user_id == current_user.id)
        .order_by(models.Tag.nome)
        .all()
    )


@router.post("", response_model=schemas.TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(
    payload: schemas.TagCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = (
        db.query(models.Tag)
        .filter(models.Tag.user_id == current_user.id, models.Tag.nome == payload.nome)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tag já existe")

    tag = models.Tag(user_id=current_user.id, **payload.model_dump())
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    tag = (
        db.query(models.Tag)
        .filter(models.Tag.id == tag_id, models.Tag.user_id == current_user.id)
        .first()
    )
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag não encontrada")

    db.delete(tag)
    db.commit()
