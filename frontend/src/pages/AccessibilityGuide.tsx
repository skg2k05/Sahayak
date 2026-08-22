import React from 'react';
import { Eye, Type, Activity, Volume2, Languages, CheckCircle2, Mic } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const AccessibilityGuide: React.FC = () => {
  const { toggleLargeText, toggleHighContrast, toggleReduceMotion } = useAccessibility();

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-16 pt-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="rounded-full bg-[#6D5DFB]/10 px-4 py-1 text-xs font-bold text-[#6D5DFB]">
          Built for Everyone — WCAG 2.1 AA
        </span>
        <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl tracking-tight">
          Accessibility Guide & Controls
        </h1>
        <p className="text-zinc-600 text-base max-w-2xl mx-auto">
          Sahayak is designed for elderly users, people with limited digital literacy, and users who prefer voice interaction in English or Hindi.
        </p>
      </div>

      {/* Accessibility Features Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card p-6 bg-white border border-zinc-200 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-violet-100 text-[#6D5DFB] flex items-center justify-center font-bold">
            <Mic className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900">Voice-First Architecture</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Speak naturally to check balances, transfer funds, or translate SMS messages. Audio speech synthesis can read any result aloud.
          </p>
        </div>

        <div className="card p-6 bg-white border border-zinc-200 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Eye className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900">Live Captions Always Included</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Voice is never the only channel. Real-time text captions are rendered continuously alongside every spoken instruction.
          </p>
        </div>

        <div className="card p-6 bg-white border border-zinc-200 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Type className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900">44px+ Touch Targets & Focus Rings</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            All buttons and form elements maintain generous comfortable tap areas with high contrast focus indicators for full keyboard navigation.
          </p>
        </div>

        <div className="card p-6 bg-white border border-zinc-200 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Languages className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900">English & Hindi Support</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Switch between English and Hindi with one tap. Both speech recognition and plain-language SMS explanations adapt seamlessly.
          </p>
        </div>
      </div>

      {/* Quick Toggle Controls */}
      <div className="card p-8 bg-white border border-zinc-200 space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-100 pb-3">Quick Display Controls</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            onClick={toggleLargeText}
            className="focus-ring rounded-2xl border border-zinc-200 p-4 font-bold text-xs text-zinc-800 hover:bg-zinc-50 text-center"
          >
            Toggle Larger Text
          </button>
          <button
            onClick={toggleHighContrast}
            className="focus-ring rounded-2xl border border-zinc-200 p-4 font-bold text-xs text-zinc-800 hover:bg-zinc-50 text-center"
          >
            Toggle High Contrast
          </button>
          <button
            onClick={toggleReduceMotion}
            className="focus-ring rounded-2xl border border-zinc-200 p-4 font-bold text-xs text-zinc-800 hover:bg-zinc-50 text-center"
          >
            Toggle Reduced Motion
          </button>
        </div>
      </div>
    </div>
  );
};
