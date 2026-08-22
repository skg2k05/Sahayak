import io
import os
from unittest.mock import MagicMock, patch
import pytest
from app.models.user import User
from app.core.security import hash_password, create_access_token


@pytest.fixture
def auth_header(db_session):
    """Fixture providing an Authorization header with a valid JWT for an active user."""
    user = User(
        full_name="Savita Sharma",
        email="savita.voice@example.com",
        phone="9876543288",
        password_hash=hash_password("Password123!"),
        preferred_language="hi-IN",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


# ==========================================
# Transcription Tests (Speech -> Text / Whisper)
# ==========================================

def test_unauthenticated_transcribe_rejected(client):
    """Unauthenticated request to /api/voice/transcribe must return 401."""
    files = {"file": ("test.mp3", b"fake audio content", "audio/mpeg")}
    response = client.post("/api/voice/transcribe", files=files)
    assert response.status_code == 401


@patch("app.services.voice_service.OpenAI")
def test_authenticated_transcribe_success(mock_openai_cls, client, auth_header):
    """Authenticated user uploads valid audio and receives transcribed text."""
    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client

    mock_transcription = MagicMock()
    mock_transcription.text = "Please explain my last transaction"
    mock_client.audio.transcriptions.create.return_value = mock_transcription

    with patch("app.services.voice_service.settings.OPENAI_API_KEY", "mock-sk-12345"):
        audio_data = b"MOCK_AUDIO_BINARY_STREAM"
        files = {"file": ("audio_sample.mp3", audio_data, "audio/mpeg")}
        data = {"language": "en"}
        response = client.post("/api/voice/transcribe", files=files, data=data, headers=auth_header)
        assert response.status_code == 200
        payload = response.json()
        assert payload["text"] == "Please explain my last transaction"
        assert payload["language"] == "en"


def test_transcribe_empty_audio_rejected(client, auth_header):
    """Uploading an empty audio file must return 400 Bad Request."""
    files = {"file": ("empty.mp3", b"", "audio/mpeg")}
    response = client.post("/api/voice/transcribe", files=files, headers=auth_header)
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_transcribe_unsupported_format_rejected(client, auth_header):
    """Uploading an unsupported file format (.txt, .exe) must return 400 Bad Request."""
    files = {"file": ("notes.txt", b"some text content", "text/plain")}
    response = client.post("/api/voice/transcribe", files=files, headers=auth_header)
    assert response.status_code == 400
    assert "unsupported" in response.json()["detail"].lower()


def test_transcribe_oversized_audio_rejected(client, auth_header):
    """Uploading audio exceeding size limit must return 400 Bad Request."""
    oversized_data = b"X" * (11 * 1024 * 1024)  # 11MB > 10MB limit
    files = {"file": ("large.mp3", oversized_data, "audio/mpeg")}
    response = client.post("/api/voice/transcribe", files=files, headers=auth_header)
    assert response.status_code == 400
    assert "exceeds maximum limit" in response.json()["detail"].lower()


def test_transcribe_missing_openai_key_handled(client, auth_header):
    """Missing OPENAI_API_KEY returns 503 Service Unavailable."""
    with patch("app.services.voice_service.settings.OPENAI_API_KEY", None):
        files = {"file": ("sample.wav", b"valid audio bytes", "audio/wav")}
        response = client.post("/api/voice/transcribe", files=files, headers=auth_header)
        assert response.status_code == 503
        assert "unconfigured" in response.json()["detail"].lower()


@patch("app.services.voice_service.OpenAI")
def test_transcribe_whisper_failure_handled(mock_openai_cls, client, auth_header):
    """Whisper API error returns 502 Bad Gateway without crashing."""
    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.audio.transcriptions.create.side_effect = Exception("Whisper API connection error")

    with patch("app.services.voice_service.settings.OPENAI_API_KEY", "mock-sk-12345"):
        files = {"file": ("sample.m4a", b"valid audio bytes", "audio/m4a")}
        response = client.post("/api/voice/transcribe", files=files, headers=auth_header)
        assert response.status_code == 502
        assert "whisper transcription failed" in response.json()["detail"].lower()


@patch("app.services.voice_service.OpenAI")
def test_transcribe_temporary_file_cleaned_up(mock_openai_cls, client, auth_header):
    """Verify temporary audio files are removed even when transcription finishes or errors."""
    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client

    created_paths = []
    real_named_temp = __import__("tempfile").NamedTemporaryFile

    def capture_temp(*args, **kwargs):
        tf = real_named_temp(*args, **kwargs)
        created_paths.append(tf.name)
        return tf

    with patch("tempfile.NamedTemporaryFile", side_effect=capture_temp):
        with patch("app.services.voice_service.settings.OPENAI_API_KEY", "mock-sk-12345"):
            mock_transcription = MagicMock()
            mock_transcription.text = "Testing cleanup"
            mock_client.audio.transcriptions.create.return_value = mock_transcription

            files = {"file": ("sample.ogg", b"audio bytes", "audio/ogg")}
            response = client.post("/api/voice/transcribe", files=files, headers=auth_header)
            assert response.status_code == 200

            # Ensure all temporary files were cleaned up
            for path in created_paths:
                assert not os.path.exists(path)


# ==========================================
# Synthesis Tests (Text -> Speech / gTTS)
# ==========================================

def test_unauthenticated_synthesize_rejected(client):
    """Unauthenticated request to /api/voice/synthesize must return 401."""
    payload = {"text": "Hello world", "language": "en"}
    response = client.post("/api/voice/synthesize", json=payload)
    assert response.status_code == 401


@patch("app.services.voice_service.gTTS")
def test_authenticated_synthesize_success(mock_gtts_cls, client, auth_header):
    """Authenticated request returns MP3 audio stream with audio/mpeg media type."""
    mock_tts = MagicMock()
    mock_gtts_cls.return_value = mock_tts

    def mock_write(fp):
        fp.write(b"MOCK_MP3_STREAM_BYTES")

    mock_tts.write_to_fp.side_effect = mock_write

    payload = {
        "text": "Your account balance is ₹4,200.",
        "language": "en",
    }
    response = client.post("/api/voice/synthesize", json=payload, headers=auth_header)
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/mpeg"
    assert response.content == b"MOCK_MP3_STREAM_BYTES"


@patch("app.services.voice_service.gTTS")
def test_synthesize_hindi_success(mock_gtts_cls, client, auth_header):
    """Synthesizing with language 'hi' passes 'hi' to gTTS."""
    mock_tts = MagicMock()
    mock_gtts_cls.return_value = mock_tts

    def mock_write(fp):
        fp.write(b"MOCK_HINDI_MP3_BYTES")

    mock_tts.write_to_fp.side_effect = mock_write

    payload = {
        "text": "Aapke account mein 4200 rupaye bache hain.",
        "language": "hi",
    }
    response = client.post("/api/voice/synthesize", json=payload, headers=auth_header)
    assert response.status_code == 200
    assert response.headers["content-type"] == "audio/mpeg"
    mock_gtts_cls.assert_called_with(text="Aapke account mein 4200 rupaye bache hain.", lang="hi", slow=False)


def test_synthesize_unsupported_language_rejected(client, auth_header):
    """Unsupported language returns 400 Bad Request."""
    payload = {
        "text": "Bonjour tout le monde",
        "language": "fr",
    }
    response = client.post("/api/voice/synthesize", json=payload, headers=auth_header)
    assert response.status_code == 400
    assert "unsupported language" in response.json()["detail"].lower()


def test_synthesize_empty_text_rejected(client, auth_header):
    """Empty or whitespace-only text returns 400 or 422."""
    response1 = client.post("/api/voice/synthesize", json={"text": "", "language": "en"}, headers=auth_header)
    assert response1.status_code in [400, 422]

    response2 = client.post("/api/voice/synthesize", json={"text": "   ", "language": "en"}, headers=auth_header)
    assert response2.status_code in [400, 422]


@patch("app.services.voice_service.gTTS")
def test_synthesize_gtts_failure_handled(mock_gtts_cls, client, auth_header):
    """gTTS exception returns 502 Bad Gateway without crashing."""
    mock_tts = MagicMock()
    mock_gtts_cls.return_value = mock_tts
    mock_tts.write_to_fp.side_effect = Exception("gTTS network failure")

    payload = {
        "text": "Testing failure handling",
        "language": "en",
    }
    response = client.post("/api/voice/synthesize", json=payload, headers=auth_header)
    assert response.status_code == 502
    assert "text-to-speech synthesis failed" in response.json()["detail"].lower()


@patch("app.services.voice_service.gTTS")
def test_synthesize_speech_normalization_masked_account(mock_gtts_cls, client, auth_header):
    """Verify masked account numbers (XXXXXX4237) are normalized into natural speech before gTTS."""
    mock_tts = MagicMock()
    mock_gtts_cls.return_value = mock_tts

    def mock_write(fp):
        fp.write(b"AUDIO")

    mock_tts.write_to_fp.side_effect = mock_write

    # Test English
    payload_en = {"text": "Your account XXXXXX4237 balance is active.", "language": "en"}
    res_en = client.post("/api/voice/synthesize", json=payload_en, headers=auth_header)
    assert res_en.status_code == 200
    mock_gtts_cls.assert_called_with(text="Your account account ending in 4 2 3 7 balance is active.", lang="en", slow=False)

    # Test Hindi
    payload_hi = {"text": "आपका खाता XXXXXX4237 सक्रिय है।", "language": "hi"}
    res_hi = client.post("/api/voice/synthesize", json=payload_hi, headers=auth_header)
    assert res_hi.status_code == 200
    mock_gtts_cls.assert_called_with(text="आपका खाता 4 2 3 7 पर समाप्त होने वाला खाता सक्रिय है।", lang="hi", slow=False)

