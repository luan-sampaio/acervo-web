from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import database
from .. import models, schemas
from ..routers.auth import get_current_user
from ..services.book_search import ExternalBookSearchError, search_external_books

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("", response_model=list[schemas.BookSearchResult])
async def search_books(
    q: str = Query(min_length=2, max_length=255),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        return await search_external_books(q=q, user_id=current_user.id, db=db)
    except ExternalBookSearchError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=exc.detail,
        ) from exc
