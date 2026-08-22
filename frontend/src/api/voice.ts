import { httpClient, BASE_URL, ApiError, getErrorMessageForStatus } from './client';

export const transcribeAudio = (file: File | Blob, language: string, token?: string) => {
  const formData = new FormData();
  formData.append('file', file, 'recording.wav');
  formData.append('language', language);
  return httpClient<{ text: string; language: string }>('/api/voice/transcribe', {
    method: 'POST',
    body: formData,
  }, token);
};

export const synthesizeSpeech = async (text: string, language: string, token?: string): Promise<string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}/api/voice/synthesize`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, language }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, getErrorMessageForStatus(response.status));
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
