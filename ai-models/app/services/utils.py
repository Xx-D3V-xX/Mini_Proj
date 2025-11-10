"""Utility helpers shared across AI services."""
from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Iterable, List, Sequence, Tuple


EARTH_RADIUS_KM = 6371.0


def haversine_km(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    lat1, lon1 = a
    lat2, lon2 = b
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    h = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(h))


def normalize(values: Sequence[float]) -> List[float]:
    if not values:
        return []
    vmin, vmax = min(values), max(values)
    if math.isclose(vmin, vmax):
        return [0.5 for _ in values]
    return [(v - vmin) / (vmax - vmin) for v in values]


def speed_for_hour(hour: int) -> float:
    """Return km/h heuristic for Mumbai traffic."""
    if 7 <= hour < 10:
        return 22
    if 10 <= hour < 16:
        return 28
    if 16 <= hour < 20:
        return 18
    return 30


def duration_minutes(distance_km: float, hour: int) -> float:
    speed = speed_for_hour(hour)
    return (distance_km / max(speed, 5)) * 60


def two_opt(route: List[int], distance_matrix: List[List[float]]) -> List[int]:
    best = route[:]
    improved = True
    while improved:
        improved = False
        for i in range(1, len(best) - 2):
            for j in range(i + 1, len(best)):
                if j - i == 1:
                    continue
                new_route = best[:]
                new_route[i:j] = reversed(best[i:j])
                if total_distance(new_route, distance_matrix) < total_distance(
                    best, distance_matrix
                ):
                    best = new_route
                    improved = True
        if len(best) > 30:  # avoid long loops
            break
    return best


def total_distance(route: Sequence[int], distance_matrix: List[List[float]]) -> float:
    return sum(distance_matrix[route[i]][route[i + 1]] for i in range(len(route) - 1))


@dataclass
class Poi:
    id: str
    name: str
    latitude: float
    longitude: float
    category: str
    rating: float = 0.0
    price_level: int = 0

    @property
    def coord(self) -> Tuple[float, float]:
        return (self.latitude, self.longitude)
