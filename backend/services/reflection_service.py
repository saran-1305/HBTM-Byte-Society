import json
import logging
from backend.services.provider_manager import ProviderManager
from backend.schemas.activity import ReflectionAnalysis, ReflectionSubmitRequest
import re

logger = logging.getLogger(__name__)

class ReflectionService:
    def __init__(self):
        self.provider_manager = ProviderManager()

    def _clean_json_string(self, raw_str: str) -> str:
        cleaned = re.sub(r'```(?:json)?\s*', '', raw_str)
        cleaned = re.sub(r'```', '', cleaned)
        return cleaned.strip()

    async def analyze_reflection(self, reflection: ReflectionSubmitRequest) -> ReflectionAnalysis:
        prompt = f"""
You are an AI Mentor evaluating a student's reflection after they consumed a learning resource.
Evaluate their reflection based on whatever they shared:
1. Biggest Insight: {reflection.biggest_insight}
2. Confusion: {reflection.confusion or "(not shared)"}
3. Application: {reflection.application or "(not shared)"}

Output strictly in JSON matching exactly this schema:
{{
 "understanding": "high" | "medium" | "low",
 "confidence": "high" | "medium" | "low",
 "actionability": "high" | "medium" | "low",
 "summary": "A 1-sentence summary of their reflection"
}}
"""
        max_retries = 2
        for attempt in range(max_retries):
            try:
                _, raw_response = await self.provider_manager.generate_json(prompt)
                cleaned_response = self._clean_json_string(raw_response)
                parsed_json = json.loads(cleaned_response)
                
                # Normalize values to lowercase
                for key in ["understanding", "confidence", "actionability"]:
                    if key in parsed_json:
                        parsed_json[key] = str(parsed_json[key]).lower()
                        
                analysis = ReflectionAnalysis(**parsed_json)
                return analysis
            except Exception as e:
                logger.error(f"Attempt {attempt + 1}: Failed to analyze reflection: {str(e)}")
                if attempt == max_retries - 1:
                    logger.warning("Using fallback reflection analysis.")
        
        # Fallback
        return ReflectionAnalysis(
            understanding="medium",
            confidence="medium",
            actionability="medium",
            summary="The user provided a baseline reflection on their learning experience."
        )
