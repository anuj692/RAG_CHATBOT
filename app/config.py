from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables or .env."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Beginner RAG Chatbot"
    app_version: str = "1.0.0"
    debug: bool = False

    # Override this with a MySQL URL in .env. SQLite keeps tests and quick
    # experimentation simple when MySQL is not running.
    mysql_url: str = "sqlite:///./rag_chatbot.db"

    upload_dir: str = "./uploads"
    max_upload_mb: int = Field(default=20, ge=1, le=200)
    chunk_size_words: int = Field(default=180, ge=50, le=500)
    chunk_overlap_words: int = Field(default=30, ge=0, le=100)

    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dimension: int = Field(default=384, ge=1)

    pinecone_api_key: str = ""
    pinecone_index_name: str = "rag-chatbot"
    pinecone_index_host: str = ""
    pinecone_namespace: str = "rag-chatbot"

    llm_max_tokens: int = Field(default=500, ge=50, le=4000)
    llm_temperature: float = Field(default=0.1, ge=0.0, le=2.0)

    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-20b"

    retrieval_top_k: int = Field(default=8, ge=1, le=50)
    context_top_k: int = Field(default=5, ge=1, le=20)
    min_retrieval_score: float = Field(default=0.35, ge=-1.0, le=1.0)
    use_hybrid_search: bool = False
    vector_weight: float = Field(default=0.7, ge=0.0, le=1.0)
    bm25_weight: float = Field(default=0.3, ge=0.0, le=1.0)

    allowed_origins: str = "*"

    @property
    def cors_origins(self) -> list[str]:
        if self.allowed_origins.strip() == "*":
            return ["*"]
        return [value.strip() for value in self.allowed_origins.split(",") if value.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

