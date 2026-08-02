from pydantic import BaseModel, UUID4
from typing import List, Optional
from datetime import datetime

class IdentityProfileBase(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    occupation: Optional[str] = None
    long_term_goal: Optional[str] = None
    aspirations: Optional[List[str]] = None
    habits: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    learning_style: Optional[str] = None
    available_time: Optional[str] = None

class IdentityProfileCreate(IdentityProfileBase):
    pass

class IdentityProfileUpdate(IdentityProfileBase):
    pass

class IdentityProfileResponse(IdentityProfileBase):
    id: UUID4
    user_id: UUID4
    onboarding_completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
