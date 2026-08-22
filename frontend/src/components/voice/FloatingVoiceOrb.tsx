import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Volume2, Check, X, Sparkles, RefreshCw, Send, HelpCircle, ArrowRight } from 'lucide-react';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../api';

type ChatMessage = {
  sender: 'user' | 'sahayak';
  text: string;
  commandAction?: any;
};

export const FloatingVoiceOrb: React.FC = () => {
  const { token, user } = useAuth();
  const { settings } = useAccessibility();
  const navigate = useNavigate();

  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');

  const {
    voiceState,
    transcript,
    parsedCommand,
    knowledgeResponse,
    errorMessage,
    startListening,
    stopListening,
    processTextQuery,
    speakText,
    resetVoiceState,
    setVoiceState,
  } = useVoiceAssistant(token, settings.language);

  const quickPrompts = [
    'What is Sahayak?',
    'How do I send money?',
    'Check my balance',
    'Explain my last transaction',
    'Is my transaction safe?',
    'Help me use Hindi',
  ];

  const handleOrbClick = () => {
    if (voiceState === 'idle') {
      startListening();
    } else if (voiceState === 'listening') {
      stopListening();
    }
  };

  const handleSendTextQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Optimistic UI update for user message
    const userMsg: ChatMessage = { sender: 'user', text: queryText };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    processTextQuery(queryText);

    // If authenticated user asks about balance or transactions, perform live API lookup
    const lower = queryText.toLowerCase();
    if (token && (lower.includes('balance') || lower.includes('kitna paisa'))) {
      try {
        const accs = await api.accounts(token);
        const total = accs.reduce((n, a) => n + Number(a.balance || 0), 0);
        const reply = settings.language === 'hi'
          ? `आपके प्राथमिक बैंक खाते का उपलब्ध बैलेंस ₹${total.toLocaleString('en-IN')} है।`
          : `Your available balance across linked accounts is ₹${total.toLocaleString('en-IN')}.`;
        
        setTimeout(() => {
          setMessages((prev) => [...prev, { sender: 'sahayak', text: reply }]);
        }, 400);
      } catch {
        // Fallback
      }
    }
  };

  const handleConfirmCommand = () => {
    if (!parsedCommand) {
      resetVoiceState();
      return;
    }

    if (parsedCommand.type === 'SEND_MONEY') {
      const params = new URLSearchParams();
      if (parsedCommand.payeeName) params.set('payee', parsedCommand.payeeName);
      if (parsedCommand.amount) params.set('amount', parsedCommand.amount.toString());
      resetVoiceState();
      navigate(`/send?${params.toString()}`);
    } else if (parsedCommand.type === 'CHECK_BALANCE') {
      speakText(settings.language === 'hi' ? 'आपका कुल बैलेंस ₹24,580 है।' : 'Your total balance across primary bank accounts is 24,580 rupees.');
      navigate('/dashboard');
    } else if (parsedCommand.type === 'VIEW_TRANSACTIONS') {
      resetVoiceState();
      navigate('/transactions');
    } else if (parsedCommand.type === 'EXPLAIN_SMS') {
      resetVoiceState();
      navigate('/translator');
    } else if (parsedCommand.type === 'GO_HOME') {
      resetVoiceState();
      navigate('/dashboard');
    } else if (parsedCommand.type === 'OPEN_SETTINGS') {
      resetVoiceState();
      navigate('/settings');
    } else {
      resetVoiceState();
    }
  };

  return (
    <aside
      aria-label="Sahayak Voice Assistant"
      className={`fixed bottom-20 right-4 z-50 transition-all duration-300 md:bottom-8 md:right-8 ${
        settings.reduceMotion ? '' : 'animate-in fade-in slide-in-from-bottom-4'
      }`}
    >
      <div className="relative flex flex-col items-end">
        {/* Voice Dialog Assistant Card when active */}
        {voiceState !== 'idle' && !minimized && (
          <div className="mb-4 w-[340px] sm:w-[400px] max-h-[520px] rounded-3xl bg-white text-slate-900 p-5 shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Top Assistant Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6D5DFB] to-[#4F8CFF] text-white shadow-md">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block leading-tight">
                    Sahayak Assistant
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Online & Accessible
                  </span>
                </div>
              </div>
              <button
                onClick={resetVoiceState}
                className="focus-ring rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close voice dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="py-3 flex-1 overflow-y-auto space-y-3">
              {/* Listening State */}
              {voiceState === 'listening' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-[#6D5DFB]">
                    <Mic className="h-5 w-5 animate-pulse" />
                    <span className="font-bold text-xs uppercase tracking-wide">Listening to your voice...</span>
                  </div>
                  <div className="min-h-[54px] rounded-2xl bg-slate-50 p-3 font-mono text-xs font-semibold text-slate-800 border border-slate-200">
                    {transcript ? `"${transcript}"` : <span className="text-slate-400 italic font-normal">Say something like "How do I send money?"...</span>}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={stopListening}
                      className="focus-ring rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-200"
                    >
                      Done speaking
                    </button>
                  </div>
                </div>
              )}

              {/* Processing State */}
              {voiceState === 'processing' && (
                <div className="flex flex-col items-center py-6 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#6D5DFB] animate-bounce" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#4F8CFF] animate-bounce [animation-delay:0.2s]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">Preparing your answer...</p>
                </div>
              )}

              {/* Knowledge Base Answer Response State */}
              {voiceState === 'confirmation' && knowledgeResponse && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-blue-50 p-4 border border-violet-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D5DFB]">Sahayak Explanation</span>
                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">{knowledgeResponse}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => speakText(knowledgeResponse)}
                      className="focus-ring flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3 py-1.5 text-xs font-bold text-[#6D5DFB] hover:bg-violet-50 transition"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span>🔊 Listen</span>
                    </button>
                    <button
                      onClick={resetVoiceState}
                      className="focus-ring rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                    >
                      Ask Another
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmation Action State */}
              {voiceState === 'confirmation' && parsedCommand && !knowledgeResponse && (
                <div className="space-y-3 animate-in fade-in">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Understood Action</p>

                  <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-blue-50 p-4 border border-violet-200">
                    {parsedCommand?.type === 'SEND_MONEY' ? (
                      <div>
                        <p className="text-xs text-[#6D5DFB] font-bold">Payment Request</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">
                          Send {parsedCommand.amount ? `₹${parsedCommand.amount}` : 'money'}
                          {parsedCommand.payeeName ? ` to ${parsedCommand.payeeName}` : ''}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-[#6D5DFB] font-bold">Voice Request</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">"{transcript}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleConfirmCommand}
                      className="focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#4F8CFF] py-2 text-xs font-bold text-white shadow-md hover:opacity-95"
                    >
                      <Check className="h-4 w-4" />
                      Confirm
                    </button>
                    <button
                      onClick={resetVoiceState}
                      className="focus-ring flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Speaking State */}
              {voiceState === 'speaking' && (
                <div className="space-y-3 text-center py-2">
                  <div className="flex justify-center items-center gap-1.5 h-7">
                    <span className="w-1 bg-[#6D5DFB] rounded-full waveform-bar" />
                    <span className="w-1 bg-[#4F8CFF] rounded-full waveform-bar" />
                    <span className="w-1 bg-emerald-500 rounded-full waveform-bar" />
                    <span className="w-1 bg-[#6D5DFB] rounded-full waveform-bar" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Sahayak is reading response aloud...</p>
                  <button
                    onClick={resetVoiceState}
                    className="focus-ring rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
                  >
                    Stop speech
                  </button>
                </div>
              )}

              {/* Error Message with Retry */}
              {errorMessage && (
                <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs space-y-2">
                  <p className="font-bold text-amber-900">{errorMessage}</p>
                  <button
                    onClick={() => startListening()}
                    className="focus-ring font-bold text-[#6D5DFB] underline text-xs flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Try again
                  </button>
                </div>
              )}

              {/* Quick Prompts Chips */}
              {voiceState === 'confirmation' || (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Quick Suggestions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendTextQuery(prompt)}
                        className="focus-ring rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#6D5DFB]/40 hover:bg-violet-50 transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Text Input Box */}
            <div className="border-t border-slate-100 pt-3 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendTextQuery(inputText);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask a question or request..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="focus-ring h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#4F8CFF] text-white disabled:opacity-40"
                  aria-label="Send question to Sahayak"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Floating Orb Trigger Button */}
        <div className="flex items-center gap-2">
          {/* Quick status badge next to orb */}
          <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-slate-900 shadow-lg border border-slate-200">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wide">
              {voiceState === 'idle'
                ? 'Ask Sahayak'
                : voiceState === 'listening'
                ? 'Listening...'
                : voiceState === 'processing'
                ? 'Understanding...'
                : voiceState === 'speaking'
                ? 'Speaking...'
                : 'Review action'}
            </span>
          </div>

          <button
            onClick={handleOrbClick}
            aria-label={`Sahayak Voice Assistant: ${voiceState}. Click to speak.`}
            className={`focus-ring relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 active:scale-95 ${
              voiceState === 'listening'
                ? 'bg-gradient-to-tr from-red-500 to-rose-600 ring-8 ring-red-500/20 animate-pulse'
                : voiceState === 'processing'
                ? 'bg-gradient-to-tr from-amber-500 to-orange-600 ring-8 ring-amber-500/20'
                : voiceState === 'speaking'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 ring-8 ring-emerald-500/20'
                : 'bg-gradient-to-tr from-[#6D5DFB] via-[#4F8CFF] to-violet-600 orb-glow hover:scale-105'
            }`}
          >
            <div className="absolute inset-1 rounded-full bg-white/20 blur-sm pointer-events-none" />

            {voiceState === 'speaking' ? (
              <Volume2 className="h-7 w-7 text-white animate-bounce" />
            ) : voiceState === 'listening' ? (
              <Mic className="h-7 w-7 text-white animate-pulse" />
            ) : (
              <Sparkles className="h-7 w-7 text-white" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
