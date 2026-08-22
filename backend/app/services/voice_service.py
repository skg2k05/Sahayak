import io
import os
import tempfile
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, UploadFile, status
from gtts import gTTS
from openai import OpenAI

from app.core.config import get_settings
from app.schemas.voice_schema import TranscriptionResponse, SynthesisRequest

settings = get_settings()

import re

ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".webm", ".aac", ".flac"}
SUPPORTED_TTS_LANGUAGES = {"en", "hi", "kn", "ta", "te", "mr", "bn"}


def normalize_text_for_speech(text: str, lang: str = "en") -> str:
    """Normalize masked account numbers (XXXXXX4237 / •••• 4237) into natural spoken phrases."""
    if not text:
        return ""

    normalized = text.strip()
    lang_code = (lang or "en").lower().strip()[:2]

    def _account_replacer(match):
        digits = " ".join(match.group(1))
        if lang_code == "hi":
            return f"{digits} पर समाप्त होने वाला खाता"
        elif lang_code == "kn":
            return f"{digits} ರಲ್ಲಿ ಕೊನೆಗೊಳ್ಳುವ ಖಾತೆ"
        elif lang_code == "ta":
            return f"{digits} இல் முடிவடையும் கணக்கு"
        elif lang_code == "te":
            return f"{digits} తో ముగిసే ఖాతా"
        elif lang_code == "mr":
            return f"{digits} शेवटी असलेले खाते"
        elif lang_code == "bn":
            return f"{digits} দিয়ে শেষ হওয়া অ্যাকাউন্ট"
        else:
            return f"account ending in {digits}"

    return re.sub(r"(?:X{3,}|x{3,}|•{3,}|[*]{3,})\s*(\d{4})", _account_replacer, normalized)


class VoiceService:
    """Service encapsulating speech-to-text (Whisper) and text-to-speech (gTTS) operations."""

    @staticmethod
    def transcribe_audio(
        file: UploadFile, language: Optional[str] = None
    ) -> TranscriptionResponse:
        """Transcribe uploaded voice audio to text using Whisper."""
        if not file or not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No audio file uploaded",
            )

        # 1. Validate file extension
        suffix = Path(file.filename).suffix.lower()
        if suffix not in ALLOWED_AUDIO_EXTENSIONS:
            allowed_list = ", ".join(ext.lstrip(".") for ext in sorted(ALLOWED_AUDIO_EXTENSIONS))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported audio format '{suffix}'. Allowed formats: {allowed_list}",
            )

        # 2. Read and validate content size
        content = file.file.read()
        if not content or len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded audio file is empty",
            )

        if len(content) > settings.MAX_AUDIO_SIZE_BYTES:
            max_mb = settings.MAX_AUDIO_SIZE_BYTES // (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Audio file size exceeds maximum limit of {max_mb} MB",
            )

        # 3. Check OpenAI configuration
        if not settings.OPENAI_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Voice transcription service is unconfigured (missing OPENAI_API_KEY)",
            )

        # 4. Safe temporary audio file handling
        temp_file = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
        temp_path = temp_file.name
        try:
            temp_file.write(content)
            temp_file.flush()
            temp_file.close()

            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            target_lang = language[:2].lower() if language and language[:2].lower() in SUPPORTED_TTS_LANGUAGES else None

            with open(temp_path, "rb") as audio_fh:
                transcription = client.audio.transcriptions.create(
                    model=settings.WHISPER_MODEL,
                    file=audio_fh,
                    language=target_lang,
                )

            transcript_text = getattr(transcription, "text", str(transcription)).strip()
            return TranscriptionResponse(
                text=transcript_text,
                language=language or "en",
            )
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Whisper transcription failed: {str(exc)}",
            )
        finally:
            # Guaranteed cleanup of temporary audio file
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except OSError:
                    pass

    @staticmethod
    def synthesize_speech(request: SynthesisRequest) -> bytes:
        """Synthesize text into speech audio bytes using gTTS with speech normalization."""
        clean_text = request.text.strip() if request.text else ""
        if not clean_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text to synthesize cannot be empty",
            )

        # Normalize and validate language
        raw_lang = request.language.lower().strip() if request.language else "en"
        lang_code = raw_lang[:2]
        if lang_code not in SUPPORTED_TTS_LANGUAGES:
            supported_str = ", ".join(sorted(SUPPORTED_TTS_LANGUAGES))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported language '{request.language}'. Supported languages: {supported_str}",
            )

        # Apply speech normalization to convert masked accounts to natural spoken text
        speech_text = normalize_text_for_speech(clean_text, lang_code)


        try:
            tts = gTTS(text=speech_text, lang=lang_code, slow=False)
            buffer = io.BytesIO()
            tts.write_to_fp(buffer)
            buffer.seek(0)
            return buffer.read()
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Text-to-speech synthesis failed: {str(exc)}",
            )

