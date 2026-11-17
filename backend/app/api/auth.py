from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import User, UserRole, AuditLog
from app.core.security import require_roles
from app.core.security import create_access_token, hash_password, verify_password, current_user

router = APIRouter(prefix="/auth", tags=["authentication"])

class RegisterInput(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class UserOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool

class TokenOutput(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user: UserOutput

@router.post("/register", response_model=UserOutput, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterInput, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = User(full_name=payload.full_name.strip(), email=email,
                password_hash=hash_password(payload.password), role=UserRole.CITIZEN.value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=TokenOutput)
def login(payload: LoginInput, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash) or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    from app.core.security import TOKEN_MINUTES
    return TokenOutput(access_token=create_access_token(user), expires_in_minutes=TOKEN_MINUTES, user=user)

@router.get("/me", response_model=UserOutput)
def me(user: User = Depends(current_user)):
    return user


class RoleUpdate(BaseModel):
    role: str = Field(pattern="^(super_admin|government_authority|inspection_team|repair_team|citizen|ai_data_reviewer)$")


@router.patch("/users/{user_id}/role", response_model=UserOutput)
def update_user_role(user_id: int, payload: RoleUpdate,
                     actor: User = Depends(require_roles(UserRole.SUPER_ADMIN.value)),
                     db: Session = Depends(get_db)):
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")
    previous_role = target.role
    target.role = payload.role
    db.add(AuditLog(actor_user_id=actor.id, action="user.role.updated",
                    resource_type="user", resource_id=str(target.id),
                    details=f"role changed from {previous_role} to {payload.role}"))
    db.commit()
    db.refresh(target)
    return target
