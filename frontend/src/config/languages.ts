export type SupportedLanguageCode = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'mr' | 'bn';

export interface LanguageConfig {
  code: SupportedLanguageCode;
  name: string;
  nativeName: string;
  locale: string;
  ttsSupported: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', locale: 'en-IN', ttsSupported: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', locale: 'hi-IN', ttsSupported: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', locale: 'kn-IN', ttsSupported: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', locale: 'ta-IN', ttsSupported: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', locale: 'te-IN', ttsSupported: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', locale: 'mr-IN', ttsSupported: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', locale: 'bn-IN', ttsSupported: true },
];

export const DEFAULT_LANGUAGE: SupportedLanguageCode = 'en';

export function getLanguageConfig(code?: string | null): LanguageConfig {
  if (!code) return SUPPORTED_LANGUAGES[0];
  const norm = code.toLowerCase().trim().slice(0, 2) as SupportedLanguageCode;
  const found = SUPPORTED_LANGUAGES.find((l) => l.code === norm);
  return found || SUPPORTED_LANGUAGES[0];
}
