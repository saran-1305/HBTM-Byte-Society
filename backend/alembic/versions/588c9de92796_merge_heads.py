"""Merge heads

Revision ID: 588c9de92796
Revises: 2d101c46b52c, a9a67bfeb9bf
Create Date: 2026-08-01 21:57:34.659064

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '588c9de92796'
down_revision: Union[str, Sequence[str], None] = ('2d101c46b52c', 'a9a67bfeb9bf')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
