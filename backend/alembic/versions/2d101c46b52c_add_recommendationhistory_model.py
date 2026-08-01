"""Add RecommendationHistory model

Revision ID: 2d101c46b52c
Revises: 427adddd69d7
Create Date: 2026-08-01 16:32:37.857725

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2d101c46b52c'
down_revision: Union[str, Sequence[str], None] = '427adddd69d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'recommendation_history',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('content_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('reasoning', sa.JSON(), nullable=False),
        sa.Column('expected_outcome', sa.String(), nullable=True),
        sa.Column('reflection_prompt', sa.String(), nullable=True),
        sa.Column('feedback', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recommendation_history_user_id'), 'recommendation_history', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_recommendation_history_user_id'), table_name='recommendation_history')
    op.drop_table('recommendation_history')
