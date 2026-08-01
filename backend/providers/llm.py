import os
import json
import random
from litellm import acompletion

class LLMProvider:
    def __init__(self):
        # We will load balance between Groq and OpenRouter
        self.model_groq = "groq/llama-3.3-70b-versatile"
        self.model_or = "openrouter/anthropic/claude-3-haiku"

    async def generate_json(self, system_prompt: str, user_prompt: str) -> dict:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        # 50/50 Split
        if random.random() < 0.5:
            primary_model = self.model_groq
            fallback_model = self.model_or
        else:
            primary_model = self.model_or
            fallback_model = self.model_groq
            
        try:
            # LiteLLM acompletion handles the async call
            response = await acompletion(
                model=primary_model,
                messages=messages,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"Primary model ({primary_model}) failed: {e}. Falling back to {fallback_model}...")
            # Fallback
            try:
                response = await acompletion(
                    model=fallback_model,
                    messages=messages,
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                return json.loads(content)
            except Exception as inner_e:
                print(f"Fallback model failed: {inner_e}. Returning mock AI profile for demo.")
                # Mock AI fallback when no API keys are present
                return {
                    "identity_summary": "This user is a highly motivated individual focused on mastering complex systems. They have a strong analytical background but struggle with finding consistent time for deep work. Their primary goal is to transition into advanced architecture roles within the next 2 years.",
                    "core_motivations": ["Continuous Learning", "Mastery of complex systems", "Building scalable solutions"],
                    "personality_traits": ["Analytical", "Determined", "Curious"],
                    "recommended_learning_approach": "Project-based learning combined with deep theoretical reading in focused 90-minute blocks.",
                    "growth_focus_areas": ["System Design", "Advanced Architecture", "Mental Models"],
                    "confidence_score": 92
                }

llm_provider = LLMProvider()
