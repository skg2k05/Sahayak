import { httpClient } from './client';
import type { Transaction } from '../types';

export const getTransactions = (token: string) =>
  httpClient<{ items: Transaction[]; total: number }>('/api/transactions', {}, token);

export const getTransactionById = (transactionId: string, token: string) =>
  httpClient<Transaction>(`/api/transactions/${transactionId}`, {}, token);

export const createTransaction = (data: Record<string, unknown>, token: string) =>
  httpClient<Transaction>('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
