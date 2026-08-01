import logging
from typing import List, Tuple
from backend.providers.base import LLMProvider, ProviderException
from backend.providers.gemini_provider import GeminiProvider
from backend.providers.openrouter_provider import OpenRouterProvider
from backend.providers.groq_provider import GroqProvider
from backend.providers.mock_provider import MockProvider

logger = logging.getLogger(__name__)

class ProviderManager:
    def __init__(self):
        # The priority cascade: Gemini -> OpenRouter -> Groq -> Mock
        self.providers: List[LLMProvider] = [
            GeminiProvider(),
            OpenRouterProvider(),
            GroqProvider(),
            MockProvider()
        ]

    async def generate_json(self, prompt: str) -> Tuple[str, str]:
        """
        Attempts to generate a response, automatically failing over to the next provider
        if one throws an exception. Returns a tuple of (provider_name, response_text).
        """
        for provider in self.providers:
            try:
                # Log attempt
                logger.info(f"Attempting LLM generation with provider: {provider.name}")
                
                response = await provider.generate(prompt)
                
                # Log success
                logger.info(f"Successfully generated response with provider: {provider.name}")
                return provider.name, response
                
            except ProviderException as e:
                # Log failure and continue to next
                logger.warning(f"Provider {provider.name} failed: {str(e)}. Falling back to next...")
                continue
            except Exception as e:
                logger.error(f"Unexpected error with provider {provider.name}: {str(e)}. Falling back to next...")
                continue
                
        # If we exhausted the list, we raise. 
        # (Though MockProvider should theoretically never fail)
        raise RuntimeError("All LLM providers failed to generate a response.")
