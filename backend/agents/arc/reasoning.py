import json
import logging
import re
from typing import Any, Dict

from backend.services.provider_manager import ProviderManager

logger = logging.getLogger(__name__)


def _clean_json(raw_str: str) -> str:
    cleaned = re.sub(r'```(?:json)?\s*', '', raw_str)
    cleaned = re.sub(r'```', '', cleaned)
    return cleaned.strip()


def _build_prompt(evidence: Dict[str, Any]) -> str:
    identity = evidence.get("identity")
    identity_text = "Identity not set yet."
    if identity:
        identity_text = (
            f"Goal: {identity.get('long_term_goal')}\n"
            f"Aspirations: {identity.get('aspirations')}\n"
            f"Interests: {identity.get('interests')}\n"
            f"Skills: {identity.get('current_skills')}"
        )

    obs_by_module = evidence.get("observations_by_module") or {}
    if obs_by_module:
        observations_text = "\n".join(
            f"[{module}]\n" + "\n".join(f"  - {o['title']}" for o in items)
            for module, items in obs_by_module.items()
        )
    else:
        observations_text = "No recent observations recorded."

    memory_notes = evidence.get("memory_notes") or []
    memory_text = "\n".join(f"- {note}" for note in memory_notes) if memory_notes else "None yet."

    last_evaluation = evidence.get("last_evaluation")
    last_evaluation_text = "This is the first evaluation for this user."
    if last_evaluation:
        last_evaluation_text = (
            f"Last decision: {last_evaluation.get('decision')} at {last_evaluation.get('created_at')}\n"
            f"Last reasoning: {last_evaluation.get('reasoning')}"
        )

    # Computed in evidence.py (deterministic, doesn't depend on this prompt being followed) —
    # used here only to phrase the prompt; decision_engine.py enforces it independently.
    struggle_requested = evidence.get("struggle_requested", False)

    struggle_note = ""
    if struggle_requested and evidence.get("current_stage") in ("explore", "commit"):
        struggle_note = (
            "\nIMPORTANT: This user has explicitly asked to enter Struggle support mode. Struggle is the one "
            "stage the user opts into themselves rather than one you infer from behavior alone — honor that "
            "request now (transition to 'struggle') and explain why it's the right move given their evidence, "
            "rather than second-guessing whether they've 'earned' it.\n"
        )

    return f"""
You are the ARC Intelligence Engine, the central brain of DASKALOS — an Adaptive Growth Decision Engine.
Your job is to evaluate the user's growth journey using real evidence, never arbitrary scores, percentages, or XP.

What each stage actually means (use this to judge readiness, not just to label the stage):
- explore: broad exposure across specializations within their field, driven by their stated aspirations. Evidence
  of readiness for Commit is typically genuine engagement across a few DIFFERENT resources/topics (roughly 3+
  distinct completions), not just time passed.
- commit: the user makes active choices and takes consistent small actions toward their specific goal — practice,
  not browsing. Evidence of struggle-worthiness or breakthrough-worthiness comes from what they actually attempt.
- struggle: this stage is chosen BY THE USER when they hit real setbacks, not inferred purely from your analysis.
  Content here should analyze the specific setback and keep them motivated, ideally connecting them with people
  experienced in their field.
- breakthrough: triggered by evidence of a genuine first success (a completed project, a real accomplishment, a
  reflection expressing achievement) — the focus becomes solidifying fundamentals so the success is repeatable.
- integrate: the highest bar — real evidence of mastery, ready to mentor others in the same field. Treat this
  transition conservatively; only recommend it with high confidence and strong, specific evidence.
{struggle_note}
Identity Context:
{identity_text}

Current Stage: {evidence.get('current_stage')}
Stage Started At: {evidence.get('stage_started_at')}

Memory (durable facts learned about this user across past evaluations):
{memory_text}

Previous Evaluation:
{last_evaluation_text}

Recent Observations (evidence), grouped by source:
{observations_text}

Evaluate whether the user should remain in '{evidence.get('current_stage')}' or transition to the next stage
(Explore -> Commit -> Struggle -> Breakthrough -> Integrate). Base this ONLY on the evidence above — never on
counts, percentages, or completion ratios (the "3+ distinct completions" guidance above is a qualitative signal
to interpret, not a score to tally). A transition requires clear qualitative evidence of readiness.

Return ONLY a JSON object matching this exact structure:
{{
    "current_stage": "string (the stage they should be in now, after this evaluation)",
    "ai_observation": "string (what you noticed recently, referencing specific evidence)",
    "current_reasoning": "string (why they are in this stage right now)",
    "stage_transition_decision": "string (KEEP or CHANGE)",
    "transition_explanation": "string (why you made this transition decision, or why not)",
    "evidence_used": [
        "string (one concrete, countable evidence point actually drawn from the observations above, e.g. 'Completed 3 beginner resources' or 'Ignored 5 advanced recommendations' or 'Reflections show increasing confidence' — not a restatement of the reasoning)"
    ],
    "recent_changes": "string (what is different now compared to the previous evaluation — 'This is their first evaluation.' if there is none)",
    "strengths": ["string (a specific strength this evidence demonstrates)"],
    "weaknesses": ["string (a specific gap or risk this evidence reveals)"],
    "current_focus": "string (one sentence: what this person is actually spending their energy on right now, per the evidence — e.g. 'Exploring AI Engineering fundamentals while starting to ship small projects')",
    "behaviour_trend": "string (one sentence describing the DIRECTION of change — improving, plateauing, or declining — and why, e.g. 'Reflection frequency has dropped over the last week, signalling reduced consistency')",
    "hidden_opportunity": "string (one concrete thing this person hasn't tried yet that the evidence suggests would help them right now — not a restatement of suggested_actions)",
    "future_prediction": "string (one grounded, specific forecast conditioned on their CURRENT trend continuing, e.g. 'If this pace continues for two more weeks, they'll have the practical evidence needed to move into Commit' or a risk warning if the trend is negative)",
    "confidence": "string (high, medium, or low — how much evidence actually backs this evaluation)",
    "suggested_actions": [
        {{"action": "string (one concrete, specific next step, e.g. 'Complete one beginner project')", "why": "string (why this helps them right now)"}}
    ],
    "memory_updates": ["string (new durable fact worth remembering long-term, if any — omit if nothing new)"]
}}

Provide 2 to 4 suggested_actions, 2 to 4 evidence_used points, and 1 to 3 items each for strengths/weaknesses.
Every field must be concrete and specific to THIS user's actual evidence above — never generic filler like
"keep learning" or "doing well". If there isn't enough evidence yet for a confident behaviour_trend or
future_prediction, say so explicitly rather than inventing one — set confidence to "low" in that case.
"""


