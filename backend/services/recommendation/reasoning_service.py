from typing import List, Dict
from backend.services.recommendation.ai_service import AIService

class ReasoningService:
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service
        
    def generate_reasoning(self, recommendation: Dict, context) -> List[str]:
        """
        Generates reasoning for the recommendation using the AI service.
        """
        return self.ai_service.generate_reasoning(recommendation, context)
