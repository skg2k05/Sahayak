import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.transaction_schema import (
    TransactionCreate,
    TransactionResponse,
    TransactionListResponse,
)
from app.services.banking_service import BankingService

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.post(
    "",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a mock banking transaction",
    description="Executes a payment transaction, deducts account balance atomically, and records transaction history.",
)
def create_transaction(
    tx_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Initiate a payment transaction."""
    return BankingService.create_transaction(db, current_user, tx_in)


@router.get(
    "",
    response_model=TransactionListResponse,
    summary="Get user transaction history",
    description="Returns paginated transaction history for the authenticated user, newest transactions first.",
)
def get_user_transactions(
    skip: int = Query(0, ge=0, description="Items to skip for pagination"),
    limit: int = Query(20, ge=1, le=100, description="Items to limit for pagination"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve user transaction history."""
    return BankingService.get_transactions(db, current_user, skip=skip, limit=limit)


@router.get(
    "/{transaction_id}",
    response_model=TransactionResponse,
    summary="Get single transaction detail",
    description="Retrieves detail for a single transaction owned by the authenticated user.",
)
def get_transaction_by_id(
    transaction_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve single transaction detail."""
    return BankingService.get_transaction_by_id(db, current_user, transaction_id)
