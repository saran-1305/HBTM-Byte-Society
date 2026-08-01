import httpx
from typing import List, Optional
import os
from backend.knowledge.providers.base import KnowledgeProvider, RawKnowledgeData

class YouTubeProvider(KnowledgeProvider):
    @property
    def provider_name(self) -> str:
        return "YouTube"
        
    @property
    def source_type(self) -> str:
        return "video"

    async def search(self, query: str, limit: int = 5) -> List[RawKnowledgeData]:
        api_key = os.getenv("YOUTUBE_API_KEY")
        if not api_key:
            # Deterministic mock mode for YouTube
            return [
                RawKnowledgeData(
                    title=f"Exploring {query} | Masterclass",
                    description=f"An in-depth video guide on {query}.",
                    url="https://youtube.com/watch?v=mock123",
                    author="Mock Creator",
                    thumbnail="https://img.youtube.com/vi/mock123/maxresdefault.jpg",
                    domain="General"
                )
            ]

        url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&maxResults={limit}&type=video&key={api_key}"
        results = []
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    for item in data.get("items", []):
                        snippet = item.get("snippet", {})
                        video_id = item.get("id", {}).get("videoId", "")
                        results.append(RawKnowledgeData(
                            title=snippet.get("title", ""),
                            description=snippet.get("description", ""),
                            url=f"https://youtube.com/watch?v={video_id}",
                            author=snippet.get("channelTitle", ""),
                            thumbnail=snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                            published_date=snippet.get("publishedAt", ""),
                            domain="Video Education"
                        ))
        except Exception as e:
            print(f"YouTube API error: {e}")
            
        return results

    async def fetch(self, url: str) -> Optional[RawKnowledgeData]:
        return None
