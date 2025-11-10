"""Multi-factor recommendation scoring."""
from __future__ import annotations

from typing import List

import numpy as np
import pandas as pd

from .. import deps
from ..config import Settings
from ..schemas import Filters, RecommendRequest
from .embeddings import EmbeddingService
from .utils import haversine_km, normalize

MOOD_CATEGORY_HINTS = {
    "Chill": ["Waterfront", "Park", "Cafe"],
    "Adventure": ["Hike", "Trail", "Fort", "Island"],
    "Family": ["Museum", "Park", "Aquarium"],
    "Culture": ["Heritage", "Museum", "Art"],
}


class RecommendService:
    def __init__(self, settings: Settings, embedding_service: EmbeddingService):
        self.settings = settings
        self.embedding_service = embedding_service

    def _apply_filters(self, df: pd.DataFrame, filters: Filters | None) -> pd.DataFrame:
        if filters is None:
            return df
        mask = pd.Series([True] * len(df))
        if filters.category:
            mask &= df["category"].str.contains(filters.category, case=False, na=False)
        if filters.tags:
            mask &= df["tags"].apply(
                lambda tags: bool(set(filters.tags or []) & set(tags or []))
            )
        if filters.rating_min is not None:
            mask &= df["rating"].fillna(0) >= float(filters.rating_min)
        if filters.price_level is not None:
            mask &= df["price_level"].fillna(0) <= int(filters.price_level)
        return df[mask]

    def recommend(self, payload: RecommendRequest) -> List[dict]:
        df = deps.get_poi_frame().copy()
        df = self._apply_filters(df, payload.filters)
        if df.empty:
            return []

        texts = df["description"].fillna("") + " " + df["name"].fillna("")
        mood_prompt = payload.mood + " " + " ".join(
            f"{k}:{v}" for k, v in sorted(payload.prefs.items())
        )
        poi_vectors = np.array(self.embedding_service.embed_texts(texts.tolist()))
        mood_vector = np.array(self.embedding_service.embed_texts([mood_prompt])[0])
        similarities = [self.embedding_service.similarity(vec, mood_vector) for vec in poi_vectors]

        categories = MOOD_CATEGORY_HINTS.get(payload.mood, [])
        category_scores = [1.0 if row["category"] in categories else 0.3 for _, row in df.iterrows()]

        if payload.location:
            distances = [
                haversine_km(
                    (payload.location.lat, payload.location.lng),
                    (row["latitude"], row["longitude"]),
                )
                for _, row in df.iterrows()
            ]
            distance_scores = [1 - d for d in normalize(distances)]
        else:
            distance_scores = [0.5] * len(df)

        price_pref = payload.prefs.get("budget")
        if price_pref:
            target = {"low": 0, "medium": 2, "high": 4}.get(str(price_pref).lower(), 2)
            price_scores = [
                1 - abs((row.get("price_level") or 2) - target) / 4 for _, row in df.iterrows()
            ]
        else:
            price_scores = [0.5] * len(df)

        rating_scores = normalize(df["rating"].fillna(3.5).tolist())

        weights = self.settings.reco_weights
        comp = zip(similarities, category_scores, distance_scores, price_scores, rating_scores)
        total_scores = [
            weights[0] * sim
            + weights[1] * cat
            + weights[2] * dist
            + weights[3] * price
            + weights[4] * rating
            for sim, cat, dist, price, rating in comp
        ]

        df = df.copy()
        df["score"] = total_scores
        df["reason"] = df.apply(
            lambda row: f"Matches {payload.mood} mood via {row['category']} vibe with rating {row['rating'] or 'N/A'}",
            axis=1,
        )
        ranked = df.sort_values("score", ascending=False).head(15)
        results: List[dict] = []
        for _, row in ranked.iterrows():
            results.append(
                {
                    "id": row["id"],
                    "name": row["name"],
                    "description": row.get("description", ""),
                    "category": row.get("category", ""),
                    "latitude": row.get("latitude"),
                    "longitude": row.get("longitude"),
                    "rating": row.get("rating"),
                    "price_level": row.get("price_level"),
                    "tags": row.get("tags", []),
                    "image_url": row.get("image_url"),
                    "reason": row.get("reason", ""),
                    "score": float(row.get("score", 0.0)),
                }
            )
        return results
