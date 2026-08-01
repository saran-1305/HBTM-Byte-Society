from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Any
import uuid

from backend.config.database import get_sync_db
from backend.utils.auth import get_current_user_id
from backend.knowledge.service import KnowledgeService

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])

@router.get("")
def get_knowledge(
    db: Session = Depends(get_sync_db)
):
    service = KnowledgeService(db)
    return service.search()

@router.get("/search")
def search_knowledge(
    q: str = "",
    category: str = None,
    stage: str = None,
    db: Session = Depends(get_sync_db)
):
    service = KnowledgeService(db)
    return service.search(query=q, category=category, stage=stage)

@router.post("/refresh")
async def refresh_knowledge(
    q: str = "personal growth",
    db: Session = Depends(get_sync_db)
):
    service = KnowledgeService(db)
    count = await service.process_and_store_knowledge(query=q)
    return {"message": f"Successfully fetched and processed {count} new knowledge items."}

@router.get("/categories")
def get_categories(
    db: Session = Depends(get_sync_db)
):
    service = KnowledgeService(db)
    from sqlalchemy import func
    from backend.models.knowledge import KnowledgeSource
    
    result = db.query(
        KnowledgeSource.category, 
        func.count(KnowledgeSource.id)
    ).group_by(KnowledgeSource.category).all()
    
    return [{"category": r[0], "count": r[1]} for r in result if r[0]]

@router.get("/tags")
def get_tags(
    db: Session = Depends(get_sync_db)
):
    # Flatten JSON tags (PostgreSQL specific or simplistic approach)
    # Simple approach for demonstration:
    from backend.models.knowledge import KnowledgeSource
    sources = db.query(KnowledgeSource.tags).filter(KnowledgeSource.tags.isnot(None)).all()
    all_tags = set()
    for s in sources:
        if isinstance(s[0], list):
            for t in s[0]:
                all_tags.add(t)
    return list(all_tags)

@router.post("/bookmark")
def bookmark_knowledge(
    knowledge_id: str,
    notes: str = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_sync_db)
):
    service = KnowledgeService(db)
    service.repo.add_bookmark(user_id, knowledge_id, notes)
    return {"message": "Bookmarked"}

@router.delete("/bookmark")
def remove_bookmark(
    knowledge_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_sync_db)
):
    service = KnowledgeService(db)
    success = service.repo.remove_bookmark(user_id, knowledge_id)
    if not success:
        raise HTTPException(404, "Bookmark not found")
    return {"message": "Bookmark removed"}

@router.get("/history")
def get_history(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_sync_db)
):
    service = KnowledgeService(db)
    history = service.repo.get_history_for_user(user_id)
    return [
        {
            "knowledge_id": str(h.knowledge_id),
            "action": h.action,
            "created_at": h.created_at.isoformat()
        } for h in history
    ]

@router.get("/progress")
def get_progress(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_sync_db)
):
    service = KnowledgeService(db)
    progress = service.repo.get_progress_for_user(user_id)
    return [
        {
            "knowledge_id": str(p.knowledge_id),
            "status": p.status,
            "percentage": p.completion_percentage
        } for p in progress
    ]

@router.get("/{id}")
def get_knowledge_item(
    id: str,
    db: Session = Depends(get_sync_db)
):
    service = KnowledgeService(db)
    details = service.get_details(id)
    if not details:
        raise HTTPException(status_code=404, detail="Knowledge item not found")
    
    return details
