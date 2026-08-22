import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _create_database_engine():
    """Create database engine with automatic fallback to local SQLite if PostgreSQL connection/auth fails."""
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql"):
        try:
            temp_engine = create_engine(
                db_url,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 3},
            )
            with temp_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Successfully connected to PostgreSQL database.")
            return temp_engine
        except Exception as exc:
            logger.warning(
                "PostgreSQL connection/authentication failed (%s). Falling back to local SQLite database: sqlite:///./sahayak_db.sqlite3",
                str(exc),
            )
            db_url = "sqlite:///./sahayak_db.sqlite3"

    connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
    return create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True,
    )


engine = _create_database_engine()

# Session factory for handling database transactions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""

    pass


def init_db():
    """Initialize database tables automatically on startup."""
    from app.models.user import User
    from app.models.account import Account
    from app.models.payee import Payee
    from app.models.transaction import Transaction

    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency generator for obtaining database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
