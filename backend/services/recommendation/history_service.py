from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, date
from typing import List, Optional
from backend.models.recommendation import RecommendationHistory

class HistoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def save(self, user_id: str, recommendation_data: dict, reasoning: list) -> RecommendationHistory:
        """
        Stores every recommendation.
        """
        history_record = RecommendationHistory(
            user_id=user_id,
            content_id=recommendation_data.get("id"),
            title=recommendation_data.get("title"),
            type=recommendation_data.get("type"),
            reasoning=reasoning,
            expected_outcome=recommendation_data.get("expected_outcome"),
            url=recommendation_data.get("url")
        )
        self.db.add(history_record)
        await self.db.commit()
        await self.db.refresh(history_record)
        return history_record
        
    async def get_recent(self, user_id: str, limit: int = 10) -> List[RecommendationHistory]:
        """
        Gets recent recommendations for a user.
        """
        result = await self.db.execute(
            select(RecommendationHistory)
            .filter(RecommendationHistory.user_id == user_id)
            .order_by(RecommendationHistory.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
            
    async def get_today(self, user_id: str) -> List[RecommendationHistory]:
        """
        Gets recommendations made today for a user.
        """
        today = date.today()
        result = await self.db.execute(
            select(RecommendationHistory)
            .filter(RecommendationHistory.user_id == user_id)
            .filter(RecommendationHistory.created_at >= today)
        )
        return result.scalars().all()
            
    async def avoid_duplicates(self, user_id: str) -> List[str]:
        """
        Returns a list of content_ids previously recommended to avoid duplicates.
        """
        result = await self.db.execute(
            select(RecommendationHistory.content_id)
            .filter(RecommendationHistory.user_id == user_id)
        )
        return result.scalars().all()
        
    async def update_feedback(self, recommendation_id: str, reaction: str) -> Optional[RecommendationHistory]:
        """
        Update feedback on a recommendation.
        """
        result = await self.db.execute(
            select(RecommendationHistory).filter(RecommendationHistory.id == recommendation_id)
        )
        record = result.scalars().first()
        if record:
            record.feedback = reaction
            await self.db.commit()
            await self.db.refresh(record)
        return record
