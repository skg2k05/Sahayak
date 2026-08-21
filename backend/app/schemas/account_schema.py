from decimal import Decimal
from typing import Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class AccountResponse(BaseModel):
    """Pydantic model representing account detail response with masked numbers."""

    id: uuid.UUID
    bank_name: str
    account_type: str
    account_number: str = Field(
        ..., description="Masked account number (e.g. XXXXXX1234)"
    )
    balance: Decimal
    currency: str = "INR"
    upi_id: Optional[str] = None
    is_primary: bool = True

    model_config = ConfigDict(from_attributes=True)


class AccountBalanceResponse(BaseModel):
    """Pydantic model for account balance response with narration string."""

    account_id: uuid.UUID
    balance: Decimal
    currency: str = "INR"
    narration: str
