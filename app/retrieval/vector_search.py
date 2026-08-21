from dataclasses import dataclass, replace

from app.config import get_settings
from app.vectorstore.pinecone_db import get_vector_store


@dataclass(frozen=True)
class SearchResult:
    chunk_id: str
    document_id: str
    text: str
    page_number: int
    score: float
    source: str

    def with_score(self, score: float, source: str | None = None) -> "SearchResult":
        return replace(self, score=score, source=source or self.source)


def vector_search(
    question: str,
    document_id: str,
    top_k: int | None = None,
) -> list[SearchResult]:
    settings = get_settings()
    matches = get_vector_store().similarity_search_with_score(
        question,
        k=top_k or settings.retrieval_top_k,
        filter={"document_id": document_id},
    )

    return [
        SearchResult(
            chunk_id=doc.metadata["chunk_id"],
            document_id=doc.metadata["document_id"],
            text=doc.page_content,
            page_number=doc.metadata["page_number"],
            score=float(score),
            source="vector",
        )
        for doc, score in matches
    ]
