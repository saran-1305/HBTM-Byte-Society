import json
import logging
from typing import Dict, Any, List
from backend.services.provider_manager import ProviderManager

logger = logging.getLogger(__name__)

class ARCAgent:
    def __init__(self):
        self.provider_manager = ProviderManager()

    def _clean_json(self, raw_str: str) -> str:
        import re
        cleaned = re.sub(r'```(?:json)?\s*', '', raw_str)
        cleaned = re.sub(r'```', '', cleaned)
        return cleaned.strip()

    async def evaluate_state(
        self, 
        identity_context: str, 
        recent_observations: List[Dict[str, Any]], 
        current_stage: str
    ) -> Dict[str, Any]:
        """
        Uses LiteLLM cascade to evaluate the user's state based on observations.
        Returns a dict with stage, observation, reasoning, and next action.
        """
        
        observations_text = "\n".join([f"- [{obs.get('source_module')}] {obs.get('title')}" for obs in recent_observations])
        if not observations_text:
            observations_text = "No recent observations recorded."

        prompt = f"""
        You are the ARC Intelligence Engine, the central brain of DASKALOS.
        Your goal is to evaluate the user's current growth journey based on their Identity and recent Activity Observations.

        Identity Context:
        {identity_context}

        Current Stage: {current_stage}

        Recent Observations:
        {observations_text}

        You must evaluate if the user should remain in '{current_stage}' or transition to a new stage (e.g. Explore, Learn, Build, Share, Lead).
        Provide an AI Observation (what you noticed recently), Reasoning (why you are keeping/changing their stage), and a Suggested Next Action.

        Return ONLY a JSON object matching this exact structure:
        {{
            "current_stage": "string (the stage they are in now)",
            "ai_observation": "string (brief observation of recent behavior)",
            "current_reasoning": "string (why are they in this stage?)",
            "suggested_next_action": "string (what should they do next?)",
            "stage_transition_decision": "string (KEEP or CHANGE)",
            "transition_explanation": "string (why you made the transition decision)"
        }}
        """

        try:
            _, raw_response = await self.provider_manager.generate_json(prompt)
            cleaned = self._clean_json(raw_response)
            parsed = json.loads(cleaned)
            return parsed
        except Exception as e:
            logger.error(f"ARCAgent evaluation failed: {e}")
            return {
                "current_stage": current_stage,
                "ai_observation": "System fallback active. Observation temporarily unavailable.",
                "current_reasoning": "Awaiting more activity data.",
                "suggested_next_action": "Continue exploring your interests.",
                "stage_transition_decision": "KEEP",
                "transition_explanation": "Fallback active."
            }
