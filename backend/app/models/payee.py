from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
import uuid
from sqlalchemy import String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.guid import GUID

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.transaction import Transaction


class Payee(Base):
    """Payee domain entity model."""

    __tablename__ = "payees"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    upi_id: Mapped[Optional[str]] = mapped_column(
        String(255), index=True, nullable=True
    )
    phone: Mapped[Optional[str]] = mapped_column(
        String(50), index=True, nullable=True
    )
    bank_name: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )
    account_number: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )
    is_trusted: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="payees")
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction", back_populates="payee"
    )
