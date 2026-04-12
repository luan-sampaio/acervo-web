"""add user_id to books

Revision ID: 0006_add_user_id_to_books
Revises: 0005_create_users_table
Create Date: 2026-04-11 22:10:00

"""

from alembic import op
import sqlalchemy as sa


revision = "0006_add_user_id_to_books"
down_revision = "0005_create_users_table"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("DELETE FROM books")

    op.add_column(
        "books",
        sa.Column("user_id", sa.Integer(), nullable=False),
    )
    op.create_foreign_key(
        "fk_books_user_id",
        "books",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index("ix_books_user_id", "books", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_books_user_id", table_name="books")
    op.drop_constraint("fk_books_user_id", "books", type_="foreignkey")
    op.drop_column("books", "user_id")
