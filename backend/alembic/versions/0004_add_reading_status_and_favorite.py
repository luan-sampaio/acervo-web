"""add reading status and favorite to books

Revision ID: 0004_add_reading_status_and_favorite
Revises: 0003_enforce_book_constraints
Create Date: 2026-04-03 10:20:00

"""

from alembic import op
import sqlalchemy as sa


revision = "0004_book_extras"
down_revision = "0003_enforce_book_constraints"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "books",
        sa.Column("status_leitura", sa.String(length=20), nullable=False, server_default="quero_ler"),
    )
    op.add_column(
        "books",
        sa.Column("favorito", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.create_check_constraint(
        "ck_books_status_leitura_valid",
        "books",
        "status_leitura IN ('quero_ler', 'lendo', 'lido')",
    )

    op.alter_column("books", "status_leitura", server_default=None)
    op.alter_column("books", "favorito", server_default=None)


def downgrade() -> None:
    op.drop_constraint("ck_books_status_leitura_valid", "books", type_="check")
    op.drop_column("books", "favorito")
    op.drop_column("books", "status_leitura")
