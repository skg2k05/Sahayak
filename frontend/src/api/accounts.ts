import { httpClient } from './client';
import type { Account } from '../types';

export const getAccounts = (token: string) => httpClient<Account[]>('/api/accounts', {}, token);

export const getAccountBalance = (accountId: string, token: string) =>
  httpClient<{ balance: number; currency: string; narration: string }>(
    `/api/accounts/${accountId}/balance`,
    {},
    token
  );
