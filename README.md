# 🏎️ F1 Analytics Dashboard — Full Stack Data Application

A full-stack backend system that ingests, processes, and exposes Formula 1 data using a structured analytics pipeline.

The project combines data ingestion from external APIs, MongoDB-based storage, and a FastAPI backend with full-text search capabilities.

---
## 🚀 Features

- 📥 Data ingestion from OpenF1 API
- 🧠 Aggregated race, driver, and season analytics
- 🔎 Full-text search (MongoDB Atlas Search)
- 📊 Driver standings & performance metrics
- 🏁 Race results and season summaries

---
## 🧱 Tech Stack
- Python
- FastAPI
- MongoDB (Atlas)
- Motor (Async MongoDB driver)
- MongoDB Atlas Search
- Requests
- Pydantic (API layer)

---
## 📡 Main Modules

- `ingest_openf1.py` → ETL pipeline for F1 data ingestion
- `api/` → FastAPI routes (races, drivers, seasons, search)
- `db/repositories/` → Data access layer
- `core/` → Logging and core configuration

---
## How to Run
### 1. Install dependencies - bash
pip install -r requirements.txt

### 2. Set environment variables
MONGODB_URI=your_mongo_uri
DB_NAME=f1_dashboard

### 3. Run ingestion pipeline
python backend/scripts/ingest_openf1.py

### 4. Start API
uvicorn app.main:app --reload

📌 API Base URL
/api/v1
🔌 Main Endpoints
GET /drivers/{full_name}
GET /races
GET /races/{race_id}
GET /seasons/{year}/races
GET /search?q=...

Architecture Overview

The system follows a layered architecture:

API Layer (FastAPI)
        ↓
Repository Layer (MongoDB abstraction)
        ↓
Database (MongoDB + Atlas Search)
        ↓
Ingestion Pipeline (OpenF1 ETL)

📊 Purpose
This project was built to simulate a real-world data engineering + analytics backend,
focusing on:

Data ingestion pipelines
Data modeling for analytics
Search optimization
API design for dashboards

📄 License
MIT
