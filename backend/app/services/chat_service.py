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

        lang_raw = (request.language or "en").lower().strip()
        if lang_raw in ["hi", "hindi"]:
            lang = "hi"
        elif lang_raw in ["kn", "kannada"]:
            lang = "kn"
        elif lang_raw in ["ta", "tamil"]:
            lang = "ta"
        elif lang_raw in ["te", "telugu"]:
            lang = "te"
        elif lang_raw in ["mr", "marathi"]:
            lang = "mr"
        elif lang_raw in ["bn", "bengali"]:
            lang = "bn"
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
        messages = {
            "hi": "सुरक्षा के लिए, पैसे भेजना या खाता बदलाव चैट से नहीं किए जा सकते। कृपया सुरक्षित ट्रांसफर विकल्प का उपयोग करें।",
            "kn": "ಸುರಕ್ಷತೆಗಾಗಿ, ಹಣ ಕಳುಹಿಸುವುದು ಅಥವಾ ಖಾತೆ ಬದಲಾವಣೆಗಳನ್ನು ಚಾಟ್ ಮೂಲಕ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಸುರಕ್ಷಿತ ವರ್ಗಾವಣೆ ಆಯ್ಕೆಯನ್ನು ಬಳಸಿ.",
            "ta": "பாதுகாப்பிற்காக, பணப் பரிமாற்றம் அல்லது கணக்கு மாற்றங்களை சாட் மூலம் செய்ய முடியாது. தயவுசெய்து பாதுகாப்பான பரிமாற்ற விருப்பத்தைப் பயன்படுத்தவும்.",
            "te": "భద్రత కొరకు, డబ్బు పంపడం లేదా ఖాతా మార్పులు చాట్ ద్వారా చేయలేము. దయచేసి సురక్షిత ట్రాన్స్‌ఫర్ ఎంపಿಕను ఉపయోగించండి.",
            "mr": "सुरक्षेसाठी, पैसे पाठवणे किंवा खात्यातील बदल चॅटद्वारे केले जाऊ शकत नाहीत. कृपया सुरक्षित ट्रान्सफर पर्यायाचा वापर करा.",
            "bn": "সুরক্ষার জন্য, অর্থ পাঠানো বা অ্যাকাউন্ট পরিবর্তন চ্যাটের মাধ্যমে করা যাবে না। অনুগ্রহ করে সুরক্ষিত স্থানান্তরের বিকল্প ব্যবহার করুন।",
        }
        res = messages.get(lang, "For your security, money transfers and account changes cannot be performed through chat. Please use the secure transaction flow.")
        return ChatResponse(response=res, language=lang, intent="UNSUPPORTED_ACTION")

    @staticmethod
    def _handle_balance(db: Session, user: User, lang: str) -> ChatResponse:
        """Retrieve authenticated user's account balance deterministically without LLM data leak."""
        accounts = BankingService.get_accounts(db, user)
        if not accounts:
            no_acc = {
                "hi": "आपका कोई पंजीकृत बैंक खाता नहीं मिला।",
                "kn": "ನಿಮ್ಮ ಯಾವುದೇ ನೋಂದಾಯಿತ ಬ್ಯಾಂಕ್ ಖಾತೆ ಕಂಡುಬಂದಿಲ್ಲ.",
                "ta": "உங்கள் பதிவுசெய்யப்பட்ட வங்கி கணக்கு எதுவும் காணப்படவில்லை.",
                "te": "మీ రిజిస్టర్డ్ బ్యాంక్ ఖాతా ఏదీ కనుగొనబడలేదు.",
                "mr": "तुमचे कोणतेही नोंदणीकृत बँक खाते आढळले नाही.",
                "bn": "আপনার কোনও নিবন্ধিত ব্যাঙ্ক অ্যাকাউন্ট পাওয়া যায়নি।",
            }
            res = no_acc.get(lang, "You do not have any registered bank accounts.")
            return ChatResponse(response=res, language=lang, intent="BALANCE")

        acc = accounts[0]
        amt_str = f"₹{acc.balance:,.2f}"

        bal_msgs = {
            "hi": f"आपके खाते {acc.account_number} में {amt_str} की राशि उपलब्ध है।",
            "kn": f"ನಿಮ್ಮ ಖಾತೆ {acc.account_number} ನಲ್ಲಿ {amt_str} ಲಭ್ಯವಿದೆ.",
            "ta": f"உங்கள் கணக்கு {acc.account_number} இல் {amt_str} இருப்பு உள்ளது.",
            "te": f"మీ ఖాతా {acc.account_number} లో {amt_str} అందుబాటులో ఉంది.",
            "mr": f"तुमच्या खात्यात {acc.account_number} मध्ये {amt_str} शिल्लक आहे.",
            "bn": f"আপনার অ্যাকাউন্ট {acc.account_number} এ {amt_str} ব্যালেন্স রয়েছে।",
        }
        res = bal_msgs.get(lang, f"Your current balance for account {acc.account_number} is {amt_str}.")
        return ChatResponse(response=res, language=lang, intent="BALANCE")

    @staticmethod
    def _handle_account(db: Session, user: User, lang: str) -> ChatResponse:
        """Retrieve authenticated user's account details deterministically with masked account number."""
        accounts = BankingService.get_accounts(db, user)
        if not accounts:
            no_acc = {
                "hi": "आपका कोई पंजीकृत बैंक खाता नहीं मिला।",
                "kn": "ನಿಮ್ಮ ಯಾವುದೇ ನೋಂದಾಯಿತ ಬ್ಯಾಂಕ್ ಖಾತೆ ಕಂಡುಬಂದಿಲ್ಲ.",
                "ta": "உங்கள் பதிவுசெய்யப்பட்ட வங்கி கணக்கு எதுவும் காணப்படவில்லை.",
                "te": "మీ రిజిస్టర్డ్ బ్యాంక్ ఖాతా ఏదీ కనుగొనబడలేదు.",
                "mr": "तुमचे कोणतेही नोंदणीकृत बँक खाते आढळले नाही.",
                "bn": "আপনার কোনও নিবন্ধিত ব্যাঙ্ক অ্যাকাউন্ট পাওয়া যায়নি।",
            }
            res = no_acc.get(lang, "You do not have any registered bank accounts.")
            return ChatResponse(response=res, language=lang, intent="ACCOUNT")

        acc = accounts[0]
        acc_msgs = {
            "hi": f"आपका {acc.bank_name} {acc.account_type} खाता ({acc.account_number}) सक्रिय है।",
            "kn": f"ನಿಮ್ಮ {acc.bank_name} {acc.account_type} ಖಾತೆ ({acc.account_number}) ಸಕ್ರಿಯವಾಗಿದೆ.",
            "ta": f"உங்கள் {acc.bank_name} {acc.account_type} கணக்கு ({acc.account_number}) செயலில் உள்ளது.",
            "te": f"మీ {acc.bank_name} {acc.account_type} ఖాతా ({acc.account_number}) క్రియాశీలంగా ఉంది.",
            "mr": f"तुमचे {acc.bank_name} {acc.account_type} खाते ({acc.account_number}) सक्रिय आहे.",
            "bn": f"আপনার {acc.bank_name} {acc.account_type} অ্যাকাউন্ট ({acc.account_number}) সক্রিয় রয়েছে।",
        }
        res = acc_msgs.get(lang, f"Your {acc.bank_name} {acc.account_type} account ({acc.account_number}) is active.")
        return ChatResponse(response=res, language=lang, intent="ACCOUNT")

    @staticmethod
    def _handle_recent_transactions(
        db: Session, user: User, lang: str
    ) -> ChatResponse:
        """Retrieve authenticated user's latest transaction deterministically with minimal fields."""
        txns_list = BankingService.get_transactions(db, user, skip=0, limit=1)
        if not txns_list.items:
            no_txn = {
                "hi": "आपका कोई हालिया लेनदेन नहीं मिला।",
                "kn": "ನಿಮ್ಮ ಯಾವುದೇ ಇತ್ತೀಚಿನ ವಹಿವಾಟು ಕಂಡುಬಂದಿಲ್ಲ.",
                "ta": "உங்கள் சமீபத்திய பரிவர்த்தனைகள் எதுவும் காணப்படவில்லை.",
                "te": "మీ ఇటీవల లావాదేవీలు ఏవీ కనుగొనబడలేదు.",
                "mr": "तुमचे कोणतेही अलीकडील व्यवहार आढळले नाहीत.",
                "bn": "আপনার কোনও সাম্প্রতিক লেনদেন পাওয়া যায়নি।",
            }
            res = no_txn.get(lang, "You have no recent transactions.")
            return ChatResponse(
                response=res, language=lang, intent="RECENT_TRANSACTIONS"
            )

        latest = txns_list.items[0]
        payee = latest.payee_name or latest.description or "merchant"
        amt_str = f"₹{latest.amount:,.2f}"

        txn_msgs = {
            "hi": f"आपका अंतिम लेनदेन {payee} को {amt_str} का ({latest.transaction_type}) था।",
            "kn": f"ನಿಮ್ಮ ಕೊನೆಯ ವಹಿವಾಟು {payee} ಗೆ {amt_str} ({latest.transaction_type}) ಆಗಿತ್ತು.",
            "ta": f"உங்கள் கடைசி பரிவர்த்தனை {payee} க்கு {amt_str} ({latest.transaction_type}) ஆகும்.",
            "te": f"మీ చివరి లావాదేవీ {payee} కి {amt_str} ({latest.transaction_type}) ఐంది.",
            "mr": f"तुमचा शेवटचा व्यवहार {payee} ला {amt_str} चा ({latest.transaction_type}) होता.",
            "bn": f"আপনার শেষ লেনদেন ছিল {payee} কে {amt_str} এর ({latest.transaction_type})।",
        }
        res = txn_msgs.get(lang, f"Your last transaction was a {latest.transaction_type} of {amt_str} to {payee}.")
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
            no_txn = {
                "hi": "समझाने के लिए कोई हालिया लेनदेन नहीं मिला।",
                "kn": "ವಿವರಿಸಲು ಯಾವುದೇ ಇತ್ತೀಚಿನ ವಹಿವಾಟು ಕಂಡುಬಂದಿಲ್ಲ.",
                "ta": "விளக்குவதற்கு சமீபத்திய பரிவர்த்தனைகள் எதுவும் இல்லை.",
                "te": "వివరించడానికి ఇటీవల లావాదేవీలు ఏవీ లేవు.",
                "mr": "स्पष्ट करण्यासाठी कोणताही अलीकडील व्यवहार आढळला नाही.",
                "bn": "ব্যাখ্যা করার জন্য কোনও সাম্প্রতিক লেনদেন পাওয়া যায়নি।",
            }
            res = no_txn.get(lang, "No recent transactions found to explain.")
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
            fraud_msgs = {
                "hi": f"आपके खाते की वर्तमान सुरक्षा स्थिति {fraud_res.risk_level.upper()} है (जोखिम स्कोर: {fraud_res.risk_score}/100)। विवरण: {reasons_str}",
                "kn": f"ನಿಮ್ಮ ಖಾತೆಯ ಸುರಕ್ಷತಾ ಸ್ಥಿತಿ {fraud_res.risk_level.upper()} ಆಗಿದೆ (ಅಪಾಯದ ಅಂಕ: {fraud_res.risk_score}/100). ವಿವರಗಳು: {reasons_str}",
                "ta": f"உங்கள் கணக்கின் பாதுகாப்பு நிலை {fraud_res.risk_level.upper()} ஆகும் (அபாய நிலை: {fraud_res.risk_score}/100). விவரங்கள்: {reasons_str}",
                "te": f"మీ ఖాతా భద్రతా స్థితి {fraud_res.risk_level.upper()} గా ఉంది (రిస్క్ స్కోర్: {fraud_res.risk_score}/100). వివరాలు: {reasons_str}",
                "mr": f"तुमच्या खात्याची सुरक्षा स्थिती {fraud_res.risk_level.upper()} आहे (जोखीम स्कोर: {fraud_res.risk_score}/100). तपशील: {reasons_str}",
                "bn": f"আপনার অ্যাকাউন্টের সুরক্ষা স্থিতি হল {fraud_res.risk_level.upper()} (ঝুঁকির স্কোর: {fraud_res.risk_score}/100)। বিবরণ: {reasons_str}",
            }
            res = fraud_msgs.get(lang, f"Your account risk status is {fraud_res.risk_level.upper()} (score: {fraud_res.risk_score}/100). Details: {reasons_str}")
        except Exception:
            safe_msgs = {
                "hi": "खाता सुरक्षा स्थिति वर्तमान में सामान्य और सुरक्षित है।",
                "kn": "ಖಾತೆಯ ಸುರಕ್ಷತಾ ಸ್ಥಿತಿ ಪ್ರಸ್ತುತ ಸಾಮಾನ್ಯವಾಗಿದೆ ಮತ್ತು ಸುರಕ್ಷಿತವಾಗಿದೆ.",
                "ta": "கணக்கு பாதுகாப்பு நிலை தற்போது இயல்பாகவும் பாதுகாப்பாகவும் உள்ளது.",
                "te": "ఖాతా భద్రతా స్థితి ప్రస్తుతం సాధారణంగా మరియు సురక్షితంగా ఉంది.",
                "mr": "खात्याची सुरक्षा स्थिती सध्या सामान्य आणि सुरक्षित आहे.",
                "bn": "অ্যাকাউন্টের সুরক্ষা স্থিতি বর্তমানে স্বাভাবিক এবং নিরাপদ।",
            }
            res = safe_msgs.get(lang, "Your account security status is currently normal and safe.")

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
                    "2. ALWAYS reply in the exact requested language using its proper native script:\n"
                    "   - 'hi': Hindi in Devanagari script (हिंदी)\n"
                    "   - 'kn': Kannada script (ಕನ್ನಡ)\n"
                    "   - 'ta': Tamil script (தமிழ்)\n"
                    "   - 'te': Telugu script (తెలుగు)\n"
                    "   - 'mr': Marathi in Devanagari script (मराठी)\n"
                    "   - 'bn': Bengali script (বাংলা)\n"
                    "   - 'en': Simple English\n"
                    "3. Do NOT use Latin/English script transliteration (Hinglish/Tanglish) for Indian languages.\n"
                    "4. Keep the response under 3 concise sentences."
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
        """Static verified fallback answers for general banking terms in native scripts."""
        low = prompt.lower()
        if "upi" in low:
            upi_msgs = {
                "hi": "यूपीआई (UPI) एक त्वरित भुगतान प्रणाली है जिसके माध्यम से आप मोबाइल ऐप से तुरंत पैसे भेज और प्राप्त कर सकते हैं।",
                "kn": "ಯುಪಿಐ (UPI) ಎನ್ನುವುದು ತತ್ಕ್ಷಣದ ಪಾವತಿ ವ್ಯವಸ್ಥೆಯಾಗಿದ್ದು, ಮೊಬೈಲ್ ಅಪ್ಲಿಕೇಶನ್ ಮೂಲಕ ತಕ್ಷಣ ಹಣ ರವಾನಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
                "ta": "யுபிஐ (UPI) என்பது உடனடி பணப் பரிவர்த்தனை அமைப்பாகும், இதன் மூலம் மொபைல் செயலி வழியாக உடனுக்குடன் பணம் அனுப்பலாம்.",
                "te": "యుపిఐ (UPI) అనేది తక్షణ చెల్లింపు వ్యవస్థ, ಇದರ ద్వారా మొబైల్ యాప్ నుండి వెంటనే డబ్బు పంపవచ్చు.",
                "mr": "युपीआय (UPI) ही एक झटपट पेमेंट प्रणाली आहे ज्याद्वारे तुम्ही मोबाईल ॲपवरून त्वरित पैसे पाठवू शकता.",
                "bn": "ইউপিআই (UPI) হল একটি তাৎক্ষণিক অর্থ প্রদান ব্যবস্থা যার মাধ্যমে আপনি মোবাইল অ্যাপ থেকে সাথে সাথে টাকা পাঠাতে পারেন।",
            }
            return upi_msgs.get(lang, "UPI (Unified Payments Interface) is an instant real-time payment system allowing immediate money transfer through a mobile app.")

        if "ifsc" in low:
            ifsc_msgs = {
                "hi": "आईएफएससी (IFSC) 11 अक्षरों का एक विशेष कोड होता है जो भारत की हर बैंक शाखा की पहचान करता है।",
                "kn": "ಐಎಫ್‌ಎಸ್‌ಸಿ (IFSC) ಎನ್ನುವುದು ಭಾರತದ ಪ್ರತಿ ಬ್ಯಾಂಕ್ ಶಾಖೆಯನ್ನು ಗುರುತಿಸುವ 11 ಅಕ್ಷರಗಳ ವಿಶೇಷ ಕೋಡ್ ಆಗಿದೆ.",
                "ta": "ஐஎஃப்எஸ்சி (IFSC) என்பது இந்தியாவில் உள்ள ஒவ்வொரு வங்கி கிளையையும் தனித்துவமாக அடையாளம் காணும் 11 எழுத்து குறியீடாகும்.",
                "te": "ఐఎఫ్‌ఎస్‌సి (IFSC) అనేది భారతదేశంలోని ప్రతి బ్యాంక్ శాఖను గుర్తించే 11 అక్షరాల ప్రత్యేక కోడ్.",
                "mr": "आयएफएससी (IFSC) हा ११ अक्षरांचा एक विशेष कोड असतो जो भारतातील प्रत्येक बँक शाखेची ओळख पटवतो.",
                "bn": "আইএফএসসি (IFSC) হল ১১টি অক্ষরের একটি বিশেষ কোড যা ভারতের প্রতিটি ব্যাঙ্ক শাখা চিহ্নিত করে।",
            }
            return ifsc_msgs.get(lang, "IFSC code is an 11-character alphanumeric code that uniquely identifies a bank branch in India for electronic funds transfer.")

        default_msgs = {
            "hi": "यह एक सामान्य बैंकिंग सेवा है। अधिक जानकारी के लिए अपनी बैंक शाखा से संपर्क करें।",
            "kn": "ಇದು ಸಾಮಾನ್ಯ ಬ್ಯಾಂಕಿಂಗ್ ಸೇವೆಯಾಗಿದೆ. ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಶಾಖೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",
            "ta": "இது ஒரு பொதுவான வங்கி சேவையாகும். கூடுதல் தகவலுக்கு உங்கள் வங்கி கிளையைத் தொடர்பு கொள்ளவும்.",
            "te": "ఇది సాధారణ బ్యాంకింగ్ సేవ. మరింత సమాచారం కోసం మీ బ్యాంక్ శాఖను సంప్రదించండి.",
            "mr": "ही एक सामान्य बँकिंग सेवा आहे. अधिक माहितीसाठी तुमच्या बँक शाखेशी संपर्क साधा.",
            "bn": "এটি একটি সাধারণ ব্যাঙ্কিং পরিষেবা। বিস্তারিত তথ্যের জন্য আপনার নিকটস্থ ব্যাঙ্ক শাখায় যোগাযোগ করুন।",
        }
        return default_msgs.get(lang, "This is a standard banking service. Please contact your nearest bank branch for further guidance.")

    @staticmethod
    def _handle_unknown(lang: str) -> ChatResponse:
        """Handle unrecognized inputs or prompt injection safely."""
        unknown_msgs = {
            "hi": "मैं सहायक का बैंकिंग सहायक हूँ। मैं आपकी खाता शेष राशि, लेनदेन या सामान्य बैंकिंग प्रश्नों में कैसे मदद कर सकता हूँ?",
            "kn": "ನಾನು ಸಹಾಯಕ್‌ನ ಬ್ಯಾಂಕಿಂಗ್ ಸಹಾಯಕ. ನಿಮ್ಮ ಖಾತೆಯ ಬ್ಯಾಲೆನ್ಸ್, ವಹಿವಾಟುಗಳು ಅಥವಾ ಬ್ಯಾಂಕಿಂಗ್ ಪ್ರಶ್ನೆಗಳಿಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
            "ta": "நான் சஹாயக்கின் வங்கி உதவியாளர். உங்கள் கணக்கு இருப்பு, பரிவர்த்தனைகள் அல்லது வங்கி கேள்விகளுக்கு நான் எவ்வாறு உதவ முடியும்?",
            "te": "నేను సహాయక్ బ్యాంకింగ్ సహాయకుడిని. మీ ఖాతా బ్యాలెన్స్, లావాదేవీలు లేదా బ్యాంకింగ్ ప్రశ్నలలో నేను ఎలా సహాయపడగలను?",
            "mr": "मी सहाय्यकचा बँकिंग सहाय्यक आहे. मी तुमच्या खात्यातील शिल्लक, व्यवहार किंवा सामान्य बँकिंग प्रश्नांमध्ये कशी मदत करू शकतो?",
            "bn": "আমি সহায়কের ব্যাঙ্কিং সহকারী। আমি কীভাবে আপনার অ্যাকাউন্টের ব্যালেন্স, লেনদেন বা ব্যাঙ্কিং প্রশ্নে সাহায্য করতে পারি?",
        }
        res = unknown_msgs.get(lang, "I am Sahayak's banking assistant. How can I help you with your account balance, transactions, or general banking questions?")
        return ChatResponse(response=res, language=lang, intent="UNKNOWN")

