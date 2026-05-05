# app/db/repositories/races_repo.py
import logging
from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

"""
Search Repository

This module implements full-text search capabilities for Formula 1 data.

It provides unified search functionality across multiple domains:
- Drivers search (name, code, team)
- Races search (meeting name, location, winners, teams)

The repository leverages MongoDB Atlas Search to perform
high-performance, relevance-based queries with ranking, fuzziness,
and autocomplete support.

Search results are normalized and aggregated into structured responses
suitable for API consumption in the F1 dashboard application.
"""

logger = logging.getLogger("app.repositories.search")

def _normalize_mongo_doc(doc: dict[str, Any]) -> dict[str, Any]:
    if not doc:
        return doc
    new_doc = dict(doc)
    _id = new_doc.pop("_id", None)
    if _id is not None:
        new_doc["id"] = str(_id)
    return new_doc


class SearchRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db["races"]
        self._races = db["races"]   # <-- IMPORTANT: define _races aqui
        self._drivers = db["drivers"]   # <-- IMPORTANT: define _drivers aqui

    @staticmethod
    def _build_highlight_html(doc: Dict[str, Any]) -> str:
        highlights: List[Dict[str, Any]] = doc.get("highlights", [])
        if not highlights:
            return ""

        h = highlights[0]
        parts: List[str] = []
        for t in h.get("texts", []):
            if t.get("type") == "hit":
                parts.append(f"<mark>{t['value']}</mark>")
            else:
                parts.append(t["value"])
            return "".join(parts)

    async def search_drivers(self, q: str) -> List[Dict[str, Any]]:
        pipeline = [
            {
                "$search": {
                    "index": "drivers_search",
                    "compound": {
                        "should": [
                            {
                                "autocomplete": {
                                    "query": q,
                                    "path": "full_name",
                                    "fuzzy": {"maxEdits": 1, "prefixLength": 3},
                                    "score": { "boost": { "value": 5 } }
                                }
                            },
                            {
                                "autocomplete": {
                                    "query": q,
                                    "path": "broadcast_name",
                                    "fuzzy": {"maxEdits": 1, "prefixLength": 3},
                                    "score": { "boost": { "value": 5 } }

                                }
                            },
                            {
                                "text": {
                                    "query": q,
                                    "path": ["code", "team_name"],
                                    "fuzzy": {"maxEdits": 1},
                                    "score": { "boost": { "value": 3} }
                                }
                            },
                        ],
                        "minimumShouldMatch": 1,
                    },
                }
            },
            {"$limit": 5},
            {
                "$project": {
                    "full_name": 1,
                    "broadcast_name": 1,
                    "code": 1,
                    "team_name": 1,
                    "country_code": 1,
                    "headshot_url": 1,
                    "score": {"$meta": "searchScore"},
                }
            },
        ]

        cursor = self._drivers.aggregate(pipeline)
        results: List[Dict[str, Any]] = []
        async for doc in cursor:
            results.append(
                {
                    "full_name": doc.get("full_name"),
                    "broadcast_name": doc.get("broadcast_name"),
                    "name_acronym": doc.get("name_acronym"),
                    "team_name": doc.get("team_name"),
                    "country_code": doc.get("country_code"),
                    "headshot_url": doc.get("headshot_url"),
                    "score": float(doc.get("score", 0)),
                }
            )
        return results

    async def search_races(self, q: str, year: Optional[int] = None) -> List[Dict[str, Any]]:

        should_clauses: List[Dict[str, Any]] = [
        {
            "autocomplete": {
            "query": q,
            "path": "meeting_name",
            "fuzzy": {
                "maxEdits": 1,
                "prefixLength": 2
            },
            "score": {
                "boost": { "value": 10 }
            }
            }
        },
        #{
        #    "autocomplete": {
        #    "query": q,
        #    "path": "location",
        #    "fuzzy": {
        #        "maxEdits": 1,
        #        "prefixLength": 2
        #    },
        #    "score": {
        #        "boost": { "value": 6 }
        #    }
        #    }
        #},
        #{
        #    "text": {
        #    "query": q,
        #    "path": "country.name",
        #    "score": {
        #        "boost": { "value": 5 }
        #    }
        #    }
        #},
        {
            "text": {
                "query": q,
                "path": "race_session.winner.full_name",
                "score": {
                "boost": { "value": 6 }
                }
            }
        },
        {
            "text": {
            "query": q,
            "path": "race_session.winner.team_name",
            "score": {
                "boost": { "value": 2 }
            }
            }
        },
        ]

        compound: Dict[str, Any] = {
            "should": should_clauses,
            "minimumShouldMatch": 1,
        }


        if year is not None:
            compound.setdefault("filter", []).append(
                {"equals": {"path": "year", "value": year}}
            )

        pipeline = [
            {
                "$search": {
                    "index": "races_search",
                    "compound": compound,
                }
            },
            {
                "$project": {
                    "meeting_key": 1,
                    "meeting_name": 1,
                    "location": 1,
                    "year": 1,
                    "country": 1,
                    "circuit": 1,
                    "race_session.winner": 1,
                    "score": {"$meta": "searchScore"},
                }
            },
        ]

        cursor = self._races.aggregate(pipeline)
        results: List[Dict[str, Any]] = []

        async for doc in cursor:
            country_name = (doc.get("country") or {}).get("name")
            circuit_short = (doc.get("circuit") or {}).get(
                "short_name", doc.get("location"))

            winner = (doc.get("race_session") or {}).get("winner") or {}

            winner_driver = winner.get("full_name")
            winner_team = winner.get("team_name")

            results.append(
                {
                    "meeting_key": doc.get("meeting_key"),
                    "name": doc.get("meeting_name"),
                    "circuit": circuit_short,
                    "country": country_name,
                    "winner_driver": winner_driver,
                    "winner_team": winner_team,
                    "year": doc.get("year"),
                    "score": float(doc.get("score", 0)),
                }
            )

        return results

    async def search(self, q: str, year: Optional[int] = None) -> Dict[str, Any]:
        drivers = await self.search_drivers(q)
        races = await self.search_races(q, year)
        return {"drivers": drivers, "races": races}
