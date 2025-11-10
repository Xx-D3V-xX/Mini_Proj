"""Mock weather provider with optional live stub."""
from __future__ import annotations

import random
from datetime import datetime
from typing import Dict

import requests

from ..config import Settings

MOCK_CONDITIONS = [
    {"status": "sunny", "description": "Clear skies with humid breeze", "icon": "sun"},
    {"status": "cloudy", "description": "High clouds with pleasant wind", "icon": "cloud"},
    {"status": "rain", "description": "Light coastal showers", "icon": "rain"},
]


class WeatherService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def current(self) -> Dict[str, object]:
        base = random.choice(MOCK_CONDITIONS)
        temperature = 26 + random.uniform(-2, 3)
        humidity = random.randint(60, 85)
        return {
            "status": base["status"],
            "description": base["description"],
            "temperature_c": round(temperature, 1),
            "humidity": humidity,
            "icon": base["icon"],
        }
