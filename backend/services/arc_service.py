from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any, Optional, List
from uuid import UUID
from datetime import datetime, timezone
import logging

from backend.repositories.arc_repository import ARCRepository, ARCObservationRepository, ARCStageHistoryRepository
from backend.agents.arc.agent import ARCAgent
from backend.models.arc import ARCProfile, ARCObservation, ARCStageHistory
from backend.models.identity_profile import IdentityProfile
from backend.data.arc_config import StageName

logger = logging.getLogger(__name__)

class ArcService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.arc_repo = ARCRepository(db)
        self.obs_repo = ARCObservationRepository(db)
        self.history_repo = ARCStageHistoryRepository(db)
        self.agent = ARCAgent()

    async def _get_or_create_profile(self, user_id: UUID) -> ARCProfile:
        profile = await self.arc_repo.get_profile(user_id)
        if not profile:
            profile = await self.arc_repo.create_profile(user_id, StageName.EXPLORE.value)
        return profile

    async def get_profile(self, user_id: UUID) -> ARCProfile:
        return await self._get_or_create_profile(user_id)

    async def get_history(self, user_id: UUID) -> List[ARCStageHistory]:
        return await self.history_repo.get_history(user_id)

    async def get_recent_observations(self, user_id: UUID, limit: int = 10) -> List[ARCObservation]:
        return await self.obs_repo.get_recent_observations(user_id, limit)

    async def record_observation(
        self,
        user_id: UUID,
        observation_type: str,
        source_module: str,
        title: str,
        description: str = None,
        metadata_obj: Dict[str, Any] = None,
        confidence: float = 1.0,
        trigger_evaluation: bool = True
    ) -> ARCObservation:
        """
        Record an event and optionally trigger an AI evaluation.
        """
        obs = await self.obs_repo.create_observation(
            user_id=user_id,
            observation_type=observation_type,
            source_module=source_module,
            title=title,
            description=description,
            metadata_obj=metadata_obj,
            confidence=confidence
        )
        await self.db.commit()

        if trigger_evaluation:
            # We could add throttling logic here (e.g. check last_evaluation_at)
            await self.evaluate_user_state(user_id)

        return obs

    async def evaluate_user_state(self, user_id: UUID) -> ARCProfile:
        """
        Gathers context and runs the ARC AI Agent to update the user's state.
        """
        profile = await self._get_or_create_profile(user_id)
        
        # Load Identity
        result = await self.db.execute(select(IdentityProfile).where(IdentityProfile.user_id == user_id))
        identity = result.scalar_one_or_none()
        identity_context = ""
        if identity:
            identity_context = f"Goal: {identity.long_term_goal}\nAspirations: {identity.aspirations}\nInterests: {identity.interests}\nSkills: {identity.current_skills}"
        else:
            identity_context = "Identity not set yet."

        # Load Recent Observations
        observations = await self.obs_repo.get_recent_observations(user_id, limit=5)
        obs_dicts = [
            {
                "source_module": o.source_module,
                "title": o.title,
                "description": o.description
            } for o in observations
        ]

        # Call Agent
        evaluation = await self.agent.evaluate_state(
            identity_context=identity_context,
            recent_observations=obs_dicts,
            current_stage=profile.current_stage
        )

        decision = evaluation.get("stage_transition_decision", "KEEP")
        new_stage = evaluation.get("current_stage", profile.current_stage)
        
        # If the AI hallucinates an invalid stage, fallback to current
        try:
            StageName(new_stage)
        except ValueError:
            new_stage = profile.current_stage
            decision = "KEEP"

        # Check for transition
        if decision == "CHANGE" and new_stage != profile.current_stage:
            # Create Transition History
            await self.history_repo.create_transition(
                user_id=user_id,
                previous_stage=profile.current_stage,
                current_stage=new_stage,
                transition_reason=evaluation.get("transition_explanation", "AI initiated stage transition"),
                ai_summary=evaluation.get("ai_observation", "")
            )
            profile.current_stage = new_stage
            profile.stage_started_at = datetime.now(timezone.utc)

        # Update ARC Profile
        profile.ai_observation = evaluation.get("ai_observation")
        profile.current_reasoning = evaluation.get("current_reasoning")
        profile.suggested_next_action = evaluation.get("suggested_next_action")
        profile.last_evaluation_at = datetime.now(timezone.utc)
        
        await self.arc_repo.update_profile(profile)
        await self.db.commit()
        await self.db.refresh(profile)

        return profile

    # --- Backward Compatibility Shims ---
    async def get_current_stage(self, user_id: UUID) -> str:
        """Shim for old modules."""
        profile = await self.get_profile(user_id)
        return profile.current_stage

    async def get_stage_progress(self, user_id: UUID) -> float:
        """Shim for old modules. Progress is deprecated, returning 1.0."""
        return 1.0
