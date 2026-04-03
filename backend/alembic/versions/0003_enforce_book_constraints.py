"""enforce book constraints

Revision ID: 0003_enforce_book_constraints
Revises: 0002_sanitize_invalid_books
Create Date: 2026-04-02 22:10:00

"""
from alembic import op


revision = "0003_enforce_book_constraints"
down_revision = "0002_sanitize_invalid_books"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE books
        SET titulo = btrim(titulo),
            autor = btrim(autor),
            updated_at = now()
        WHERE titulo <> btrim(titulo)
           OR autor <> btrim(autor)
        """
    )

    op.execute(
        """
        DELETE FROM books
        WHERE char_length(btrim(titulo)) < 2
           OR char_length(btrim(autor)) < 2
        """
    )


def downgrade() -> None:
    pass
