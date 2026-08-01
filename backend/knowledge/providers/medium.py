import httpx
from typing import List, Optional
from backend.knowledge.providers.base import KnowledgeProvider, RawKnowledgeData

class MediumProvider(KnowledgeProvider):
    @property
    def provider_name(self) -> str:
        return "Medium"
        
    @property
    def source_type(self) -> str:
        return "article"

    async def search(self, query: str, limit: int = 5) -> List[RawKnowledgeData]:
        # Since Medium API is restricted, we'll provide a deterministic mock based on the query
        return [
            RawKnowledgeData(
                title=f"The Ultimate Guide to {query}",
                description=f"A deep dive into {query} and why it matters in today's tech landscape.",
                url="https://medium.com/mock-article-123",
                author="John Doe",
                domain="Technology",
                thumbnail="https://miro.medium.com/max/1200/1*mock.jpg"
            ),
            RawKnowledgeData(
                title=f"Why I stopped using {query}",
                description=f"An alternative perspective on the {query} trend.",
                url="https://medium.com/mock-article-456",
                author="Jane Smith",
                domain="Opinion"
            )
        ][:limit]

    async def fetch(self, url: str) -> Optional[RawKnowledgeData]:
        return None
