from typing import Optional
from fastapi import APIRouter, Depends, File, Form, Response, UploadFile
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.voice_schema import TranscriptionResponse, SynthesisRequest
from app.services.voice_service import VoiceService

router = APIRouter(prefix="/api/voice", tags=["Voice"])


@router.post(
    "/transcribe",
    response_model=TranscriptionResponse,
    summary="Transcribe uploaded audio file to text",
    description="Transcribes speech audio into text using OpenAI Whisper. Requires supported audio format (<=10MB).",
)
def transcribe_audio(
    file: UploadFile = File(..., description="Audio file to transcribe"),
    language: Optional[str] = Form(None, description="Optional spoken language code ('en', 'hi')"),
    current_user: User = Depends(get_current_user),
):
    """Transcribe speech audio into text."""
    return VoiceService.transcribe_audio(file, language)


@router.post(
    "/synthesize",
    summary="Synthesize text to speech audio",
    description="Synthesizes plain text into spoken MP3 audio stream using gTTS.",
    responses={
        200: {
            "content": {"audio/mpeg": {}},
            "description": "Returns synthesized MP3 audio stream.",
        }
    },
)
def synthesize_speech(
    payload: SynthesisRequest,
    current_user: User = Depends(get_current_user),
):
    """Synthesize text into MP3 audio stream."""
    audio_bytes = VoiceService.synthesize_speech(payload)
    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": "inline; filename=speech.mp3",
        },
    )
