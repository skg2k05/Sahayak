import { httpClient } from './client';
import type { Translation } from '../types';

export const explainTransaction = (text: string, language: string, token: string) =>
  httpClient<Translation>('/api/translator/explain', {
    method: 'POST',
    body: JSON.stringify({ text, language }),
  }, token);
