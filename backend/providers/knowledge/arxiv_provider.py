import httpx
import xml.etree.ElementTree as ET
from typing import List, Dict, Any
from backend.providers.knowledge.base import BaseKnowledgeProvider

class ArxivProvider(BaseKnowledgeProvider):
    @property
    def provider_name(self) -> str:
        return "arxiv"

    async def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        url = "http://export.arxiv.org/api/query"
        params = {
            "search_query": f"all:{query}",
            "start": 0,
            "max_results": limit
        }
        
        results = []
        async with httpx.AsyncClient(follow_redirects=True) as client:
            try:
                response = await client.get(url, params=params)
                if response.status_code == 200:
                    root = ET.fromstring(response.text)
                    ns = {'atom': 'http://www.w3.org/2005/Atom'}
                    
                    for entry in root.findall('atom:entry', ns):
                        title = entry.find('atom:title', ns).text
                        if title: title = title.replace('\n', ' ').strip()
                        
                        summary = entry.find('atom:summary', ns).text
                        if summary: summary = summary.replace('\n', ' ').strip()
                        
                        link = entry.find('atom:id', ns).text
                        
                        authors = []
                        for author in entry.findall('atom:author', ns):
                            name = author.find('atom:name', ns).text
                            if name: authors.append(name)
                        
                        # estimate 1 paper = 60 mins reading
                        estimated_duration = 60
                        
                        results.append({
                            "title": title or "Unknown Paper",
                            "description": summary[:500] if summary else "",
                            "url": link or "",
                            "source_type": "paper",
                            "provider": self.provider_name,
                            "author": authors[0] if authors else "Unknown",
                            "thumbnail": "", # Arxiv doesn't provide thumbnails
                            "language": "en",
                            "estimated_duration": estimated_duration,
                            "metadata_": {"authors": authors}
                        })
                    
                    if not results:
                        print(f"ArXiv API returned 0 items. Status: {response.status_code}, Body: {response.text[:200]}")
                else:
                    print(f"ArXiv API non-200 status: {response.status_code} - {response.text[:200]}")
            except Exception as e:
                print(f"Error fetching from ArXiv: {e}")
                
        return results
