# backend/scripts/ingest_openf1.py
from collections import defaultdict, deque
import os
from time import time, sleep
from typing import Any, Dict, List, Optional, Tuple

import requests
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from requests.utils import requote_uri
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

"""
OpenF1 Data Ingestion Script

This script is responsible for extracting, transforming, and loading (ETL)
data from the OpenF1 API into a MongoDB database.

It processes multiple entities including:
- Meetings (races, sprints, sessions)
- Drivers
- Session results
- Championship points
- Season aggregation

The pipeline enriches raw API data into structured documents optimized
for analytics and dashboard consumption.

Key responsibilities:
- Fetch data from OpenF1 API with rate limiting considerations
- Transform raw API responses into normalized MongoDB documents
- Aggregate race, sprint, and championship data
- Build season-level summaries
- Maintain driver and race collections
- Create Atlas Search indexes for optimized querying
"""

load_dotenv()

CALL_TIMES = deque()

MAX_PER_SECOND = 3
MAX_PER_MINUTE = 30

OPENF1_BASE = "https://api.openf1.org/v1"

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "f1_dashboard")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI não definido no .env")

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

races_coll = db["races"]
results_coll = db["raceResults"]
drivers_session_coll = db["drivers_session"]
drivers_coll = db["drivers"]

call_counter = 0

def get_json(
    path: str,
    params: Optional[Dict[str, Any]] = None,
    allow_404: bool = False,
) -> List[Dict[str, Any]]:

    global call_counter
    url = f"{OPENF1_BASE}{path}"
    resp = requests.get(url, params=params, timeout=30)

    if allow_404 and resp.status_code == 404:
        return []

    if resp.status_code >= 400:
        raise requests.exceptions.HTTPError(
            f"OpenF1 error {resp.status_code} for {url} param {params}",
            response=resp,
        )

    data = resp.json()
    return data if isinstance(data, list) else [data]

