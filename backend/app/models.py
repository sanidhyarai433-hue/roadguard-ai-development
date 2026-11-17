from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def utc_now():
    return datetime.now(timezone.utc)


class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    GOVERNMENT_AUTHORITY = "government_authority"
    INSPECTION_TEAM = "inspection_team"
    REPAIR_TEAM = "repair_team"
    CITIZEN = "citizen"
    AI_DATA_REVIEWER = "ai_data_reviewer"


class RoadSegment(Base):
    __tablename__ = "road_segments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(180), index=True)
    area: Mapped[str | None] = mapped_column(String(180), nullable=True)
    city: Mapped[str] = mapped_column(String(120), default="Unknown")
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    length_km: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    reports: Mapped[list["IncidentReport"]] = relationship(back_populates="road")


class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    road_id: Mapped[int | None] = mapped_column(ForeignKey("road_segments.id"), nullable=True, index=True)
    reporter_name: Mapped[str] = mapped_column(String(120), default="Anonymous")
    description: Mapped[str] = mapped_column(Text)
    damage_type: Mapped[str] = mapped_column(String(40), default="unclassified")
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    severity_score: Mapped[float] = mapped_column(Float, default=0)
    risk_score: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(30), default="submitted", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    road: Mapped[RoadSegment | None] = relationship(back_populates="reports")
