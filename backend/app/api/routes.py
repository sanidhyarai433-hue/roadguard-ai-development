from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import IncidentReport, RoadSegment
from app.schemas import DashboardSummary, IncidentCreate, IncidentOut, RoadCreate, RoadOut
from app.services.risk import assess_risk

router = APIRouter()


@router.get("/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    roads = db.scalar(select(func.count()).select_from(RoadSegment)) or 0
    total = db.scalar(select(func.count()).select_from(IncidentReport)) or 0
    opened = db.scalar(select(func.count()).select_from(IncidentReport).where(
        IncidentReport.status.notin_(["verified_closed", "rejected"])
    )) or 0
    high_risk = db.scalar(select(func.count()).select_from(IncidentReport).where(
        IncidentReport.risk_score >= 60
    )) or 0
    return DashboardSummary(roads_tracked=roads, incidents_total=total,
                            incidents_open=opened, incidents_high_risk=high_risk)


@router.post("/roads", response_model=RoadOut, status_code=201)
def create_road(payload: RoadCreate, db: Session = Depends(get_db)):
    road = RoadSegment(**payload.model_dump())
    db.add(road)
    db.commit()
    db.refresh(road)
    return road


@router.get("/roads", response_model=list[RoadOut])
def list_roads(db: Session = Depends(get_db), limit: int = Query(default=100, ge=1, le=500)):
    return list(db.scalars(select(RoadSegment).order_by(RoadSegment.id.desc()).limit(limit)))


@router.post("/incidents", response_model=IncidentOut, status_code=201)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    values = payload.model_dump()
    factors = {key: values.pop(key) for key in (
        "traffic_score", "location_score", "frequency_score", "connectivity_score"
    )}
    assessment = assess_risk(
        severity=values["severity_score"],
        traffic=factors["traffic_score"],
        location=factors["location_score"],
        frequency=factors["frequency_score"],
        connectivity=factors["connectivity_score"],
    )
    if values["road_id"] is not None and db.get(RoadSegment, values["road_id"]) is None:
        raise HTTPException(status_code=404, detail="Road segment not found")
    incident = IncidentReport(**values, risk_score=assessment.score)
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("/incidents", response_model=list[IncidentOut])
def list_incidents(db: Session = Depends(get_db), limit: int = Query(default=100, ge=1, le=500)):
    return list(db.scalars(select(IncidentReport).order_by(IncidentReport.id.desc()).limit(limit)))
