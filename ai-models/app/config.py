"""Environment configuration for the AI microservice."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    port: int = Field(8001, alias="PORT")
    embed_model: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2", alias="EMBED_MODEL"
    )
    embed_cache_dir: Path = Field(
        default=Path("./app/data/cache"), alias="EMBED_CACHE_DIR"
    )
    reco_weights_raw: str = Field(
        default="0.45,0.2,0.2,0.05,0.1", alias="RECO_WEIGHTS"
    )
    osrm_url: str = Field(default="http://localhost:5000", alias="OSRM_URL")
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-2.5-flash", alias="GEMINI_MODEL")
    gemini_requests_per_minute: int = Field(
        default=30, alias="GEMINI_REQUESTS_PER_MINUTE"
    )
    poi_csv_path: Path = Field(
        default=Path("../backend/seed/pois.csv"), alias="POI_CSV_PATH"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def reco_weights(self) -> List[float]:
        return [float(w.strip()) for w in self.reco_weights_raw.split(",") if w.strip()]


class HealthStatus(BaseModel):
    status: str = "ok"
    cache_dir: Path
    embed_model: str


@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    settings.embed_cache_dir.mkdir(parents=True, exist_ok=True)
    return settings
