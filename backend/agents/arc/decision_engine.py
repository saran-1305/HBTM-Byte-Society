from dataclasses import dataclass
from typing import Any, Dict, Optional

from backend.data.arc_config import StageName

# Stages the user can request to leave in favor of Struggle themselves. Struggle is opt-in by
# design — it must never require the AI (or its availability) to grant it.
_STAGES_ELIGIBLE_FOR_STRUGGLE_REQUEST = (StageName.EXPLORE.value, StageName.COMMIT.value)


@dataclass
class Decision:
    decision: str  # "KEEP" or "CHANGE"
    new_stage: str
    override_explanation: Optional[str] = None


def resolve_decision(evaluation: Dict[str, Any], current_stage: str, struggle_requested: bool = False) -> Decision:
    """
    Validates the LLM's proposed decision/stage against the known StageName enum.
    Falls back to KEEP with the current stage if the AI hallucinated an invalid stage.

    A user-initiated Struggle request always wins, deterministically — this does NOT depend on
    the LLM response being present, valid, or even having run (it still applies if `evaluate`
    fell back to its offline default because every provider failed).
    """
    decision = evaluation.get("stage_transition_decision", "KEEP")
    new_stage = evaluation.get("current_stage", current_stage)

    try:
        StageName(new_stage)
    except ValueError:
        new_stage = current_stage
        decision = "KEEP"

    if decision == "CHANGE" and new_stage == current_stage:
        decision = "KEEP"

    override_explanation = None
    if struggle_requested and current_stage in _STAGES_ELIGIBLE_FOR_STRUGGLE_REQUEST:
        if decision != "CHANGE" or new_stage != StageName.STRUGGLE.value:
            override_explanation = (
                "You asked to enter Struggle support mode directly — that's your call to make, not "
                "something ARC needed to independently conclude, so it's honored immediately."
            )
        decision = "CHANGE"
        new_stage = StageName.STRUGGLE.value

    return Decision(decision=decision, new_stage=new_stage, override_explanation=override_explanation)
