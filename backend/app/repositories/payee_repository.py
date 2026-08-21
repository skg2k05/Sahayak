from typing import List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.payee import Payee


class PayeeRepository:
    """Repository implementation for Payee entity data access."""

    @staticmethod
    def get_user_payees(db: Session, user_id: uuid.UUID) -> List[Payee]:
        """Retrieve all payees belonging to a specific user."""
        stmt = (
            select(Payee)
            .where(Payee.user_id == user_id)
            .order_by(Payee.name.asc())
        )
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_user_payee_by_id(
        db: Session, user_id: uuid.UUID, payee_id: uuid.UUID
    ) -> Optional[Payee]:
        """Retrieve a specific payee by ID scoped to user."""
        stmt = select(Payee).where(
            Payee.id == payee_id,
            Payee.user_id == user_id,
        )
        return db.scalar(stmt)
