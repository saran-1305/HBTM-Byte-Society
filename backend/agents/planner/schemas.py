from pydantic import BaseModel
from typing import List

class MilestoneItem(BaseModel):
    title: str
    status: str # 'completed', 'in_progress', 'upcoming'
    target_date: str
    progress_percentage: int

class HabitItem(BaseModel):
    name: str
    completed_minutes: int
    target_minutes: int

class PlannerResponse(BaseModel):
    milestones: List[MilestoneItem]
    habits: List[HabitItem]
