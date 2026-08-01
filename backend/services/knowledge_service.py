import uuid
import asyncio
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from backend.repositories.knowledge_repo import KnowledgeRepository
from backend.agents.identity.repository import IdentityRepository
from backend.providers.knowledge.factory import ProviderFactory
from backend.agents.knowledge.agent import knowledge_agent
from backend.models.knowledge import CuratedRecommendation

class KnowledgeService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = KnowledgeRepository(db)
        self.identity_repo = IdentityRepository(db)
        self.provider_factory = ProviderFactory()

    async def refresh_recommendations(self, user_id: str) -> List[CuratedRecommendation]:
        uid = uuid.UUID(user_id)
        profile = await self.identity_repo.get_by_user_id(uid)
        if not profile:
            raise ValueError("Identity profile not found")

        # 1. Clear old recommendations
        await self.repo.clear_user_recommendations(uid)

        # 2. Determine search queries based on profile
        # Simply use core interests/motivations or the primary goal
        queries = profile.interests[:3] if profile.interests else ["personal growth", "productivity"]
        if profile.long_term_goal:
            queries.insert(0, profile.long_term_goal)

        raw_sources = []
        providers = self.provider_factory.get_all_providers()
        
        # 3. Fetch from all providers concurrently for each query (limit 3 per provider per query)
        tasks = []
        for provider in providers:
            for query in queries[:2]: # take top 2 queries to avoid too many requests
                tasks.append(provider.search(query=query, limit=3))
                
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for res in results:
            if isinstance(res, list):
                raw_sources.extend(res)

        if not raw_sources:
            return []

        # 4. Save raw collection
        await self.repo.save_collection("all_providers", raw_sources)

        # 5. Call KnowledgeAgent to curate
        profile_data = {
            "identity_summary": profile.identity_summary,
            "core_motivations": profile.core_motivations,
            "interests": profile.interests,
            "recommended_learning_approach": profile.recommended_learning_approach
        }
        
        curation_result = await knowledge_agent.curate_resources(profile_data, raw_sources)

        # 6. Store curated recommendations
        for ranked_item in curation_result.curated_resources:
            idx = ranked_item.source_index
            if 0 <= idx < len(raw_sources):
                # Only keep high/medium relevance
                if ranked_item.relevance_score > 50:
                    raw_data = raw_sources[idx]
                    # Save the KnowledgeSource
                    source = await self.repo.save_source(raw_data)
                    
                    # Save CuratedRecommendation
                    await self.repo.save_curated_recommendation(
                        user_id=uid,
                        source_id=source.id,
                        curation_data=ranked_item.model_dump()
                    )

        await self.db.commit()
        
        # 7. Return the new recommendations
        return await self.repo.get_user_recommendations(uid)

    async def get_recommendations(self, user_id: str) -> List[CuratedRecommendation]:
        uid = uuid.UUID(user_id)
        recs = await self.repo.get_user_recommendations(uid)
        if not recs:
            # Lazy refresh if none exist
            return await self.refresh_recommendations(user_id)
        return recs
