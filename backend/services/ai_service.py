import json
import logging
from backend.services.provider_manager import ProviderManager
from backend.schemas.curator import CuratorReasoning
import re

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.provider_manager = ProviderManager()

    def _clean_json_string(self, raw_str: str) -> str:
        """Removes markdown code blocks if the LLM hallucinated them."""
        # Strip ```json and ``` wrapping
        cleaned = re.sub(r'```(?:json)?\s*', '', raw_str)
        cleaned = re.sub(r'```', '', cleaned)
        return cleaned.strip()

    async def generate_reasoning(self, prompt: str) -> CuratorReasoning:
        """
        Sends prompt to Provider Manager, handles retries for JSON parsing,
        and strictly returns a CuratorReasoning schema.
        """
        max_retries = 2
        
        for attempt in range(max_retries):
            try:
                # 1. Ask provider manager to generate
                provider_name, raw_response = await self.provider_manager.generate_json(prompt)
                
                # 2. Clean up hallucinated markdown
                cleaned_response = self._clean_json_string(raw_response)
                
                # 3. Parse JSON
                parsed_json = json.loads(cleaned_response)
                
                # 4. Validate through Pydantic
                reasoning = CuratorReasoning(**parsed_json)
                return reasoning
                
            except json.JSONDecodeError as e:
                logger.error(f"Attempt {attempt + 1}: JSON parsing failed. {str(e)}\nRaw Response: {raw_response}")
                if attempt == max_retries - 1:
                    logger.warning("Max retries reached for JSON parsing. Using fallback.")
            except Exception as e:
                logger.error(f"Attempt {attempt + 1}: Unexpected error in AI Service: {str(e)}")
                if attempt == max_retries - 1:
                    logger.warning("Max retries reached. Using fallback.")
                    
        # Failsafe Mode (Fallback) as requested in Step 8
        logger.info("Engaging Fallback Mode for AI Curator.")
        return CuratorReasoning(
            title="Today's Recommendation",
            summary="Continue building momentum.",
            why_now="This recommendation aligns with your current growth stage.",
            learning_focus="Focus on understanding one key concept.",
            next_action="Spend 20 minutes engaging with this resource.",
            reflection_question="What is one idea you learned today?",
            estimated_outcome="Improved understanding.",
            confidence="fallback"
        )
