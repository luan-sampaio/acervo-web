from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Book(Base):
    __tablename__ = "books"
    __table_args__ = (
        CheckConstraint("char_length(btrim(titulo)) >= 2", name="ck_books_titulo_min_length"),
        CheckConstraint("char_length(btrim(autor)) >= 2", name="ck_books_autor_min_length"),
        CheckConstraint(
            "status_leitura IN ('quero_ler', 'lendo', 'lido')",
            name="ck_books_status_leitura_valid",
        ),
        Index(
            "ix_books_user_external_id_unique",
            "user_id",
            "external_id",
            unique=True,
            postgresql_where=text("external_id IS NOT NULL"),
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    titulo = Column(String(255), nullable=False)
    autor = Column(String(255), nullable=False)
    status_leitura = Column(String(20), nullable=False, server_default="quero_ler")
    favorito = Column(Boolean, nullable=False, server_default="false")
    isbn = Column(String(20), nullable=True)
    cover_url = Column(String(512), nullable=True)
    external_id = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class ReadingAnnotation(Base):
    __tablename__ = "reading_annotations"
    __table_args__ = (
        CheckConstraint(
            "rating IS NULL OR rating BETWEEN 1 AND 5",
            name="ck_reading_annotations_rating_range",
        ),
        UniqueConstraint("user_id", "book_id", name="uq_reading_annotations_user_book"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=True)
    review = Column(Text, nullable=True)
    started_at = Column(Date, nullable=True)
    finished_at = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
