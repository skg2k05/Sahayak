from decimal import Decimal
from typing import Optional
import uuid
from pydantic import BaseModel, ConfigDict


class PayeeResponse(BaseModel):
    """Pydantic model for payee response."""

    id: uuid.UUID
    name: str
    upi_id: Optional[str] = None
    phone: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    is_trusted: bool = False
    trusted_status: bool = False
    relationship: Optional[str] = "Saved Payee"
    photo_url: Optional[str] = None
    monthly_limit: Optional[Decimal] = None

    model_config = ConfigDict(from_attributes=True)
