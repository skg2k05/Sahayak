from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import get_settings
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse, TokenResponse
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
settings = get_settings()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with hashed password and return authentication token.",
)
def register(
    request: Request,
    user_in: UserRegister,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Register new user account with rate limit protection."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    AuthService.check_rate_limit(
        key=f"sahayak:rate_limit:register:{client_ip}",
        max_attempts=settings.AUTH_RATE_LIMIT_MAX_ATTEMPTS,
        window_seconds=settings.AUTH_RATE_LIMIT_WINDOW_SECONDS,
        error_message="Too many registration attempts. Please try again later.",
    )
    return AuthService.register_user(db, user_in)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user",
    description="Authenticate user with email and password, returning JWT access token.",
)
def login(
    request: Request,
    credentials: UserLogin,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Authenticate user and return JWT access token with rate limit protection."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    AuthService.check_rate_limit(
        key=f"sahayak:rate_limit:login:{client_ip}",
        max_attempts=settings.AUTH_RATE_LIMIT_MAX_ATTEMPTS,
        window_seconds=settings.AUTH_RATE_LIMIT_WINDOW_SECONDS,
        error_message="Too many login attempts. Please try again later.",
    )
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