def transform_driver(d: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transforms raw OpenF1 driver data into a normalized MongoDB document.

    Standardizes driver identity, team information, and metadata
    for consistent storage across sessions and meetings.
    """
    return {
        "session_key": d.get("session_key"),
        "meeting_key": d.get("meeting_key"),
        "driver_number": d["driver_number"],
        "first_name": d.get("first_name"),
        "last_name": d.get("last_name"),
        "full_name": d.get("full_name"),
        "broadcast_name": d.get("broadcast_name"),
        "code": d.get("name_acronym"),
        "headshot_url": d.get("headshot_url"),
        "team_name": d.get("team_name"),
        "team_colour": d.get("team_colour"),
        "country_code": d.get("country_code"),
    }


def transform_meeting_to_doc(m: dict) -> dict:
    """
    Transforms a meeting (race weekend) into a structured document.

    Includes:
    - Circuit and country metadata
    - Event dates and location
    - Circuit details (type, image, short name)
    """    
    return {
        "meeting_key": m["meeting_key"],
        "meeting_name": m.get("meeting_name"),
        "meeting_official_name": m.get("meeting_official_name"),
        "year": m.get("year"),
        "location": m.get("location"),
        "country": {
            "name": m.get("country_name"),
            "code": m.get("country_code"),
            "flag": m.get("country_flag"),
        },
        "circuit": {
            "circuit_key": m.get("circuit_key"),
            "short_name": m.get("circuit_short_name"),
            "type": m.get("circuit_type"),
            "image": m.get("circuit_image"),
        },
        "date_start": m.get("date_start"),
        "date_end": m.get("date_end"),
        "gmt_offset": m.get("gmt_offset"),
    }


def transform_session_result_subdoc(
    r: dict,
    all_drivers: List[Dict[str, Any]],
) -> dict:
    """
    Enriches session results with driver metadata.

    Maps driver performance data with:
    - Driver identity
    - Team information
    - Broadcast naming
    - Visual assets (headshots)
    """    

    driver_number = r["driver_number"]
    meeting_key = r["meeting_key"]

    driver = next(
        (
            d for d in all_drivers
            if d.get("driver_number") == driver_number
            and d.get("meeting_key") == meeting_key
        ),
        None,
    )

    doc = {
        "driver_number": driver_number,
        "position": r.get("position"),
        "number_of_laps": r.get("number_of_laps"),
        "duration": r.get("duration"),
        "gap_to_leader": r.get("gap_to_leader"),
        "dnf": r.get("dnf"),
        "dns": r.get("dns"),
        "dsq": r.get("dsq"),
    }

    if driver:
        doc["broadcast_name"] = driver.get("broadcast_name")
        doc["full_name"] = driver.get("full_name")
        doc["name_acronym"] = driver.get("name_acronym")
        doc["team_name"] = driver.get("team_name")
        doc["headshot_url"] = driver.get("headshot_url")

    return doc


def build_session_doc(
    session_meta: dict,
    meeting: dict,
    all_session_results: List[Dict[str, Any]],
    all_drivers: List[Dict[str, Any]],
) -> dict:
    """
    Builds a complete session document including:
    - Session metadata
    - Enriched results
    - Winner extraction
    - Driver-level performance aggregation
    """
    session_key = session_meta["session_key"]
    meeting_key = meeting["meeting_key"]

    session_results_raw = [
        r for r in all_session_results
        if r.get("session_key") == session_key
    ]

    enriched_results = [
        transform_session_result_subdoc(r, all_drivers)
        for r in session_results_raw
    ]

    winner_result: Optional[dict] = next(
        (r for r in enriched_results if r.get("position") == 1),
        None,
    )

    winner = None
    if winner_result:
        winner = {
            "driver_number": winner_result.get("driver_number"),
            "full_name": winner_result.get("full_name"),
            "broadcast_name": winner_result.get("broadcast_name"),
            "name_acronym": winner_result.get("name_acronym"),
            "team_name": winner_result.get("team_name"),
            "headshot_url": winner_result.get("headshot_url"),
            "position": winner_result.get("position"),
        }

    return {
        "session_key": session_key,
        "session_name": session_meta.get("session_name"),
        "session_type": session_meta.get("session_type"),
        "date_start": session_meta.get("date_start"),
        "date_end": session_meta.get("date_end"),
        "results": enriched_results,
        "winner": winner,
    }


def build_meeting_points(
    meeting_key: int,
    race_session: Optional[dict],
    sprint_session: Optional[dict],
    all_points: List[Dict[str, Any]],
    all_drivers: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Aggregates championship points per driver for a given meeting.

    Handles:
    - Race points
    - Sprint points
    - Net point deltas
    - Pre/post meeting standings

    Returns drivers ordered by total points earned in the event.
    """
    race_session_key = race_session["session_key"] if race_session else None
    sprint_session_key = sprint_session["session_key"] if sprint_session else None

    # agg por driver_number
    agg: Dict[int, Dict[str, Any]] = defaultdict(lambda: {
        "driver_number": None,
        "full_name": None,
        "broadcast_name": None,
        "name_acronym": None,
        "team_name": None,
        "headshot_url": None,
        "points_race": 0.0,
        "points_sprint": 0.0,
        "points_meeting": 0.0,
        "points_start": None,   # antes do meeting (menor points_start)
        "points_after": None,   # depois do meeting (maior points_current)
    })

    # 1) Agrega deltas de pontos por sessão (Race / Sprint)
    for p in all_points:
        if p.get("meeting_key") != meeting_key:
            continue

        session_key = p.get("session_key")
        if session_key is None:
            continue

        dn = p.get("driver_number")
        if dn is None:
            continue

        points_start = p.get("points_start") or 0
        points_current = p.get("points_current") or 0
        delta = points_current - points_start  # pontos ganhos nessa sessão

        d = agg[dn]
        d["driver_number"] = dn

        if race_session_key is not None and session_key == race_session_key:
            d["points_race"] += delta
        elif sprint_session_key is not None and session_key == sprint_session_key:
            d["points_sprint"] += delta
        else:
            d["points_meeting"] += delta

        if p.get("points_start") is not None:
            if d["points_start"] is None or p["points_start"] < d["points_start"]:
                d["points_start"] = p["points_start"]

        if p.get("points_current") is not None:
            if d["points_after"] is None or p["points_current"] > d["points_after"]:
                d["points_after"] = p["points_current"]

    for d in agg.values():
        d["points_meeting"] += d["points_race"] + d["points_sprint"]

        driver = next(
            (drv for drv in all_drivers
             if drv.get("driver_number") == d["driver_number"]
             and drv.get("meeting_key") == meeting_key),
            None,
        )
        if driver:
            d["full_name"] = driver.get("full_name")
            d["broadcast_name"] = driver.get("broadcast_name")
            d["name_acronym"] = driver.get("name_acronym")
            d["team_name"] = driver.get("team_name")
            d["headshot_url"] = driver.get("headshot_url")

    # 3) retorna ordenado por pontos no meeting (opcional)
    return sorted(
        agg.values(),
        key=lambda x: x.get("points_meeting") or 0,
        reverse=True,
    )


def ingest() -> None:
    """
    Main ingestion pipeline.

    Steps:
    1. Fetch sessions, meetings, drivers, and results from OpenF1 API
    2. Filter and process valid race meetings
    3. Build enriched race documents
    4. Compute session-level and meeting-level statistics
    5. Store data into MongoDB collections
    6. Build season-level aggregation documents
    7. Persist unique drivers collection
    """

    YEARS = [2023, 2024, 2025, 2026]

    all_sessions: list[dict] = []
    all_session_results: list[dict] = []

    print(f"== Starting ingestion from OpenF1 ==")

    # 1) ler todos os meetings de cada ano, e guardar num dict por meeting_key
    for year in YEARS:
        sessions = get_json(
            "/sessions", params={"year": year, "session_type": "Race"})
        print(f"Year {year}: found {len(sessions)} sessions")
        all_sessions.extend(sessions)

    sessions_results = get_json(
        "/session_result")

    all_session_results.extend(sessions_results)

    meetings = get_json("/meetings")
    drivers = get_json("/drivers")
    all_points = get_json("/championship_drivers")

    for m in meetings:
        meeting_name = m["meeting_name"]
        if "Pre-Season" in meeting_name:
            print(f"  Meeting {meeting_name} is a Pre-Season, leaving it.")
            continue

        meeting_key = m["meeting_key"]

        race_doc = transform_meeting_to_doc(m)

        meeting_sessions = [
            s for s in all_sessions
            if s.get("meeting_key") == meeting_key
        ]

        race_session_meta = next(
            (s for s in meeting_sessions if s.get("session_name") == "Race"),
            None,
        )
        sprint_session_meta = next(
            (s for s in meeting_sessions if s.get("session_name") == "Sprint"),
            None,
        )

        race_session_doc = (
            build_session_doc(race_session_meta, m,
                              all_session_results, drivers)
            if race_session_meta else None
        )

        sprint_session_doc = (
            build_session_doc(sprint_session_meta, m,
                              all_session_results, drivers)
            if sprint_session_meta else None
        )

        race_doc["race_session"] = race_session_doc
        race_doc["sprint_session"] = sprint_session_doc

        race_doc["points"] = build_meeting_points(
            meeting_key=meeting_key,
            race_session=race_session_doc,
            sprint_session=sprint_session_doc,
            all_points=all_points,
            all_drivers=drivers,
        )
        races_coll.update_one(
            {"meeting_key": meeting_key},
            {"$set": race_doc},
            upsert=True,
        )

        print(f"== Race {race_doc["meeting_name"]} inserted ==\n")

    print(f"== Inserting Drivers ==\n")
    drivers_bulk: List[UpdateOne] = []
    for d in drivers:
        doc = transform_driver(d)
        drivers_bulk.append(
            UpdateOne(
                {"meeting_key": doc["meeting_key"], "session_key": doc["session_key"],
                    "driver_number": d["driver_number"]},
                {"$set": doc},
                upsert=True,
            )
        )

    if drivers_bulk:
        drivers_session_coll.bulk_write(drivers_bulk)
        print(f"== Drivers inserted ==\n")

    print(f"== Inserting Unique Drivers ==\n")
    save_unique_drivers(drivers)

    print(f"== Building Seasons ==\n")
    seasons_docs = build_seasons_from_race_docs(races_coll.find({}))

    for season in seasons_docs:
        db.seasons.replace_one(
            {"_id": season["_id"]},
            season,
            upsert=True,
        )
    print(f"Seasons Collection Done.\n")


def build_seasons_from_race_docs(
    race_docs: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Builds season-level aggregation from race documents.

    Groups data by year and computes:
    - List of meetings per season
    - Driver participation per season
    - Winner per race
    - Season statistics (driver count, meeting count)
    """
    seasons_by_year: Dict[int, Dict[str, Any]] = defaultdict(
        lambda: {
            "year": None,
            "meetings": [],
            "all_drivers": set(), 
        }
    )

    for race in race_docs:
        year = race.get("year")
        if year is None:
            continue

        season = seasons_by_year[year]
        season["year"] = year

        country = race.get("country") or {}
        country_name = country.get("name")
        country_flag = country.get("flag")

        drivers_in_meeting = set()

        race_session = race.get("race_session") or {}
        race_results = race_session.get("results", []) or []

        for r in race_results:
            dn = r.get("driver_number")
            if dn is not None:
                drivers_in_meeting.add(dn)

        sprint_session = race.get("sprint_session") or {}
        sprint_results = sprint_session.get("results", []) or []

        for r in sprint_results:
            dn = r.get("driver_number")
            if dn is not None:
                drivers_in_meeting.add(dn)

        winner_result = next(
            (r for r in race_results if r.get("position") == 1),
            None,
        )

        winner = None
        if winner_result:
            winner = {
                "driver_number": winner_result.get("driver_number"),
                "full_name": winner_result.get("full_name"),
                "broadcast_name": winner_result.get("broadcast_name"),
                "name_acronym": winner_result.get("name_acronym"),
                "team_name": winner_result.get("team_name"),
                "headshot_url": winner_result.get("headshot_url"),
            }

        season["all_drivers"].update(drivers_in_meeting)

        season["meetings"].append({
            "meeting_key":  race.get("meeting_key"),
            "meeting_name": race.get("meeting_name"),
            "location":     race.get("location"),
            "date_start":   race.get("date_start"),
            "date_end":     race.get("date_end"),
            "country_name": country_name,
            "country_flag": country_flag,
            "drivers":      list(drivers_in_meeting),
            "winner":       winner,
        })

    seasons_docs: List[Dict[str, Any]] = []

    for year, season in seasons_by_year.items():
        meetings = season["meetings"]
        all_drivers = season["all_drivers"]

        doc = {
            "_id": year,
            "year": year,
            "name": f"Formula 1 {year} Season",
            "meetings": meetings,
            "meeting_count": len(meetings),
            "driver_count": len(all_drivers),
        }
        seasons_docs.append(doc)

    return seasons_docs


def build_unique_drivers(all_drivers: list[dict]) -> list[dict]:
    unique_by_code: dict[str, dict] = {}
    """
    Extracts a deduplicated list of drivers.

    Uses driver acronym as unique key to ensure
    a clean canonical driver registry.
    """
    for d in all_drivers:
        code = d.get("name_acronym")
        if not code:
            continue

        if code in unique_by_code:
            continue

        unique_by_code[code] = {
            "full_name": d.get("full_name"),
            "broadcast_name": d.get("broadcast_name"),
            "name_acronym": d.get("name_acronym"),
            "country_code": d.get("country_code"),
            "headshot_url": d.get("headshot_url"),
            "team_name": d.get("team_name"),
        }

    return list(unique_by_code.values())


def save_unique_drivers(all_drivers: list[dict]) -> None:
    unique_drivers = build_unique_drivers(all_drivers)

    # zera a coleção e insere apenas os consolidados
    drivers_coll.delete_many({})
    if unique_drivers:
        drivers_coll.insert_many(unique_drivers)

    print(f"Inserting {len(unique_drivers)} in 'drivers collection'.")


def ensure_indexes() -> None:
    """
    Creates MongoDB indexes and Atlas Search indexes.

    Optimizes query performance for:
    - Race search
    - Driver search
    - Season filtering
    - Full-text and autocomplete search capabilities
    """    
    print("Criando índices (se não existirem)...")
    races_coll.create_index("meeting_key", unique=True)
    races_coll.create_index([("year", 1)])

    db.seasons.create_index([("year", 1)])

    db.command({"dropSearchIndex": "drivers", "name": "drivers_search"})
    db.command({
        "createSearchIndexes": "drivers",
        "indexes": [
            {
                "name": "drivers_search",
                "definition": {
                    "mappings": {
                        "dynamic": False,
                        "fields": {
                            "full_name":      {"type": "autocomplete"},
                            "broadcast_name": {"type": "autocomplete"},
                            "name_acronym":  {"type": "string"},
                            "team_name":      {"type": "string"},
                            "country_code":   {"type": "string"},
                            "driver_number":  {"type": "number"}
                        }
                    }
                }
            }
        ]
    })

    db.command({"dropSearchIndex": "races", "name": "races_search"})
    db.command({
        "createSearchIndexes": "races",
        "indexes": [
            {
                "name": "races_search",
                "definition": {
                    "mappings": {
                        "dynamic": False,
                        "fields": {
                            "meeting_name":           {"type": "autocomplete"},
                            "meeting_official_name":  {"type": "string"},
                            "location":               {"type": "autocomplete"},
                            "country.name":           {"type": "string"},
                            "country.code":           {"type": "string"},
                            "circuit.short_name":     {"type": "string"},
                            "year":                   {"type": "number"},
                            "race_session.winner.full_name": {"type": "string"},
                            "race_session.winner.team_name": {"type": "string"}
                        }
                    }
                }
            }
        ]
    })

def main() -> None:
    """
    Entry point for the ingestion process.

    Executes full ETL pipeline and ensures:
    - Data ingestion from OpenF1
    - Database population
    - Index creation
    """    
    ingest()
    print("Ingestão OpenF1 concluída.")

    ensure_indexes()
    print("Atlas Search indexes criados/atualizados.")


if __name__ == "__main__":
    main()
