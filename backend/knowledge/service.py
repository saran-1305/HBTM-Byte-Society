from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import asyncio
from backend.knowledge.repository import KnowledgeRepository
from backend.knowledge.providers.factory import ProviderFactory
from backend.knowledge.agent import KnowledgeAgent
from backend.models.knowledge import KnowledgeSource, KnowledgeSummary

class KnowledgeService:
    def __init__(self, db: Session):
        self.repo = KnowledgeRepository(db)
        self.agent = KnowledgeAgent()
        
    async def process_and_store_knowledge(self, query: str, limit_per_provider: int = 2) -> int:
        """
        Orchestrates pulling from providers, running through the agent, and storing to the DB.
        Returns the number of new items stored.
        """
        providers = ProviderFactory.get_all_providers()
        
        # 1. Fetch raw data concurrently from all providers
        tasks = [provider.search(query, limit=limit_per_provider) for provider in providers]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        raw_items = []
        for idx, res in enumerate(results):
            if isinstance(res, Exception):
                print(f"Provider {providers[idx].provider_name} failed: {res}")
            else:
                raw_items.extend(res)
                
        stored_count = 0
        
        # 2. Process each item through KnowledgeAgent and store
        for raw in raw_items:
            # Simple deduplication check by URL
            existing = self.repo.db.query(KnowledgeSource).filter(KnowledgeSource.url == raw.url).first()
            if existing:
                continue
                
            # Process via LiteLLM
            ai_result = await self.agent.process_knowledge(raw)
            
            # Save Source
            source = KnowledgeSource(
                title=raw.title,
                description=raw.description,
                source=raw.author or "Unknown",
                source_type="article" if not raw.domain else "web", # Defaulting, can be refined
                author=raw.author,
                url=raw.url,
                thumbnail=raw.thumbnail,
                category=ai_result.category,
                domain=raw.domain,
                tags=ai_result.tags,
                difficulty=ai_result.difficulty,
                stage=ai_result.stage,
                language=raw.language,
                estimated_time=ai_result.estimated_time
            )
            self.repo.save_knowledge_source(source)
            
            # Save Summary
            summary = KnowledgeSummary(
                knowledge_id=source.id,
                ai_summary=ai_result.ai_summary,
                key_takeaways=ai_result.key_takeaways,
                prerequisites=ai_result.prerequisites,
                learning_outcomes=ai_result.learning_outcomes
            )
            self.repo.save_knowledge_summary(summary)
            
            stored_count += 1
            
        return stored_count

    def search(self, query: str = "", category: str = None, stage: str = None) -> List[Dict[str, Any]]:
        sources = self.repo.search_knowledge(query=query, category=category, stage=stage)
        
        results = []
        for s in sources:
            results.append({
                "id": str(s.id),
                "title": s.title,
                "description": s.description,
                "domain": s.domain,
                "stage": s.stage,
                "difficulty": s.difficulty,
                "url": s.url,
                "thumbnail": s.thumbnail,
                "created_at": s.created_at.isoformat() if s.created_at else None
            })
        return results

    def get_details(self, knowledge_id: str) -> Optional[Dict[str, Any]]:
        source = self.repo.get_knowledge_by_id(knowledge_id)
        if not source:
            return None
            
        summary = self.repo.get_summary_for_knowledge(knowledge_id)
        
        return {
            "id": str(source.id),
            "title": source.title,
            "description": source.description,
            "url": source.url,
            "author": source.author,
            "domain": source.domain,
            "stage": source.stage,
            "difficulty": source.difficulty,
            "estimated_time": source.estimated_time,
            "tags": source.tags,
            "ai_summary": summary.ai_summary if summary else None,
            "key_takeaways": summary.key_takeaways if summary else [],
            "prerequisites": summary.prerequisites if summary else [],
            "learning_outcomes": summary.learning_outcomes if summary else []
        }
