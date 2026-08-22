/**
 * Converts masked account identifiers, currency symbols, and technical formatting
 * into natural, fluent spoken language for Text-To-Speech (TTS).
 *
 * Screen rendering continues displaying masked forms like "•••• 4237" or "XXXXXX4237",
 * but TTS will pronounce natural phrases like "account ending in 4 2 3 7".
 */
export function normalizeTextForSpeech(text: string, language: string = 'en'): string {
  if (!text) return '';

  let normalized = text.trim();
  const lang = (language || 'en').toLowerCase().trim().slice(0, 2);

  // 1. Normalize masked account numbers (e.g. XXXXXX4237, •••• 4237, ****4237)
  const maskedAccountRegex = /(?:X{3,}|x{3,}|•{3,}|[*]{3,})\s*(\d{4})/g;

  normalized = normalized.replace(maskedAccountRegex, (_, last4) => {
    const spacedDigits = last4.split('').join(' ');
    switch (lang) {
      case 'hi':
        return `${spacedDigits} पर समाप्त होने वाला खाता`;
      case 'kn':
        return `${spacedDigits} ರಲ್ಲಿ ಕೊನೆಗೊಳ್ಳುವ ಖಾತೆ`;
      case 'ta':
        return `${spacedDigits} இல் முடிவடையும் கணக்கு`;
      case 'te':
        return `${spacedDigits} తో ముగిసే ఖాతా`;
      case 'mr':
        return `${spacedDigits} शेवटी असलेले खाते`;
      case 'bn':
        return `${spacedDigits} দিয়ে শেষ হওয়া অ্যাকাউন্ট`;
      default:
        return `account ending in ${spacedDigits}`;
    }
  });

  // 2. Normalize Currency formatting (e.g. ₹4,200.00 -> 4,200 rupees/रुपये)
  normalized = normalized.replace(/₹\s*([\d,]+(?:\.\d{1,2})?)/g, (_, amt) => {
    switch (lang) {
      case 'hi':
      case 'mr':
        return `${amt} रुपये`;
      case 'kn':
        return `${amt} ರೂಪಾಯಿಗಳು`;
      case 'ta':
        return `${amt} ரூபாய்`;
      case 'te':
        return `${amt} రూపాయలు`;
      case 'bn':
        return `${amt} টাকা`;
      default:
        return `${amt} rupees`;
    }
  });

  return normalized;
}
