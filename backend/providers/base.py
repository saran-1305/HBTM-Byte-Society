from abc import ABC, abstractmethod
import json

class LLMProvider(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the provider (e.g., 'gemini', 'openrouter')"""
        pass
        
    @abstractmethod
    async def generate(self, prompt: str) -> str:
        """Generates a raw string response from the LLM based on the prompt."""
        pass

class ProviderException(Exception):
    """Custom exception for LLM provider failures (timeouts, 429s, etc)"""
    pass
