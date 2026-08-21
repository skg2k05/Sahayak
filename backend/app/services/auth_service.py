from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse, TokenResponse
from app.repositories.user_repository import UserRepository
from app.repositories.audit_repository import AuditRepository
from app.core.security import hash_password, verify_password, create_access_token


class AuthService:
    """Service handling user authentication and registration business logic."""

    @staticmethod
    def register_user(db: Session, user_in: UserRegister) -> TokenResponse:
        """Register a new user, store hashed password, audit event, and issue JWT."""
        # 1. Duplicate email check
        existing_email = UserRepository.get_by_email(db, user_in.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # 2. Duplicate phone check (if phone provided)
        if user_in.phone:
            existing_phone = UserRepository.get_by_phone(db, user_in.phone)
            if existing_phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Phone number already registered",
                )

        # 3. Secure password hashing
        hashed_pw = hash_password(user_in.password)

        # 4. Construct user model
        user = User(
            full_name=user_in.full_name,
            email=user_in.email.lower().strip(),
            phone=user_in.phone.strip() if user_in.phone else None,
            password_hash=hashed_pw,
            preferred_language=user_in.preferred_language or "hi-IN",
            accessibility_settings=user_in.accessibility_settings or {},
            is_active=True,
        )

        # 5. Persist user
        created_user = UserRepository.create(db, user)

        # 6. Record audit log (without secrets)
        AuditRepository.create_audit_log(
            db=db,
            action="USER_REGISTERED",
            user_id=created_user.id,
            resource_type="User",
            resource_id=str(created_user.id),
            metadata_json={"email": created_user.email},
        )

        # 7. Create JWT token
        access_token = create_access_token(data={"sub": str(created_user.id)})

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(created_user),
        )

    @staticmethod
    def login_user(db: Session, credentials: UserLogin) -> TokenResponse:
        """Authenticate user credentials, audit login event, and return JWT."""
        user = UserRepository.get_by_email(db, credentials.email)
        if not user or not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account",
            )

        # Audit log
        AuditRepository.create_audit_log(
            db=db,
            action="USER_LOGGED_IN",
            user_id=user.id,
            resource_type="User",
            resource_id=str(user.id),
            metadata_json={"email": user.email},
        )

        access_token = create_access_token(data={"sub": str(user.id)})

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
