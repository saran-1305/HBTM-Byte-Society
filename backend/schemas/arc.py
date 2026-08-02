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

class SuggestedAction(BaseModel):
    action: str
    why: str = ""

class ARCEvaluationResponse(BaseModel):
    id: UUID
    stage: str
    decision: str
    ai_observation: Optional[str]
    reasoning: Optional[str]
    transition_explanation: Optional[str]
    suggested_actions: List[SuggestedAction] = []
    evidence_used: List[str] = []
    recent_changes: Optional[str] = None
    strengths: List[str] = []
    weaknesses: List[str] = []
    current_focus: Optional[str] = None
    behaviour_trend: Optional[str] = None
    hidden_opportunity: Optional[str] = None
    future_prediction: Optional[str] = None
    confidence: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ARCEvidenceResponse(BaseModel):
    stage: str
    raw_evidence: Optional[Dict[str, Any]] = None
    evidence_used: List[str] = []
    recent_changes: Optional[str] = None
    strengths: List[str] = []
    weaknesses: List[str] = []
    evaluated_at: datetime

class ObserveRequest(BaseModel):
    observation_type: str
    source_module: str
    title: str
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    trigger_evaluation: bool = False

class TimelineItemResponse(BaseModel):
    type: str  # "evaluation" or "transition"
    timestamp: datetime
    stage: Optional[str] = None
    decision: Optional[str] = None
    ai_observation: Optional[str] = None
    reasoning: Optional[str] = None
    suggested_actions: Optional[List[SuggestedAction]] = None
    previous_stage: Optional[str] = None
    current_stage: Optional[str] = None
    transition_reason: Optional[str] = None
    ai_summary: Optional[str] = None

    class Config:
        from_attributes = True
