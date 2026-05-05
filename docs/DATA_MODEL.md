# Data Model
## Races Collection

Stores full race weekend data:

- meeting_key
- year
- country
- race_session
- sprint_session
- points

---
## Drivers Collection

Canonical driver registry:

- full_name
- team_name
- acronym
- country_code
- headshot_url

---
## Seasons Collection

Aggregated yearly view:

- year
- meeting_count
- driver_count
- meetings[]

---
## Search Indexes

Drivers:
- full_name
- team_name
- broadcast_name

Races:
- meeting_name
- location
- winner