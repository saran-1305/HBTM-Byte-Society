import httpx
import os
from typing import List, Dict, Any
from backend.providers.knowledge.base import BaseKnowledgeProvider

class YouTubeProvider(BaseKnowledgeProvider):
    @property
    def provider_name(self) -> str:
        return "youtube"

    async def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        api_key = os.getenv("YOUTUBE_API_KEY")
        
        # Graceful fallback if no API key is provided
        if not api_key:
            print("YOUTUBE_API_KEY not found. Returning mocked YouTube results.")
            return self._get_mock_results(query, limit)
            
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "maxResults": limit,
            "key": api_key,
            "relevanceLanguage": "en"
        }
        
        results = []
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    items = data.get("items", [])
                    for item in items:
                        snippet = item.get("snippet", {})
                        video_id = item.get("id", {}).get("videoId", "")
                        
                        title = snippet.get("title", "Unknown Video")
                        description = snippet.get("description", "")
                        channel = snippet.get("channelTitle", "Unknown Channel")
                        thumbnail = snippet.get("thumbnails", {}).get("high", {}).get("url", "")
                        
                        results.append({
                            "title": title,
                            "description": description[:500] if description else "",
                            "url": f"https://www.youtube.com/watch?v={video_id}",
                            "source_type": "video",
                            "provider": self.provider_name,
                            "author": channel,
                            "thumbnail": thumbnail,
                            "language": "en",
                            "estimated_duration": 15, # Default 15 mins since Search API doesn't return duration
                            "metadata_": {"video_id": video_id}
                        })
            except Exception as e:
                print(f"Error fetching from YouTube: {e}")
                
        return results
        
    def _get_mock_results(self, query: str, limit: int) -> List[Dict[str, Any]]:
        return [
            {
                "title": f"The Ultimate Guide to {query}",
                "description": f"A comprehensive visual breakdown of {query}.",
                "url": "https://www.youtube.com/watch?v=aircAruvnKk", # 3Blue1Brown neural networks video as fallback
                "source_type": "video",
                "provider": self.provider_name,
                "author": "Tech Educator",
                "thumbnail": "https://img.youtube.com/vi/aircAruvnKk/maxresdefault.jpg",
                "language": "en",
                "estimated_duration": 15,
                "metadata_": {"mocked": True}
            }
        ]
