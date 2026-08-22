import type { Account, Payee, Risk, Transaction, Translation, User } from '../types';

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const errorText = (status: number): string => {
  switch (status) {
    case 400:
      return 'Please check the entered information and try again.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This request conflicts with existing records.';
    case 422:
      return 'Please check the details and try again.';
    case 429:
      return 'Too many attempts. Please wait a little while before trying again.';
    case 500:
    case 502:
    case 503:
      return 'We could not reach Sahayak right now. Please check your connection or try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  try {
    const headers: Record<string, string> = {
      ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as Record<string, string>),
    };

    const res = await fetch(`${BASE}${path}`, { ...init, headers });

    if (!res.ok) {
      let customMsg = '';
      try {
        const json = await res.json();
        if (json && json.detail) {
          customMsg = typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail);
        }
      } catch {
        // Fallback if res body is not json
      }
      throw new ApiError(res.status, customMsg || errorText(res.status));
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new ApiError(0, 'Network error. Please check your internet connection.');
    }
    throw new ApiError(500, err instanceof Error ? err.message : 'An unexpected error occurred.');
  }
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: Record<string, unknown>) =>
    request<{ access_token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: (token: string) => request<User>('/api/auth/me', {}, token),

  accounts: (token: string) => request<Account[]>('/api/accounts', {}, token),

  balance: (id: string, token: string) =>
    request<{ balance: number; currency: string; narration: string }>(`/api/accounts/${id}/balance`, {}, token),

  payees: (token: string) => request<Payee[]>('/api/payees', {}, token),

  transactions: (token: string) => request<{ items: Transaction[]; total: number }>('/api/transactions', {}, token),

  transaction: (id: string, token: string) => request<Transaction>(`/api/transactions/${id}`, {}, token),

  createTransaction: (data: Record<string, unknown>, token: string) =>
    request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  fraud: (data: Record<string, unknown>, token: string) =>
    request<Risk>('/api/fraud/check', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  translate: (text: string, language: string, token: string) =>
    request<Translation>('/api/translator/explain', {
      method: 'POST',
      body: JSON.stringify({ text, language }),
    }, token),

  transcribe: (file: File | Blob, language: string, token?: string) => {
    const body = new FormData();
    body.append('file', file, 'recording.wav');
    body.append('language', language);
    return request<{ text: string; language: string }>('/api/voice/transcribe', {
      method: 'POST',
      body,
    }, token);
  },

  synthesize: async (text: string, language: string, token?: string): Promise<string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${BASE}/api/voice/synthesize`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text, language }),
    });

    if (!res.ok) {
      throw new ApiError(res.status, errorText(res.status));
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },

  chat: (message: string, language: string = 'en', token?: string) =>
    request<{ response: string; language: string; intent: string }>(
      '/api/chat',
      {
        method: 'POST',
        body: JSON.stringify({ message, language }),
      },
      token
    ),
};

