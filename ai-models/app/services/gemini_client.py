"""Google Gemini client wrapper with lightweight guardrails."""
from __future__ import annotations

import logging
import threading
import time
from collections import deque
from typing import Deque, Optional

from ..config import Settings

try:
    import google.generativeai as genai
except Exception:  # pragma: no cover - optional dependency
    genai = None  # type: ignore

logger = logging.getLogger(__name__)


class RateLimitError(Exception):
    """Raised when outbound Gemini calls exceed the configured rate."""


class RateLimiter:
    """Simple sliding-window limiter to avoid hammering the API."""

    def __init__(self, max_calls: int, interval_seconds: int = 60):
        self.max_calls = max(1, max_calls)
        self.interval = max(1, interval_seconds)
        self._timestamps: Deque[float] = deque()
        self._lock = threading.Lock()

    def allow(self) -> bool:
        now = time.monotonic()
        with self._lock:
            while self._timestamps and now - self._timestamps[0] > self.interval:
                self._timestamps.popleft()
            if len(self._timestamps) >= self.max_calls:
                return False
            self._timestamps.append(now)
            return True


class GeminiClient:
    """Lazy Google Gemini client with rate limiting and error handling."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self._limiter = RateLimiter(settings.gemini_requests_per_minute)
        self._model: Optional["genai.GenerativeModel"] = None
        self._configure()

    def _configure(self) -> None:
        if not self.settings.gemini_api_key:
            logger.warning("GEMINI_API_KEY missing; chatbot will fall back to heuristics.")
            return
        if genai is None:
            logger.error(
                "google-generativeai not installed; run `pip install google-generativeai` to enable Gemini."
            )
            return
        try:
            genai.configure(api_key=self.settings.gemini_api_key)
            self._model = genai.GenerativeModel(
                model_name=self.settings.gemini_model,
            )
            logger.info("Gemini model %s configured", self.settings.gemini_model)
        except Exception as exc:  # noqa: BLE001
            logger.error("Failed to configure Gemini model: %s", exc)
            self._model = None

    def generate(self, prompt: str) -> str | None:
        """Generate a concise completion, enforcing rate limits."""
        if not self._model:
            return None
        if not self._limiter.allow():
            raise RateLimitError("Gemini usage limit reached")
        try:
            response = self._model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.35,
                    "max_output_tokens": 256,
                    "top_p": 0.9,
                },
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning("Gemini request failed: %s", exc)
            return None
        text = getattr(response, "text", None)
        if text:
            return text.strip()
        try:
            candidates = response.candidates or []
            if not candidates:
                return None
            parts = candidates[0].content.parts
            combined = " ".join(part.text for part in parts if getattr(part, "text", ""))
            return combined.strip() or None
        except Exception:  # noqa: BLE001
            return None


__all__ = ["GeminiClient", "RateLimitError"]