_REQUIRED_KEYS = ("current_stage", "ai_observation", "current_reasoning", "stage_transition_decision")


def _fallback(evidence: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "current_stage": evidence.get("current_stage"),
        "ai_observation": "System fallback active. Observation temporarily unavailable.",
        "current_reasoning": "Awaiting more activity data.",
        "stage_transition_decision": "KEEP",
        "transition_explanation": "Fallback active.",
        "evidence_used": [],
        "recent_changes": "Unavailable — AI providers were unreachable for this evaluation.",
        "strengths": [],
        "weaknesses": [],
        "current_focus": "Unavailable — AI providers were unreachable for this evaluation.",
        "behaviour_trend": "Not enough signal to determine a trend right now.",
        "hidden_opportunity": None,
        "future_prediction": None,
        "confidence": "low",
        "suggested_actions": [
            {"action": "Continue exploring your interests.", "why": "Keep building evidence for the next evaluation."}
        ],
        "memory_updates": [],
    }


async def generate_reasoning(evidence: Dict[str, Any]) -> Dict[str, Any]:
    """
    Single LLM round-trip (via the existing Groq -> OpenRouter -> mock ProviderManager cascade)
    that produces the decision, reasoning, transition explanation, suggested actions, and memory updates.
    """
    provider_manager = ProviderManager()
    prompt = _build_prompt(evidence)

    try:
        _, raw_response = await provider_manager.generate_json(prompt)
        cleaned = _clean_json(raw_response)
        parsed = json.loads(cleaned)

        # ProviderManager's own last-resort fallback returns a generic mock shaped for a
        # different feature (opportunities) when both Groq and OpenRouter fail. Detect that
        # here rather than silently surfacing nulls to the user.
        if not all(parsed.get(key) for key in _REQUIRED_KEYS):
            logger.warning("ARC reasoning response missing required fields, using ARC-specific fallback.")
            return _fallback(evidence)

        return parsed
    except Exception as e:
        logger.error(f"ARC reasoning generation failed: {e}")
        return _fallback(evidence)
