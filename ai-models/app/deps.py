"""Shared loading utilities and lazy singletons."""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import List, Sequence

import pandas as pd

from .config import Settings, get_settings


FALLBACK_POIS = [
    {
        "id": "gateway-india",
        "name": "Gateway of India",
        "description": "Iconic arch-monument overlooking the Arabian Sea, popular for heritage walks.",
        "category": "Heritage",
        "latitude": 18.921984,
        "longitude": 72.834654,
        "rating": 4.7,
        "price_level": 0,
        "tags": ["heritage", "sea", "sunrise"],
        "opening_hours": {
            "mon": [["06:00", "22:00"]],
            "tue": [["06:00", "22:00"]],
            "wed": [["06:00", "22:00"]],
            "thu": [["06:00", "22:00"]],
            "fri": [["06:00", "22:00"]],
            "sat": [["06:00", "22:00"]],
            "sun": [["06:00", "22:00"]],
        },
        "image_url": "https://example.com/gateway.jpg",
    },
    {
        "id": "marine-drive",
        "name": "Marine Drive",
        "description": "3.6-km-long boulevard with sweeping bay views, best for sunsets and evening walks.",
        "category": "Waterfront",
        "latitude": 18.943176,
        "longitude": 72.823553,
        "rating": 4.8,
        "price_level": 0,
        "tags": ["sunset", "family", "night"],
        "opening_hours": {
            "mon": [["00:00", "23:59"]],
            "tue": [["00:00", "23:59"]],
            "wed": [["00:00", "23:59"]],
            "thu": [["00:00", "23:59"]],
            "fri": [["00:00", "23:59"]],
            "sat": [["00:00", "23:59"]],
            "sun": [["00:00", "23:59"]],
        },
        "image_url": "https://example.com/marine.jpg",
    },
    {
        "id": "bandra-fort",
        "name": "Bandra Fort",
        "description": "Seaside fort ruins with views of Bandra-Worli Sea Link, popular for photography.",
        "category": "Fort",
        "latitude": 19.0435,
        "longitude": 72.8204,
        "rating": 4.4,
        "price_level": 0,
        "tags": ["sunset", "photography", "couples"],
        "opening_hours": {
            "mon": [["06:00", "20:00"]],
            "tue": [["06:00", "20:00"]],
            "wed": [["06:00", "20:00"]],
            "thu": [["06:00", "20:00"]],
            "fri": [["06:00", "20:00"]],
            "sat": [["06:00", "20:00"]],
            "sun": [["06:00", "20:00"]],
        },
        "image_url": "https://example.com/bandra-fort.jpg",
    },
]


@lru_cache()
def get_stopwords() -> List[str]:
    stop_path = Path(__file__).resolve().parent / "data" / "stopwords.txt"
    if not stop_path.exists():
        return []
    return [line.strip() for line in stop_path.read_text(encoding="utf-8").splitlines() if line.strip()]


def _resolve_path(path: Path) -> Path:
    if path.is_absolute():
        return path
    base = Path(__file__).resolve().parents[2]
    return (base / path).resolve()


@lru_cache(maxsize=1)
def get_poi_frame() -> pd.DataFrame:
    settings = get_settings()
    csv_path = _resolve_path(settings.poi_csv_path)
    if csv_path.exists():
        df = pd.read_csv(csv_path)
        if "tags" in df.columns:
            df["tags"] = df["tags"].fillna("").apply(lambda x: [t.strip() for t in str(x).split("|") if t.strip()])
        if "opening_hours" in df.columns:
            df["opening_hours"] = df["opening_hours"].apply(_safe_json_load)
        return df
    return pd.DataFrame(FALLBACK_POIS)


def _safe_json_load(val):
    if pd.isna(val):
        return {}
    if isinstance(val, dict):
        return val
    try:
        return json.loads(val)
    except Exception:
        return {}


def get_corpus() -> Sequence[str]:
    df = get_poi_frame()
    name_col = df["name"].fillna("").astype(str)
    desc_col = df["description"].fillna("").astype(str)
    if "tags" in df.columns:
        tags_col = df["tags"]
    else:
        tags_col = pd.Series([[] for _ in range(len(df))])
    combined = []
    for row in zip(name_col, desc_col, tags_col):
        parts = []
        for item in row:
            if isinstance(item, list):
                parts.extend(item)
            else:
                parts.append(str(item))
        combined.append(" ".join(parts))
    return combined


__all__ = [
    "get_settings",
    "get_stopwords",
    "get_poi_frame",
    "get_corpus",
]
