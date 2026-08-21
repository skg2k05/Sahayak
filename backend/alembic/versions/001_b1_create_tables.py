"""Create Phase B1 database tables

Revision ID: 001_b1_create_tables
Revises: 
Create Date: 2026-08-21 20:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_b1_create_tables"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("preferred_language", sa.String(length=20), server_default="hi-IN", nullable=False),
        sa.Column("accessibility_settings", sa.JSON(), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_phone"), "users", ["phone"], unique=True)

    # 2. accounts
    op.create_table(
        "accounts",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("account_number", sa.String(length=50), nullable=False),
        sa.Column("account_type", sa.String(length=50), nullable=False),
        sa.Column("bank_name", sa.String(length=100), nullable=False),
        sa.Column("balance", sa.Numeric(precision=12, scale=2), server_default="0.00", nullable=False),
        sa.Column("currency", sa.String(length=10), server_default="INR", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_accounts_user_id"), "accounts", ["user_id"], unique=False)
    op.create_index(op.f("ix_accounts_account_number"), "accounts", ["account_number"], unique=True)

    # 3. payees
    op.create_table(
        "payees",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("upi_id", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("bank_name", sa.String(length=100), nullable=True),
        sa.Column("account_number", sa.String(length=50), nullable=True),
        sa.Column("is_trusted", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_payees_user_id"), "payees", ["user_id"], unique=False)
    op.create_index(op.f("ix_payees_upi_id"), "payees", ["upi_id"], unique=False)
    op.create_index(op.f("ix_payees_phone"), "payees", ["phone"], unique=False)

    # 4. transactions
    op.create_table(
        "transactions",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("account_id", sa.UUID(as_uuid=True), sa.ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("payee_id", sa.UUID(as_uuid=True), sa.ForeignKey("payees.id", ondelete="SET NULL"), nullable=True),
        sa.Column("transaction_type", sa.String(length=50), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("currency", sa.String(length=10), server_default="INR", nullable=False),
        sa.Column("status", sa.String(length=50), server_default="PENDING", nullable=False),
        sa.Column("reference", sa.String(length=100), nullable=True),
        sa.Column("description", sa.String(length=550), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_transactions_account_id"), "transactions", ["account_id"], unique=False)
    op.create_index(op.f("ix_transactions_payee_id"), "transactions", ["payee_id"], unique=False)
    op.create_index(op.f("ix_transactions_reference"), "transactions", ["reference"], unique=False)

    # 5. sms_translations
    op.create_table(
        "sms_translations",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("original_message", sa.Text(), nullable=False),
        sa.Column("translated_message", sa.Text(), nullable=False),
        sa.Column("detected_language", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_sms_translations_user_id"), "sms_translations", ["user_id"], unique=False)

    # 6. audit_logs
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("resource_type", sa.String(length=100), nullable=True),
        sa.Column("resource_id", sa.String(length=255), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_audit_logs_user_id"), "audit_logs", ["user_id"], unique=False)

    # 7. feature_flags
    op.create_table(
        "feature_flags",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("enabled", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_feature_flags_name"), "feature_flags", ["name"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_feature_flags_name"), table_name="feature_flags")
    op.drop_table("feature_flags")

    op.drop_index(op.f("ix_audit_logs_user_id"), table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_index(op.f("ix_sms_translations_user_id"), table_name="sms_translations")
    op.drop_table("sms_translations")

    op.drop_index(op.f("ix_transactions_reference"), table_name="transactions")
    op.drop_index(op.f("ix_transactions_payee_id"), table_name="transactions")
    op.drop_index(op.f("ix_transactions_account_id"), table_name="transactions")
    op.drop_table("transactions")

    op.drop_index(op.f("ix_payees_phone"), table_name="payees")
    op.drop_index(op.f("ix_payees_upi_id"), table_name="payees")
    op.drop_index(op.f("ix_payees_user_id"), table_name="payees")
    op.drop_table("payees")

    op.drop_index(op.f("ix_accounts_account_number"), table_name="accounts")
    op.drop_index(op.f("ix_accounts_user_id"), table_name="accounts")
    op.drop_table("accounts")

    op.drop_index(op.f("ix_users_phone"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
