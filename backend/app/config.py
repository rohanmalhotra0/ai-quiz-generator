"""Application configuration. API key is read from environment."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """App settings. Set OPENAI_API_KEY in env or .env file."""

    openai_api_key: str = ""
    # Optional: max chunk size for text splitting (chars)
    chunk_size: int = 1500
    chunk_overlap: int = 200

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
