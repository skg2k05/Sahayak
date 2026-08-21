from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.payee_schema import PayeeResponse
from app.services.banking_service import BankingService

router = APIRouter(prefix="/api/payees", tags=["Payees"])


@router.get(
    "",
    response_model=List[PayeeResponse],
    summary="Get authenticated user saved payees",
    description="Returns list of saved payees belonging strictly to the authenticated user.",
)
def get_user_payees(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve user's saved payees."""
    return BankingService.get_payees(db, current_user)
