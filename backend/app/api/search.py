# app/api/races.py
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from ..db.dependencies import get_search_repository
from ..db.repositories.search_repo import SearchRepository
"""
Search API Router

This module provides a unified search endpoint for querying Formula 1 data.

It allows clients to perform text-based searches across race-related data,
with optional filtering by season year.

The module delegates all search logic to a dedicated SearchRepository,
ensuring separation between API layer and query implementation.
"""
router = APIRouter(
    prefix="/api/v1",
    tags=["search"],
)


@router.get("/search")
async def search_races(
    q: str = Query(..., min_length=1),
    year: Optional[int] = Query(None),
    repo: SearchRepository = Depends(get_search_repository),
):
    return await repo.search(q=q, year=year)
