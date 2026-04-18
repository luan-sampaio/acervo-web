"""remove book import metadata

Revision ID: 0013_remove_book_metadata
Revises: 0012_book_import_metadata
Create Date: 2026-04-18 00:50:00

"""

from alembic import op
import sqlalchemy as sa


revision = "0013_remove_book_metadata"
down_revision = "0012_book_import_metadata"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column("books", "language")
    op.drop_column("books", "page_count")
    op.drop_column("books", "publisher")
    op.drop_column("books", "published_date")


def downgrade() -> None:
    op.add_column("books", sa.Column("published_date", sa.String(length=32), nullable=True))
    op.add_column("books", sa.Column("publisher", sa.String(length=255), nullable=True))
    op.add_column("books", sa.Column("page_count", sa.Integer(), nullable=True))
    op.add_column("books", sa.Column("language", sa.String(length=10), nullable=True))
