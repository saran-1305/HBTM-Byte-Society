from typing import List, Optional, Any, Dict
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from backend.models.arc import ARCProfile, ARCObservation, ARCStageHistory, ARCEvaluation

class ARCRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_profile(self, user_id: UUID) -> Optional[ARCProfile]:
        result = await self.db.execute(select(ARCProfile).where(ARCProfile.user_id == user_id))
        return result.scalar_one_or_none()

    async def create_profile(self, user_id: UUID, current_stage: str) -> ARCProfile:
        profile = ARCProfile(user_id=user_id, current_stage=current_stage)
        self.db.add(profile)
        await self.db.flush()
        return profile

    async def update_profile(self, profile: ARCProfile) -> ARCProfile:
        self.db.add(profile)
        await self.db.flush()
        return profile


class ARCObservationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def create_observation(
        self, 
        user_id: UUID, 
        observation_type: str,
        source_module: str,
        title: str,
        description: str = None,
        metadata_obj: Dict[str, Any] = None,
        confidence: float = 1.0
    ) -> ARCObservation:
        obs = ARCObservation(
            user_id=user_id,
            observation_type=observation_type,
            source_module=source_module,
            title=title,
            description=description,
            metadata_obj=metadata_obj,
            confidence=confidence
        )
        self.db.add(obs)
        await self.db.flush()
        return obs

    async def get_recent_observations(self, user_id: UUID, limit: int = 10) -> List[ARCObservation]:
        result = await self.db.execute(
            select(ARCObservation)
            .where(ARCObservation.user_id == user_id)
            .order_by(desc(ARCObservation.created_at))
            .limit(limit)
        )
        return result.scalars().all()


class ARCStageHistoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def create_transition(
        self, 
        user_id: UUID, 
        previous_stage: Optional[str],
        current_stage: str,
        transition_reason: str,
        ai_summary: str = None
    ) -> ARCStageHistory:
        history = ARCStageHistory(
            user_id=user_id,
            previous_stage=previous_stage,
            current_stage=current_stage,
            transition_reason=transition_reason,
            ai_summary=ai_summary
        )
        self.db.add(history)
        await self.db.flush()
        return history

    async def get_history(self, user_id: UUID) -> List[ARCStageHistory]:
        result = await self.db.execute(
            select(ARCStageHistory)
            .where(ARCStageHistory.user_id == user_id)
            .order_by(desc(ARCStageHistory.transitioned_at))
        )
        return result.scalars().all()


class ARCEvaluationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        user_id: UUID,
        stage: str,
        decision: str,
        ai_observation: str = None,
        reasoning: str = None,
        transition_explanation: str = None,
        suggested_actions: List[Dict[str, Any]] = None,
        evidence_snapshot: Dict[str, Any] = None,
        evidence_used: List[str] = None,
        recent_changes: str = None,
        strengths: List[str] = None,
        weaknesses: List[str] = None,
        current_focus: str = None,
        behaviour_trend: str = None,
        hidden_opportunity: str = None,
        future_prediction: str = None,
        confidence: str = None,
    ) -> ARCEvaluation:
        evaluation = ARCEvaluation(
            user_id=user_id,
            stage=stage,
            decision=decision,
            ai_observation=ai_observation,
            reasoning=reasoning,
            transition_explanation=transition_explanation,
            suggested_actions=suggested_actions or [],
            evidence_snapshot=evidence_snapshot,
            evidence_used=evidence_used or [],
            recent_changes=recent_changes,
            strengths=strengths or [],
            weaknesses=weaknesses or [],
            current_focus=current_focus,
            behaviour_trend=behaviour_trend,
            hidden_opportunity=hidden_opportunity,
            future_prediction=future_prediction,
            confidence=confidence,
        )
        self.db.add(evaluation)
        await self.db.flush()
        return evaluation

    async def get_latest(self, user_id: UUID) -> Optional[ARCEvaluation]:
        result = await self.db.execute(
            select(ARCEvaluation)
            .where(ARCEvaluation.user_id == user_id)
            .order_by(desc(ARCEvaluation.created_at))
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_history(self, user_id: UUID, limit: int = 20) -> List[ARCEvaluation]:
        result = await self.db.execute(
            select(ARCEvaluation)
            .where(ARCEvaluation.user_id == user_id)
            .order_by(desc(ARCEvaluation.created_at))
            .limit(limit)
        )
        return result.scalars().all()
