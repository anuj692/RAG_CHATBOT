from functools import lru_cache

from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone

from app.config import get_settings
from app.ingestion.embedder import get_embeddings


def _require_pinecone_settings() -> None:
    settings = get_settings()
    if not settings.pinecone_api_key:
        raise RuntimeError("PINECONE_API_KEY is missing. Add it to .env.")
    if not settings.pinecone_index_host and not settings.pinecone_index_name:
        raise RuntimeError("Set PINECONE_INDEX_HOST or PINECONE_INDEX_NAME in .env.")


@lru_cache
def get_index():
    _require_pinecone_settings()
    settings = get_settings()
    client = Pinecone(api_key=settings.pinecone_api_key)
    if settings.pinecone_index_host:
        return client.Index(host=settings.pinecone_index_host)
    return client.Index(settings.pinecone_index_name)


@lru_cache
def get_vector_store() -> PineconeVectorStore:
    settings = get_settings()
    return PineconeVectorStore(
        index=get_index(),
        embedding=get_embeddings(),
        namespace=settings.pinecone_namespace,
    )


def delete_document_vectors(document_id: str) -> None:
    settings = get_settings()
    get_vector_store().delete(
        filter={"document_id": {"$eq": document_id}},
        namespace=settings.pinecone_namespace,
    )
