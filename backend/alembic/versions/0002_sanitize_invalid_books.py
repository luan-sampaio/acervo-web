"""sanitize invalid books

Revision ID: 0002_sanitize_invalid_books
Revises: 0001_create_books
Create Date: 2026-04-02 20:12:00

"""
from alembic import op


revision = "0002_sanitize_invalid_books"
down_revision = "0001_create_books"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE books
        SET titulo = 'Dom Casmurro',
            autor = 'Machado de Assis',
            updated_at = now()
        WHERE lower(btrim(titulo)) = 'dom'
           OR lower(btrim(autor)) = 'machado de'
        """
    )

    op.execute(
        """
        UPDATE books
        SET titulo = 'O Cortiço',
            autor = 'Aluísio Azevedo',
            updated_at = now()
        WHERE lower(btrim(titulo)) = 'a'
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
