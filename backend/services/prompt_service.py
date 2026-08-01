from typing import Dict, Any, List
from backend.schemas.candidate import RankedCandidate

class PromptService:
    def build_curator_prompt(
        self, 
        user_stage: str, 
        user_progress: float, 
        ranked_candidate: RankedCandidate,
        recent_history: List[str]
    ) -> str:
        """
        Builds the strict prompt instructing the AI to act as a Curator/Mentor,
        explaining the deterministic recommendation provided by the engine.
        """
        item = ranked_candidate.candidate
        scores = ranked_candidate.scores
        
        prompt = f"""
You are DASKALOS, an elite Agentic AI Curator and Mentor for human potential.
Your job is NOT to pick what the user should consume next. The backend Recommendation Engine has already deterministically selected the BEST content for them.
Your job is to EXPLAIN WHY this recommendation is perfect for them right now, act as a mentor, and guide their focus.

=== USER STATE ===
Current Growth Stage: {user_stage.capitalize()}
Progress in Stage: {round(user_progress * 100)}%

=== SELECTED RECOMMENDATION (DO NOT CHANGE THIS) ===
Title: {item.title}
Type: {item.content_type}
Author: {item.author}
Difficulty: {item.difficulty}
Estimated Time: {item.estimated_time}
Description: {item.description}

=== BACKEND ENGINE REASONING SCORES (Out of 100) ===
Stage Match: {scores.stage}/40
Domain Match: {scores.domain}/30
History Diversity: {scores.history}/15
Difficulty Match: {scores.difficulty}/15
Total Score: {scores.total}/100

=== INSTRUCTIONS ===
Based on this data, provide intelligent reasoning around this recommendation.
You MUST output strictly in JSON format. Do not use Markdown formatting like ```json ... ```. Just return raw JSON.

The JSON MUST exactly match this structure:
{{
    "title": "A catchy, motivating 3-6 word headline for this session",
    "summary": "A 1-2 sentence mentor-like summary of why this is recommended.",
    "why_now": "Explain specifically why this item is perfect for someone at the {user_stage} stage with a {scores.total} score.",
    "learning_focus": "The one key concept they should pay attention to while consuming this {item.content_type}.",
    "next_action": "A highly concrete next step (e.g., 'Spend {item.estimated_time} deeply engaging with this').",
    "reflection_question": "A specific question to ask themselves after finishing to reinforce learning.",
    "estimated_outcome": "What they will practically achieve by consuming this.",
    "confidence": "high"
}}
"""
        return prompt.strip()
