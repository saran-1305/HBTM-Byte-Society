from typing import List, Optional
from backend.repositories.content_repository import ContentRepository
from backend.schemas.candidate import RecommendationItem
from backend.services.stage_service import StageService

class CandidateService:
    def __init__(self, content_repo: ContentRepository):
        self.repo = content_repo
        self.stage_service = StageService()

    def get_candidates(self, current_stage: str, domain: Optional[str] = None) -> List[RecommendationItem]:
        """
        Retrieves candidates allowed for the given stage.
        Allowed stages: all previous stages + current stage + next stage.
        """
        all_stages = [s.value for s in self.stage_service.get_all_stages()]
        
        try:
            current_index = all_stages.index(current_stage)
        except ValueError:
            raise ValueError(f"Invalid stage provided: {current_stage}")

        allowed_max_index = min(current_index + 1, len(all_stages) - 1)
        allowed_stages = all_stages[:allowed_max_index + 1]

        candidates = []
        for item in self.repo.get_all():
            if item.stage in allowed_stages:
                # If domain is provided, only return domain matches. 
                # (We might want to relax this for wildcard discovery, but for strict filtering we keep it if passed)
                if domain and item.domain != domain:
                    continue
                candidates.append(item)
                
        return candidates
