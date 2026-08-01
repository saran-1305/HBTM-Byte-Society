from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class FeedbackReaction(str, Enum):
    resonated = "resonated"
    already_knew = "already_knew"
    did_it = "did_it"
    not_for_me = "not_for_me"

class FeedbackRequest(BaseModel):
    recommendation_id: str
    reaction: FeedbackReaction

class RecommendationContext(BaseModel):
    aspiration: str = ""
    stage: str = ""
    available_time: int = 60
    domain: str = ""
    recent_topics: List[str] = []
    completed_items: List[str] = []
    feedback: List[str] = []
    habits: List[str] = []

class RecommendationItem(BaseModel):
    title: str
    type: str
    description: str
    estimated_time: str
    why_this: str
    expected_outcome: str

class RecommendationResponse(BaseModel):
    recommendation: dict
    reasoning: List[str]
    expected_outcome: Optional[str] = None
    reflection_prompt: str
    created_at: str

    class Config:
        from_attributes = True

class RecommendationListResponse(BaseModel):
    items: List[RecommendationResponse]
