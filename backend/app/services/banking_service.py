from decimal import Decimal
from typing import List
import uuid
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.account_schema import AccountResponse, AccountBalanceResponse
from app.schemas.payee_schema import PayeeResponse
from app.schemas.transaction_schema import (
    TransactionCreate,
    TransactionResponse,
    TransactionListResponse,
)
from app.repositories.account_repository import AccountRepository
from app.repositories.payee_repository import PayeeRepository
from app.repositories.transaction_repository import TransactionRepository
from app.repositories.audit_repository import AuditRepository
from app.core.redis import RedisClient


def mask_account_number(acc_num: str) -> str:
    """Mask account number keeping only last 4 digits visible."""
    clean = acc_num.strip()
    if len(clean) <= 4:
        return clean
    return f"XXXXXX{clean[-4:]}"


class BankingService:
    """Service encapsulating core banking business logic and operations."""

    @staticmethod
    def get_accounts(db: Session, user: User) -> List[AccountResponse]:
        """Retrieve formatted user accounts with masked account numbers."""
        accounts = AccountRepository.get_user_accounts(db, user.id)
        result = []
        for index, acc in enumerate(accounts):
            # Generate deterministic UPI ID if not stored
            user_handle = user.email.split("@")[0] if user.email else "user"
            upi_id = f"{user_handle}@upi"
            
            resp = AccountResponse(
                id=acc.id,
                bank_name=acc.bank_name,
                account_type=acc.account_type,
                account_number=mask_account_number(acc.account_number),
                balance=acc.balance,
                currency=acc.currency,
                upi_id=upi_id,
                is_primary=(index == 0),
            )
            result.append(resp)
        return result

    @staticmethod
    def get_account_balance(
        db: Session, user: User, account_id: uuid.UUID
    ) -> AccountBalanceResponse:
        """Verify account ownership and return balance with localized narration (cached in Redis)."""
        cache_key = f"sahayak:balance:{user.id}:{account_id}"

        # 1. Attempt retrieval from Redis cache
        cached_json = RedisClient.get(cache_key)
        if cached_json:
            try:
                return AccountBalanceResponse.model_validate_json(cached_json)
            except Exception:
                pass

        # 2. Query PostgreSQL source of truth
        account = AccountRepository.get_user_account_by_id(db, user.id, account_id)
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found",
            )

        formatted_balance = f"{account.balance:,.2f}"
        narration = f"Aapke account mein ₹{formatted_balance} bache hain."

        response = AccountBalanceResponse(
            account_id=account.id,
            balance=account.balance,
            currency=account.currency,
            narration=narration,
        )

        # 3. Store in Redis cache with short TTL
        RedisClient.set(cache_key, response.model_dump_json())
        return response

    @staticmethod
    def get_payees(db: Session, user: User) -> List[PayeeResponse]:
        """Retrieve saved payees for authenticated user."""
        payees = PayeeRepository.get_user_payees(db, user.id)
        result = []
        for p in payees:
            resp = PayeeResponse(
                id=p.id,
                name=p.name,
                upi_id=p.upi_id,
                phone=p.phone,
                bank_name=p.bank_name,
                account_number=mask_account_number(p.account_number) if p.account_number else None,
                is_trusted=p.is_trusted,
                trusted_status=p.is_trusted,
                relationship="Saved Payee",
                photo_url=None,
                monthly_limit=Decimal("50000.00"),
            )
            result.append(resp)
        return result

    @staticmethod
    def create_transaction(
        db: Session, user: User, tx_in: TransactionCreate
    ) -> TransactionResponse:
        """Execute atomic mock payment transaction with strict balance and ownership validation."""
        if tx_in.amount <= Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction amount must be greater than zero",
            )

        # 1. Fetch and lock user's account
        account = AccountRepository.get_user_account_by_id(
            db, user.id, tx_in.account_id, lock_for_update=True
        )
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found or does not belong to user",
            )

        # 2. Fetch and validate payee if specified
        payee = None
        if tx_in.payee_id:
            payee = PayeeRepository.get_user_payee_by_id(db, user.id, tx_in.payee_id)
            if not payee:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Payee not found or does not belong to user",
                )

        # 3. Check sufficient balance
        if account.balance < tx_in.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient account balance",
            )

        # 4. Atomic balance update and transaction record creation
        new_balance = account.balance - tx_in.amount
        AccountRepository.update_balance(db, account, new_balance)

        ref_code = f"TXN-{uuid.uuid4().hex[:12].upper()}"
        payee_name = payee.name if payee else "External Payee"
        desc = tx_in.description or f"Payment to {payee_name}"

        txn = Transaction(
            account_id=account.id,
            payee_id=payee.id if payee else None,
            transaction_type="DEBIT",
            amount=tx_in.amount,
            currency=account.currency,
            status="SUCCESS",
            reference=ref_code,
            description=desc,
        )
        TransactionRepository.create(db, txn)

        # Commit transaction atomically
        db.commit()
        db.refresh(txn)

        # Record audit event
        AuditRepository.create_audit_log(
            db=db,
            action="TRANSACTION_CREATED",
            user_id=user.id,
            resource_type="Transaction",
            resource_id=str(txn.id),
            metadata_json={
                "amount": str(txn.amount),
                "account_id": str(account.id),
                "reference": ref_code,
            },
        )

        # Invalidate cached balance in Redis
        cache_key = f"sahayak:balance:{user.id}:{account.id}"
        RedisClient.delete(cache_key)

        return TransactionResponse(
            id=txn.id,
            account_id=txn.account_id,
            payee_id=txn.payee_id,
            payee_name=payee_name if payee else None,
            transaction_type=txn.transaction_type,
            amount=txn.amount,
            currency=txn.currency,
            status=txn.status,
            reference=txn.reference,
            description=txn.description,
            category=tx_in.category or "Transfer",
            created_at=txn.created_at,
            resulting_balance=new_balance,
        )

    @staticmethod
    def get_transactions(
        db: Session, user: User, skip: int = 0, limit: int = 20
    ) -> TransactionListResponse:
        """Retrieve paginated user transaction history."""
        items, total = TransactionRepository.get_user_transactions(
            db, user.id, skip=skip, limit=limit
        )

        response_items = []
        for t in items:
            payee_name = t.payee.name if t.payee else None
            resp = TransactionResponse(
                id=t.id,
                account_id=t.account_id,
                payee_id=t.payee_id,
                payee_name=payee_name,
                transaction_type=t.transaction_type,
                amount=t.amount,
                currency=t.currency,
                status=t.status,
                reference=t.reference,
                description=t.description,
                category="Transfer",
                created_at=t.created_at,
                resulting_balance=t.account.balance if t.account else None,
            )
            response_items.append(resp)

        return TransactionListResponse(items=response_items, total=total)

    @staticmethod
    def get_transaction_by_id(
        db: Session, user: User, transaction_id: uuid.UUID
    ) -> TransactionResponse:
        """Retrieve specific transaction details scoped to authenticated user."""
        txn = TransactionRepository.get_user_transaction_by_id(
            db, user.id, transaction_id
        )
        if not txn:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found",
            )

        payee_name = txn.payee.name if txn.payee else None
        return TransactionResponse(
            id=txn.id,
            account_id=txn.account_id,
            payee_id=txn.payee_id,
            payee_name=payee_name,
            transaction_type=txn.transaction_type,
            amount=txn.amount,
            currency=txn.currency,
            status=txn.status,
            reference=txn.reference,
            description=txn.description,
            category="Transfer",
            created_at=txn.created_at,
            resulting_balance=txn.account.balance if txn.account else None,
        )
