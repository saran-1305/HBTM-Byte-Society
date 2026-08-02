import httpx
from typing import List, Dict, Any

from .base import BaseOpportunityProvider, RawOpportunity
from backend.models.opportunity import OpportunityProviderType

# Generic scouting/timing vocabulary that appears in almost every opportunity's boilerplate
# (deadlines, status, years) — matching on these produces false positives regardless of domain.
_GENERIC_STOPWORDS = {
    'latest', 'upcoming', 'apply', 'registration', 'register', 'open', 'live', 'now',
    'deadline', 'submission', 'days', 'left', 'about', 'month', 'months', 'week', 'weeks',
    'from', 'this', 'that', 'with', 'your', 'today', 'event', 'events',
}


class DevpostProvider(BaseOpportunityProvider):
    """
    A live search provider that fetches real hackathons from Devpost API.
    Devpost is a tech-hackathon-only platform, so relevance filtering here must be strict:
    for a non-tech goal (business, dance, etc.) this should correctly return nothing.
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
                        
                        # Keyword matching to ensure relevance to the queries. Only substantive,
                        # domain-specific terms count — generic scouting vocabulary and bare years
                        # (e.g. "2026", "open") appear in nearly every hackathon's boilerplate and
                        # would otherwise cause false-positive matches for unrelated goals.
                        combined_text = (title + " " + desc).lower()
                        is_relevant = False
                        for query in queries:
                            terms = [
                                t for t in query.lower().split()
                                if len(t) > 3 and not t.isdigit() and t not in _GENERIC_STOPWORDS
                            ]
                            if any(term in combined_text for term in terms):
                                is_relevant = True
                                break

                        if title and url and is_relevant:
                            results.append(RawOpportunity(
                                title=title,
                                description=desc,
                                url=url,
                                provider_name="Devpost"
                            ))
        except Exception as e:
            print(f"Error fetching from Devpost: {e}")
            
        return results
