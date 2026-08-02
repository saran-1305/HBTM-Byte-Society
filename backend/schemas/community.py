from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID


class CertificationResponse(BaseModel):
    id: UUID
    domain: str
    issued_at: datetime

    class Config:
        from_attributes = True


class CreatePostRequest(BaseModel):
    title: str
    description: str


class ReplyRequest(BaseModel):
    content: str


class CommunityPostResponse(BaseModel):
    id: UUID
    user_id: UUID
    domain: str
    title: str
    description: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class CommunityReplyResponse(BaseModel):
    id: UUID
    post_id: UUID
    responder_user_id: UUID
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class MyPostResponse(BaseModel):
    post: CommunityPostResponse
    reply_count: int


class PostDetailResponse(BaseModel):
    post: CommunityPostResponse
    replies: List[CommunityReplyResponse]
