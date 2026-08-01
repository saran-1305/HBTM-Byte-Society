from typing import List
from backend.knowledge.providers.base import KnowledgeProvider
from backend.knowledge.providers.google_books import GoogleBooksProvider
from backend.knowledge.providers.youtube import YouTubeProvider
from backend.knowledge.providers.arxiv import ArxivProvider
from backend.knowledge.providers.medium import MediumProvider

class ProviderFactory:
    @staticmethod
    def get_all_providers() -> List[KnowledgeProvider]:
        return [
            GoogleBooksProvider(),
            YouTubeProvider(),
            ArxivProvider(),
            MediumProvider()
        ]
        
    @staticmethod
    def get_provider(name: str) -> KnowledgeProvider:
        providers = {
            "google books": GoogleBooksProvider(),
            "youtube": YouTubeProvider(),
            "arxiv": ArxivProvider(),
            "medium": MediumProvider()
        }
        return providers.get(name.lower(), GoogleBooksProvider())
