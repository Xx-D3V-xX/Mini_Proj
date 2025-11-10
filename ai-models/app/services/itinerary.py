"""Day-plan construction heuristics."""
from __future__ import annotations

from dataclasses import dataclass
from typing import List

import pandas as pd

from .. import deps
from ..config import Settings
from ..schemas import ItineraryRequest, ItineraryResponse, RecommendRequest
from .recommend import RecommendService
from .utils import haversine_km, two_opt


@dataclass
class PlanStop:
    poi_id: str
    name: str
    latitude: float
    longitude: float
    category: str
    rating: float | None

    @property
    def coord(self) -> tuple[float, float]:
        return (self.latitude, self.longitude)


class ItineraryService:
    def __init__(self, settings: Settings, recommend_service: RecommendService):
        self.settings = settings
        self.recommend_service = recommend_service

    def _select_pois(self, payload: ItineraryRequest) -> List[PlanStop]:
        df = deps.get_poi_frame().copy()
        if payload.poi_ids:
            df = df[df["id"].isin(payload.poi_ids)]
        if df.empty or not payload.poi_ids:
            recs = self.recommend_service.recommend(
                RecommendRequest(mood=payload.mood, prefs={}, location=payload.start_location)
            )
            if recs:
                df = pd.DataFrame(recs)
        if df.empty:
            df = (
                deps.get_poi_frame()
                .sort_values("rating", ascending=False)
                .groupby("category", group_keys=False)
                .head(2)
            )
        else:
            # encourage diversity by picking top-rated per category
            df = (
                df.sort_values("rating", ascending=False)
                .groupby("category", group_keys=False)
                .head(2)
            )
        df = df.head(8)  # manageable day
        return [
            PlanStop(
                poi_id=row["id"],
                name=row["name"],
                latitude=row["latitude"],
                longitude=row["longitude"],
                category=row.get("category", ""),
                rating=row.get("rating"),
            )
            for _, row in df.iterrows()
        ]

    def _order(self, start: tuple[float, float], stops: List[PlanStop]) -> List[PlanStop]:
        if not stops:
            return []
        coords = [s.coord for s in stops]
        remaining = list(range(len(stops)))
        order: List[int] = []
        current = start
        while remaining:
            next_idx = min(remaining, key=lambda idx: haversine_km(current, coords[idx]))
            order.append(next_idx)
            current = coords[next_idx]
            remaining.remove(next_idx)
        # apply 2-opt for refinement (with synthetic distance matrix)
        n = len(order)
        dist_matrix = [[0.0] * n for _ in range(n)]
        for i in range(n):
            for j in range(i + 1, n):
                d = haversine_km(coords[order[i]], coords[order[j]])
                dist_matrix[i][j] = dist_matrix[j][i] = d
        optimized_positions = two_opt(list(range(n)), dist_matrix)
        ordered_indices = [order[idx] for idx in optimized_positions]
        return [stops[i] for i in ordered_indices]

    def _dwell_minutes(self, category: str) -> int:
        category = (category or "").lower()
        if "museum" in category or "gallery" in category:
            return 90
        if "heritage" in category or "fort" in category:
            return 80
        if "park" in category or "water" in category:
            return 60
        return 75

    def build(self, payload: ItineraryRequest) -> ItineraryResponse:
        stops = self._select_pois(payload)
        ordered = self._order(
            (payload.start_location.lat, payload.start_location.lng), stops
        )
        start_minutes = _parse_minutes(payload.time_window.start)
        end_limit = _parse_minutes(payload.time_window.end)

        items = []
        cursor = start_minutes
        total_distance = 0.0
        prev_coord = (payload.start_location.lat, payload.start_location.lng)
        lunch_inserted = False
        evening_break_inserted = False

        for stop in ordered:
            distance = haversine_km(prev_coord, stop.coord)
            travel = _travel_minutes(distance, cursor)
            cursor += travel
            total_distance += distance

            if not lunch_inserted and cursor >= 13 * 60:
                items.append(
                    {
                        "poi_id": "lunch-break",
                        "name": "Lunch Break",
                        "lat": prev_coord[0],
                        "lng": prev_coord[1],
                        "start_time": _format_minutes(cursor),
                        "end_time": _format_minutes(cursor + 45),
                        "travel_minutes": 0,
                        "distance_km": 0,
                    }
                )
                cursor += 45
                lunch_inserted = True

            dwell = self._dwell_minutes(stop.category)
            start_time = _format_minutes(cursor)
            cursor += dwell
            end_time = _format_minutes(cursor)

            items.append(
                {
                    "poi_id": stop.poi_id,
                    "name": stop.name,
                    "lat": stop.latitude,
                    "lng": stop.longitude,
                    "start_time": start_time,
                    "end_time": end_time,
                    "travel_minutes": round(travel, 1),
                    "distance_km": round(distance, 2),
                }
            )
            prev_coord = stop.coord

            if not evening_break_inserted and cursor >= 18 * 60:
                items.append(
                    {
                        "poi_id": "evening-break",
                        "name": "Sunset & Snacks",
                        "lat": prev_coord[0],
                        "lng": prev_coord[1],
                        "start_time": _format_minutes(cursor),
                        "end_time": _format_minutes(cursor + 30),
                        "travel_minutes": 0,
                        "distance_km": 0,
                    }
                )
                cursor += 30
                evening_break_inserted = True

            if cursor >= end_limit:
                break

        total_time = max(cursor - start_minutes, 0)
        return ItineraryResponse(
            title=f"{payload.mood.title()} Trail",
            total_distance_km=round(total_distance, 2),
            total_time_min=round(total_time, 1),
            items=items,
        )


def _parse_minutes(value: str) -> int:
    hour, minute = value.split(":")
    return int(hour) * 60 + int(minute)


def _format_minutes(value: float) -> str:
    hour = int(value) // 60
    minute = int(value) % 60
    return f"{hour:02d}:{minute:02d}"


def _travel_minutes(distance_km: float, current_minute: float) -> float:
    hour = int(current_minute // 60) % 24
    if hour in range(7, 11) or hour in range(17, 20):
        speed = 18
    elif hour in range(11, 16):
        speed = 24
    else:
        speed = 28
    return max(distance_km / max(speed, 5) * 60, 5)
