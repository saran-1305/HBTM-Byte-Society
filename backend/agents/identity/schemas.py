from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

class OnboardingStartRequest(BaseModel):
    full_name: str
    age: Optional[int] = None
    occupation: Optional[str] = None

class OnboardingSaveRequest(BaseModel):
    aspirations: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    current_skills: Optional[List[str]] = None
    learning_style: Optional[str] = None
    available_time: Optional[str] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    habits: Optional[List[str]] = None
    challenges: Optional[List[str]] = None
    preferred_content_types: Optional[List[str]] = None
    long_term_goal: Optional[str] = None

class IdentitySummaryResponse(BaseModel):
    identity_summary: str
    core_motivations: List[str]
    personality_traits: List[str]
    recommended_learning_approach: str
    growth_focus_areas: List[str]
    confidence_score: int

class IdentityProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str
    onboarding_completed: bool
    
    identity_summary: Optional[str] = None
    core_motivations: Optional[List[str]] = None
    personality_traits: Optional[List[str]] = None
    recommended_learning_approach: Optional[str] = None
    growth_focus_areas: Optional[List[str]] = None
    confidence_score: Optional[int] = None
    
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
