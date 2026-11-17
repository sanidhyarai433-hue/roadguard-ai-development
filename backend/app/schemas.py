from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class RoadCreate(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    area: str | None = Field(default=None, max_length=180)
    city: str = Field(default="Unknown", max_length=120)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    length_km: float | None = Field(default=None, gt=0)


class RoadOut(RoadCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class IncidentCreate(BaseModel):
    road_id: int | None = None
    reporter_name: str = Field(default="Anonymous", max_length=120)
    description: str = Field(min_length=5, max_length=4000)
    damage_type: str = Field(default="unclassified", max_length=40)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    severity_score: float = Field(default=0, ge=0, le=100)
    traffic_score: float = Field(default=50, ge=0, le=100)
    location_score: float = Field(default=50, ge=0, le=100)
    frequency_score: float = Field(default=0, ge=0, le=100)
    connectivity_score: float = Field(default=50, ge=0, le=100)


class IncidentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    road_id: int | None
    reporter_name: str
    description: str
    damage_type: str
    latitude: float | None
    longitude: float | None
    severity_score: float
    risk_score: float
    status: str
    created_at: datetime


class DashboardSummary(BaseModel):
    roads_tracked: int
    incidents_total: int
    incidents_open: int
    incidents_high_risk: int
    data_source: str = "live_database"
