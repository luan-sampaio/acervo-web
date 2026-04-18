"""remove categories and tags

Revision ID: 0010_remove_categories_and_tags
Revises: 0009_add_category_to_books
Create Date: 2026-04-18 00:00:00

"""

from alembic import op


revision = "0010_remove_categories_and_tags"
down_revision = "0009_add_category_to_books"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("books_category_id_fkey", "books", type_="foreignkey")
    op.drop_column("books", "category_id")
    op.drop_table("book_tags")
    op.drop_index("ix_tags_user_id", table_name="tags")
    op.drop_table("tags")
    op.drop_index("ix_categories_user_id", table_name="categories")
    op.drop_table("categories")


def downgrade() -> None:
    raise NotImplementedError("Downgrade not supported for removing categories and tags")
