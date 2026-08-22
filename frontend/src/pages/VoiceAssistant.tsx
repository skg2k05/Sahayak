import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Volume2, Sparkles, Check, ArrowRight, X, RefreshCw } from 'lucide-react';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { Button, SpeakButton } from '../components/ui';

export const VoiceAssistant: React.FC = () => {
  const { token } = useAuth();
  const { settings } = useAccessibility();
  const navigate = useNavigate();

  const {
    voiceState,
    transcript,
    parsedCommand,
    errorMessage,
    startListening,
    stopListening,
    processTextQuery,
    speakText,
    resetVoiceState,
  } = useVoiceAssistant(token, settings.language);

  const presets = [
    'Check my total balance',
    'Send ₹500 to Rahul Sharma',
    'Show recent transactions',
    'Explain a bank SMS message',
  ];

  const handleConfirmAction = () => {
    if (!parsedCommand) return;

    if (parsedCommand.type === 'SEND_MONEY') {
      const params = new URLSearchParams();
      if (parsedCommand.payeeName) params.set('payee', parsedCommand.payeeName);
      if (parsedCommand.amount) params.set('amount', parsedCommand.amount.toString());
      navigate(`/send?${params.toString()}`);
    } else if (parsedCommand.type === 'CHECK_BALANCE') {
      speakText('Your available balance across primary account is 24,580 rupees.');
      navigate('/dashboard');
    } else if (parsedCommand.type === 'VIEW_TRANSACTIONS') {
      navigate('/transactions');
    } else if (parsedCommand.type === 'EXPLAIN_SMS') {
      navigate('/translator');
    } else if (parsedCommand.type === 'GO_HOME') {
      navigate('/dashboard');
    } else if (parsedCommand.type === 'OPEN_SETTINGS') {
      navigate('/settings');
    }
  };

  return (
    <div className="mx-auto max-w-2xl text-center space-y-8 pb-12">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#6D5DFB]/10 px-3 py-1 text-xs font-bold text-[#6D5DFB]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Voice Center</span>
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl mt-2">
          Talk to Sahayak
        </h1>
        <p className="text-zinc-600 text-sm mt-1">
          Speak your request or choose a suggestion below. Captions always appear live on screen.
        </p>
      </div>

      {/* Central Interactive Futuristic Orb Visualizer */}
      <div className="relative mx-auto flex flex-col items-center py-6">
        <button
          onClick={() => {
            if (voiceState === 'idle') startListening();
            else if (voiceState === 'listening') stopListening();
          }}
          className={`focus-ring relative flex h-40 w-40 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-500 active:scale-95 ${
            voiceState === 'listening'
              ? 'bg-gradient-to-tr from-red-500 to-rose-600 ring-8 ring-red-500/20 scale-105 animate-pulse'
              : voiceState === 'processing'
              ? 'bg-gradient-to-tr from-amber-500 to-orange-600 ring-8 ring-amber-500/20'
              : voiceState === 'speaking'
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 ring-8 ring-emerald-500/20'
              : 'bg-gradient-to-tr from-[#6D5DFB] via-[#4F8CFF] to-violet-600 orb-glow hover:scale-105'
          }`}
          aria-label="Tap to activate voice assistant"
        >
          <Mic className="h-16 w-16" />
        </button>

        {/* Dynamic Status Text */}
        <p className="text-lg font-bold text-zinc-900 mt-6">
          {voiceState === 'idle'
            ? 'Tap the microphone to speak'
            : voiceState === 'listening'
            ? 'Listening to your request...'
            : voiceState === 'processing'
            ? 'Understanding your request...'
            : voiceState === 'speaking'
            ? 'Sahayak is speaking aloud...'
            : 'Review your request'}
        </p>
      </div>

      {/* Live Captions Display Card */}
      <div className="card p-6 bg-white shadow-lg border border-zinc-200 text-left space-y-3 min-h-[100px]">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Live Captions</span>
        <p className="text-lg font-semibold text-zinc-900 leading-relaxed">
          {transcript ? `"${transcript}"` : <span className="text-zinc-400 italic font-normal">Your spoken words will appear here...</span>}
        </p>

        {errorMessage && (
          <p className="text-xs text-red-600 font-semibold">{errorMessage}</p>
        )}
      </div>

      {/* Confirmation Action Screen */}
      {voiceState === 'confirmation' && parsedCommand && (
        <div className="card p-6 bg-violet-50/80 border border-violet-200 text-left space-y-4 animate-in fade-in zoom-in-95">
          <h2 className="text-base font-bold text-zinc-900">Interpreted Action</h2>
          <div className="rounded-xl bg-white p-4 border border-violet-100 font-bold text-zinc-900">
            {parsedCommand.type === 'SEND_MONEY'
              ? `Send ${parsedCommand.amount ? `₹${parsedCommand.amount}` : 'money'} to ${parsedCommand.payeeName || 'payee'}`
              : parsedCommand.type === 'CHECK_BALANCE'
              ? 'Check account balance'
              : parsedCommand.type === 'VIEW_TRANSACTIONS'
              ? 'Open transaction statement history'
              : parsedCommand.type === 'EXPLAIN_SMS'
              ? 'Open SMS translator tool'
              : 'Execute voice request'}
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 font-bold" variant="gradient" onClick={handleConfirmAction}>
              Confirm Action →
            </Button>
            <Button variant="secondary" onClick={resetVoiceState}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Preset Voice Action Chips */}
      <div className="pt-4 space-y-3">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Or Try a Voice Shortcut</span>
        <div className="flex flex-wrap justify-center gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => processTextQuery(preset)}
              className="focus-ring rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-800 hover:border-[#6D5DFB]/50 hover:bg-violet-50 transition shadow-sm"
            >
              🎙 "{preset}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
