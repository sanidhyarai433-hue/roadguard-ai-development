import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.api.auth import router as auth_router
from app.db import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="ROADGUARD AI API",
    description="Road infrastructure reporting, risk assessment and maintenance intelligence API.",
    version="0.1.0",
    lifespan=lifespan,
)

origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health/live", tags=["health"])
def liveness():
    return {"status": "alive", "service": "roadguard-api"}


@app.get("/health/ready", tags=["health"])
def readiness():
    from app.db import engine
    from sqlalchemy import text
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ready", "database": "connected"}


app.include_router(router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
