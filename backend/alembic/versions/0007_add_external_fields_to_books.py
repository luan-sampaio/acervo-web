"""add external fields to books

Revision ID: 0007_add_external_fields_to_books
Revises: 0006_add_user_id_to_books
Create Date: 2026-04-11 23:00:00

"""

from alembic import op
import sqlalchemy as sa


revision = "0007_add_external_fields_to_books"
down_revision = "0006_add_user_id_to_books"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("books", sa.Column("isbn", sa.String(length=20), nullable=True))
    op.add_column("books", sa.Column("cover_url", sa.String(length=512), nullable=True))
    op.add_column("books", sa.Column("external_id", sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column("books", "external_id")
    op.drop_column("books", "cover_url")
    op.drop_column("books", "isbn")
