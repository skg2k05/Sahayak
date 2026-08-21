from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])



@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with hashed password and return authentication token.",
)
def register(
    user_in: UserRegister,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Register new user account."""
    return AuthService.register_user(db, user_in)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user",
    description="Authenticate user with email and password, returning JWT access token.",
)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Authenticate user and return JWT access token."""
    return AuthService.login_user(db, credentials)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Fetch current authenticated user profile using valid JWT token.",
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Return profile of currently authenticated user."""
    return UserResponse.model_validate(current_user)
