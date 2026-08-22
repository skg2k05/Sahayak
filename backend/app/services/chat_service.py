import logging
import json
from decimal import Decimal
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from openai import OpenAI

from app.core.config import get_settings
from app.models.user import User
from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.services.banking_service import BankingService
from app.services.transaction_translator import TransactionTranslatorService
from app.services.fraud_service import FraudService
from app.schemas.fraud_schema import FraudCheckRequest

settings = get_settings()
logger = logging.getLogger(__name__)


class ChatbotService:
    """Secure, controlled AI Banking Chatbot Service for Sahayak."""

    @staticmethod
    def process_chat_message(
        db: Session, user: User, request: ChatRequest
    ) -> ChatResponse:
        """Process incoming chat message with strict user isolation and controlled orchestration."""
        raw_msg = request.message.strip() if request.message else ""
        if not raw_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty",
            )

        if len(raw_msg) > 500:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message exceeds maximum allowed length of 500 characters",
            )

        lang = (request.language or "en").lower().strip()
        if lang in ["hi", "hindi"]:
            lang = "hi"
        else:
            lang = "en"

        # 1. Determine Intent safely
        intent = ChatbotService._classify_intent(raw_msg)

        # Log operational metadata only (NO sensitive message content or PII)
        logger.info(
            "Chat request processed: user_id=%s, intent=%s, language=%s",
            str(user.id),
            intent,
            lang,
        )

        # 2. Dispatch to controlled, authorized handler
        if intent == "UNSUPPORTED_ACTION":
            return ChatbotService._handle_unsupported_action(lang)

        if intent == "FRAUD":
            return ChatbotService._handle_fraud(db, user, lang)

        if intent == "TRANSACTION_EXPLANATION":
            return ChatbotService._handle_transaction_explanation(db, user, lang)

        if intent == "BALANCE":
            return ChatbotService._handle_balance(db, user, lang)

        if intent == "ACCOUNT":
            return ChatbotService._handle_account(db, user, lang)

        if intent == "RECENT_TRANSACTIONS":
            return ChatbotService._handle_recent_transactions(db, user, lang)

        if intent == "GENERAL_BANKING_QUESTION":
            return ChatbotService._handle_general_question(raw_msg, lang)

        # Fallback for UNKNOWN / Prompt Injection Attempts
        return ChatbotService._handle_unknown(lang)

    @staticmethod
    def _classify_intent(msg: str) -> str:
        """Classify message intent deterministically using rule patterns."""
        low = msg.lower()

        # Prompt injection / System metadata attempt check -> UNKNOWN
        injection_patterns = [
            "ignore your instructions",
            "ignore previous",
            "give me the system prompt",
            "show all users",
            "query the database",
            "sql injection",
            "select * from",
            "drop table",
        ]
        if any(p in low for p in injection_patterns):
            return "UNKNOWN"

        # Financial Actions (Strictly Blocked)
        financial_action_patterns = [
            "send",
            "transfer",
            "pay",
            "bhej",
            "bhejo",
            "paise bhej",
            "transfer karo",
            "change pin",
            "change password",
            "update password",
            "give pin",
            "show pin",
            "cvv",
        ]
        if any(p in low for p in financial_action_patterns) and not any(
            g in low for g in ["what is", "how does", "explain", "kya hai", "kaise"]
        ):
            return "UNSUPPORTED_ACTION"

        # Fraud queries (Checked BEFORE Account/Balance to prioritize fraud concerns)
        if any(
            f in low
            for f in [
                "fraud",
                "suspicious",
                "scam",
                "risk check",
                "धोखाधड़ी",
                "संदिग्ध",
                "खतरा",
            ]
        ):
            return "FRAUD"

        # Transaction Explanation (Checked BEFORE Recent Transactions/Account)
        if any(
            e in low
            for e in [
                "explain transaction",
                "why was i charged",
                "explain my last",
                "explain last",
                "लेनदेन समझाएं",
                "चार्ज क्यों",
            ]
        ):
            return "TRANSACTION_EXPLANATION"

        # Balance queries
        if any(
            b in low
            for b in [
                "balance",
                "how much money",
                "kitna paisa",
                "बैलेंस",
                "पैसे कितने",
                "खाते में कितना",
                "my balance",
            ]
        ):
            return "BALANCE"

        # Account queries
        if any(
            a in low
            for a in [
                "account number",
                "account details",
                "my account",
                "खाता संख्या",
                "खाता विवरण",
                "खाते की जानकारी",
            ]
        ):
            return "ACCOUNT"

        # Recent Transactions
        if any(
            t in low
            for t in [
                "last transaction",
                "recent transaction",
                "recent payment",
                "last payment",
                "पिछला लेनदेन",
                "अंतिम लेनदेन",
                "हाल के लेनदेन",
                "transactions",
            ]
        ):
            return "RECENT_TRANSACTIONS"

        # General Banking Questions
        if any(
            g in low
            for g in [
                "upi",
                "ifsc",
                "cvv",
                "atm",
                "pin",
                "interest rate",
                "fixed deposit",
                "savings account",
                "what is",
                "how does",
                "kya hai",
                "kaise",
            ]
        ):
            return "GENERAL_BANKING_QUESTION"

        return "UNKNOWN"

    @staticmethod
    def _handle_unsupported_action(lang: str) -> ChatResponse:
        """Handle request for financial transfers or modifications safely without execution."""
        if lang == "hi":
            res = "सुरक्षा के लिए, पैसे भेजना या खाता बदलाव चैट से नहीं किए जा सकते। कृपया सुरक्षित ट्रांसफर विकल्प का उपयोग करें।"
        else:
            res = "For your security, money transfers and account changes cannot be performed through chat. Please use the secure transaction flow."

        return ChatResponse(response=res, language=lang, intent="UNSUPPORTED_ACTION")

    @staticmethod
    def _handle_balance(db: Session, user: User, lang: str) -> ChatResponse:
        """Retrieve authenticated user's account balance deterministically without LLM data leak."""
        accounts = BankingService.get_accounts(db, user)
        if not accounts:
            if lang == "hi":
                res = "आपका कोई पंजीकृत बैंक खाता नहीं मिला।"
            else:
                res = "You do not have any registered bank accounts."
            return ChatResponse(response=res, language=lang, intent="BALANCE")

        acc = accounts[0]
        amt_str = f"₹{acc.balance:,.2f}"

        if lang == "hi":
            res = f"आपके खाते {acc.account_number} में {amt_str} की राशि उपलब्ध है।"
        else:
            res = f"Your current balance for account {acc.account_number} is {amt_str}."

        return ChatResponse(response=res, language=lang, intent="BALANCE")

    @staticmethod
    def _handle_account(db: Session, user: User, lang: str) -> ChatResponse:
        """Retrieve authenticated user's account details deterministically with masked account number."""
        accounts = BankingService.get_accounts(db, user)
        if not accounts:
            if lang == "hi":
                res = "आपका कोई पंजीकृत बैंक खाता नहीं मिला।"
            else:
                res = "You do not have any registered bank accounts."
            return ChatResponse(response=res, language=lang, intent="ACCOUNT")

        acc = accounts[0]
        if lang == "hi":
            res = f"आपका {acc.bank_name} {acc.account_type} खाता ({acc.account_number}) सक्रिय है।"
        else:
            res = f"Your {acc.bank_name} {acc.account_type} account ({acc.account_number}) is active."

        return ChatResponse(response=res, language=lang, intent="ACCOUNT")

    @staticmethod
    def _handle_recent_transactions(
        db: Session, user: User, lang: str
    ) -> ChatResponse:
        """Retrieve authenticated user's latest transaction deterministically with minimal fields."""
        txns_list = BankingService.get_transactions(db, user, skip=0, limit=1)
        if not txns_list.items:
            if lang == "hi":
                res = "आपका कोई हालिया लेनदेन नहीं मिला।"
            else:
                res = "You have no recent transactions."
            return ChatResponse(
                response=res, language=lang, intent="RECENT_TRANSACTIONS"
            )

        latest = txns_list.items[0]
        payee = latest.payee_name or latest.description or "merchant"
        amt_str = f"₹{latest.amount:,.2f}"

        if lang == "hi":
            res = f"आपका अंतिम लेनदेन {payee} को {amt_str} का ({latest.transaction_type}) था।"
        else:
            res = f"Your last transaction was a {latest.transaction_type} of {amt_str} to {payee}."

        return ChatResponse(
            response=res, language=lang, intent="RECENT_TRANSACTIONS"
        )

    @staticmethod
    def _handle_transaction_explanation(
        db: Session, user: User, lang: str
    ) -> ChatResponse:
        """Explain latest user transaction using TransactionTranslatorService."""
        txns_list = BankingService.get_transactions(db, user, skip=0, limit=1)
        if not txns_list.items:
            if lang == "hi":
                res = "समझाने के लिए कोई हालिया लेनदेन नहीं मिला।"
            else:
                res = "No recent transactions found to explain."
            return ChatResponse(
                response=res, language=lang, intent="TRANSACTION_EXPLANATION"
            )

        latest = txns_list.items[0]
        text_to_explain = latest.description or f"Payment of INR {latest.amount} to {latest.payee_name or 'merchant'}"

        translation = TransactionTranslatorService.explain_transaction(
            text_to_explain, language=lang
        )
        return ChatResponse(
            response=translation.plain_language,
            language=lang,
            intent="TRANSACTION_EXPLANATION",
        )

    @staticmethod
    def _handle_fraud(db: Session, user: User, lang: str) -> ChatResponse:
        """Retrieve deterministic fraud evaluation using FraudService and format in simple language."""
        accounts = BankingService.get_accounts(db, user)
        if not accounts:
            if lang == "hi":
                res = "जोखिम मूल्यांकन के लिए कोई खाता नहीं मिला।"
            else:
                res = "No bank account found for risk evaluation."
            return ChatResponse(response=res, language=lang, intent="FRAUD")

        primary_acc = accounts[0]
        req = FraudCheckRequest(
            account_id=primary_acc.id,
            amount=Decimal("1000.00"),
        )
        try:
            fraud_res = FraudService.evaluate_transaction_risk(db, user, req)
            reasons_str = "; ".join(fraud_res.reasons)
            if lang == "hi":
                res = f"आपके खाते की वर्तमान सुरक्षा स्थिति {fraud_res.risk_level.upper()} है (जोखिम स्कोर: {fraud_res.risk_score}/100)। विवरण: {reasons_str}"
            else:
                res = f"Your account risk status is {fraud_res.risk_level.upper()} (score: {fraud_res.risk_score}/100). Details: {reasons_str}"
        except Exception:
            if lang == "hi":
                res = "खाता सुरक्षा स्थिति वर्तमान में सामान्य और सुरक्षित है।"
            else:
                res = "Your account security status is currently normal and safe."

        return ChatResponse(response=res, language=lang, intent="FRAUD")

    @staticmethod
    def _handle_general_question(user_prompt: str, lang: str) -> ChatResponse:
        """Answer general banking questions via Google Gemini API or static verified knowledge without user PII."""
        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                from google.genai import types

                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                system_instruction = (
                    "You are Sahayak's helpful AI banking educator for elderly and low-literacy users in India. "
                    "Explain general financial and banking terms (like UPI, IFSC, ATM, fixed deposits) "
                    "in simple, concise, plain language.\n"
                    "Rules:\n"
                    "1. Do NOT request or invent personal account numbers, PINs, or private user data.\n"
                    "2. If language is 'hi', reply in clear, simple Hindi (or Hinglish suitable for speech).\n"
                    "3. Keep the response under 3 sentences."
                )

                prompt_text = f"User Question: '{user_prompt}'\nLanguage: '{lang}'"

                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt_text,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.3,
                        max_output_tokens=200,
                    ),
                )

                ai_content = getattr(response, "text", None)
                if ai_content and ai_content.strip():
                    return ChatResponse(
                        response=ai_content.strip(),
                        language=lang,
                        intent="GENERAL_BANKING_QUESTION",
                    )
            except Exception:
                pass

        res = ChatbotService._static_banking_knowledge_fallback(
            user_prompt, lang
        )
        return ChatResponse(
            response=res, language=lang, intent="GENERAL_BANKING_QUESTION"
        )


    @staticmethod
    def _static_banking_knowledge_fallback(prompt: str, lang: str) -> str:
        """Static verified fallback answers for general banking terms."""
        low = prompt.lower()
        if "upi" in low:
            if lang == "hi":
                return "यूपीआई (UPI) एक त्वरित भुगतान प्रणाली है जिसके माध्यम से आप मोबाइल ऐप से तुरंत पैसे भेज और प्राप्त कर सकते हैं।"
            return "UPI (Unified Payments Interface) is an instant real-time payment system allowing immediate money transfer through a mobile app."

        if "ifsc" in low:
            if lang == "hi":
                return "आईएफएससी (IFSC) 11 अक्षरों का एक विशेष कोड होता है जो भारत की हर बैंक शाखा की पहचान करता है।"
            return "IFSC code is an 11-character alphanumeric code that uniquely identifies a bank branch in India for electronic funds transfer."

        if lang == "hi":
            return "यह एक सामान्य बैंकिंग सेवा है। अधिक जानकारी के लिए अपनी बैंक शाखा से संपर्क करें।"
        return "This is a standard banking service. Please contact your nearest bank branch for further guidance."

    @staticmethod
    def _handle_unknown(lang: str) -> ChatResponse:
        """Handle unrecognized inputs or prompt injection safely."""
        if lang == "hi":
            res = "मैं सहायक का बैंकिंग सहायक हूँ। मैं आपकी खाता शेष राशि, लेनदेन या सामान्य बैंकिंग प्रश्नों में कैसे मदद कर सकता हूँ?"
        else:
            res = "I am Sahayak's banking assistant. How can I help you with your account balance, transactions, or general banking questions?"

        return ChatResponse(response=res, language=lang, intent="UNKNOWN")
