from pydantic import BaseModel, Field, ConfigDict


class TranscriptionResponse(BaseModel):
    """Pydantic model for speech-to-text transcription response."""

    text: str = Field(..., description="Transcribed text from speech audio.")
    language: str = Field("en", description="Language of transcribed audio.")

    model_config = ConfigDict(from_attributes=True)


class SynthesisRequest(BaseModel):
    """Pydantic model for text-to-speech synthesis request."""

    text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Text content to synthesize to audio.",
    )
    language: str = Field(
        "en",
        description="Target spoken language code ('en' for English, 'hi' for Hindi).",
    )
