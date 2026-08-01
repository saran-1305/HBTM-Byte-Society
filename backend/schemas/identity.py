from pydantic import BaseModel, UUID4
from typing import List, Optional
from datetime import datetime

class IdentityProfileBase(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    occupation: Optional[str] = None
    aspirations: Optional[List[str]] = None
    habits: Optional[List[str]] = None
    
    # Other potential fields that can be expanded later
    learning_style: Optional[str] = None
    available_time: Optional[str] = None
    interests: Optional[List[str]] = None

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
