import os
import json
from litellm import acompletion

class LLMProvider:
    def __init__(self):
        # We will use Groq primarily, and fallback to OpenRouter
        self.primary_model = "groq/llama3-70b-8192" # standard groq model
        self.fallback_model = "openrouter/anthropic/claude-3-haiku"

    async def generate_json(self, system_prompt: str, user_prompt: str) -> dict:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        try:
            # LiteLLM acompletion handles the async call
            response = await acompletion(
                model=self.primary_model,
                messages=messages,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"Primary model failed: {e}. Falling back...")
            # Fallback
            response = await acompletion(
                model=self.fallback_model,
                messages=messages,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            return json.loads(content)

llm_provider = LLMProvider()
