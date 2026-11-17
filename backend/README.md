# ROADGUARD AI backend

FastAPI + SQLAlchemy service. The initial foundation provides persistent road-segment and incident records, validated REST endpoints, health checks, and an explainable rule-based risk score.

## Run locally

```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env  # Windows; on macOS/Linux use: cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

OpenAPI docs: http://localhost:8000/docs

## Endpoints

- `GET /health/live` — process liveness.
- `GET /health/ready` — verifies database connectivity.
- `GET /api/v1/dashboard/summary` — counts persisted roads and incidents.
- `POST/GET /api/v1/roads` — create and list road segments.
- `POST/GET /api/v1/incidents` — create and list incident reports. Risk is calculated server-side.

## Database

Defaults to SQLite for a zero-configuration local prototype. Set `DATABASE_URL` to a PostgreSQL connection string for deployment. PostGIS geometry columns/migrations are a later GIS milestone; coordinates are currently stored as latitude/longitude fields.

## Risk score

`R = 0.35S + 0.25T + 0.20L + 0.10F + 0.10C`

All inputs are validated on a 0–100 scale. The API returns a stored numeric risk score; the scoring function also exposes factor contributions for explainability. Priority bands: critical ≥80, high ≥60, medium ≥35, low <35.

This is a transparent deterministic rules engine, **not a trained ML model**. No detection accuracy or model inference is claimed in this milestone.


## Authentication and roles

- `POST /api/v1/auth/register` creates a citizen account only. Passwords are PBKDF2-HMAC-SHA256 hashed with a per-user random salt.
- `POST /api/v1/auth/login` returns a short-lived JWT access token.
- `GET /api/v1/auth/me` returns the authenticated account.
- `PATCH /api/v1/auth/users/{user_id}/role` is restricted to an existing `super_admin` and records a role-change audit event.

Supported roles: `super_admin`, `government_authority`, `inspection_team`, `repair_team`, `citizen`, and `ai_data_reviewer`. Public registration cannot choose an elevated role.

Set a unique, high-entropy `JWT_SECRET` before deployment. The development fallback secret is not suitable for production. Access tokens expire after `ACCESS_TOKEN_MINUTES` (30 by default).

The current milestone includes identity and role primitives. It does not yet claim complete per-resource authorization policies, password reset, refresh-token rotation, email verification, or production identity-provider integration.
