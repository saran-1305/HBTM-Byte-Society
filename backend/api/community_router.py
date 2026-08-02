from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from backend.config.database import get_db
from backend.services.community_service import CommunityService
from backend.schemas.community import (
    CertificationResponse,
    CreatePostRequest,
    ReplyRequest,
    CommunityPostResponse,
    CommunityReplyResponse,
    MyPostResponse,
    PostDetailResponse,
)

router = APIRouter(tags=["Community & Mentorship"])


@router.get("/certification/{user_id}", response_model=List[CertificationResponse], summary="Get a user's certifications")
async def get_certifications(user_id: UUID, db: AsyncSession = Depends(get_db)):
    service = CommunityService(db)
    return await service.get_certifications(user_id)


@router.post("/posts/{user_id}", response_model=CommunityPostResponse, summary="Post a problem to the community board")
async def create_post(user_id: UUID, req: CreatePostRequest, db: AsyncSession = Depends(get_db)):
    service = CommunityService(db)
    try:
        return await service.create_post(user_id, req.title, req.description)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/posts/mentor/{user_id}", response_model=List[CommunityPostResponse], summary="Open posts a certified mentor can help with")
async def get_mentor_feed(user_id: UUID, db: AsyncSession = Depends(get_db)):
    service = CommunityService(db)
    try:
        return await service.list_open_posts_for_mentor(user_id)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.get("/posts/mine/{user_id}", response_model=List[MyPostResponse], summary="A user's own posted problems")
async def get_my_posts(user_id: UUID, db: AsyncSession = Depends(get_db)):
    service = CommunityService(db)
    return await service.get_posts_for_user(user_id)


@router.get("/posts/{post_id}", response_model=PostDetailResponse, summary="Get a post with its replies")
async def get_post(post_id: UUID, db: AsyncSession = Depends(get_db)):
    service = CommunityService(db)
    try:
        return await service.get_post_detail(post_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/posts/{post_id}/reply/{user_id}", response_model=CommunityReplyResponse, summary="Reply to a post as a certified mentor")
async def reply_to_post(post_id: UUID, user_id: UUID, req: ReplyRequest, db: AsyncSession = Depends(get_db)):
    service = CommunityService(db)
    try:
        return await service.reply(post_id, user_id, req.content)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.post("/posts/{post_id}/resolve/{user_id}", response_model=CommunityPostResponse, summary="Mark a post resolved")
async def resolve_post(post_id: UUID, user_id: UUID, db: AsyncSession = Depends(get_db)):
    service = CommunityService(db)
    try:
        return await service.resolve_post(post_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
