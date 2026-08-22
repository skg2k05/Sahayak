export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export const getErrorMessageForStatus = (status: number): string => {
  switch (status) {
    case 400:
      return 'Please check the information and try again.';
    case 401:
      return 'Your session has expired. Please sign in again.';
    case 404:
      return 'The requested record was not found.';
    case 409:
      return 'This action conflicts with an existing record.';
    case 422:
      return 'Please verify the details and try again.';
    case 429:
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 500:
    case 502:
    case 503:
      return 'Sahayak services are temporarily unreachable. Please check your network connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

export async function httpClient<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  try {
    const headers: Record<string, string> = {
      ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as Record<string, string>),
    };

    const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });

    if (!response.ok) {
      let customMessage = '';
      try {
        const json = await response.json();
        if (json && json.detail) {
          customMessage = typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail);
        }
      } catch {
        // Fallback
      }
      throw new ApiError(response.status, customMessage || getErrorMessageForStatus(response.status));
    }

    return (await response.json()) as T;
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
