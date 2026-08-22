import { httpClient } from './client';
import type { User } from '../types';

export const loginUser = (email: string, password: string) =>
  httpClient<{ access_token: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const registerUser = (data: Record<string, unknown>) =>
  httpClient<{ access_token: string; user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getMe = (token: string) => httpClient<User>('/api/auth/me', {}, token);
