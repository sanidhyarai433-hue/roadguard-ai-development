# ROADGUARD AI

Road infrastructure intelligence platform: road inspections, damage reporting, AI-assisted detection, explainable risk prioritisation, maintenance workflows and repair verification.

## Repository layout

- `app/` — Next.js web application.
- `backend/` — FastAPI service, SQLAlchemy persistence, road/incident APIs and the first explainable risk engine.

## Start the web app

```bash
pnpm install
pnpm dev
```

## Start the API

See [backend setup](backend/README.md). The API runs at `http://localhost:8000`; interactive OpenAPI documentation is at `http://localhost:8000/docs`.

## Implementation status

The backend foundation currently includes working database-backed road and incident endpoints and a deterministic, explainable risk-scoring rule. The frontend's existing demo records have not yet been represented as live municipal data. Trained YOLO inference, PostGIS spatial queries, authentication/RBAC, storage, duplicate intelligence, predictive maintenance and repair verification remain subsequent implementation milestones.

No model accuracy, live municipal integration or production readiness is claimed until those capabilities are implemented and tested.
