from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseKnowledgeProvider(ABC):
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    async def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Search for knowledge resources based on a query.
        Must return a list of dictionaries that map to KnowledgeSource attributes:
        {
            "title": str,
            "description": str,
            "url": str,
            "source_type": str,
            "provider": str,
            "author": str,
            "thumbnail": str,
            "language": str,
            "difficulty": str,
            "metadata_": dict
        }
        """
        pass
