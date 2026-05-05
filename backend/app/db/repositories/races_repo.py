# app/db/repositories/races_repo.py
import logging
from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

"""
Races Repository

This module implements the data access layer for Formula 1 race-related data.

It provides methods to query and aggregate race information stored in MongoDB,
including race results, driver performance, championship standings, and podium statistics.

Key responsibilities:
- Retrieve races by year or race identifier
- Aggregate driver wins and performance metrics
- Compute driver standings (points, teams, and statistics)
- Calculate podium counts for race and sprint sessions

The repository encapsulates all database logic, including MongoDB aggregation pipelines,
ensuring a clean separation between data access and API layers.
"""

logger = logging.getLogger("app.repositories.races")

def _normalize_mongo_doc(doc: dict[str, Any]) -> dict[str, Any]:
    if not doc:
        return doc
    new_doc = dict(doc)
    _id = new_doc.pop("_id", None)
    if _id is not None:
        new_doc["id"] = str(_id)
    return new_doc


class RacesRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db["races"]

    async def get_by_race_year(self, year: int) -> List[Dict[str, Any]]:
        logger.debug("Listing races for year %s", year)
        cursor = self._collection.find({"year": year})
        docs = await cursor.to_list(length=None)
        return [_normalize_mongo_doc(d) for d in docs]

    async def get_by_race_id(self, id: int) -> Optional[dict]:
        logger.debug(f"Finding race by id {id}")
        doc = await self._collection.find_one({"meeting_key": id})
        return _normalize_mongo_doc(doc)

    async def get_wins_by_driver_fullname(
        self, full_name: str
    ) -> list[dict[str, Any]]:
        logger.debug(f"Fetching wins by full name: {full_name}")
        cursor = self._collection.find(
            {"race_session.winner.full_name": full_name},
            {"_id": 0},
        )
        docs: list[dict[str, Any]] = [doc async for doc in cursor]
        return [_normalize_mongo_doc(doc) for doc in docs]

    async def list_by_year(self) -> List[int]:
        logger.debug("Listing available years")
        years = await self._collection.distinct("year")
        years = [int(y) for y in years]  # garantia de int
        years.sort()
        return years

    async def get_driver_standings(self, full_name: str, year: int) -> Dict[str, Any]:
        points_data = await self._get_points(full_name, year)
        podiums_data = await self._get_podiums(full_name, year)

        return {
            "full_name": full_name,
            "teams": points_data["teams"],
            "headshot_url": points_data["headshot_url"],
            "total_points": points_data["total_points"],
            "total_points_race": points_data["total_points_race"],
            "total_points_sprint": points_data["total_points_sprint"],
            "podiums_race": podiums_data["podiums_race"],
            "podiums_sprint": podiums_data["podiums_sprint"],
            "podiums_total": podiums_data["podiums_total"],
        }

    async def _get_points(self, full_name: str, year: int) -> Dict[str, Any]:
        match_stage = {"$match": {"points.full_name": full_name}}
        if year is not None:
            match_stage["$match"]["year"] = year
            
        pipeline = [
            {"$unwind": "$points"},
            match_stage,
            {
                "$group": {
                    "_id": "$points.full_name",
                    "full_name": {"$first": "$points.full_name"},
                    "team_names": {"$addToSet": "$points.team_name"},
                    "headshot_urls": {"$addToSet": "$points.headshot_url"},
                    "total_points": {
                        "$sum": {"$ifNull": ["$points.points_meeting", 0]}
                    },
                    "total_points_race": {
                        "$sum": {"$ifNull": ["$points.points_race", 0]}
                    },
                    "total_points_sprint": {
                        "$sum": {"$ifNull": ["$points.points_sprint", 0]}
                    },
                }
            },
        ]

        cursor = self._collection.aggregate(pipeline)
        docs = await cursor.to_list(length=1)
        if not docs:
            return {
                "teams": [],
                "headshot_url": None,
                "total_points": 0,
                "total_points_race": 0,
                "total_points_sprint": 0,
            }

        d = docs[0]
        teams = [t for t in d.get("team_names", []) if t]
        headshots = [h for h in d.get("headshot_urls", []) if h]

        return {
            "teams": teams,
            "headshot_url": headshots[0] if headshots else None,
            "total_points": d.get("total_points", 0),
            "total_points_race": d.get("total_points_race", 0),
            "total_points_sprint": d.get("total_points_sprint", 0),
        }

    async def _get_podiums(self, full_name: str, year: int) -> Dict[str, Any]:
        match_stage = {"$match": {"points.full_name": full_name}}
        if year is not None:
            match_stage["$match"]["year"] = year
            
        pipeline = [
            {
                "$facet": {
                    "race": [
                        match_stage,
                        {"$unwind": "$race_session.results"},
                        {
                            "$match": {
                                "race_session.results.full_name": full_name
                            }
                        },
                        {
                            "$group": {
                                "_id": None,
                                "podiums_race": {
                                    "$sum": {
                                        "$cond": [
                                            {
                                                "$and": [
                                                    {
                                                        "$gte": [
                                                            "$race_session.results.position",
                                                            1,
                                                        ]
                                                    },
                                                    {
                                                        "$lte": [
                                                            "$race_session.results.position",
                                                            3,
                                                        ]
                                                    },
                                                ]
                                            },
                                            1,
                                            0,
                                        ]
                                    }
                                },
                            }
                        },
                    ],
                    "sprint": [
                        {
                            "$match": {
                                "sprint_session.results.full_name": full_name
                            }
                        },
                        {"$unwind": "$sprint_session.results"},
                        {
                            "$match": {
                                "sprint_session.results.full_name": full_name
                            }
                        },
                        {
                            "$group": {
                                "_id": None,
                                "podiums_sprint": {
                                    "$sum": {
                                        "$cond": [
                                            {
                                                "$and": [
                                                    {
                                                        "$gte": [
                                                            "$sprint_session.results.position",
                                                            1,
                                                        ]
                                                    },
                                                    {
                                                        "$lte": [
                                                            "$sprint_session.results.position",
                                                            3,
                                                        ]
                                                    },
                                                ]
                                            },
                                            1,
                                            0,
                                        ]
                                    }
                                },
                            }
                        },
                    ],
                }
            },
            {
                "$project": {
                    "podiums_race": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$race.podiums_race", 0]},
                            0,
                        ]
                    },
                    "podiums_sprint": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$sprint.podiums_sprint", 0]},
                            0,
                        ]
                    },
                }
            },
            {
                "$addFields": {
                    "podiums_total": {
                        "$add": ["$podiums_race", "$podiums_sprint"]
                    }
                }
            },
        ]

        cursor = self._collection.aggregate(pipeline)
        docs = await cursor.to_list(length=1)
        if not docs:
            return {
                "podiums_race": 0,
                "podiums_sprint": 0,
                "podiums_total": 0,
            }

        d = docs[0]
        return {
            "podiums_race": d.get("podiums_race", 0),
            "podiums_sprint": d.get("podiums_sprint", 0),
            "podiums_total": d.get("podiums_total", 0),
        }
