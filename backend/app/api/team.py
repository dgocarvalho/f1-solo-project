# app/api/races.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query

from ..db.repositories.teams_repo import TeamsRepository

router = APIRouter(
    prefix="/api/v1",
    tags=["teams"],
)

"""
@router.get("/years")
async def list_years(
    races_repo: RacesRepository = Depends(
        get_races_repo),
) -> List[int]:
    return await s_repo.list_years()


@router.get("/races")
async def list_races_by_year(
    year: int = Query(..., description="Ano da temporada, ex: 2022"),
    races_repo: RacesRepository = Depends(
        get_races_repo),
) -> List[dict]:
    return await races_repo.list_by_year(year)

@router.get("/team/{race_id}")
async def get_race_detail(
    race_id: str,
    races_repo: RacesRepository = Depends(
        get_races_repo),
) -> dict:
    race = await races_repo.get_by_race_id(race_id)
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    return race
"""
