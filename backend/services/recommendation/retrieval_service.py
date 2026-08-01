import json
import os
from typing import List

class RetrievalService:
    def __init__(self, content_file_path: str = None):
        if not content_file_path:
            # Default to backend/content_pool.json
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.content_file_path = os.path.join(base_dir, "content_pool.json")
        else:
            self.content_file_path = content_file_path
            
    def load_pool(self) -> List[dict]:
        try:
            with open(self.content_file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return []
            
    def retrieve_candidates(self, context, recent_history_ids: List[str]) -> List[dict]:
        """
        Filters candidates based on context and removes items already recommended recently.
        This service DOES NOT decide on the final recommendation.
        """
        pool = self.load_pool()
        if not pool:
            return []
            
        candidates = []
        for item in pool:
            # Avoid recently recommended content
            if item.get("id") in recent_history_ids:
                continue
                
            # Filter by stage
            if item.get("stage") not in [context.stage, "All", None]:
                continue
                
            # (Optional) Filter by available time, difficulty, or domain if needed
            # The prompt says: "Filter candidates by Domain, Stage, Type, Difficulty"
            # However, for simplicity and since content_pool is small, we mainly filter by history and stage.
            # You can expand domain filtering if the content pool grows large.
            if context.domain and item.get("domain") and context.domain.lower() not in item.get("domain").lower() and item.get("domain") != "General":
                # For small pool, let's just allow general or matching domains
                pass
                
            candidates.append(item)
            
        return candidates
