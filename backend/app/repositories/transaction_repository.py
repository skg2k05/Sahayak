from typing import List, Optional, Tuple
import uuid
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload
from app.models.account import Account
from app.models.transaction import Transaction


class TransactionRepository:
    """Repository implementation for Transaction entity data access."""

    @staticmethod
    def create(db: Session, transaction: Transaction) -> Transaction:
        """Persist a new transaction record."""
        db.add(transaction)
        return transaction

    @staticmethod
    def get_user_transactions(
        db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Transaction], int]:
        """Retrieve paginated transactions belonging to user accounts (newest first)."""
        base_stmt = (
            select(Transaction)
            .join(Account, Transaction.account_id == Account.id)
            .where(Account.user_id == user_id)
        )

        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total = db.scalar(count_stmt) or 0

        stmt = (
            base_stmt.options(joinedload(Transaction.payee), joinedload(Transaction.account))
            .order_by(Transaction.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(db.scalars(stmt).all())
        return items, total

    @staticmethod
    def get_user_transaction_by_id(
        db: Session, user_id: uuid.UUID, transaction_id: uuid.UUID
    ) -> Optional[Transaction]:
        """Retrieve a specific transaction by ID, ensuring ownership via account user_id."""
        stmt = (
            select(Transaction)
            .join(Account, Transaction.account_id == Account.id)
            .options(joinedload(Transaction.payee), joinedload(Transaction.account))
            .where(Transaction.id == transaction_id, Account.user_id == user_id)
        )
        return db.scalar(stmt)
