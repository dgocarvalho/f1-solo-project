from fastapi import FastAPI
from .api.races import router as races_router
from .api.team import router as team_router
from .api.seasons import router as seasons_router
from .api.search import router as search_router
from .api.drivers import router as drivers_router
from fastapi.middleware.cors import CORSMiddleware

"""
Main entry point for the F1 Dashboard API.

This module initializes the FastAPI application, configures middleware,
and registers all API routers responsible for exposing Formula 1 data.

The API is structured into modular routes covering:
- Seasons
- Races
- Teams
- Drivers
- Search functionality

It also configures CORS to allow communication with the frontend application during development.
"""

app = FastAPI(
    title="F1 Dashboard API",
    version="0.1.0",
)

origins = [
    "http://localhost:8080",  # seu frontend
    "http://localhost:5173",  # se usar Vite nesse porto em algum momento
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # ou ["*"] em desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(seasons_router)
app.include_router(races_router)
app.include_router(search_router)
app.include_router(team_router)
app.include_router(drivers_router)