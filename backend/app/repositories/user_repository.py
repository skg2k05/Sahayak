from typing import Optional
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.user import User


class UserRepository:
    """Repository pattern implementation for User entity data access."""

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """Retrieve a user by email address."""
        stmt = select(User).where(User.email == email.lower().strip())
        return db.scalar(stmt)

    @staticmethod
    def get_by_phone(db: Session, phone: str) -> Optional[User]:
        """Retrieve a user by phone number."""
        if not phone:
            return None
        stmt = select(User).where(User.phone == phone.strip())
        return db.scalar(stmt)

    @staticmethod
    def get_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
        """Retrieve a user by primary key ID."""
        stmt = select(User).where(User.id == user_id)
        return db.scalar(stmt)

    @staticmethod
    def create(db: Session, user: User) -> User:
        """Persist a new User record."""
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
