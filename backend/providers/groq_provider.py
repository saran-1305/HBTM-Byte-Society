import json
import os
import requests
import asyncio
from backend.providers.base import LLMProvider, ProviderException

class GroqProvider(LLMProvider):
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            self.api_key = os.getenv("GROQ_API_KEY_2")
            
    @property
    def name(self) -> str:
        return "groq"

    def _make_request(self, prompt: str) -> str:
        if not self.api_key:
            raise ProviderException("GROQ_API_KEY not found")
            
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "llama3-8b-8192", # Groq model
            "messages": [
                {"role": "system", "content": "You are a precise JSON-only AI."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.5
        }
        
        try:
            response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data, timeout=15)
            if response.status_code != 200:
                raise ProviderException(f"Groq returned {response.status_code}: {response.text}")
                
            result = response.json()
            return result["choices"][0]["message"]["content"]
        except requests.exceptions.RequestException as e:
            raise ProviderException(f"Groq request failed: {str(e)}")

    async def generate(self, prompt: str) -> str:
        return await asyncio.to_thread(self._make_request, prompt)
