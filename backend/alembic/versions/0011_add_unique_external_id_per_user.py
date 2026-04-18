"""add unique external_id per user

Revision ID: 0011_unique_external_id_user
Revises: 0010_remove_categories_and_tags
Create Date: 2026-04-18 00:10:00

"""

from alembic import op
import sqlalchemy as sa


revision = "0011_unique_external_id_user"
down_revision = "0010_remove_categories_and_tags"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        WITH duplicated_books AS (
            SELECT
                id,
                ROW_NUMBER() OVER (
                    PARTITION BY user_id, external_id
                    ORDER BY created_at ASC, id ASC
                ) AS row_num
            FROM books
            WHERE external_id IS NOT NULL
        )
        UPDATE books
        SET external_id = NULL
        WHERE id IN (
            SELECT id
            FROM duplicated_books
            WHERE row_num > 1
        )
        """
    )

    op.create_index(
        "ix_books_user_external_id_unique",
        "books",
        ["user_id", "external_id"],
        unique=True,
        postgresql_where=sa.text("external_id IS NOT NULL"),
    )


def downgrade() -> None:
    op.drop_index("ix_books_user_external_id_unique", table_name="books")
