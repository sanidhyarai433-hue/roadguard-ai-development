import pytest
from app.services.risk import assess_risk


def test_risk_weights_sum_to_input_when_all_factors_equal():
    result = assess_risk(severity=70, traffic=70, location=70, frequency=70, connectivity=70)
    assert result.score == 70
    assert result.priority == "high"
    assert sum(result.weighted_contributions.values()) == 70


def test_risk_rejects_out_of_range_values():
    with pytest.raises(ValueError):
        assess_risk(severity=101, traffic=50, location=50, frequency=0, connectivity=50)


def test_low_risk_classification():
    result = assess_risk(severity=10, traffic=10, location=10, frequency=10, connectivity=10)
    assert result.priority == "low"
