"""add category_id to books

Revision ID: 0009_add_category_to_books
Revises: 0008_create_cats_and_tags
Create Date: 2026-04-12 00:01:00

"""

from alembic import op
import sqlalchemy as sa


revision = "0009_add_category_to_books"
down_revision = "0008_create_cats_and_tags"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "books",
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("categories.id", ondelete="SET NULL"), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("books", "category_id")
