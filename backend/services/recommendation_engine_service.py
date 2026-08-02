from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List

from backend.services.arc_service import ArcService
from backend.repositories.content_repository import ContentRepository
from backend.services.candidate_service import CandidateService
from backend.services.ranking_service import RankingService
from backend.services.recommendation_history_service import RecommendationHistoryService
from backend.schemas.candidate import RecommendationResponse, RankedCandidate

class RecommendationEngineService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.arc_service = ArcService(db)
        self.repo = ContentRepository()
        self.candidate_service = CandidateService(self.repo)
        self.ranking_service = RankingService()
        self.history_service = RecommendationHistoryService(db)

    async def get_ranked_candidates(self, user_id: UUID) -> List[RankedCandidate]:
        """Core pipeline to fetch and rank all candidates for a user."""
        # 1. Read ARC State
        current_stage = await self.arc_service.get_current_stage(user_id)
        
        # 2. Fetch Identity Profile to set Domain
        from sqlalchemy.future import select
        from backend.models.identity_profile import IdentityProfile
        result = await self.db.execute(select(IdentityProfile).where(IdentityProfile.user_id == user_id))
        identity = result.scalar_one_or_none()
        
        if identity and identity.long_term_goal:
            target_domain = identity.long_term_goal
        elif identity and identity.aspirations and len(identity.aspirations) > 0:
            target_domain = identity.aspirations[0]
        else:
            target_domain = "productivity"

        # 3. Retrieve Recent History
        recent_history_ids = await self.history_service.get_recent_history(user_id, limit=10)

        # 4. Retrieve Candidates (Live Search)
        candidates = await self.candidate_service.get_candidates(current_stage, domain=target_domain)
        
        # Filter out items they've seen in the last 10 recommendations
        filtered_candidates = [c for c in candidates if c.id not in recent_history_ids]
        
        if not filtered_candidates:
            # If all candidates were filtered out (e.g. only fallback video is available), reuse them
            filtered_candidates = candidates
            
        if not filtered_candidates:
            raise ValueError("No eligible candidates found after filtering history.")

        # 4. Rank Candidates
        ranked = self.ranking_service.rank_candidates(
            candidates=filtered_candidates,
            current_stage=current_stage,
            target_domain=target_domain,
            recent_history=recent_history_ids
        )
        
        return ranked

    async def generate_recommendation(self, user_id: UUID) -> RecommendationResponse:
        """Pipeline to generate, save, and return the single BEST recommendation."""
        ranked = await self.get_ranked_candidates(user_id)
        
        # 5. Choose Top Recommendation
        top_ranked = ranked[0]
        
        # 6. Save Recommendation
        await self.history_service.save_recommendation(user_id, top_ranked.candidate)

        # Feed evidence to ARC (not itself a trigger — completion/reflection is the meaningful signal)
        await self.arc_service.record_observation(
            user_id=user_id,
            observation_type="Recommendation Given",
            source_module="recommendation",
            title=top_ranked.candidate.title,
            trigger_evaluation=False,
        )

        # 7. Return Response
        return RecommendationResponse(
            recommendation=top_ranked.candidate,
            score_breakdown=top_ranked.scores
        )
