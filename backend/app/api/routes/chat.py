from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.services.chat_service import ChatbotService

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])


@router.post(
    "",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Secure AI Banking Chatbot",
    description=(
        "Process natural language user chat queries with controlled intent classification, "
        "strict user isolation, zero PII data minimization, and safe fallback responses."
    ),
)
def process_chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatResponse:
    """Process user banking chat request."""
    return ChatbotService.process_chat_message(db, current_user, request)
