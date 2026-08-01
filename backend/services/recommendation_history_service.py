from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from uuid import UUID

from backend.models.recommendation import RecommendationHistory
from backend.schemas.candidate import RecommendationItem

class RecommendationHistoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_recent_history(self, user_id: UUID, limit: int = 10) -> List[str]:
        """Returns a list of the last `limit` content IDs recommended to this user."""
        stmt = (
            select(RecommendationHistory.content_id)
            .where(RecommendationHistory.user_id == user_id)
            .order_by(RecommendationHistory.created_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def save_recommendation(self, user_id: UUID, item: RecommendationItem) -> RecommendationHistory:
        """Saves a recommendation to the history log."""
        history = RecommendationHistory(
            user_id=user_id,
            content_id=item.id,
            title=item.title,
            type=item.content_type,
            stage=item.stage,
            domain=item.domain,
            url=item.url
        )
        self.db.add(history)
        await self.db.commit()
        await self.db.refresh(history)
        return history

    async def get_full_history(self, user_id: UUID) -> List[RecommendationHistory]:
        """Gets all recommendation history for a user."""
        stmt = (
            select(RecommendationHistory)
            .where(RecommendationHistory.user_id == user_id)
            .order_by(RecommendationHistory.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
