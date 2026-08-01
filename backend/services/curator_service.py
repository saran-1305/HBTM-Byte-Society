from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from backend.services.arc_service import ArcService
from backend.services.recommendation_engine_service import RecommendationEngineService
from backend.services.recommendation_history_service import RecommendationHistoryService
from backend.services.ai_service import AIService
from backend.services.prompt_service import PromptService
from backend.schemas.curator import CuratorResponse

class CuratorService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.arc_service = ArcService(db)
        self.recommendation_engine = RecommendationEngineService(db)
        self.history_service = RecommendationHistoryService(db)
        self.ai_service = AIService()
        self.prompt_service = PromptService()

    async def get_curated_recommendation(self, user_id: UUID) -> CuratorResponse:
        """
        Orchestrates Phase 2 and Phase 3:
        1. Gets the deterministic recommendation (Phase 2).
        2. Retrieves user context.
        3. Builds a prompt and generates intelligent reasoning via LLM (Phase 3).
        4. Bundles them into a CuratorResponse.
        """
        # 1. Get Deterministic Recommendation (This handles retrieving, ranking, and saving history)
        # Note: Since the prompt service needs the score breakdown, we'll fetch the ranked candidate 
        # and do the history save ourselves, or just use the generated response which has both.
        # Actually, `generate_recommendation` returns `RecommendationResponse` with `recommendation` and `score_breakdown`.
        # However, `PromptService` expects `RankedCandidate`. They have the exact same shape!
        rec_response = await self.recommendation_engine.generate_recommendation(user_id)
        
        # 2. Get User Context
        current_stage = await self.arc_service.get_current_stage(user_id)
        progress = await self.arc_service.get_stage_progress(user_id)
        
        # 3. Get Recent History for context
        recent_history_ids = await self.history_service.get_recent_history(user_id, limit=5)

        # 4. Build Prompt
        # We construct a RankedCandidate-like object on the fly for the prompt service
        from backend.schemas.candidate import RankedCandidate
        ranked_candidate = RankedCandidate(
            candidate=rec_response.recommendation,
            scores=rec_response.score_breakdown
        )
        
        prompt = self.prompt_service.build_curator_prompt(
            user_stage=current_stage,
            user_progress=progress,
            ranked_candidate=ranked_candidate,
            recent_history=recent_history_ids
        )

        # 5. Generate AI Reasoning
        reasoning = await self.ai_service.generate_reasoning(prompt)

        # 6. Return Unified Response
        return CuratorResponse(
            recommendation=rec_response.recommendation,
            curator=reasoning
        )
