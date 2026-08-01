from pydantic import BaseModel, Field
from backend.schemas.candidate import RecommendationItem

class CuratorReasoning(BaseModel):
    title: str = Field(..., description="A catchy headline for today's recommendation focus.")
    summary: str = Field(..., description="A 1-2 sentence summary of why this is recommended.")
    why_now: str = Field(..., description="Explanation of why this is highly relevant to their current ARC stage.")
    learning_focus: str = Field(..., description="The one key concept they should focus on while consuming this.")
    next_action: str = Field(..., description="A concrete next step (e.g., 'Spend 20 minutes reading chapter 1').")
    reflection_question: str = Field(..., description="A question to ask themselves after completing it to reinforce learning.")
    estimated_outcome: str = Field(..., description="What they will achieve by consuming this.")
    confidence: str = Field(..., description="The AI's confidence in this reasoning, typically 'high' or 'fallback'.")

class CuratorResponse(BaseModel):
    recommendation: RecommendationItem
    curator: CuratorReasoning
