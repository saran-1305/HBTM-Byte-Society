from typing import List, Dict
from backend.schemas.candidate import RecommendationItem, RankedCandidate, ScoreBreakdown

class RankingService:
    def __init__(self):
        # Weights for deterministic scoring
        self.weights = {
            "stage": 40.0,
            "domain": 30.0,
            "history": 15.0,
            "difficulty": 15.0
        }

    def rank_candidates(
        self, 
        candidates: List[RecommendationItem], 
        current_stage: str, 
        target_domain: str, 
        recent_history: List[str] # List of recent content IDs
    ) -> List[RankedCandidate]:
        """
        Deterministically ranks candidates based on signals.
        """
        ranked = []
        for item in candidates:
            # 1. Stage Score (Max 40)
            stage_score = self.weights["stage"] if item.stage == current_stage else (self.weights["stage"] * 0.5)
            
            # 2. Domain Score (Max 30)
            domain_score = self.weights["domain"] if item.domain == target_domain else 0.0
            
            # 3. History Score (Max 15)
            # If the author/type is different from the very last thing they consumed, give a diversity bonus
            history_score = self.weights["history"]
            if recent_history and recent_history[0] == item.id:
                history_score = 0.0 # Repeated exact item
            
            # 4. Difficulty Score (Max 15)
            # Simple heuristic: if stage is explore, prefer beginner. If breakthrough, prefer advanced.
            difficulty_score = self.weights["difficulty"] * 0.8 # baseline
            if current_stage == "explore" and item.difficulty == "beginner":
                difficulty_score = self.weights["difficulty"]
            elif current_stage == "breakthrough" and item.difficulty == "advanced":
                difficulty_score = self.weights["difficulty"]
                
            total_score = stage_score + domain_score + history_score + difficulty_score
            
            breakdown = ScoreBreakdown(
                stage=stage_score,
                domain=domain_score,
                history=history_score,
                difficulty=difficulty_score,
                total=total_score
            )
            
            ranked.append(RankedCandidate(candidate=item, scores=breakdown))
            
        # Sort descending by total score
        ranked.sort(key=lambda x: x.scores.total, reverse=True)
        return ranked
