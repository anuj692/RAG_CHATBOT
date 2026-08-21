from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    file_name: str
    status: str
    total_chunks: int
    error_message: str | None = None
    created_at: datetime


class SessionCreate(BaseModel):
    title: str = Field(default="New chat", min_length=1, max_length=255)
    document_id: str | None = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Title cannot be blank.")
        return cleaned


class SessionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    is_archived: bool | None = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Title cannot be blank.")
        return cleaned


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    document_id: str | None = None
    is_archived: bool
    created_at: datetime
    updated_at: datetime


class Citation(BaseModel):
    document_id: str
    file_name: str
    page_number: int
    chunk_id: str
    score: float


class ChatRequest(BaseModel):
    session_id: str
    document_id: str
    question: str = Field(min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation]
    retrieved_chunks: int


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    role: str
    content: str
    citations: list[dict] | None = None
    created_at: datetime


class HistoryResponse(BaseModel):
    session_id: str
    messages: list[MessageResponse]
