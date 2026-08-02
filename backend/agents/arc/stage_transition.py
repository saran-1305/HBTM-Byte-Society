from uuid import UUID

from backend.models.arc import ARCStageHistory
from backend.repositories.arc_repository import ARCStageHistoryRepository


async def record_transition(
    history_repo: ARCStageHistoryRepository,
    user_id: UUID,
    previous_stage: str,
    new_stage: str,
    transition_explanation: str,
    ai_summary: str,
) -> ARCStageHistory:
    """Persists a stage transition. Thin wrapper kept separate for the evaluation pipeline's readability."""
    return await history_repo.create_transition(
        user_id=user_id,
        previous_stage=previous_stage,
        current_stage=new_stage,
        transition_reason=transition_explanation or "AI initiated stage transition",
        ai_summary=ai_summary,
    )
