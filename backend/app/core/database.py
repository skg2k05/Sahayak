from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from app.core.config import get_settings

settings = get_settings()

# Engine creation with pool pre-ping to check live connections
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)

# Session factory for handling database transactions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""

    pass


def get_db() -> Generator[Session, None, None]:
    """Dependency generator for obtaining database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
