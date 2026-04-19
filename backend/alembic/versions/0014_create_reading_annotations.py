"""create reading annotations

Revision ID: 0014_reading_annotations
Revises: 0013_remove_book_metadata
Create Date: 2026-04-19 00:00:00

"""

from alembic import op
import sqlalchemy as sa


revision = "0014_reading_annotations"
down_revision = "0013_remove_book_metadata"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "reading_annotations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("book_id", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=True),
        sa.Column("review", sa.Text(), nullable=True),
        sa.Column("started_at", sa.Date(), nullable=True),
        sa.Column("finished_at", sa.Date(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "rating IS NULL OR rating BETWEEN 1 AND 5",
            name="ck_reading_annotations_rating_range",
        ),
        sa.ForeignKeyConstraint(["book_id"], ["books.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "book_id", name="uq_reading_annotations_user_book"),
    )
    op.create_index(
        op.f("ix_reading_annotations_id"),
        "reading_annotations",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_reading_annotations_book_id"),
        "reading_annotations",
        ["book_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_reading_annotations_user_id"),
        "reading_annotations",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_reading_annotations_user_id"), table_name="reading_annotations")
    op.drop_index(op.f("ix_reading_annotations_book_id"), table_name="reading_annotations")
    op.drop_index(op.f("ix_reading_annotations_id"), table_name="reading_annotations")
    op.drop_table("reading_annotations")
