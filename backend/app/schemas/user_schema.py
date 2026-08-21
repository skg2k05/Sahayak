from datetime import datetime
from typing import Dict, Any, Optional
import uuid
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    """Registration request payload schema."""

    full_name: str = Field(..., min_length=1, max_length=255, json_schema_extra={"example": "Anita Sharma"})
    email: EmailStr = Field(..., json_schema_extra={"example": "anita@example.com"})
    phone: Optional[str] = Field(None, json_schema_extra={"example": "+919876543210"})
    password: str = Field(..., min_length=6, max_length=128, json_schema_extra={"example": "example-password"})
    preferred_language: str = Field("hi-IN", json_schema_extra={"example": "hi-IN"})
    accessibility_settings: Optional[Dict[str, Any]] = Field(
        default_factory=dict, json_schema_extra={"example": {"high_contrast": False, "font_size": "medium"}}
    )


class UserLogin(BaseModel):
    """Login request payload schema."""

    email: EmailStr = Field(..., json_schema_extra={"example": "anita@example.com"})
    password: str = Field(..., json_schema_extra={"example": "example-password"})


class UserResponse(BaseModel):
    """Safe user profile response schema (without password_hash)."""

    id: uuid.UUID
    full_name: str
    email: str
    phone: Optional[str] = None
    preferred_language: str
    accessibility_settings: Dict[str, Any]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Authentication token response payload schema."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    """JWT Token payload schema."""

    sub: Optional[str] = None
    exp: Optional[int] = None
