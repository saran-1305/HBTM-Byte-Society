from typing import Any, Dict
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.models.arc import ARCProfile
from backend.models.identity_profile import IdentityProfile
from backend.repositories.arc_repository import ARCObservationRepository, ARCEvaluationRepository


async def build_evidence_profile(db: AsyncSession, user_id: UUID, profile: ARCProfile) -> Dict[str, Any]:
    """
    Pure data assembly (no LLM calls). Gathers everything the reasoning step
    needs to judge whether the user should stay or transition.
    """
    result = await db.execute(select(IdentityProfile).where(IdentityProfile.user_id == user_id))
    identity = result.scalar_one_or_none()

    if identity:
        identity_context = {
            "long_term_goal": identity.long_term_goal,
            "aspirations": identity.aspirations,
            "interests": identity.interests,
            "current_skills": identity.current_skills,
        }
    else:
        identity_context = None

    obs_repo = ARCObservationRepository(db)
    observations = await obs_repo.get_recent_observations(user_id, limit=15)

    observations_by_module: Dict[str, list] = {}
    for obs in observations:
        observations_by_module.setdefault(obs.source_module, []).append({
            "title": obs.title,
            "description": obs.description,
            "created_at": obs.created_at.isoformat() if obs.created_at else None,
        })

    eval_repo = ARCEvaluationRepository(db)
    last_evaluation = await eval_repo.get_latest(user_id)
    last_evaluation_summary = None
    if last_evaluation:
        last_evaluation_summary = {
            "decision": last_evaluation.decision,
            "reasoning": last_evaluation.reasoning,
            "created_at": last_evaluation.created_at.isoformat() if last_evaluation.created_at else None,
        }

    # Struggle is the one stage the user opts into themselves rather than one ARC infers — this
    # must be detected deterministically here (not left to the LLM to notice) so decision_engine.py
    # can honor it even if every AI provider is unavailable for this evaluation.
    struggle_requested = any(
        "struggle support" in ((o.get("title") or "") + (o.get("description") or "")).lower()
        for items in observations_by_module.values()
        for o in items
    )

    return {
        "identity": identity_context,
        "current_stage": profile.current_stage,
        "stage_started_at": profile.stage_started_at.isoformat() if profile.stage_started_at else None,
        "memory_notes": profile.memory_notes or [],
        "observations_by_module": observations_by_module,
        "last_evaluation": last_evaluation_summary,
        "struggle_requested": struggle_requested,
    }
