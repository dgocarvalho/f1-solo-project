# app/db/repositories/races_repo.py
import logging
from typing import Any, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

"""
Seasons Repository

This module implements the data access layer for Formula 1 season-related data.

It provides methods to retrieve season information stored in MongoDB,
including filtering by year and listing all available season years.

The repository abstracts database operations from the API layer,
ensuring a clean separation of concerns and simplifying data access logic.
"""

logger = logging.getLogger("app.repositories.seasons")

def _normalize_mongo_doc(doc: dict[str, Any]) -> dict[str, Any]:
    """Converte ObjectId para string e renomeia _id -> id (opcional)."""
    if not doc:
        return doc
    new_doc = dict(doc)
    _id = new_doc.pop("_id", None)
    if _id is not None:
        new_doc["id"] = str(_id)
    return new_doc


class SeasonsRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db["seasons"]

    async def list_by_year(self, year: int) -> List[dict]:
        logger.debug("Listing seasons for year %s", year)

        cursor = self._collection.find({"year": year})
        return await cursor.to_list(length=None)

    async def list_years(self) -> List[int]:
        logger.debug("Listing available years")
        years = await self._collection.distinct("year")
        years = [int(y) for y in years]  # garantia de int
        years.sort()
        return years
