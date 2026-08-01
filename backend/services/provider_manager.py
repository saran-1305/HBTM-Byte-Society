import logging
import litellm
import os
from typing import Tuple

logger = logging.getLogger(__name__)

class ProviderManager:
    def __init__(self):
        # We use litellm for routing. Ensure keys are in env
        # litellm will automatically pick up GROQ_API_KEY and OPENROUTER_API_KEY from os.environ
        pass

    async def generate_json(self, prompt: str) -> Tuple[str, str]:
        """
        Attempts to generate a response using LiteLLM, automatically failing over.
        Flow: Groq -> OpenRouter -> Mock
        Returns a tuple of (provider_name, response_text).
        """
        models = [
            "groq/llama-3.1-8b-instant",
            "openrouter/meta-llama/llama-3-8b-instruct:free"
        ]
        
        for model in models:
            try:
                # Log attempt
                logger.info(f"Attempting LiteLLM generation with model: {model}")
                
                # LiteLLM async completion
                response = await litellm.acompletion(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=2048,
                    temperature=0.7,
                )
                content = response.choices[0].message.content
                
                # Log success
                logger.info(f"Successfully generated response with model: {model}")
                return model, content
                
            except Exception as e:
                # Log failure and continue to next
                logger.warning(f"LiteLLM model {model} failed: {str(e)}. Falling back to next...")
                continue
                
        # If we exhausted the real models, return a deterministic mock response
        logger.warning("All LiteLLM providers failed. Returning deterministic mock response.")
        
        # Generic mock response that fits most json expectations
        mock_response = '''
        {
            "confidence_score": 0.5,
            "priority_score": 0.5,
            "ai_explanation": "Mock response due to API failure.",
            "estimated_impact": "Medium",
            "category": "General",
            "difficulty": "intermediate",
            "estimated_time": "1 hour"
        }
        '''
        return "MockProvider", mock_response
