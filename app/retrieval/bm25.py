import re

from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import Chunk


def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]+", text.lower())


def build_bm25_retriever(document_id: str, db: Session, top_k: int) -> BM25Retriever | None:
    """Build a keyword-search retriever over one document's chunks.

    BM25Retriever keeps its corpus in memory, so it's rebuilt fresh from
    SQLite on every call rather than persisted — fine at this project's
    scale, and it means there's no separate keyword index to keep in sync.
    """

    chunks = db.scalars(
        select(Chunk)
        .where(Chunk.document_id == document_id)
        .order_by(Chunk.chunk_index)
    ).all()
    if not chunks:
        return None

    documents = [
        Document(
            page_content=chunk.chunk_text,
            metadata={
                "chunk_id": chunk.id,
                "document_id": chunk.document_id,
                "page_number": chunk.page_number,
            },
        )
        for chunk in chunks
    ]
    return BM25Retriever.from_documents(documents, preprocess_func=tokenize, k=top_k)
