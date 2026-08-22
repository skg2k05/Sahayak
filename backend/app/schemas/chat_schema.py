from pydantic import BaseModel, Field, field_validator

SUPPORTED_CHAT_LANGUAGES = {"en", "hi", "kn", "ta", "te", "mr", "bn"}



class ChatRequest(BaseModel):
    """Chatbot request payload schema."""

    message: str = Field(
        ...,
        min_length=1,
        max_length=500,
        json_schema_extra={"example": "What is my current account balance?"},
    )
    language: str = Field(
        "en",
        json_schema_extra={"example": "en"},
    )

    @field_validator("message")
    @classmethod
    def validate_message_not_empty(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Message cannot be empty or blank")
        return clean

    @field_validator("language")
    @classmethod
    def validate_language(cls, v: str) -> str:
        clean = v.lower().strip()[:2]
        if clean in SUPPORTED_CHAT_LANGUAGES:
            return clean
        return "en"


class ChatResponse(BaseModel):
    """Chatbot response payload schema."""

    response: str = Field(
        ...,
        json_schema_extra={"example": "Your current balance is ₹4,200.00."},
    )
    language: str = Field("en", json_schema_extra={"example": "en"})
    intent: str = Field(
        ...,
        json_schema_extra={"example": "BALANCE"},
    )

