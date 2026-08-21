from typing import List
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.account_schema import AccountResponse, AccountBalanceResponse
from app.services.banking_service import BankingService

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])


@router.get(
    "",
    response_model=List[AccountResponse],
    summary="Get authenticated user accounts",
    description="Returns a list of accounts owned by the authenticated user with masked account numbers.",
)
def get_user_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve user's accounts."""
    return BankingService.get_accounts(db, current_user)


@router.get(
    "/{account_id}/balance",
    response_model=AccountBalanceResponse,
    summary="Get account balance and narration",
    description="Returns the balance and localized narration string for an account belonging to the authenticated user.",
)
def get_account_balance(
    account_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve balance for a specific user account."""
    return BankingService.get_account_balance(db, current_user, account_id)
