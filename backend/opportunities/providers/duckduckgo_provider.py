import asyncio
from typing import List, Dict, Any
from duckduckgo_search import DDGS

from .base import BaseOpportunityProvider, RawOpportunity
from backend.models.opportunity import OpportunityProviderType

class DuckDuckGoProvider(BaseOpportunityProvider):
    """
    A live search provider that uses duckduckgo-search to discover real-time opportunities.
    """
    
    @property
    def provider_name(self) -> str:
        return OpportunityProviderType.DUCKDUCKGO.value

    def _sync_search(self, query: str) -> List[dict]:
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query + ' apply OR register OR deadline', max_results=5))
                return results
        except Exception as e:
            print(f"DDGS Error for '{query}': {e}")
            return []

    async def search(self, queries: List[str], context: Dict[str, Any] = None) -> List[RawOpportunity]:
        results = []
        
        for query in queries:
            raw_results = await asyncio.to_thread(self._sync_search, query)
            
            for r in raw_results:
                if 'title' in r and 'href' in r:
                    results.append(RawOpportunity(
                        title=r['title'],
                        description=r.get('body', ''),
                        url=r['href'],
                        provider_name=self.provider_name
                    ))
                    
        return results
