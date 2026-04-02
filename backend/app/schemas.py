from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BookBase(BaseModel):
    titulo: str
    autor: str


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    titulo: str | None = None
    autor: str | None = None


class BookResponse(BookBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
