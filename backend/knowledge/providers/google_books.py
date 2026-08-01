import httpx
from typing import List, Optional
from backend.knowledge.providers.base import KnowledgeProvider, RawKnowledgeData

class GoogleBooksProvider(KnowledgeProvider):
    @property
    def provider_name(self) -> str:
        return "Google Books"
        
    @property
    def source_type(self) -> str:
        return "book"

    async def search(self, query: str, limit: int = 5) -> List[RawKnowledgeData]:
        url = f"https://www.googleapis.com/books/v1/volumes?q={query}&maxResults={limit}"
        results = []
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    items = data.get("items", [])
                    for item in items:
                        info = item.get("volumeInfo", {})
                        results.append(RawKnowledgeData(
                            title=info.get("title", "Unknown Title"),
                            description=info.get("description", ""),
                            url=info.get("infoLink", ""),
                            author=", ".join(info.get("authors", [])),
                            thumbnail=info.get("imageLinks", {}).get("thumbnail", ""),
                            published_date=info.get("publishedDate", ""),
                            domain="Literature"
                        ))
        except Exception as e:
            print(f"Google Books API error: {e}")
            
        return results

    async def fetch(self, url: str) -> Optional[RawKnowledgeData]:
        # Typically, we'd extract volume ID from URL, but this serves as the interface.
        return None
