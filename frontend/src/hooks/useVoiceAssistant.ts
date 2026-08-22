import { useState, useRef, useCallback } from 'react';
import type { VoiceState, VoiceCommandAction } from '../types';
import { api } from '../api';
import { findKnowledgeAnswer } from '../data/sahayakKnowledge';

export function parseVoiceCommand(text: string): VoiceCommandAction {
  const lower = text.toLowerCase().trim();

  // Send money pattern: "send ₹500 to Rahul", "pay 500 to Rahul", "transfer 1000 rupees to Priya"
  const sendMatch =
    lower.match(/(?:send|pay|transfer)\s*(?:₹|rs|rupees)?\s*(\d+(?:\.\d+)?)\s*(?:rupees|rs)?\s*(?:to)\s*([a-z\s]+)/i) ||
    lower.match(/(?:send|pay|transfer)\s*([a-z\s]+)\s*(?:₹|rs|rupees)?\s*(\d+(?:\.\d+)?)/i);

  if (sendMatch) {
    let amountStr: string;
    let nameStr: string;

    if (!isNaN(Number(sendMatch[1]))) {
      amountStr = sendMatch[1];
      nameStr = sendMatch[2];
    } else {
      nameStr = sendMatch[1];
      amountStr = sendMatch[2];
    }

    return {
      type: 'SEND_MONEY',
      amount: parseFloat(amountStr),
      payeeName: nameStr.trim(),
    };
  }

  if (lower.includes('send') || lower.includes('pay') || lower.includes('transfer') || lower.includes('bhejo')) {
    return { type: 'SEND_MONEY' };
  }

  if (lower.includes('balance') || lower.includes('check balance') || lower.includes('kitna paisa') || lower.includes('paisa')) {
    return { type: 'CHECK_BALANCE' };
  }

  if (lower.includes('transaction') || lower.includes('history') || lower.includes('activity') || lower.includes('hisab')) {
    return { type: 'VIEW_TRANSACTIONS' };
  }

  if (lower.includes('explain') || lower.includes('sms') || lower.includes('message') || lower.includes('meaning') || lower.includes('samjhao')) {
    return { type: 'EXPLAIN_SMS' };
  }

  if (lower.includes('home') || lower.includes('dashboard') || lower.includes('main')) {
    return { type: 'GO_HOME' };
  }

  if (lower.includes('setting') || lower.includes('accessibility') || lower.includes('help')) {
    return { type: 'OPEN_SETTINGS' };
  }

  return { type: 'UNKNOWN', query: text };
}

export function useVoiceAssistant(token: string | null, language: 'en' | 'hi' = 'en') {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [parsedCommand, setParsedCommand] = useState<VoiceCommandAction | null>(null);
  const [knowledgeResponse, setKnowledgeResponse] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  const speakText = useCallback(
    async (textToSpeak: string) => {
      setVoiceState('speaking');
      try {
        if (token) {
          const url = await api.synthesize(textToSpeak, language, token);
          const audio = new Audio(url);
          setAudioUrl(url);
          audio.onended = () => setVoiceState('idle');
          audio.onerror = () => fallbackBrowserSpeech(textToSpeak);
          await audio.play();
        } else {
          fallbackBrowserSpeech(textToSpeak);
        }
      } catch {
        fallbackBrowserSpeech(textToSpeak);
      }
    },
    [token, language]
  );

  const fallbackBrowserSpeech = (textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.onend = () => setVoiceState('idle');
      utterance.onerror = () => setVoiceState('idle');
      window.speechSynthesis.speak(utterance);
    } else {
      setVoiceState('idle');
    }
  };

  const processTextQuery = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setVoiceState('idle');
        return;
      }

      setTranscript(text);
      setVoiceState('processing');
      setErrorMessage('');
      setKnowledgeResponse(null);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      try {
        // Query backend AI chatbot service
        const chatRes = await api.chat(text, language, token || undefined);
        if (chatRes && chatRes.response) {
          setKnowledgeResponse(chatRes.response);
          setVoiceState('confirmation');
          speakText(chatRes.response);
          return;
        }
      } catch (err) {
        console.warn('Backend AI chatbot notice:', err);
      }

      // Check product knowledge base fallback
      const knowledgeAnswer = findKnowledgeAnswer(text, language);
      if (knowledgeAnswer) {
        setKnowledgeResponse(knowledgeAnswer);
        setVoiceState('confirmation');
        speakText(knowledgeAnswer);
        return;
      }

      // Voice action command parser fallback
      const command = parseVoiceCommand(text);
      setParsedCommand(command);
      setVoiceState('confirmation');
    },
    [language, token, speakText]
  );


  const startListening = useCallback(() => {
    setErrorMessage('');
    setTranscript('');
    setParsedCommand(null);
    setKnowledgeResponse(null);
    setVoiceState('listening');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        recognitionRef.current = rec;
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = language === 'hi' ? 'hi-IN' : 'en-US';

        let capturedText = '';

        rec.onresult = (event: any) => {
          let currentResult = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentResult += event.results[i][0].transcript;
          }
          capturedText = currentResult;
          setTranscript(currentResult);
        };

        rec.onend = () => {
          // FIX: Process transcript immediately when recognition ends!
          if (capturedText.trim()) {
            processTextQuery(capturedText);
          } else {
            setVoiceState('idle');
          }
        };

        rec.onerror = (event: any) => {
          console.warn('Speech recognition notice:', event.error);
          if (event.error !== 'no-speech') {
            startMediaRecorderFallback();
          } else {
            setVoiceState('idle');
          }
        };

        rec.start();
        return;
      } catch (e) {
        console.warn('Could not initialize SpeechRecognition:', e);
      }
    }

    startMediaRecorderFallback();
  }, [language, processTextQuery]);

  const startMediaRecorderFallback = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Microphone access is not supported in this browser.');
      setVoiceState('idle');
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          setVoiceState('processing');
          try {
            const result = await api.transcribe(audioBlob, language, token || undefined);
            if (result && result.text) {
              setTranscript(result.text);
              processTextQuery(result.text);
            } else {
              setErrorMessage('Could not process speech. Please try again.');
              setVoiceState('idle');
            }
          } catch {
            setErrorMessage("Sahayak's voice service is temporarily unreachable.");
            setVoiceState('idle');
          }
        };

        mediaRecorder.start();
        setVoiceState('listening');
      })
      .catch(() => {
        setErrorMessage('Microphone permission denied or unavailable.');
        setVoiceState('idle');
      });
  };

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore
      }
    }
  }, []);

  const resetVoiceState = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    stopListening();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setVoiceState('idle');
    setTranscript('');
    setParsedCommand(null);
    setKnowledgeResponse(null);
    setErrorMessage('');
  }, [stopListening]);

  return {
    voiceState,
    transcript,
    parsedCommand,
    knowledgeResponse,
    errorMessage,
    audioUrl,
    startListening,
    stopListening,
    processTextQuery,
    speakText,
    resetVoiceState,
    setVoiceState,
  };
}
