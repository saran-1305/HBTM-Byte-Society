from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from typing import List, Optional
import uuid
from backend.models.knowledge import (
    KnowledgeSource, KnowledgeSummary, KnowledgeBookmark,
    KnowledgeHistory, UserKnowledgeProgress
)

class KnowledgeRepository:
    def __init__(self, db: Session):
        self.db = db

    def save_knowledge_source(self, source: KnowledgeSource) -> KnowledgeSource:
        self.db.add(source)
        self.db.commit()
        self.db.refresh(source)
        return source

    def save_knowledge_summary(self, summary: KnowledgeSummary) -> KnowledgeSummary:
        self.db.add(summary)
        self.db.commit()
        self.db.refresh(summary)
        return summary

    def get_knowledge_by_id(self, knowledge_id: str) -> Optional[KnowledgeSource]:
        return self.db.query(KnowledgeSource).filter(KnowledgeSource.id == knowledge_id).first()

    def get_summary_for_knowledge(self, knowledge_id: str) -> Optional[KnowledgeSummary]:
        return self.db.query(KnowledgeSummary).filter(KnowledgeSummary.knowledge_id == knowledge_id).first()

    def search_knowledge(
        self, 
        query: str = "", 
        category: str = None, 
        domain: str = None, 
        difficulty: str = None, 
        stage: str = None,
        max_time: int = None,
        limit: int = 20
    ) -> List[KnowledgeSource]:
        q = self.db.query(KnowledgeSource)
        
        if query:
            search_filter = or_(
                KnowledgeSource.title.ilike(f"%{query}%"),
                KnowledgeSource.description.ilike(f"%{query}%")
            )
            q = q.filter(search_filter)
            
        if category:
            q = q.filter(KnowledgeSource.category == category)
        if domain:
            q = q.filter(KnowledgeSource.domain == domain)
        if difficulty:
            q = q.filter(KnowledgeSource.difficulty == difficulty)
        if stage:
            q = q.filter(KnowledgeSource.stage == stage)
        if max_time:
            q = q.filter(KnowledgeSource.estimated_time <= max_time)
            
        return q.order_by(desc(KnowledgeSource.created_at)).limit(limit).all()

    def add_bookmark(self, user_id: str, knowledge_id: str, notes: str = None) -> KnowledgeBookmark:
        bookmark = KnowledgeBookmark(
            user_id=uuid.UUID(user_id), 
            knowledge_id=knowledge_id,
            notes=notes
        )
        self.db.add(bookmark)
        self.db.commit()
        self.db.refresh(bookmark)
        return bookmark

    def remove_bookmark(self, user_id: str, knowledge_id: str) -> bool:
        bookmark = self.db.query(KnowledgeBookmark).filter(
            and_(
                KnowledgeBookmark.user_id == uuid.UUID(user_id),
                KnowledgeBookmark.knowledge_id == knowledge_id
            )
        ).first()
        if bookmark:
            self.db.delete(bookmark)
            self.db.commit()
            return True
        return False

    def get_bookmarks_for_user(self, user_id: str) -> List[KnowledgeBookmark]:
        return self.db.query(KnowledgeBookmark).filter(
            KnowledgeBookmark.user_id == uuid.UUID(user_id)
        ).order_by(desc(KnowledgeBookmark.created_at)).all()

    def add_history(self, user_id: str, knowledge_id: str, action: str) -> KnowledgeHistory:
        history = KnowledgeHistory(
            user_id=uuid.UUID(user_id),
            knowledge_id=knowledge_id,
            action=action
        )
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history

    def get_history_for_user(self, user_id: str, limit: int = 20) -> List[KnowledgeHistory]:
        return self.db.query(KnowledgeHistory).filter(
            KnowledgeHistory.user_id == uuid.UUID(user_id)
        ).order_by(desc(KnowledgeHistory.created_at)).limit(limit).all()

    def update_progress(self, user_id: str, knowledge_id: str, status: str, percentage: int) -> UserKnowledgeProgress:
        progress = self.db.query(UserKnowledgeProgress).filter(
            and_(
                UserKnowledgeProgress.user_id == uuid.UUID(user_id),
                UserKnowledgeProgress.knowledge_id == knowledge_id
            )
        ).first()
        
        if not progress:
            progress = UserKnowledgeProgress(
                user_id=uuid.UUID(user_id),
                knowledge_id=knowledge_id,
                status=status,
                completion_percentage=percentage
            )
            self.db.add(progress)
        else:
            progress.status = status
            progress.completion_percentage = percentage
            
        self.db.commit()
        self.db.refresh(progress)
        return progress

    def get_progress_for_user(self, user_id: str) -> List[UserKnowledgeProgress]:
        return self.db.query(UserKnowledgeProgress).filter(
            UserKnowledgeProgress.user_id == uuid.UUID(user_id)
        ).all()
