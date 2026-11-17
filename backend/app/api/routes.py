from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import IncidentReport, RoadSegment, UserRole, MaintenanceJob, AuditLog
from app.core.security import require_roles
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
def create_road(payload: RoadCreate, db: Session = Depends(get_db), actor = Depends(require_roles(UserRole.SUPER_ADMIN.value, UserRole.GOVERNMENT_AUTHORITY.value, UserRole.INSPECTION_TEAM.value))):
    road = RoadSegment(**payload.model_dump())
    db.add(road)
    db.commit()
    db.refresh(road)
    return road


@router.get("/roads", response_model=list[RoadOut])
def list_roads(db: Session = Depends(get_db), limit: int = Query(default=100, ge=1, le=500)):
    return list(db.scalars(select(RoadSegment).order_by(RoadSegment.id.desc()).limit(limit)))


@router.post("/incidents", response_model=IncidentOut, status_code=201)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db), actor = Depends(require_roles(UserRole.SUPER_ADMIN.value, UserRole.GOVERNMENT_AUTHORITY.value, UserRole.INSPECTION_TEAM.value, UserRole.CITIZEN.value))):
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
def list_incidents(db: Session = Depends(get_db), limit: int = Query(default=100, ge=1, le=500), actor = Depends(require_roles(UserRole.SUPER_ADMIN.value, UserRole.GOVERNMENT_AUTHORITY.value, UserRole.INSPECTION_TEAM.value, UserRole.REPAIR_TEAM.value, UserRole.AI_DATA_REVIEWER.value))):
    return list(db.scalars(select(IncidentReport).order_by(IncidentReport.id.desc()).limit(limit)))


class MaintenanceCreate(BaseModel):
    incident_id: int
    assigned_team: str | None = None
    priority: str = "medium"
    scheduled_at: datetime | None = None
    notes: str | None = None


class MaintenanceStatusUpdate(BaseModel):
    status: str = Field(pattern="^(queued|assigned|in_progress|completed|cancelled|verification_pending|verified_closed)$")
    notes: str | None = None


@router.post("/maintenance/jobs", status_code=201)
def create_maintenance_job(payload: MaintenanceCreate, db: Session = Depends(get_db),
                           actor=Depends(require_roles(UserRole.SUPER_ADMIN.value, UserRole.GOVERNMENT_AUTHORITY.value))):
    incident = db.get(IncidentReport, payload.incident_id)
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    job = MaintenanceJob(**payload.model_dump())
    db.add(job)
    db.flush()
    db.add(AuditLog(actor_user_id=actor.id, action="maintenance.job.created",
                    resource_type="maintenance_job", resource_id=str(job.id)))
    db.commit()
    db.refresh(job)
    return {"id": job.id, "incident_id": job.incident_id, "status": job.status,
            "priority": job.priority, "assigned_team": job.assigned_team,
            "scheduled_at": job.scheduled_at, "created_at": job.created_at}


@router.get("/maintenance/jobs")
def list_maintenance_jobs(db: Session = Depends(get_db),
                          actor=Depends(require_roles(UserRole.SUPER_ADMIN.value, UserRole.GOVERNMENT_AUTHORITY.value, UserRole.REPAIR_TEAM.value))):
    jobs = db.scalars(select(MaintenanceJob).order_by(MaintenanceJob.id.desc()).limit(500))
    return [{"id": j.id, "incident_id": j.incident_id, "status": j.status, "priority": j.priority,
             "assigned_team": j.assigned_team, "scheduled_at": j.scheduled_at,
             "completed_at": j.completed_at, "notes": j.notes} for j in jobs]


@router.patch("/maintenance/jobs/{job_id}/status")
def update_maintenance_status(job_id: int, payload: MaintenanceStatusUpdate,
                              db: Session = Depends(get_db),
                              actor=Depends(require_roles(UserRole.SUPER_ADMIN.value, UserRole.GOVERNMENT_AUTHORITY.value, UserRole.REPAIR_TEAM.value))):
    job = db.get(MaintenanceJob, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Maintenance job not found")
    allowed = {
        "queued": {"assigned", "cancelled"},
        "assigned": {"in_progress", "cancelled"},
        "in_progress": {"completed", "cancelled"},
        "completed": {"verification_pending"},
        "verification_pending": {"verified_closed", "in_progress"},
        "verified_closed": set(),
        "cancelled": set(),
    }
    if payload.status not in allowed.get(job.status, set()):
        raise HTTPException(status_code=409, detail=f"Invalid transition: {job.status} -> {payload.status}")
    previous = job.status
    job.status = payload.status
    if payload.notes is not None:
        job.notes = payload.notes
    if payload.status == "completed":
        job.completed_at = datetime.now(timezone.utc)
    db.add(AuditLog(actor_user_id=actor.id, action="maintenance.status.changed",
                    resource_type="maintenance_job", resource_id=str(job.id),
                    details=f"{previous} -> {job.status}"))
    db.commit()
    db.refresh(job)
    return {"id": job.id, "status": job.status, "completed_at": job.completed_at}
