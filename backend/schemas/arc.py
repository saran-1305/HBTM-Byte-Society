from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import UUID

class ARCProfileResponse(BaseModel):
    user_id: UUID
    current_stage: str
    stage_started_at: datetime
    current_reasoning: Optional[str]
    ai_observation: Optional[str]
    suggested_next_action: Optional[str]
    last_evaluation_at: Optional[datetime]

    class Config:
        from_attributes = True

class ARCObservationResponse(BaseModel):
    id: UUID
    observation_type: str
    source_module: str
    title: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ARCStageHistoryResponse(BaseModel):
    id: UUID
    previous_stage: Optional[str]
    current_stage: str
    transition_reason: str
    ai_summary: Optional[str]
    transitioned_at: datetime

    class Config:
        from_attributes = True
