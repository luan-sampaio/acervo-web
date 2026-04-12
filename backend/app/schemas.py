from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

    model_config = ConfigDict(str_strip_whitespace=True)


class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


ReadingStatus = Literal["quero_ler", "lendo", "lido"]


class BookBase(BaseModel):
    titulo: str = Field(min_length=2, max_length=255)
    autor: str = Field(min_length=2, max_length=255)
    status_leitura: ReadingStatus = "quero_ler"
    favorito: bool = False
    isbn: str | None = Field(default=None, max_length=20)
    cover_url: str | None = Field(default=None, max_length=512)
    external_id: str | None = Field(default=None, max_length=100)

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")


class BookCreate(BookBase):
    pass


class BookSearchResult(BaseModel):
    external_id: str
    titulo: str
    autor: str
    isbn: str | None = None
    cover_url: str | None = None
    descricao: str | None = None


class CategoryCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=100)
    cor: str | None = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")

    model_config = ConfigDict(str_strip_whitespace=True)


class CategoryResponse(BaseModel):
    id: int
    nome: str
    cor: str | None = None

    model_config = ConfigDict(from_attributes=True)


class TagCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=50)

    model_config = ConfigDict(str_strip_whitespace=True)


class TagResponse(BaseModel):
    id: int
    nome: str

    model_config = ConfigDict(from_attributes=True)


class BookTagsUpdate(BaseModel):
    tag_ids: list[int]


class BookUpdate(BaseModel):
    titulo: str | None = Field(default=None, min_length=2, max_length=255)
    autor: str | None = Field(default=None, min_length=2, max_length=255)
    status_leitura: ReadingStatus | None = None
    favorito: bool | None = None
    category_id: int | None = None

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    @model_validator(mode="after")
    def validate_at_least_one_field(self):
        if (
            self.titulo is None
            and self.autor is None
            and self.status_leitura is None
            and self.favorito is None
            and self.category_id is None
        ):
            raise ValueError("Informe ao menos um campo para atualização")
        return self


class BookResponse(BookBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category_id: int | None = None
    category: CategoryResponse | None = None
    tags: list[TagResponse] = []

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class BookListResponse(BaseModel):
    items: list[BookResponse]
    total: int = Field(ge=0)
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)
    sort_by: Literal["created_at", "titulo", "autor"]
    sort_order: Literal["asc", "desc"]
    search: str = ""
    author: str = ""
    status_leitura: ReadingStatus | None = None
    favorito_only: bool = False
    latest_created_at: datetime | None = None
