from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
import uuid
from sqlalchemy import String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.guid import GUID

if TYPE_CHECKING:
    from app.models.account import Account
    from app.models.payee import Payee


class Transaction(Base):
    """Transaction domain entity model."""

    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4
    )
    account_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey("accounts.id", ondelete="CASCADE"), index=True, nullable=False
    )
    payee_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("payees.id", ondelete="SET NULL"), index=True, nullable=True
    )
    transaction_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )
    currency: Mapped[str] = mapped_column(
        String(10), default="INR", nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(50), default="PENDING", nullable=False
    )
    reference: Mapped[Optional[str]] = mapped_column(
        String(100), index=True, nullable=True
    )
    description: Mapped[Optional[str]] = mapped_column(
        String(550), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    account: Mapped["Account"] = relationship("Account", back_populates="transactions")
    payee: Mapped[Optional["Payee"]] = relationship("Payee", back_populates="transactions")
