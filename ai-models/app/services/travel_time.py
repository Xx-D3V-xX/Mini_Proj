"""Travel time estimation with OSRM fallback."""
from __future__ import annotations

import logging
from typing import List

import requests

from ..config import Settings
from ..schemas import Location, TravelTimeResponse
from .utils import duration_minutes, haversine_km

logger = logging.getLogger(__name__)


class TravelTimeService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def _coords_to_osrm(self, coords: List[Location]) -> str:
        return ";".join(f"{c.lng},{c.lat}" for c in coords)

    def _osrm_table(self, coords: List[Location]) -> tuple[list[list[float]], list[list[float]]] | None:
        url = f"{self.settings.osrm_url}/table/v1/driving/{self._coords_to_osrm(coords)}?annotations=distance,duration"
        try:
            res = requests.get(url, timeout=2)
            res.raise_for_status()
            data = res.json()
            durations = data.get("durations")
            distances = data.get("distances")
            if not durations or not distances:
                return None
            return durations, distances
        except Exception as exc:  # noqa: BLE001
            logger.debug("OSRM table unavailable: %s", exc)
            return None

    def estimate(self, coords: List[Location]) -> TravelTimeResponse:
        if len(coords) < 2:
            return TravelTimeResponse(legs=[], total_distance_km=0, total_duration_min=0)
        osrm_tables = self._osrm_table(coords)
        legs = []
        total_distance = 0.0
        total_duration = 0.0
        for idx in range(len(coords) - 1):
            origin = coords[idx]
            dest = coords[idx + 1]
            if osrm_tables:
                durations, distances = osrm_tables
                try:
                    raw_duration = durations[idx][idx + 1]
                    raw_distance = distances[idx][idx + 1]
                except (IndexError, TypeError):
                    raw_duration = None
                    raw_distance = None
                if raw_duration is None or raw_distance is None:
                    distance = haversine_km((origin.lat, origin.lng), (dest.lat, dest.lng))
                    duration = duration_minutes(distance, hour=9 + idx)
                else:
                    duration = float(raw_duration) / 60  # seconds -> minutes
                    distance = float(raw_distance) / 1000  # meters -> km
            else:
                distance = haversine_km((origin.lat, origin.lng), (dest.lat, dest.lng))
                duration = duration_minutes(distance, hour=9 + idx)
            total_distance += distance
            total_duration += duration
            legs.append(
                {
                    "origin": origin,
                    "destination": dest,
                    "distance_km": round(distance, 2),
                    "duration_min": round(duration, 1),
                }
            )
        return TravelTimeResponse(
            legs=legs,
            total_distance_km=round(total_distance, 2),
            total_duration_min=round(total_duration, 1),
        )
