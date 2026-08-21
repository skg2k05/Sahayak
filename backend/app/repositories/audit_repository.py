from typing import Optional, Dict, Any
import uuid
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

SENSITIVE_KEYS = {
    "password",
    "password_hash",
    "token",
    "access_token",
    "refresh_token",
    "secret",
    "authorization",
}


def _sanitize_metadata(metadata: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Sanitize metadata dictionary by stripping sensitive keys."""
    if not metadata:
        return {}
    return {
        k: "[REDACTED]" if k.lower() in SENSITIVE_KEYS else v
        for k, v in metadata.items()
    }


class AuditRepository:
    """Repository pattern implementation for AuditLog entity data access."""

    @staticmethod
    def create_audit_log(
        db: Session,
        action: str,
        user_id: Optional[uuid.UUID] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        metadata_json: Optional[Dict[str, Any]] = None,
    ) -> AuditLog:
        """Create and persist an AuditLog entry."""
        sanitized_meta = _sanitize_metadata(metadata_json)
        audit_entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=sanitized_meta,
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        return audit_entry
