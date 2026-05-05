# app/db/repositories/races_repo.py
import logging
from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
"""
Drivers Repository

This module implements the data access layer for driver-related operations.

It interacts directly with the MongoDB collection responsible for storing
driver documents and provides methods to query and retrieve driver data.

Responsibilities:
- Encapsulate database queries for drivers
- Normalize MongoDB documents for API consumption
- Provide an abstraction layer between API and database
"""
logger = logging.getLogger("app.repositories.drivers")

def _normalize_mongo_doc(doc: dict[str, Any]) -> dict[str, Any]:
    if not doc:
        return doc
    new_doc = dict(doc)
    _id = new_doc.pop("_id", None)
    if _id is not None:
        new_doc["id"] = str(_id)
    return new_doc


class DriversRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db["drivers"]

    async def get_by_full_name(self, full_name: str) -> Optional[dict[str, Any]]:
        logger.debug(f"Fetching driver by full name: {full_name}")
        doc = await self._collection.find_one({"full_name": full_name}, {"_id":0})
        return _normalize_mongo_doc(doc) if doc else None

    