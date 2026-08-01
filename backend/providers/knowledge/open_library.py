import httpx
from typing import List, Dict, Any
from backend.providers.knowledge.base import BaseKnowledgeProvider

class OpenLibraryProvider(BaseKnowledgeProvider):
    @property
    def provider_name(self) -> str:
        return "open_library"

    async def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        url = "https://openlibrary.org/search.json"
        params = {
            "q": query,
            "limit": limit,
            "lang": "eng"
        }
        
        results = []
        async with httpx.AsyncClient(follow_redirects=True) as client:
            try:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    docs = data.get("docs", [])
                    for doc in docs:
                        title = doc.get("title", "Unknown Title")
                        authors = doc.get("author_name", ["Unknown Author"])
                        key = doc.get("key", "") # e.g. /works/OL12345W
                        cover_i = doc.get("cover_i")
                        
                        thumbnail = f"https://covers.openlibrary.org/b/id/{cover_i}-M.jpg" if cover_i else ""
                        book_url = f"https://openlibrary.org{key}" if key else f"https://openlibrary.org/search?q={query}"
                        
                        # OpenLibrary doesn't always have page count easily accessible in search, defaulting to 250
                        page_count = doc.get("number_of_pages_median", 250)
                        estimated_duration = page_count * 2
                        
                        results.append({
                            "title": title,
                            "description": "A book from OpenLibrary matching your interests.",
                            "url": book_url,
                            "source_type": "book",
                            "provider": self.provider_name,
                            "author": authors[0] if authors else "Unknown",
                            "thumbnail": thumbnail,
                            "language": "en",
                            "estimated_duration": estimated_duration,
                            "metadata_": {"page_count": page_count}
                        })
                    if not docs:
                        print(f"OpenLibrary returned 0 items for {query}")
                else:
                    print(f"OpenLibrary API non-200 status: {response.status_code}")
            except Exception as e:
                print(f"Error fetching from OpenLibrary: {e}")
                
        return results
