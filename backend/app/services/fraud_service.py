from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.fraud_schema import FraudCheckRequest, FraudCheckResponse
from app.repositories.account_repository import AccountRepository
from app.repositories.payee_repository import PayeeRepository
from app.repositories.transaction_repository import TransactionRepository


class FraudService:
    """Deterministic, explainable transaction fraud and risk scoring service."""

    @staticmethod
    def evaluate_transaction_risk(
        db: Session, user: User, request: FraudCheckRequest
    ) -> FraudCheckResponse:
        """Evaluate risk for a prospective transaction using transparent deterministic rules."""
        if request.amount <= Decimal("0.00"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction amount must be greater than zero",
            )

        # 1. Verify account ownership
        account = AccountRepository.get_user_account_by_id(
            db, user.id, request.account_id
        )
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found or does not belong to user",
            )

        # 2. Verify payee ownership if provided
        payee = None
        if request.payee_id:
            payee = PayeeRepository.get_user_payee_by_id(
                db, user.id, request.payee_id
            )
            if not payee:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Payee not found or does not belong to user",
                )

        score = 0
        reasons: List[str] = []

        # Rule 1: Unusually Large Transaction Amount
        if request.amount > Decimal("50000.00"):
            score += 35
            reasons.append(
                f"Transaction amount of ₹{request.amount:,.2f} exceeds the ₹50,000.00 large transaction threshold."
            )
        elif request.amount > Decimal("20000.00"):
            score += 15
            reasons.append(
                f"Transaction amount of ₹{request.amount:,.2f} is moderately elevated."
            )

        # Retrieve recent user transaction history for temporal analysis
        recent_txns, _ = TransactionRepository.get_user_transactions(
            db, user.id, skip=0, limit=50
        )

        now = datetime.now(timezone.utc)
        five_mins_ago = now - timedelta(minutes=5)
        one_hour_ago = now - timedelta(hours=1)

        # Calculate time-window frequencies
        txns_last_5m = 0
        txns_last_1h = 0

        for t in recent_txns:
            if t.created_at:
                # Ensure timezone aware comparison
                t_time = (
                    t.created_at.replace(tzinfo=timezone.utc)
                    if t.created_at.tzinfo is None
                    else t.created_at
                )
                if t_time >= five_mins_ago:
                    txns_last_5m += 1
                if t_time >= one_hour_ago:
                    txns_last_1h += 1

        # Rule 2: Rapid Repeated Transactions (Short Time Window)
        if txns_last_5m >= 3:
            score += 30
            reasons.append(
                f"Rapid successive transactions ({txns_last_5m}) detected within the last 5 minutes."
            )
        elif txns_last_5m == 2:
            score += 15
            reasons.append(
                "Multiple transactions (2) detected within the last 5 minutes."
            )

        # Rule 3: High Transaction Frequency (Past Hour)
        if txns_last_1h >= 5:
            score += 25
            reasons.append(
                f"High transaction velocity ({txns_last_1h} transactions) detected within the past hour."
            )

        # Rule 4: High Balance Depletion (> 80% of account balance)
        if account.balance > Decimal("0.00") and request.amount > (account.balance * Decimal("0.80")):
            score += 20
            reasons.append(
                f"Transaction amount depletes more than 80% of available account balance (₹{account.balance:,.2f})."
            )

        # Rule 5: Untrusted Payee
        if payee is not None and not payee.is_trusted:
            score += 15
            reasons.append("Recipient payee is not listed as a trusted contact.")

        # Default safe condition if no risk factors triggered
        if not reasons:
            score = 5
            reasons.append("Transaction parameters are within normal expected limits.")

        # Bound score between 0 and 100
        bounded_score = min(max(score, 0), 100)

        # Determine risk level tier
        if bounded_score < 30:
            risk_level = "low"
        elif bounded_score < 70:
            risk_level = "medium"
        else:
            risk_level = "high"

        return FraudCheckResponse(
            risk_level=risk_level,
            risk_score=bounded_score,
            reasons=reasons,
        )
