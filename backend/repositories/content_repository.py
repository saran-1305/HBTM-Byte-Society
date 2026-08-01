import json
from typing import List, Optional
import os

from backend.schemas.candidate import RecommendationItem

class ContentRepository:
    def __init__(self, file_path: str = "backend/data/content_pool.json"):
        self.items: List[RecommendationItem] = []
        self._load_data(file_path)

    def _load_data(self, file_path: str):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Content pool not found at {file_path}")
            
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for item in data:
                self.items.append(RecommendationItem(**item))

    def get_all(self) -> List[RecommendationItem]:
        return self.items

    def get_by_stage(self, stage: str) -> List[RecommendationItem]:
        return [item for item in self.items if item.stage == stage]

    def get_by_domain(self, domain: str) -> List[RecommendationItem]:
        return [item for item in self.items if item.domain == domain]

    def get_by_type(self, content_type: str) -> List[RecommendationItem]:
        return [item for item in self.items if item.content_type == content_type]

    def get_by_id(self, item_id: str) -> Optional[RecommendationItem]:
        for item in self.items:
            if item.id == item_id:
                return item
        return None
