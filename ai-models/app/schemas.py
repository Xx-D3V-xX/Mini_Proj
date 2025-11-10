"""Pydantic schema definitions for FastAPI endpoints."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class Location(BaseModel):
    lat: float
    lng: float


class Filters(BaseModel):
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    rating_min: Optional[float] = Field(default=None, ge=0, le=5)
    price_level: Optional[int] = Field(default=None, ge=0, le=4)


class RecommendRequest(BaseModel):
    mood: str
    prefs: dict = Field(default_factory=dict)
    location: Optional[Location] = None
    filters: Optional[Filters] = None


class PoiScore(BaseModel):
    id: str
    name: str
    description: str
    category: str
    latitude: float
    longitude: float
    rating: Optional[float] = None
    price_level: Optional[int] = None
    tags: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None
    reason: str
    score: float


class RecommendResponse(BaseModel):
    items: List[PoiScore]


class EmbedRequest(BaseModel):
    texts: List[str]


class EmbedResponse(BaseModel):
    vectors: List[List[float]]


class TimeWindow(BaseModel):
    start: str
    end: str


class ItineraryItem(BaseModel):
    poi_id: str
    name: str
    lat: float
    lng: float
    start_time: str
    end_time: str
    travel_minutes: float
    distance_km: float


class ItineraryRequest(BaseModel):
    mood: str
    start_location: Location
    time_window: TimeWindow
    poi_ids: Optional[List[str]] = None


class ItineraryResponse(BaseModel):
    title: str
    total_distance_km: float
    total_time_min: float
    items: List[ItineraryItem]


class TravelTimeRequest(BaseModel):
    coords: List[Location]


class TravelEdge(BaseModel):
    origin: Location
    destination: Location
    distance_km: float
    duration_min: float


class TravelTimeResponse(BaseModel):
    legs: List[TravelEdge]
    total_distance_km: float
    total_duration_min: float


class ChatRequest(BaseModel):
    query: str
    history: Optional[List[dict]] = None


class ChatResponse(BaseModel):
    answer: str
    references: List[str]


class WeatherResponse(BaseModel):
    status: str
    description: str
    temperature_c: float
    humidity: int
    icon: str
