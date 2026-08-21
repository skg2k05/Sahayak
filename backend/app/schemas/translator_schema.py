from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TranslateRequest(BaseModel):
    """Pydantic model for transaction translation request input."""

    text: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Cryptic banking SMS message or transaction text to translate.",
    )
    language: Optional[str] = Field(
        "en",
        description="Target language for voice-first explanation ('en' for English, 'hi' for Hindi).",
    )


class TranslateResponse(BaseModel):
    """Pydantic model representing structured transaction translation response."""

    summary: str = Field(..., description="Short summary of the financial transaction")
    amount: Optional[float] = Field(None, description="Extracted transaction monetary amount if present")
    transaction_type: str = Field(
        "debit", description="Type of transaction (debit, credit, unknown)"
    )
    merchant: Optional[str] = Field(
        None, description="Extracted merchant, recipient, or sender name"
    )
    account_last4: Optional[str] = Field(
        None, description="Extracted last 4 digits of account or card number"
    )
    plain_language: str = Field(
        ..., description="Accessible plain-language voice-first explanation"
    )
    language: str = Field("en", description="Language of the plain language explanation")

    model_config = ConfigDict(from_attributes=True)
