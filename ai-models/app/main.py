"""FastAPI application entrypoint."""
from __future__ import annotations

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import HealthStatus, get_settings
from .schemas import (
    ChatRequest,
    ChatResponse,
    EmbedRequest,
    EmbedResponse,
    ItineraryRequest,
    ItineraryResponse,
    RecommendRequest,
    RecommendResponse,
    TravelTimeRequest,
    TravelTimeResponse,
    WeatherResponse,
)
from .services.chatbot import ChatbotService
from .services.embeddings import EmbeddingService
from .services.gemini_client import GeminiClient
from .services.itinerary import ItineraryService
from .services.recommend import RecommendService
from .services.travel_time import TravelTimeService
from .services.weather import WeatherService


app = FastAPI(title="MumbAI Trails AI", version="1.0.0")
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

embedding_service = EmbeddingService(settings)
recommend_service = RecommendService(settings, embedding_service)
itinerary_service = ItineraryService(settings, recommend_service)
travel_service = TravelTimeService(settings)
gemini_client = GeminiClient(settings)
chat_service = ChatbotService(settings, gemini_client)
weather_service = WeatherService(settings)


def get_recommend_service() -> RecommendService:
    return recommend_service


def get_itinerary_service() -> ItineraryService:
    return itinerary_service


def get_embedding_service() -> EmbeddingService:
    return embedding_service


def get_travel_service() -> TravelTimeService:
    return travel_service


def get_chat_service() -> ChatbotService:
    return chat_service


def get_weather_service() -> WeatherService:
    return weather_service


@app.get("/health", response_model=HealthStatus)
def health() -> HealthStatus:
    return HealthStatus(
        status="ok",
        cache_dir=settings.embed_cache_dir,
        embed_model=settings.embed_model,
    )


@app.post("/embed", response_model=EmbedResponse)
def embed(payload: EmbedRequest, svc: EmbeddingService = Depends(get_embedding_service)) -> EmbedResponse:
    vectors = svc.embed_texts(payload.texts)
    return EmbedResponse(vectors=vectors)


@app.post("/recommend", response_model=RecommendResponse)
def recommend(
    payload: RecommendRequest,
    svc: RecommendService = Depends(get_recommend_service),
) -> RecommendResponse:
    items = svc.recommend(payload)
    return RecommendResponse(items=items)


@app.post("/itinerary", response_model=ItineraryResponse)
def build_itinerary(
    payload: ItineraryRequest,
    svc: ItineraryService = Depends(get_itinerary_service),
) -> ItineraryResponse:
    return svc.build(payload)


@app.post("/travel-time", response_model=TravelTimeResponse)
def travel_time(
    payload: TravelTimeRequest,
    svc: TravelTimeService = Depends(get_travel_service),
) -> TravelTimeResponse:
    return svc.estimate(payload.coords)


@app.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    svc: ChatbotService = Depends(get_chat_service),
) -> ChatResponse:
    answer, references = svc.answer(payload.query)
    return ChatResponse(answer=answer, references=references)


@app.get("/weather", response_model=WeatherResponse)
def weather(svc: WeatherService = Depends(get_weather_service)) -> WeatherResponse:
    return WeatherResponse(**svc.current())
