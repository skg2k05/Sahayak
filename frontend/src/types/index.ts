export type User = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  preferred_language: string;
  accessibility_settings?: Record<string, unknown>;
};

export type Account = {
  id: string;
  bank_name: string;
  account_type: string;
  account_number: string;
  balance: number | string;
  currency: string;
  upi_id?: string;
  is_primary: boolean;
};

export type Payee = {
  id: string;
  name: string;
  upi_id?: string;
  phone?: string;
  bank_name?: string;
  is_trusted: boolean;
  trusted_status?: boolean;
};

export type Transaction = {
  id: string;
  account_id: string;
  payee_id?: string;
  payee_name?: string;
  transaction_type: string;
  amount: number | string;
  currency: string;
  status: string;
  reference?: string;
  description?: string;
  created_at: string;
  resulting_balance?: number | string;
};

export type Risk = {
  risk_level: 'low' | 'medium' | 'high';
  risk_score: number;
  reasons: string[];
};

export type Translation = {
  summary: string;
  amount?: number;
  transaction_type: string;
  merchant?: string;
  account_last4?: string;
  plain_language: string;
  language: string;
};

export type VoiceState = 'idle' | 'listening' | 'processing' | 'confirmation' | 'speaking';

export type VoiceCommandAction = 
  | { type: 'SEND_MONEY'; payeeName?: string; amount?: number }
  | { type: 'CHECK_BALANCE' }
  | { type: 'VIEW_TRANSACTIONS' }
  | { type: 'EXPLAIN_SMS' }
  | { type: 'GO_HOME' }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'UNKNOWN'; query: string };

import type { SupportedLanguageCode } from '../config/languages';

export type AccessibilitySettings = {
  largeText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  voiceGuidance: boolean;
  language: SupportedLanguageCode;
};


