import os
import json
from typing import Dict, List
import litellm

class AIService:
    def __init__(self):
        # We check the USE_MOCK environment variable
        self.use_mock = os.getenv("USE_MOCK", "false").lower() == "true"
        
        # If not mocking, ensure API key is set for litellm
        self.model = os.getenv("AI_MODEL", "gemini/gemini-1.5-pro") # Using gemini by default
        
    def _get_models_to_try(self):
        return [
            {"model": self.model, "api_key": os.getenv("GROQ_API_KEY")},
            {"model": self.model, "api_key": os.getenv("GROQ_API_KEY_2")},
            {"model": "openrouter/anthropic/claude-3-haiku", "api_key": os.getenv("OPENROUTER_API_KEY")}
        ]

    def generate_recommendation(self, context, candidates: List[Dict]) -> Dict:
        """
        Takes context and candidate list, returns one selected recommendation with reasoning.
        """
        if self.use_mock or not candidates:
            return self._mock_recommendation(candidates)
            
        system_prompt = (
            "You are DASKALOS, an elite AI Personal Growth Curator.\n"
            "Your responsibility is to help the user become the person they aspire to become.\n"
            "Based on their context, generate exactly 5 highly specific, transformative recommendations.\n"
            "ALL 5 recommendations MUST be real, existing YouTube Videos.\n"
            "Do not recommend books or articles. Only real YouTube videos.\n"
            "For every recommendation, you MUST provide a real, highly-accurate YouTube URL (e.g. https://www.youtube.com/watch?v=...).\n"
            "Return structured JSON containing a 'recommendations' array."
        )
        
        user_prompt = (
            f"User Context:\n"
            f"- Aspiration: {context.aspiration}\n"
            f"- Stage: {context.stage}\n"
            f"- Domain: {context.domain}\n"
            f"- Available Time: {context.available_time} minutes\n"
            f"- Recent History: {context.recent_topics}\n"
            f"- Habits: {context.habits}\n\n"
            f"Generate 5 perfect YouTube Video recommendations for this user right now.\n"
            f"Provide the response in this exact JSON format:\n"
            "{\n"
            '  "recommendations": [\n'
            '    {\n'
            '      "id": "generate_a_unique_snake_case_id",\n'
            '      "title": "Exact Title of the YouTube Video",\n'
            '      "type": "Video",\n'
            '      "description": "A 1-sentence hook explaining what it is",\n'
            '      "estimated_time": "e.g., 15 minutes, 3 hours",\n'
            '      "why_this": "Why this specific item is the best choice right now",\n'
            '      "url": "https://www.youtube.com/watch?v=..."\n'
            '    }\n'
            '  ]\n'
            "}"
        )
        
        models_to_try = self._get_models_to_try()
        
        for config in models_to_try:
            try:
                response = litellm.completion(
                    model=config["model"],
                    api_key=config["api_key"],
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                return json.loads(content)
            except Exception as e:
                print(f"Error calling LLM {config['model']}: {e}")
                
        return self._mock_recommendation(candidates)

    def generate_reasoning(self, recommendation: Dict, context) -> List[str]:
        """
        Generates reasoning bullet points. 
        Note: The generate_recommendation already returns 'why_this'.
        This method expands it into a list of specific bullet points.
        """
        if self.use_mock:
            return [
                "This perfectly aligns with your current aspiration.",
                "It fits within your available time constraint.",
                "It builds upon your recent feedback and topics."
            ]
            
        system_prompt = (
            "You are an AI Personal Growth Curator.\n"
            "Generate exactly 3 concise bullet points explaining why this recommendation was chosen.\n"
            "Focus on: Why this? Why now? How does it connect to the aspiration?\n"
            "Return JSON format:\n"
            "{\n"
            '    "reasoning": ["point 1", "point 2", "point 3"]\n'
            "}"
        )
        
        user_prompt = (
            f"Aspiration: {context.aspiration}\n"
            f"Recommendation: {recommendation.get('title')}\n"
            f"Why this (from AI): {recommendation.get('why_this')}\n"
        )
        
        models_to_try = self._get_models_to_try()
        
        for config in models_to_try:
            try:
                response = litellm.completion(
                    model=config["model"],
                    api_key=config["api_key"],
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                return json.loads(content).get("reasoning", [])
            except Exception as e:
                print(f"Error generating reasoning with {config['model']}: {e}")
                
        return ["Provides significant transformative value.", "Matches your available time."]

    def _mock_recommendation(self, candidates: List[Dict]) -> Dict:
        # Return deterministic mock response (just pick the first candidate if available)
        if candidates:
            candidate = candidates[0]
        else:
            candidate = {
                "id": "mock_123",
                "title": "A Walk in Nature",
                "type": "Experience",
                "description": "Take 30 minutes to walk outside without your phone.",
                "estimated_time": "30 minutes"
            }
            
        return {
            "id": candidate.get("id"),
            "title": candidate.get("title"),
            "type": candidate.get("type"),
            "description": candidate.get("description"),
            "estimated_time": candidate.get("estimated_time"),
            "why_this": "Because mock mode is enabled, and this is a great default action.",
            "expected_outcome": "You will feel refreshed and grounded."
        }
