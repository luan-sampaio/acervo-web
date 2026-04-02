from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class BookBase(BaseModel):
    titulo: str = Field(min_length=2, max_length=255)
    autor: str = Field(min_length=2, max_length=255)

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    titulo: str | None = Field(default=None, min_length=2, max_length=255)
    autor: str | None = Field(default=None, min_length=2, max_length=255)

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    @model_validator(mode="after")
    def validate_at_least_one_field(self):
        if self.titulo is None and self.autor is None:
            raise ValueError("Informe ao menos um campo para atualização")
        return self


class BookResponse(BookBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
