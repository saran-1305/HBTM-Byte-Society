import json
import asyncio
from backend.providers.base import LLMProvider

class MockProvider(LLMProvider):
    @property
    def name(self) -> str:
        return "mock"

    async def generate(self, prompt: str) -> str:
        # Simulate network latency
        await asyncio.sleep(0.5)
        
        fallback_json = {
            "title": "Today's Recommendation",
            "summary": "Continue building momentum.",
            "why_now": "This recommendation aligns with your current growth stage.",
            "learning_focus": "Focus on understanding one key concept.",
            "next_action": "Spend 20 minutes engaging with this resource.",
            "reflection_question": "What is one idea you learned today?",
            "estimated_outcome": "Improved understanding.",
            "confidence": "fallback"
        }
        
        return json.dumps(fallback_json)
