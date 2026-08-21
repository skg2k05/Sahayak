from decimal import Decimal
from typing import List, Optional
import uuid
from pydantic import BaseModel, Field, ConfigDict


class FraudCheckRequest(BaseModel):
    """Pydantic model for evaluating transaction fraud/risk."""

    account_id: uuid.UUID = Field(..., description="Source account ID for the prospective transaction")
    amount: Decimal = Field(
        ...,
        gt=Decimal("0.00"),
        description="Prospective transaction amount in INR",
    )
    payee_id: Optional[uuid.UUID] = Field(
        None,
        description="Target payee ID if known",
    )
    transaction_type: str = Field(
        "DEBIT",
        description="Transaction type (e.g. DEBIT)",
    )


class FraudCheckResponse(BaseModel):
    """Pydantic model representing deterministic, explainable risk assessment output."""

    risk_level: str = Field(
        ...,
        description="Risk level tier: 'low', 'medium', or 'high'",
    )
    risk_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Bounded risk score between 0 and 100",
    )
    reasons: List[str] = Field(
        default_factory=list,
        description="Human-readable transparent explanations for triggered risk factors",
    )

    model_config = ConfigDict(from_attributes=True)
