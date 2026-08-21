from datetime import datetime
from decimal import Decimal
from typing import List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class TransactionCreate(BaseModel):
    """Pydantic model for creating a payment transaction."""

    account_id: uuid.UUID
    payee_id: Optional[uuid.UUID] = None
    amount: Decimal = Field(
        ..., gt=Decimal("0.00"), description="Transaction amount (must be > 0)"
    )
    description: Optional[str] = Field(None, max_length=550)
    category: Optional[str] = Field(None, max_length=50)


class TransactionResponse(BaseModel):
    """Pydantic model for transaction details response."""

    id: uuid.UUID
    account_id: uuid.UUID
    payee_id: Optional[uuid.UUID] = None
    payee_name: Optional[str] = None
    transaction_type: str
    amount: Decimal
    currency: str = "INR"
    status: str
    reference: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    created_at: datetime
    resulting_balance: Optional[Decimal] = None

    model_config = ConfigDict(from_attributes=True)


class TransactionListResponse(BaseModel):
    """Pydantic model for list of transaction responses."""

    items: List[TransactionResponse]
    total: int
