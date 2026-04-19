"""add unique title author per user

Revision ID: 0015_unique_title_author_user
Revises: 0014_reading_annotations
Create Date: 2026-04-19 00:30:00

"""

from alembic import op


revision = "0015_unique_title_author_user"
down_revision = "0014_reading_annotations"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM books
                GROUP BY user_id, lower(btrim(titulo)), lower(btrim(autor))
                HAVING count(*) > 1
            ) THEN
                RAISE EXCEPTION
                    'Cannot create unique title/author index: duplicated books already exist';
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        CREATE UNIQUE INDEX ix_books_user_title_author_unique
        ON books (user_id, lower(btrim(titulo)), lower(btrim(autor)))
        """
    )


def downgrade() -> None:
    op.drop_index("ix_books_user_title_author_unique", table_name="books")
