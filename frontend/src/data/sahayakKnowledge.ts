export type KnowledgeEntry = {
  id: string;
  category: 'general' | 'banking' | 'voice' | 'howto' | 'elderly' | 'transactions' | 'fraud' | 'security' | 'accessibility' | 'process';
  keywords: string[];
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
};

export const SAHAYAK_KNOWLEDGE: KnowledgeEntry[] = [
  // 1. GENERAL SAHAYAK
  {
    id: 'gen-1',
    category: 'general',
    keywords: ['what is sahayak', 'about sahayak', 'who is sahayak', 'meaning', 'app'],
    questionEn: 'What is Sahayak?',
    questionHi: 'सहायक क्या है?',
    answerEn: 'Sahayak is a voice-first digital banking assistant designed to make everyday banking simpler and more accessible. You can use normal banking features while also getting voice guidance, plain-language transaction explanations, Hindi support, and safety information.',
    answerHi: 'सहायक एक वॉच-फर्स्ट डिजिटल बैंकिंग असिस्टेंट है जिसे दैनिक बैंकिंग को सरल और सुलभ बनाने के लिए डिज़ाइन किया गया है। आप आवाज़ के निर्देशों, हिंदी सहायता और सरल भाषा में लेनदेन की व्याख्या के साथ बैंकिंग कर सकते हैं।',
  },
  {
    id: 'gen-2',
    category: 'general',
    keywords: ['what can sahayak do', 'features', 'capabilities', 'functions'],
    questionEn: 'What can Sahayak do?',
    questionHi: 'सहायक क्या कर सकता है?',
    answerEn: 'Sahayak helps you check account balances, send money via UPI, manage payees, view transaction history, translate confusing bank SMS into plain language, read details aloud, and check transactions for fraud risk.',
    answerHi: 'सहायक आपको बैंक बैलेंस चेक करने, पैसे भेजने, लाभार्थी जोड़ने, ट्रांजैक्शन हिस्ट्री देखने, बैंक एसएमएस का सरल भाषा में अनुवाद करने और धोखाधड़ी से सुरक्षा जांच में मदद करता है।',
  },
  {
    id: 'gen-3',
    category: 'general',
    keywords: ['who is sahayak for', 'elderly', 'senior citizens', 'low digital literacy'],
    questionEn: 'Who is Sahayak for?',
    questionHi: 'सहायक किसके लिए है?',
    answerEn: 'Sahayak is built for everyone, but especially for elderly users, people with limited digital literacy, users who prefer speaking instead of typing, and anyone more comfortable using Hindi or voice guidance.',
    answerHi: 'सहायक सभी के लिए बनाया गया है, विशेष रूप से वरिष्ठ नागरिकों, कम डिजिटल साक्षरता वाले लोगों और उन लोगों के लिए जो टाइप करने के बजाय बोलकर हिंदी में काम करना पसंद करते हैं।',
  },
  {
    id: 'gen-4',
    category: 'general',
    keywords: ['why different', 'differentiator', 'normal banking app'],
    questionEn: 'Why is Sahayak different from normal banking apps?',
    questionHi: 'सहायक अन्य बैंकिंग ऐप से अलग क्यों है?',
    answerEn: 'Unlike standard banking apps with tiny fonts and complex financial jargon, Sahayak provides large readable typography, persistent voice assistance, live text captions, plain-language explanations, and safety checks before confirming payments.',
    answerHi: 'पारंपरिक ऐप्स के विपरीत, सहायक में बड़े स्पष्ट अक्षर, लगातार वॉइस गाइडेंस, लाइव टेक्स्ट कैप्शंस, सरल भाषा और भुगतान से पहले स्पष्ट सुरक्षा जांच दी जाती है।',
  },
  {
    id: 'gen-5',
    category: 'general',
    keywords: ['easy for elderly', 'senior citizen easy', 'old people'],
    questionEn: 'Is Sahayak easy for elderly people?',
    questionHi: 'क्या सहायक बुजुर्गों के लिए आसान है?',
    answerEn: 'Yes. Sahayak is specifically designed to make banking easier. You can speak naturally, view large clear captions, hear answers read aloud, and change font size or contrast anytime.',
    answerHi: 'हाँ! सहायक को बुजुर्गों के लिए बेहद सरल बनाया गया है। आप आसानी से अपनी भाषा में बोल सकते हैं, बड़े शब्द देख सकते हैं और उत्तरों को बोलकर सुन सकते हैं।',
  },

  // 2. BANKING & ACCOUNTS
  {
    id: 'bank-1',
    category: 'banking',
    keywords: ['check balance', 'account balance', 'how much money', 'paisa'],
    questionEn: 'How do I check my balance?',
    questionHi: 'मैं अपना बैलेंस कैसे चेक करूँ?',
    answerEn: 'To check your balance: 1. Sign in to your account. 2. Open the Dashboard. 3. Your total available balance is displayed on the primary card. You can also tap the mic and say "Check my balance".',
    answerHi: 'बैलेंस चेक करने के लिए: 1. लॉगिन करें। 2. डैशबोर्ड खोलें। 3. आपका कुल बैलेंस कार्ड पर दिखाई देगा। आप माइक दबाकर "मेरा बैलेंस बताओ" भी बोल सकते हैं।',
  },
  {
    id: 'bank-2',
    category: 'banking',
    keywords: ['send money', 'pay money', 'transfer', 'bhejo'],
    questionEn: 'How do I send money?',
    questionHi: 'पैसे कैसे भेजें?',
    answerEn: 'To send money: 1. Click Send Money. 2. Select a saved payee or enter a UPI ID. 3. Enter the amount. 4. Review the transaction and AI risk score. 5. Tap Confirm Payment.',
    answerHi: 'पैसे भेजने के लिए: 1. "Send Money" पर क्लिक करें। 2. लाभार्थी या UPI ID चुनें। 3. राशि दर्ज करें। 4. सुरक्षा स्कोर और विवरण देखें। 5. "Confirm" दबाएं।',
  },
  {
    id: 'bank-[#3]',
    category: 'banking',
    keywords: ['receive money', 'qr code', 'upi id'],
    questionEn: 'How do I receive money?',
    questionHi: 'पैसे कैसे प्राप्त करें?',
    answerEn: 'On the Dashboard, tap "Receive Money" to display your personalized UPI QR Code and UPI ID. Others can scan this QR code using PhonePe, Google Pay, or Paytm to pay you.',
    answerHi: 'डैशबोर्ड पर "Receive Money" पर क्लिक करें। आपका UPI QR कोड और UPI ID दिखेगा, जिसे स्कैन करके कोई भी आपको पैसे भेज सकता है।',
  },
  {
    id: 'bank-4',
    category: 'banking',
    keywords: ['payee', 'add payee', 'beneficiary', 'contact'],
    questionEn: 'What is a payee and how do I add one?',
    questionHi: 'लाभार्थी (Payee) क्या है और इसे कैसे जोड़ें?',
    answerEn: 'A payee is a saved contact you send money to regularly. Go to the Payees page and click "Add New Payee" to save their full name and UPI ID for quick voice transfers.',
    answerHi: 'लाभार्थी वह व्यक्ति है जिसे आप अक्सर पैसे भेजते हैं। Payees पेज पर जाकर "Add New Payee" दबाएं और उनका नाम और UPI ID सहेजें।',
  },

  // 3. VOICE & CAPTIONS
  {
    id: 'voice-1',
    category: 'voice',
    keywords: ['voice banking', 'how to use voice', 'speak'],
    questionEn: 'How does voice banking work?',
    questionHi: 'वॉइस बैंकिंग कैसे काम करती है?',
    answerEn: 'Tap the glowing assistant orb at the bottom right. Speak your request (e.g., "Send ₹500 to Rahul"). Sahayak transcribes your speech, shows text captions, displays a confirmation screen, and can read the result aloud.',
    answerHi: 'नीचे दाएं कोने में दिए गए और पर क्लिक करें और बोलें (जैसे "राहुल को 500 रुपये भेजो")। सहायक आपकी बात सुनकर टेक्स्ट कैप्शंस दिखाएगा और पुष्टि के बाद काम करेगा।',
  },
  {
    id: 'voice-2',
    category: 'voice',
    keywords: ['captions', 'text captions', 'see what heard'],
    questionEn: 'Does Sahayak show text captions for voice?',
    questionHi: 'क्या सहायक आवाज़ के साथ टेक्स्ट भी दिखाता है?',
    answerEn: 'Yes! Every voice interaction always displays real-time live text captions. You never have to rely on audio alone.',
    answerHi: 'हाँ! हर वॉइस कमांड के साथ स्क्रीन पर लाइव टेक्स्ट कैप्शंस दिखाई देते हैं, ताकि आपको सिर्फ सुनने पर निर्भर न रहना पड़े।',
  },
  {
    id: 'voice-3',
    category: 'voice',
    keywords: ['read aloud', 'speech synthesis', 'listen answer'],
    questionEn: 'Can Sahayak read answers aloud?',
    questionHi: 'क्या सहायक उत्तर बोलकर सुना सकता है?',
    answerEn: 'Yes. Whenever Sahayak explains a transaction or confirms a payment, tap the "🔊 Read Aloud" button to hear the explanation in English or Hindi.',
    answerHi: 'हाँ! जब भी सहायक किसी ट्रांजैक्शन की व्याख्या करता है, "🔊 Read Aloud" बटन दबाकर आप उत्तर हिंदी या अंग्रेजी में सुन सकते हैं।',
  },

  // 4. TRANSACTION TRANSLATOR
  {
    id: 'trans-1',
    category: 'transactions',
    keywords: ['explain transaction', 'bank sms', 'sms translator', 'meaning of sms'],
    questionEn: 'How does the Transaction Translator work?',
    questionHi: 'ट्रांजैक्शन ट्रांसलेटर कैसे काम करता है?',
    answerEn: 'Copy and paste any confusing bank SMS (e.g., "UPI txn debited...") into the SMS Translator page. Sahayak converts technical jargon into plain language explaining the amount, merchant, and account.',
    answerHi: 'बैंक का कोई भी जटिल मैसेज ट्रांसलेटर में पेस्ट करें। सहायक उसे सरल भाषा में समझाएगा कि कितने पैसे, किस दुकान पर और किस खाते से कटे हैं।',
  },
  {
    id: 'trans-2',
    category: 'transactions',
    keywords: ['debit', 'credit', 'meaning of debit credit'],
    questionEn: 'What is the difference between Debit and Credit?',
    questionHi: 'डेबिट (Debit) और क्रेडिट (Credit) में क्या अंतर है?',
    answerEn: 'Debit (-) means money was deducted or spent from your bank account. Credit (+) means money was deposited or received into your account.',
    answerHi: 'डेबिट (-) का अर्थ है आपके बैंक खाते से पैसे कटे या खर्च हुए। क्रेडिट (+) का अर्थ है आपके खाते में पैसे आए।',
  },

  // 5. FRAUD & SAFETY
  {
    id: 'fraud-1',
    category: 'fraud',
    keywords: ['fraud detection', 'safe payment', 'risk score', 'suspicious'],
    questionEn: 'How does Sahayak detect suspicious transactions?',
    questionHi: 'सहायक संदिग्ध ट्रांजैक्शन की पहचान कैसे करता है?',
    answerEn: 'Before executing a payment, Sahayak evaluates factors like large amounts, rapid transactions, and untrusted payees (`POST /api/fraud/check`). It displays clear risk badges (Low, Medium, High warning) with human reasons.',
    answerHi: 'भुगतान से पहले सहायक राशि, नए पते और बार-बार होने वाले भुगतानों की जांच करता है और सरल भाषा में रिस्क स्कोर (Low, Medium, High) दिखाता है।',
  },
  {
    id: 'fraud-2',
    category: 'fraud',
    keywords: ['high risk', 'warning', 'medium risk'],
    questionEn: 'What does a High Risk warning mean?',
    questionHi: 'हाई रिस्क (High Risk) चेतावनी का क्या मतलब है?',
    answerEn: 'High Risk means the payment exhibits unusual activity, such as a large balance depletion or an unverified payee. Sahayak asks you to verify the recipient carefully before continuing.',
    answerHi: 'हाई रिस्क का मतलब है कि यह पेमेंट असामान्य लग रहा है। सहायक आपको सलाह देता है कि आगे बढ़ने से पहले पाने वाले का नाम और विवरण ध्यान से जांचें।',
  },

  // 6. SECURITY
  {
    id: 'sec-1',
    category: 'security',
    keywords: ['is sahayak secure', 'safe', 'protection', 'jwt', 'privacy'],
    questionEn: 'Is Sahayak secure?',
    questionHi: 'क्या सहायक सुरक्षित है?',
    answerEn: 'Yes. Sahayak uses JWT authentication, password hashing, Redis rate-limiting, and strict database isolation so users can only access their own banking data.',
    answerHi: 'हाँ! सहायक में JWT एन्क्रिप्शन, पासवर्ड हैशिंग और सख्त सुरक्षा नियम हैं, जिससे केवल आप ही अपना डेटा देख सकते हैं।',
  },

  // 7. ACCESSIBILITY & HINDI
  {
    id: 'acc-1',
    category: 'accessibility',
    keywords: ['use hindi', 'hindi support', 'language change'],
    questionEn: 'Can I use Sahayak in Hindi?',
    questionHi: 'क्या मैं सहायक का उपयोग हिंदी में कर सकता हूँ?',
    answerEn: 'Yes! Toggle the language switch at the top to "हिंदी". Sahayak will respond in Hindi for voice explanations, translator summaries, and text guidance.',
    answerHi: 'हाँ! सबसे ऊपर दिए गए "हिंदी" बटन को दबाएं। सहायक आपको हिंदी में उत्तर, ट्रांजैक्शन विवरण और आवाज़ की सुविधा देगा।',
  },
  {
    id: 'acc-2',
    category: 'accessibility',
    keywords: ['large text', 'increase text font', 'contrast'],
    questionEn: 'How do I increase text size or enable high contrast?',
    questionHi: 'अक्षरों का आकार बड़ा या हाई कॉन्ट्रास्ट कैसे करें?',
    answerEn: 'Tap the Accessibility button (Sliders icon) in the navbar to open the controls. You can toggle Larger Text, High Contrast mode, and Reduce Motion.',
    answerHi: 'नेविगेशन बार में दिए गए एक्सेसिबिलिटी बटन (Sliders आइकन) पर क्लिक करें। वहां से आप अक्षरों का आकार बढ़ा सकते हैं और हाई कॉन्ट्रास्ट चालू कर सकते हैं।',
  },
];

export function findKnowledgeAnswer(query: string, language: string = 'en'): string | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  // Search keyword matches
  let bestMatch: KnowledgeEntry | null = null;
  let maxMatchCount = 0;

  for (const entry of SAHAYAK_KNOWLEDGE) {
    let matches = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw.toLowerCase())) {
        matches += kw.length;
      }
    }
    if (matches > maxMatchCount) {
      maxMatchCount = matches;
      bestMatch = entry;
    }
  }

  if (bestMatch && maxMatchCount > 2) {
    return language.toLowerCase().slice(0, 2) === 'hi' ? bestMatch.answerHi : bestMatch.answerEn;
  }

  return null;
}

