from sqlalchemy import Boolean, CheckConstraint, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from .database import Base


class Book(Base):
    __tablename__ = "books"
    __table_args__ = (
        CheckConstraint("char_length(btrim(titulo)) >= 2", name="ck_books_titulo_min_length"),
        CheckConstraint("char_length(btrim(autor)) >= 2", name="ck_books_autor_min_length"),
        CheckConstraint(
            "status_leitura IN ('quero_ler', 'lendo', 'lido')",
            name="ck_books_status_leitura_valid",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    autor = Column(String(255), nullable=False)
    status_leitura = Column(String(20), nullable=False, server_default="quero_ler")
    favorito = Column(Boolean, nullable=False, server_default="false")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
