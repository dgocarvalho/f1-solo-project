# app/api/races.py
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query

from ..db.dependencies import get_races_repo
from ..db.repositories.races_repo import RacesRepository
"""
Races API Router

This module provides endpoints for accessing Formula 1 race-related data.

It exposes functionality to:
- List all races
- Retrieve race details by race ID
- Retrieve races by season year
- Retrieve driver performance data such as wins and standings

The module follows a repository pattern, delegating all business logic
and data access to the RacesRepository layer.
This ensures a clean separation between API routing and data processing logic.
"""
router = APIRouter(
    prefix="/api/v1",
    tags=["races"],
)


@router.get("/races")
async def list_races(
    races_repo: RacesRepository = Depends(get_races_repo),
):
    return await races_repo.list_by_year()


@router.get("/races/{race_id}")
async def get_race_detail(
    race_id: int,
    races_repo: RacesRepository = Depends(get_races_repo),
):
    race = await races_repo.get_by_race_id(race_id)
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    return race


@router.get("/seasons/{year}/races")
async def get_race_detail_by_year(
    year: int,
    races_repo: RacesRepository = Depends(get_races_repo),
) -> List[Dict[str, Any]]:
    race = await races_repo.get_by_race_year(year)
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    return race

@router.get("/drivers/{fullname}/wins")
async def get_race_detail_by_year(
    fullname: str,
    races_repo: RacesRepository = Depends(get_races_repo),
) -> List[Dict[str, Any]]:
    race = await races_repo.get_wins_by_driver_fullname(fullname)
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    return race

@router.get("/drivers/standings/{fullName}")
async def get_driver_standings(
    fullName: str,
    year: int | None = Query(None),
    races_repo: RacesRepository = Depends(get_races_repo),
) -> Dict[str, Any]:
    driver = await races_repo.get_driver_standings(full_name=fullName, year=year)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver