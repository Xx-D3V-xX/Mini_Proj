"""Embedding utilities with transformer + TF-IDF fallback."""
from __future__ import annotations

import logging
from typing import List, Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

from .. import deps
from ..config import Settings

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover - fallback path
    SentenceTransformer = None  # type: ignore


logger = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._model: Optional[SentenceTransformer] = None
        self._vectorizer: Optional[TfidfVectorizer] = None
        self._tfidf_matrix = None

    def _load_transformer(self) -> Optional[SentenceTransformer]:
        if SentenceTransformer is None:
            return None
        if self._model is not None:
            return self._model
        try:
            self._model = SentenceTransformer(
                self.settings.embed_model,
                cache_folder=str(self.settings.embed_cache_dir),
            )
            logger.info("Loaded sentence-transformer %s", self.settings.embed_model)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Falling back to TF-IDF embeddings: %s", exc)
            self._model = None
        return self._model

    def _ensure_vectorizer(self) -> TfidfVectorizer:
        if self._vectorizer is not None:
            return self._vectorizer
        stopwords = deps.get_stopwords()
        self._vectorizer = TfidfVectorizer(stop_words=stopwords, max_features=1024)
        corpus = deps.get_corpus()
        if corpus:
            self._tfidf_matrix = self._vectorizer.fit_transform(corpus)
        else:
            self._tfidf_matrix = self._vectorizer.fit_transform(["mumbai trails dataset"])
        return self._vectorizer

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        model = self._load_transformer()
        if model is not None:
            embeddings = model.encode(texts, convert_to_numpy=True)
            return embeddings.astype(float).tolist()
        vectorizer = self._ensure_vectorizer()
        embeddings = vectorizer.transform(texts).toarray()
        return embeddings.astype(float).tolist()

    def similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        if not a.any() or not b.any():
            return 0.0
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
