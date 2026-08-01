from abc import ABC, abstractmethod
from typing import List, Dict, Any
from pydantic import BaseModel

class RawOpportunity(BaseModel):
    title: str
    description: str
    url: str
    provider_name: str
    category: str = "Unknown"
    location: str = None
    is_online: bool = True
    deadline: str = None
    start_date: str = None

class BaseOpportunityProvider(ABC):
    """
    Abstract base class for all opportunity providers.
    Every provider (e.g., Devpost, Eventbrite, DuckDuckGo) must implement this interface.
    """
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    async def search(self, queries: List[str], context: Dict[str, Any] = None) -> List[RawOpportunity]:
        """
        Executes a search using the generated AI queries.
        Returns a list of raw opportunities to be normalized and ranked by the engine.
        """
        pass
