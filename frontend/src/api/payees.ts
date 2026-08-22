import { httpClient } from './client';
import type { Payee } from '../types';

export const getPayees = (token: string) => httpClient<Payee[]>('/api/payees', {}, token);
