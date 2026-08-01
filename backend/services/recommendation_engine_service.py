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
        
        # In a real system we might read domain from their IdentityProfile.
        # For Phase 2, we'll assume a default domain or skip strict domain filtering.
        # Let's say their domain is productivity for now.
        target_domain = "productivity"

        # 2. Retrieve Recent History
        recent_history_ids = await self.history_service.get_recent_history(user_id, limit=10)

        # 3. Retrieve Candidates
        candidates = self.candidate_service.get_candidates(current_stage, domain=None) # Relaxing domain strict filter
        
        # Filter out items they've seen in the last 10 recommendations
        candidates = [c for c in candidates if c.id not in recent_history_ids]
        
        if not candidates:
            raise ValueError("No eligible candidates found after filtering history.")

        # 4. Rank Candidates
        ranked = self.ranking_service.rank_candidates(
            candidates=candidates,
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
        
        # 7. Return Response
        return RecommendationResponse(
            recommendation=top_ranked.candidate,
            score_breakdown=top_ranked.scores
        )
