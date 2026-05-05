# app/db/dependencies.py
import os
import logging

from functools import lru_cache

from dotenv import load_dotenv
from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

from .repositories.seasons_repo import SeasonsRepository
from .repositories.search_repo import SearchRepository
from .repositories.races_repo import RacesRepository
from .repositories.drivers_repo import DriversRepository

logger = logging.getLogger("app.repositories.races")
logging.basicConfig(level=logging.INFO)
load_dotenv()  # lê variáveis do .env na raiz do backend

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "f1_dashboard")

_client: AsyncIOMotorClient | None = None

# Send a ping to confirm a successful connection
try:
    # Create a new client and connect to the server
    client = MongoClient(MONGODB_URI, server_api=ServerApi('1'))

    client.admin.command('ping')
    logger.info("Pinged your deployment. You successfully connected to MongoDB!")

except Exception as e:
    logger.error("Error:", e)

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not defined in the .env file")


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGODB_URI)
    return _client


def get_db(client: AsyncIOMotorClient = Depends(get_client)) -> AsyncIOMotorDatabase:
    return client[DB_NAME]


def get_races_repo(
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> RacesRepository:
    return RacesRepository(db)


def get_season_repo(
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> SeasonsRepository:
    return SeasonsRepository(db)


def get_search_repository(
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> SearchRepository:
    return SearchRepository(db)


def get_drivers_repo(
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> DriversRepository:
    return DriversRepository(db)
