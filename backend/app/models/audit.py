from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
import uuid
from sqlalchemy import String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.guid import GUID

if TYPE_CHECKING:
    from app.models.user import User


class AuditLog(Base):
    """Audit Log domain entity model."""

    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID, primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        GUID, ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )
    resource_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    metadata_json: Mapped[dict] = mapped_column(
        JSON, default=dict, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="audit_logs")
