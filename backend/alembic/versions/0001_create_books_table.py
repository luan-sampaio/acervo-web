"""create books table

Revision ID: 0001_create_books
Revises: 
Create Date: 2026-04-02 18:18:00

"""
from alembic import op
import sqlalchemy as sa

revision = "0001_create_books"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "books",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("titulo", sa.String(length=255), nullable=False),
        sa.Column("autor", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.CheckConstraint("char_length(btrim(titulo)) >= 2", name="ck_books_titulo_min_length"),
        sa.CheckConstraint("char_length(btrim(autor)) >= 2", name="ck_books_autor_min_length"),
    )
    op.create_index(op.f("ix_books_id"), "books", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_books_id"), table_name="books")
    op.drop_table("books")
