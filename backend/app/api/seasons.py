# app/api/races.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query

from ..db.dependencies import get_season_repo
from ..db.repositories.seasons_repo import SeasonsRepository

"""
Seasons API Router

This module provides endpoints for accessing Formula 1 season data.

Endpoints include:
- Retrieve all seasons for a specific year
- Retrieve list of available years

The router follows a repository pattern, delegating database operations
to the SeasonsRepository layer for better separation of concerns.
"""

router = APIRouter(
    prefix="/api/v1",
    tags=["seasons"],
)


@router.get("/years/{year}")
async def list_years(
    year: int,
    season_repo: SeasonsRepository = Depends(
        get_season_repo),
) -> List[dict]:
    seasons = await season_repo.list_by_year(year)
    if not seasons:
        raise HTTPException(status_code=404, detail="Season not found")
    return seasons


@router.get("/years")
async def list_years(
    season_repo: SeasonsRepository = Depends(
        get_season_repo),
) -> List[int]:
    return await season_repo.list_years()
