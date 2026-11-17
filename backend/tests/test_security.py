from app.core.security import hash_password, verify_password


def test_password_hash_is_salted_and_verifiable():
    password = "Correct-Horse-Battery-42"
    first = hash_password(password)
    second = hash_password(password)
    assert first != second
    assert verify_password(password, first)
    assert not verify_password("wrong-password", first)


def test_password_hash_rejects_short_password():
    import pytest
    with pytest.raises(ValueError):
        hash_password("short")
