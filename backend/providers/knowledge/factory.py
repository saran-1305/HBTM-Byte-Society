from typing import List
from backend.providers.knowledge.base import BaseKnowledgeProvider
from backend.providers.knowledge.open_library import OpenLibraryProvider
from backend.providers.knowledge.arxiv_provider import ArxivProvider
from backend.providers.knowledge.youtube import YouTubeProvider

class ProviderFactory:
    def __init__(self):
        self._providers = {
            "open_library": OpenLibraryProvider(),
            "arxiv": ArxivProvider(),
            "youtube": YouTubeProvider()
        }

    def get_provider(self, name: str) -> BaseKnowledgeProvider:
        provider = self._providers.get(name)
        if not provider:
            raise ValueError(f"Provider '{name}' not found")
        return provider

    def get_all_providers(self) -> List[BaseKnowledgeProvider]:
        return list(self._providers.values())
