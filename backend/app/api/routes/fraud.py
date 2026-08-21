from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.fraud_schema import FraudCheckRequest, FraudCheckResponse
from app.services.fraud_service import FraudService

router = APIRouter(prefix="/api/fraud", tags=["Fraud Detection"])


@router.post(
    "/check",
    response_model=FraudCheckResponse,
    summary="Evaluate transaction risk and fraud score",
    description="Evaluates a prospective transaction using transparent, deterministic rules and returns risk level, score (0-100), and explainable reasons.",
)
def check_transaction_fraud(
    payload: FraudCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Perform deterministic risk assessment on prospective transaction."""
    return FraudService.evaluate_transaction_risk(db, current_user, payload)
