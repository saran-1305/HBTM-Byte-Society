from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel

class RawKnowledgeData(BaseModel):
    title: str
    description: Optional[str] = None
    url: str
    author: Optional[str] = None
    thumbnail: Optional[str] = None
    language: str = 'en'
    published_date: Optional[str] = None
    raw_content: Optional[str] = None
    domain: Optional[str] = None

class KnowledgeProvider(ABC):
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """The name of the provider (e.g. 'YouTube', 'Google Books')"""
        pass
        
    @property
    @abstractmethod
    def source_type(self) -> str:
        """The type of knowledge source (e.g. 'video', 'book', 'article')"""
        pass

    @abstractmethod
    async def search(self, query: str, limit: int = 5) -> List[RawKnowledgeData]:
        """Search for knowledge items matching the query."""
        pass

    @abstractmethod
    async def fetch(self, url: str) -> Optional[RawKnowledgeData]:
        """Fetch a specific knowledge item by its URL or ID."""
        pass
