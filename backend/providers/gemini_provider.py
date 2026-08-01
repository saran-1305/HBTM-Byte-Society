import json
import os
import requests
import asyncio
from backend.providers.base import LLMProvider, ProviderException

class GeminiProvider(LLMProvider):
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
            
    @property
    def name(self) -> str:
        return "gemini"

    def _make_request(self, prompt: str) -> str:
        if not self.api_key:
            raise ProviderException("GEMINI_API_KEY not found")
            
        headers = {
            "Content-Type": "application/json"
        }
        
        # We explicitly instruct Gemini to return JSON
        data = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "systemInstruction": {
                "parts": [{"text": "You are a precise JSON-only AI. Return only valid JSON without any markdown formatting like ```json"}]
            },
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=20)
            if response.status_code != 200:
                raise ProviderException(f"Gemini returned {response.status_code}: {response.text}")
                
            result = response.json()
            return result["candidates"][0]["content"]["parts"][0]["text"]
        except requests.exceptions.RequestException as e:
            raise ProviderException(f"Gemini request failed: {str(e)}")

    async def generate(self, prompt: str) -> str:
        return await asyncio.to_thread(self._make_request, prompt)
