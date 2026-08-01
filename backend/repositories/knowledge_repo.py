import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from backend.models.knowledge import KnowledgeSource, KnowledgeCollection, CuratedRecommendation

class KnowledgeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_source(self, data: Dict[str, Any]) -> KnowledgeSource:
        source = KnowledgeSource(**data)
        self.db.add(source)
        await self.db.flush()
        return source

    async def save_collection(self, provider: str, raw_content: List[Dict[str, Any]]) -> KnowledgeCollection:
        collection = KnowledgeCollection(
            provider=provider,
            raw_content=raw_content,
            processing_status="processed"
        )
        self.db.add(collection)
        await self.db.flush()
        return collection

    async def save_curated_recommendation(self, user_id: uuid.UUID, source_id: uuid.UUID, curation_data: Dict[str, Any]) -> CuratedRecommendation:
        rec = CuratedRecommendation(
            user_id=user_id,
            knowledge_source_id=source_id,
            recommendation_reason=curation_data.get("recommendation_reason", ""),
            relevance_score=curation_data.get("relevance_score", 0.0),
            confidence_score=curation_data.get("confidence_score", 0.0),
            priority=curation_data.get("priority", 3),
            recommendation_type=curation_data.get("recommendation_type", "supplementary"),
            generated_by="knowledge_agent_v1"
        )
        self.db.add(rec)
        await self.db.flush()
        return rec

    async def get_user_recommendations(self, user_id: uuid.UUID) -> List[CuratedRecommendation]:
        stmt = (
            select(CuratedRecommendation)
            .where(CuratedRecommendation.user_id == user_id)
            .options(selectinload(CuratedRecommendation.source))
            .order_by(CuratedRecommendation.priority.asc(), CuratedRecommendation.relevance_score.desc())
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def clear_user_recommendations(self, user_id: uuid.UUID):
        stmt = select(CuratedRecommendation).where(CuratedRecommendation.user_id == user_id)
        res = await self.db.execute(stmt)
        for rec in res.scalars().all():
            await self.db.delete(rec)
        await self.db.flush()
