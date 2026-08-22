import { httpClient } from './client';

export interface ChatResponse {
  response: string;
  language: string;
  intent: string;
}

export async function sendChatMessage(
  message: string,
  language: string = 'en',
  token?: string
): Promise<ChatResponse> {
  return httpClient<ChatResponse>(
    '/api/chat',
    {
      method: 'POST',
      body: JSON.stringify({ message, language }),
    },
    token
  );
}
