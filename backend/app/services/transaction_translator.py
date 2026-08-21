import json
import re
from typing import Optional
from fastapi import HTTPException, status
from openai import OpenAI

from app.core.config import get_settings
from app.schemas.translator_schema import TranslateResponse

settings = get_settings()


class TransactionTranslatorService:
    """Service handling natural language financial SMS & transaction explanation using OpenAI and fallback parsing."""

    @staticmethod
    def explain_transaction(
        text: str, language: Optional[str] = "en"
    ) -> TranslateResponse:
        """Translate cryptic transaction text into voice-first accessible explanation."""
        clean_text = text.strip() if text else ""
        if not clean_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction text cannot be empty",
            )

        if len(clean_text) > 1000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transaction text exceeds maximum allowed length of 1000 characters",
            )

        # Normalize target language code
        target_lang = (language or "en").lower().strip()
        if target_lang in ["hi", "hindi"]:
            target_lang = "hi"
        else:
            target_lang = "en"

        # Attempt OpenAI extraction if API key configured
        if settings.OPENAI_API_KEY:
            try:
                ai_response = TransactionTranslatorService._call_openai(
                    clean_text, target_lang
                )
                if ai_response:
                    return ai_response
            except Exception:
                # Graceful fallback on API errors, rate limits, or network timeouts
                pass

        # Fallback to deterministic rule-based parser
        return TransactionTranslatorService._rule_based_fallback(
            clean_text, target_lang
        )

    @staticmethod
    def _call_openai(
        text: str, target_lang: str
    ) -> Optional[TranslateResponse]:
        """Call OpenAI API to extract structured fields and plain-language explanation."""
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        system_instruction = (
            "You are Sahayak's financial SMS transaction translator. Your job is to extract "
            "transaction metadata and explain cryptic bank SMS alerts in simple, accessible, "
            "voice-first plain language for elderly and low-literacy users in India.\n"
            "Rules:\n"
            "1. Do NOT invent transaction details (amount, last 4 digits, merchant) if they are missing from the message.\n"
            "2. If target language is 'hi', output summary and plain_language in clear, simple Hindi (or Hinglish suitable for text-to-speech).\n"
            "3. Return ONLY valid JSON matching this schema:\n"
            "{\n"
            '  "summary": "string",\n'
            '  "amount": float or null,\n'
            '  "transaction_type": "debit" or "credit" or "unknown",\n'
            '  "merchant": "string or null",\n'
            '  "account_last4": "string of 4 digits or null",\n'
            '  "plain_language": "string",\n'
            '  "language": "en" or "hi"\n'
            "}"
        )

        user_prompt = f"SMS Message: '{text}'\nTarget Language: '{target_lang}'"

        completion = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=300,
        )

        content = completion.choices[0].message.content
        if not content:
            return None

        data = json.loads(content)
        return TranslateResponse(
            summary=data.get("summary", "Transaction processed"),
            amount=data.get("amount"),
            transaction_type=data.get("transaction_type", "debit"),
            merchant=data.get("merchant"),
            account_last4=data.get("account_last4"),
            plain_language=data.get("plain_language", data.get("summary", "")),
            language=target_lang,
        )

    @staticmethod
    def _rule_based_fallback(
        text: str, target_lang: str
    ) -> TranslateResponse:
        """Deterministic rule-based parser for transaction text when AI service is unavailable."""
        lower_text = text.lower()

        # 1. Extract Amount
        amount: Optional[float] = None
        amount_match = re.search(
            r"(?:inr|rs\.?|₹)\s*([\d,]+(?:\.\d{1,2})?)", text, re.IGNORECASE
        )
        if not amount_match:
            amount_match = re.search(
                r"([\d,]+(?:\.\d{1,2})?)\s*(?:debited|credited|paid)", text, re.IGNORECASE
            )
        if amount_match:
            try:
                raw_amt = amount_match.group(1).replace(",", "")
                amount = float(raw_amt)
            except ValueError:
                amount = None

        # 2. Transaction Type
        if any(w in lower_text for w in ["credited", "credit", "received", "deposited"]):
            tx_type = "credit"
        elif any(w in lower_text for w in ["debited", "debit", "paid", "spent", "withdrawn"]):
            tx_type = "debit"
        else:
            tx_type = "debit"

        # 3. Account Last 4
        account_last4: Optional[str] = None
        acct_match = re.search(
            r"(?:a/c|acct|account|card)\s*(?:xx|\*|x)*(\d{4})", text, re.IGNORECASE
        )
        if acct_match:
            account_last4 = acct_match.group(1)

        # 4. Merchant / Recipient
        merchant: Optional[str] = None
        merch_match = re.search(
            r"(?:at|to|via|from)\s+([A-Za-z0-9\s_\-\.]+?)(?:\s+on|\s+ref|\s+bal|\s+avl|\.|$|\bupi\b)",
            text,
            re.IGNORECASE,
        )
        if merch_match:
            m_str = merch_match.group(1).strip()
            # Filter out numeric sequences or short words
            if m_str and not m_str.isdigit() and len(m_str) > 1:
                merchant = m_str

        # 5. Construct Plain Language Explanations
        amt_display = f"₹{amount:,.2f}" if amount is not None else "An amount"
        amt_display_plain = f"₹{amount:,.2f}" if amount is not None else "An unspecified amount"

        if target_lang == "hi":
            amt_hi = f"₹{amount:,.2f}" if amount is not None else "Ek rashi"
            acc_hi = f" (aakhri 4 digits {account_last4})" if account_last4 else ""
            merch_hi = f" {merchant} par" if merchant else ""

            if tx_type == "credit":
                summary = f"{amt_hi} aapke bank khate mein jama kiye gaye hain."
                plain_lang = f"{amt_hi} aapke khate{acc_hi} mein credit hue hain."
            else:
                summary = f"{amt_hi} aapke bank khate se kaate gaye hain."
                plain_lang = f"{amt_hi} aapke khate{acc_hi} se{merch_hi} debit hue hain."
        else:
            acc_en = f" ending in {account_last4}" if account_last4 else ""
            merch_en = f" at {merchant}" if merchant else ""

            if tx_type == "credit":
                summary = f"{amt_display} was credited to your bank account."
                plain_lang = f"{amt_display_plain} was credited to your account{acc_en}{merch_en}."
            else:
                summary = f"{amt_display} was deducted from your bank account."
                plain_lang = f"{amt_display_plain} was deducted from your account{acc_en}{merch_en}."

        return TranslateResponse(
            summary=summary,
            amount=amount,
            transaction_type=tx_type,
            merchant=merchant,
            account_last4=account_last4,
            plain_language=plain_lang,
            language=target_lang,
        )
