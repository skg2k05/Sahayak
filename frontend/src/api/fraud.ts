import { httpClient } from './client';
import type { Risk } from '../types';

export const checkFraudRisk = (data: Record<string, unknown>, token: string) =>
  httpClient<Risk>('/api/fraud/check', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
