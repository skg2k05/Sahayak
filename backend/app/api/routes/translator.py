from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.translator_schema import TranslateRequest, TranslateResponse
from app.services.transaction_translator import TransactionTranslatorService

router = APIRouter(prefix="/api/translator", tags=["Translator"])


@router.post(
    "/explain",
    response_model=TranslateResponse,
    summary="Explain cryptic transaction SMS in plain voice-first language",
    description="Parses a financial SMS message into structured metadata and accessible plain-language explanation.",
)
def explain_transaction(
    payload: TranslateRequest,
    current_user: User = Depends(get_current_user),
):
    """Translate banking SMS into voice-first plain language explanation."""
    return TransactionTranslatorService.explain_transaction(
        payload.text, payload.language
    )
