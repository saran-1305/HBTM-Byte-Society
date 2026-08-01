from pydantic import BaseModel, Field
from typing import Optional
from backend.models.activity import ActivityAction

class ActivityStartRequest(BaseModel):
    recommendation_id: str
    
class ActivityCompleteRequest(BaseModel):
    recommendation_id: str

class ReflectionSubmitRequest(BaseModel):
    recommendation_id: str
    biggest_insight: str
    confusion: str
    application: str

class ReflectionAnalysis(BaseModel):
    understanding: str = Field(..., description="High, Medium, or Low")
    confidence: str = Field(..., description="High, Medium, or Low")
    actionability: str = Field(..., description="High, Medium, or Low")
    summary: str = Field(..., description="A 1-sentence summary of their reflection")
