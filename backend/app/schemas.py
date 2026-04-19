from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


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
    already_in_library: bool = False


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


class ReadingAnnotationBase(BaseModel):
    rating: int | None = Field(default=None, ge=1, le=5)
    review: str | None = Field(default=None, max_length=5000)
    started_at: date | None = None
    finished_at: date | None = None

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    @field_validator("review")
    @classmethod
    def normalize_review(cls, value: str | None) -> str | None:
        if value is None:
            return None

        normalized_value = value.strip()
        return normalized_value or None

    @model_validator(mode="after")
    def validate_date_range(self):
        if (
            self.started_at is not None
            and self.finished_at is not None
            and self.finished_at < self.started_at
        ):
            raise ValueError("A data de término não pode ser anterior à data de início")
        return self


class ReadingAnnotationCreate(ReadingAnnotationBase):
    @model_validator(mode="after")
    def validate_at_least_one_field(self):
        if (
            self.rating is None
            and self.review is None
            and self.started_at is None
            and self.finished_at is None
        ):
            raise ValueError("Informe ao menos um campo para criar a anotação")
        return self


class ReadingAnnotationUpdate(ReadingAnnotationBase):
    @model_validator(mode="after")
    def validate_at_least_one_field(self):
        fields_set = self.model_fields_set
        if not fields_set:
            raise ValueError("Informe ao menos um campo para atualização")
        return self


class ReadingAnnotationResponse(ReadingAnnotationBase):
    id: int
    user_id: int
    book_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class BookResponse(BookBase):
    id: int
    created_at: datetime
    updated_at: datetime
    annotation: ReadingAnnotationResponse | None = None

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


class BookStatsResponse(BaseModel):
    total_books: int = Field(ge=0)
    favorite_count: int = Field(ge=0)
    reading_now_count: int = Field(ge=0)
    finished_count: int = Field(ge=0)
    want_to_read_count: int = Field(ge=0)
    annotation_count: int = Field(ge=0)
    average_rating: float | None = None
    dated_reading_count: int = Field(ge=0)
    review_count: int = Field(ge=0)
