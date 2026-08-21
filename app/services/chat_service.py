from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database.models import ChatSession, Document, Message
from app.database.schemas import (
    ChatResponse,
    Citation,
    HistoryResponse,
    SessionCreate,
    SessionUpdate,
)
from app.guardrails.basic_guardrails import (
    NOT_FOUND_MESSAGE,
    filter_retrieved_chunks,
    sanitize_context,
    validate_answer,
    validate_question,
)
from app.llm.groq_llm import generate_answer
from app.retrieval.hybrid_search import hybrid_search
from app.retrieval.reranker import rerank_results
from app.retrieval.vector_search import SearchResult, vector_search


def create_session(payload: SessionCreate, db: Session) -> ChatSession:
    session = ChatSession(title=payload.title.strip(), document_id=payload.document_id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def list_sessions(db: Session) -> list[ChatSession]:
    return list(db.scalars(select(ChatSession).order_by(ChatSession.updated_at.desc())).all())


def update_session(session_id: str, payload: SessionUpdate, db: Session) -> ChatSession:
    session = db.get(ChatSession, session_id)
    if session is None:
        raise LookupError("Chat session not found.")

    if payload.title is not None:
        session.title = payload.title.strip()
    if payload.is_archived is not None:
        session.is_archived = payload.is_archived
    db.commit()
    db.refresh(session)
    return session

def delete_session(session_id: str, db: Session) -> None:
    """Delete one chat session and all of its messages."""

    session = db.get(ChatSession, session_id)

    if session is None:
        raise LookupError("Chat session not found.")

    db.delete(session)
    db.commit()


def delete_all_sessions(db: Session) -> int:
    """Delete all chat sessions and their messages."""

    sessions = list(db.scalars(select(ChatSession)).all())

    for session in sessions:
        db.delete(session)

    db.commit()
    return len(sessions)


def get_history(session_id: str, db: Session) -> HistoryResponse:
    session = db.get(ChatSession, session_id)
    if session is None:
        raise LookupError("Chat session not found.")

    messages = db.scalars(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
    ).all()
    return HistoryResponse(session_id=session_id, messages=list(messages))


def _retrieve(question: str, document_id: str, db: Session) -> list[SearchResult]:
    settings = get_settings()
    if settings.use_hybrid_search:
        results = hybrid_search(question, document_id, db, top_k=settings.retrieval_top_k)
    else:
        results = vector_search(question, document_id, top_k=settings.retrieval_top_k)

    filtered = filter_retrieved_chunks(
        results,
        minimum_score=settings.min_retrieval_score,
        limit=settings.retrieval_top_k,
    )
    return rerank_results(question, filtered, top_k=settings.context_top_k)


def _build_context(document: Document, results: list[SearchResult]) -> str:
    sections: list[str] = []
    for index, result in enumerate(results, start=1):
        sections.append(
            f"[Source {index} | {document.file_name} | page {result.page_number}]\n"
            f"{sanitize_context(result.text)}"
        )
    return "\n\n".join(sections)


def answer_question(
    session_id: str,
    document_id: str,
    question: str,
    db: Session,
) -> ChatResponse:
    cleaned_question = validate_question(question)
    chat_session = db.get(ChatSession, session_id)
    if chat_session is None:
        raise LookupError("Chat session not found.")

    document = db.get(Document, document_id)
    if document is None:
        raise LookupError("Document not found.")
    if document.status != "ready":
        raise ValueError(f"Document is not ready. Current status: {document.status}.")

    db.add(Message(session_id=session_id, role="user", content=cleaned_question))
    db.commit()

    results = _retrieve(cleaned_question, document_id, db)
    citations = [
        Citation(
            document_id=document.id,
            file_name=document.file_name,
            page_number=result.page_number,
            chunk_id=result.chunk_id,
            score=round(result.score, 4),
        )
        for result in results
    ]

    if results:
        context = _build_context(document, results)
        answer = validate_answer(generate_answer(context, cleaned_question), has_context=True)
    else:
        answer = NOT_FOUND_MESSAGE

    db.add(
        Message(
            session_id=session_id,
            role="assistant",
            content=answer,
            citations=[citation.model_dump() for citation in citations],
        )
    )
    db.commit()

    return ChatResponse(
        answer=answer,
        citations=citations,
        retrieved_chunks=len(results),
    )

