# app/db/repositories/races_repo.py
import logging
from typing import Any, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

"""
Teams Repository

This module implements the data access layer for Formula 1 team-related queries.

Although currently operating over the races collection, it provides
team-related views derived from race data, including seasonal filtering,
race listings, and basic aggregation of available years.

The repository abstracts MongoDB operations and provides a simple interface
for retrieving and organizing team-related race information.
"""

logger = logging.getLogger("app.repositories.teams")

def _normalize_mongo_doc(doc: dict[str, Any]) -> dict[str, Any]:
    """Converte ObjectId para string e renomeia _id -> id (opcional)."""
    if not doc:
        return doc
    new_doc = dict(doc)
    _id = new_doc.pop("_id", None)
    if _id is not None:
        new_doc["id"] = str(_id)
    return new_doc


class TeamsRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db["races"]

    async def list_by_year(self, year: int) -> List[dict]:
        logger.debug("Listing races for year %s", year)
        cursor = self._collection.find({"year": year}).sort("date_start", 1)
        docs = await cursor.to_list(length=1000)
        return [_normalize_mongo_doc(d) for d in docs]

    async def get_by_race_id(self, race_id: str) -> Optional[dict]:
        logger.debug("Fetching race detail for raceId %s", race_id)
        return await self._collection.find_one({"raceId": race_id})

    async def list_years(self) -> List[int]:
        logger.debug("Listing available years")
        years = await self._collection.distinct("year")
        years.sort()
        return years
