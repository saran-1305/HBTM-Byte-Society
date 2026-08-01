import httpx
import xml.etree.ElementTree as ET
from typing import List, Optional
from backend.knowledge.providers.base import KnowledgeProvider, RawKnowledgeData

class ArxivProvider(KnowledgeProvider):
    @property
    def provider_name(self) -> str:
        return "arXiv"
        
    @property
    def source_type(self) -> str:
        return "paper"

    async def search(self, query: str, limit: int = 5) -> List[RawKnowledgeData]:
        url = f"http://export.arxiv.org/api/query?search_query=all:{query}&start=0&max_results={limit}"
        results = []
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                if response.status_code == 200:
                    root = ET.fromstring(response.text)
                    ns = {'arxiv': 'http://www.w3.org/2005/Atom'}
                    for entry in root.findall('arxiv:entry', ns):
                        title = entry.find('arxiv:title', ns).text.strip()
                        summary = entry.find('arxiv:summary', ns).text.strip()
                        link = entry.find('arxiv:id', ns).text.strip()
                        author = entry.find('arxiv:author/arxiv:name', ns).text.strip()
                        published = entry.find('arxiv:published', ns).text.strip()
                        
                        results.append(RawKnowledgeData(
                            title=title,
                            description=summary,
                            url=link,
                            author=author,
                            published_date=published,
                            domain="Science & Technology"
                        ))
        except Exception as e:
            print(f"arXiv API error: {e}")
            
        return results

    async def fetch(self, url: str) -> Optional[RawKnowledgeData]:
        return None
