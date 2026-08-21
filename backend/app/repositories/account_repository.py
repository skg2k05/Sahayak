from decimal import Decimal
from typing import List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.account import Account


class AccountRepository:
    """Repository implementation for Account entity data access."""

    @staticmethod
    def get_user_accounts(db: Session, user_id: uuid.UUID) -> List[Account]:
        """Retrieve all active accounts belonging to a specific user."""
        stmt = (
            select(Account)
            .where(Account.user_id == user_id, Account.is_active.is_(True))
            .order_by(Account.created_at.asc())
        )
        return list(db.scalars(stmt).all())

    @staticmethod
    def get_user_account_by_id(
        db: Session,
        user_id: uuid.UUID,
        account_id: uuid.UUID,
        lock_for_update: bool = False,
    ) -> Optional[Account]:
        """Retrieve a specific account by ID scoped to user, with optional pessimistic locking."""
        stmt = select(Account).where(
            Account.id == account_id,
            Account.user_id == user_id,
            Account.is_active.is_(True),
        )
        if lock_for_update:
            stmt = stmt.with_for_update()
        return db.scalar(stmt)

    @staticmethod
    def update_balance(db: Session, account: Account, new_balance: Decimal) -> Account:
        """Update balance attribute of account in current session."""
        account.balance = new_balance
        db.add(account)
        return account
