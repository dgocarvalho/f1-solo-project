# app/api/races.py
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query

from ..db.repositories.drivers_repo import DriversRepository
from ..db.dependencies import get_drivers_repo
"""
Drivers API Router

This module provides endpoints for accessing Formula 1 driver data.

It exposes functionality to retrieve detailed information about drivers
based on their full name, including performance and identity metadata.

The module follows a repository pattern, delegating all data access
and business logic to the DriversRepository layer. This ensures a clean
separation between API routing and data handling responsibilities.
"""
router = APIRouter(
    prefix="/api/v1",
    tags=["drivers"],
)


@router.get("/drivers/{fullName}")
async def get_driver(
    fullName: str,
    drivers_repo: DriversRepository = Depends(
        get_drivers_repo),
) -> dict:
    driver = await drivers_repo.get_by_full_name(fullName)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

