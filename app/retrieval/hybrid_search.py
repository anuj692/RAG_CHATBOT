from langchain.retrievers import EnsembleRetriever
from sqlalchemy.orm import Session

from app.config import get_settings
from app.retrieval.bm25 import build_bm25_retriever
from app.retrieval.vector_search import SearchResult
from app.vectorstore.pinecone_db import get_vector_store


def hybrid_search(
    question: str,
    document_id: str,
    db: Session,
    top_k: int | None = None,
) -> list[SearchResult]:
    settings = get_settings()
    limit = top_k or settings.retrieval_top_k

    bm25_retriever = build_bm25_retriever(document_id, db, top_k=limit)
    if bm25_retriever is None:
        return []

    vector_retriever = get_vector_store().as_retriever(
        search_kwargs={"k": limit, "filter": {"document_id": document_id}},
    )

    ensemble = EnsembleRetriever(
        retrievers=[vector_retriever, bm25_retriever],
        weights=[settings.vector_weight, settings.bm25_weight],
        id_key="chunk_id",
    )
    documents = ensemble.invoke(question)[:limit]

    # EnsembleRetriever ranks by reciprocal-rank fusion, not a raw similarity
    # score, so citations get a relative "how high did this rank" number
    # instead of a true 0-1 similarity score.
    total = len(documents)
    return [
        SearchResult(
            chunk_id=doc.metadata["chunk_id"],
            document_id=doc.metadata["document_id"],
            text=doc.page_content,
            page_number=doc.metadata["page_number"],
            score=round(1.0 - (index / total), 4),
            source="hybrid",
        )
        for index, doc in enumerate(documents)
    ]
