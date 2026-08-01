import json
import os
import requests
import asyncio
from backend.providers.base import LLMProvider, ProviderException

class OpenRouterProvider(LLMProvider):
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
            
    @property
    def name(self) -> str:
        return "openrouter"

    def _make_request(self, prompt: str) -> str:
        if not self.api_key:
            raise ProviderException("OPENROUTER_API_KEY not found")
            
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "DASKALOS AI Curator",
            "Content-Type": "application/json"
        }
        data = {
            "model": "meta-llama/llama-3-8b-instruct:free",
            "messages": [
                {"role": "system", "content": "You are a precise JSON-only AI."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"}
        }
        
        try:
            response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data, timeout=20)
            if response.status_code != 200:
                raise ProviderException(f"OpenRouter returned {response.status_code}: {response.text}")
                
            result = response.json()
            return result["choices"][0]["message"]["content"]
        except requests.exceptions.RequestException as e:
            raise ProviderException(f"OpenRouter request failed: {str(e)}")

    async def generate(self, prompt: str) -> str:
        return await asyncio.to_thread(self._make_request, prompt)
