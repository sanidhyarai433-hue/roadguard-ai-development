"""Explainable rule-based road-risk scoring; this is not an ML prediction."""
from dataclasses import dataclass

WEIGHTS = {
    "severity": 0.35,
    "traffic": 0.25,
    "location": 0.20,
    "frequency": 0.10,
    "connectivity": 0.10,
}


@dataclass(frozen=True)
class RiskAssessment:
    score: float
    priority: str
    factors: dict[str, float]
    weighted_contributions: dict[str, float]


def assess_risk(*, severity: float, traffic: float, location: float,
                frequency: float, connectivity: float) -> RiskAssessment:
    values = {
        "severity": severity, "traffic": traffic, "location": location,
        "frequency": frequency, "connectivity": connectivity,
    }
    for name, value in values.items():
        if not 0 <= value <= 100:
            raise ValueError(f"{name} must be between 0 and 100")

    contributions = {key: round(values[key] * weight, 2) for key, weight in WEIGHTS.items()}
    score = round(sum(contributions.values()), 2)
    priority = "critical" if score >= 80 else "high" if score >= 60 else "medium" if score >= 35 else "low"
    return RiskAssessment(score, priority, values, contributions)
