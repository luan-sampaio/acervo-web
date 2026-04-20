"""add annual reading goal to users

Revision ID: 0016_annual_reading_goal
Revises: 0015_unique_title_author_user
Create Date: 2026-04-20 00:00:00

"""

from alembic import op
import sqlalchemy as sa


revision = "0016_annual_reading_goal"
down_revision = "0015_unique_title_author_user"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("annual_reading_goal", sa.Integer(), server_default="12", nullable=False),
    )
    op.create_check_constraint(
        "ck_users_annual_reading_goal_range",
        "users",
        "annual_reading_goal BETWEEN 1 AND 365",
    )


def downgrade() -> None:
    op.drop_constraint("ck_users_annual_reading_goal_range", "users", type_="check")
    op.drop_column("users", "annual_reading_goal")
