import httpx
from typing import List, Dict, Any

from .base import BaseOpportunityProvider, RawOpportunity
from backend.models.opportunity import OpportunityProviderType

class DevpostProvider(BaseOpportunityProvider):
    """
    A live search provider that fetches real hackathons from Devpost API.
    """
    
    @property
    def provider_name(self) -> str:
        # Reusing DUCKDUCKGO type for now, or just use a generic name
        return "Devpost"

    async def search(self, queries: List[str], context: Dict[str, Any] = None) -> List[RawOpportunity]:
        results = []
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # We can just fetch the main list of hackathons once
                # Devpost API returns all live hackathons
                response = await client.get("https://devpost.com/api/hackathons?status[]=open")
                if response.status_code == 200:
                    data = response.json()
                    hackathons = data.get("hackathons", [])
                    
                    for h in hackathons:
                        title = h.get("title", "")
                        url = h.get("url", "")
                        themes = [t.get("name") for t in h.get("themes", [])]
                        desc = f"Themes: {', '.join(themes)}. {h.get('time_left_to_submission', '')}"
                        
                        # Simple keyword matching to ensure relevance to the queries
                        combined_text = (title + " " + desc).lower()
                        is_relevant = False
                        for query in queries:
                            # Extract key terms from query
                            terms = [t for t in query.lower().split() if len(t) > 3 and t not in ['latest', 'upcoming', 'apply', 'registration']]
                            if any(term in combined_text for term in terms):
                                is_relevant = True
                                break
                        
                        # If no specific queries match, but we have hackathons, just pass them and let LLM ranker filter
                        if title and url and (is_relevant or len(results) < 5):
                            results.append(RawOpportunity(
                                title=title,
                                description=desc,
                                url=url,
                                provider_name="Devpost"
                            ))
        except Exception as e:
            print(f"Error fetching from Devpost: {e}")
            
        return results
