from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    """Health check endpoint to verify API operational status."""
    return {
        "status": "ok",
        "service": "sahayak-api",
    }
