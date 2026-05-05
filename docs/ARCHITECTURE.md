# Architecture

## Overview
The system is composed of 3 main layers:

OpenF1 API
   ↓
ETL Ingestion Layer
   ↓
MongoDB (Storage + Aggregations)
   ↓
FastAPI (API Layer)

---
## ETL Layer

- Fetches data from OpenF1
- Transforms race, driver, and session data
- Computes:
  - points
  - podiums
  - winners
- Stores structured documents in MongoDB

---
## Database Layer

Collections:
- races
- drivers
- seasons

MongoDB is used for:
- flexible schema
- nested documents
- analytics-friendly structure

---
## API Layer

Built with FastAPI:
- exposes race data
- driver analytics
- search endpoints

Uses repository pattern to isolate database logic.

---
## Search

MongoDB Atlas Search provides:
- full-text search
- autocomplete
- fuzzy matching
- ranking system