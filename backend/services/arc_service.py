from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional, List
from uuid import UUID
from datetime import datetime, timezone
import logging

from backend.repositories.arc_repository import (
    ARCRepository,
    ARCObservationRepository,
    ARCStageHistoryRepository,
    ARCEvaluationRepository,
)
from backend.repositories.community_repository import CertificationRepository
from backend.agents.arc.evidence import build_evidence_profile
from backend.agents.arc.reasoning import generate_reasoning
from backend.agents.arc.decision_engine import resolve_decision
from backend.agents.arc.stage_transition import record_transition
from backend.agents.arc.action_generator import normalize_actions, normalize_string_list
from backend.models.arc import ARCProfile, ARCObservation, ARCStageHistory, ARCEvaluation
from backend.data.arc_config import StageName

logger = logging.getLogger(__name__)

MAX_MEMORY_NOTES = 20

class ArcService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.arc_repo = ARCRepository(db)
        self.obs_repo = ARCObservationRepository(db)
        self.history_repo = ARCStageHistoryRepository(db)
        self.eval_repo = ARCEvaluationRepository(db)
        self.cert_repo = CertificationRepository(db)

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

    async def evaluate_user_state(self, user_id: UUID) -> ARCEvaluation:
        """
        Runs the full evaluation pipeline: gather evidence -> AI reasoning ->
        resolve decision -> (transition if warranted) -> normalize suggested actions ->
        persist an ARCEvaluation record (every call, not just on transition) -> update ARCProfile.
        """
        profile = await self._get_or_create_profile(user_id)

        evidence = await build_evidence_profile(self.db, user_id, profile)
        raw_evaluation = await generate_reasoning(evidence)
        decision = resolve_decision(raw_evaluation, profile.current_stage, evidence.get("struggle_requested", False))

        transition_explanation = decision.override_explanation or raw_evaluation.get("transition_explanation")
        if decision.decision == "CHANGE":
            await record_transition(
                self.history_repo,
                user_id=user_id,
                previous_stage=profile.current_stage,
                new_stage=decision.new_stage,
                transition_explanation=transition_explanation,
                ai_summary=raw_evaluation.get("ai_observation", ""),
            )
            profile.current_stage = decision.new_stage
            profile.stage_started_at = datetime.now(timezone.utc)

            if decision.new_stage == StageName.INTEGRATE.value:
                identity = evidence.get("identity") or {}
                domain = identity.get("long_term_goal") or (
                    identity.get("aspirations")[0] if identity.get("aspirations") else None
                ) or "general"
                await self.cert_repo.create_if_missing(user_id, domain)

        suggested_actions = normalize_actions(raw_evaluation.get("suggested_actions"))
        evidence_used = normalize_string_list(raw_evaluation.get("evidence_used"))
        strengths = normalize_string_list(raw_evaluation.get("strengths"), max_items=3)
        weaknesses = normalize_string_list(raw_evaluation.get("weaknesses"), max_items=3)
        recent_changes = raw_evaluation.get("recent_changes")
        current_focus = raw_evaluation.get("current_focus")
        behaviour_trend = raw_evaluation.get("behaviour_trend")
        hidden_opportunity = raw_evaluation.get("hidden_opportunity")
        future_prediction = raw_evaluation.get("future_prediction")
        confidence = raw_evaluation.get("confidence")

        # Fold in any new durable facts the AI surfaced, capped to avoid unbounded growth.
        memory_updates = raw_evaluation.get("memory_updates") or []
        if isinstance(memory_updates, list) and memory_updates:
            existing_notes = profile.memory_notes or []
            merged_notes = existing_notes + [str(n).strip() for n in memory_updates if str(n).strip()]
            profile.memory_notes = merged_notes[-MAX_MEMORY_NOTES:]

        profile.ai_observation = raw_evaluation.get("ai_observation")
        profile.current_reasoning = raw_evaluation.get("current_reasoning")
        profile.suggested_next_action = suggested_actions[0]["action"] if suggested_actions else None
        profile.last_evaluation_at = datetime.now(timezone.utc)

        await self.arc_repo.update_profile(profile)

        evaluation = await self.eval_repo.create(
            user_id=user_id,
            stage=profile.current_stage,
            decision=decision.decision,
            ai_observation=raw_evaluation.get("ai_observation"),
            reasoning=raw_evaluation.get("current_reasoning"),
            transition_explanation=transition_explanation,
            suggested_actions=suggested_actions,
            evidence_snapshot=evidence,
            evidence_used=evidence_used,
            recent_changes=recent_changes,
            strengths=strengths,
            weaknesses=weaknesses,
            current_focus=current_focus,
            behaviour_trend=behaviour_trend,
            hidden_opportunity=hidden_opportunity,
            future_prediction=future_prediction,
            confidence=confidence,
        )

        await self.db.commit()
        await self.db.refresh(evaluation)

        return evaluation

    async def get_latest_evaluation(self, user_id: UUID) -> Optional[ARCEvaluation]:
        evaluation = await self.eval_repo.get_latest(user_id)
        if not evaluation:
            return None

        # The evaluation row's `stage` is a snapshot from when it ran. In the normal flow it always
        # matches ARCProfile.current_stage (both are set in the same transaction), but anything that
        # touches current_stage outside that flow (a manual fix, a migration, an admin action) would
        # silently desync them — and every permission check (e.g. community posting) reads the profile,
        # not this evaluation row. Overlay the live profile stage so callers never see a stale value.
        profile = await self.get_profile(user_id)
        if profile.current_stage != evaluation.stage:
            logger.warning(
                f"ARCEvaluation.stage ('{evaluation.stage}') desynced from ARCProfile.current_stage "
                f"('{profile.current_stage}') for user {user_id}; using the profile's live value."
            )
            # Detach from the session before mutating — this is a display-only correction, and
            # `evaluation` must never be flushed back with a rewritten historical stage.
            self.db.expunge(evaluation)
            evaluation.stage = profile.current_stage

        return evaluation

    async def get_suggested_actions(self, user_id: UUID) -> List[Dict[str, Any]]:
        latest = await self.eval_repo.get_latest(user_id)
        return latest.suggested_actions if latest else []

    async def get_evidence(self, user_id: UUID) -> Dict[str, Any]:
        """
        Returns the raw evidence gathered for the latest evaluation (identity, grouped
        observations, memory, previous evaluation) plus the AI's structured breakdown
        of what it actually used, and the strengths/weaknesses/changes it derived from it.
        """
        latest = await self.eval_repo.get_latest(user_id)
        if not latest:
            latest = await self.evaluate_user_state(user_id)

        return {
            "stage": latest.stage,
            "raw_evidence": latest.evidence_snapshot,
            "evidence_used": latest.evidence_used or [],
            "recent_changes": latest.recent_changes,
            "strengths": latest.strengths or [],
            "weaknesses": latest.weaknesses or [],
            "evaluated_at": latest.created_at,
        }

    async def get_timeline(self, user_id: UUID, limit: int = 20) -> List[Dict[str, Any]]:
        """Merges evaluations and stage transitions into one chronological feed."""
        evaluations = await self.eval_repo.get_history(user_id, limit=limit)
        transitions = await self.history_repo.get_history(user_id)

        items = [
            {
                "type": "evaluation",
                "timestamp": e.created_at,
                "stage": e.stage,
                "decision": e.decision,
                "ai_observation": e.ai_observation,
                "reasoning": e.reasoning,
                "suggested_actions": e.suggested_actions,
            }
            for e in evaluations
        ] + [
            {
                "type": "transition",
                "timestamp": t.transitioned_at,
                "previous_stage": t.previous_stage,
                "current_stage": t.current_stage,
                "transition_reason": t.transition_reason,
                "ai_summary": t.ai_summary,
            }
            for t in transitions
        ]

        items.sort(key=lambda i: i["timestamp"], reverse=True)
        return items[:limit]

    # --- Backward Compatibility Shims ---
    async def get_current_stage(self, user_id: UUID) -> str:
        """Shim for old modules."""
        profile = await self.get_profile(user_id)
        return profile.current_stage

    async def get_stage_progress(self, user_id: UUID) -> float:
        """Shim for old modules (curator prompt context). Progress is deprecated, returning 1.0."""
        return 1.0
