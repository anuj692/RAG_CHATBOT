from functools import lru_cache

from langchain_huggingface import HuggingFaceEndpointEmbeddings

from app.config import get_settings


@lru_cache
def get_embeddings() -> HuggingFaceEndpointEmbeddings:
    settings = get_settings()

    if not settings.hf_token:
        raise RuntimeError(
            "HF_TOKEN is missing. Add a Hugging Face token to .env "
            "(generate one at https://huggingface.co/settings/tokens)."
        )

    # Calls Hugging Face's hosted inference API instead of loading the
    # embedding model in-process, so the server never has to load PyTorch +
    # sentence-transformers into its own memory.
    return HuggingFaceEndpointEmbeddings(
        model=settings.embedding_model,
        task="feature-extraction",
        huggingfacehub_api_token=settings.hf_token,
    )
