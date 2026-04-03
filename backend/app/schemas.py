from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


ReadingStatus = Literal["quero_ler", "lendo", "lido"]


class BookBase(BaseModel):
    titulo: str = Field(min_length=2, max_length=255)
    autor: str = Field(min_length=2, max_length=255)
    status_leitura: ReadingStatus = "quero_ler"
    favorito: bool = False

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    titulo: str | None = Field(default=None, min_length=2, max_length=255)
    autor: str | None = Field(default=None, min_length=2, max_length=255)
    status_leitura: ReadingStatus | None = None
    favorito: bool | None = None

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    @model_validator(mode="after")
    def validate_at_least_one_field(self):
        if (
            self.titulo is None
            and self.autor is None
            and self.status_leitura is None
            and self.favorito is None
        ):
            raise ValueError("Informe ao menos um campo para atualização")
        return self


class BookResponse(BookBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookListResponse(BaseModel):
    items: list[BookResponse]
    total: int = Field(ge=0)
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    sort_by: Literal["created_at", "titulo", "autor"]
    sort_order: Literal["asc", "desc"]
    search: str = ""
    author: str = ""
    latest_created_at: datetime | None = None
