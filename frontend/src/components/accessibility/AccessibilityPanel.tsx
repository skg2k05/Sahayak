import React from 'react';
import { X, Type, Eye, Activity, Volume2, Languages, Check } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

export const AccessibilityPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const {
    settings,
    toggleLargeText,
    toggleHighContrast,
    toggleReduceMotion,
    toggleVoiceGuidance,
    setLanguage,
  } = useAccessibility();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-title"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-zinc-200 outline-none animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6D5DFB]/10 text-[#6D5DFB]">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h2 id="accessibility-title" className="text-xl font-bold text-zinc-900">
                Accessibility Controls
              </h2>
              <p className="text-xs text-zinc-500">Customize display and voice preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition"
            aria-label="Close accessibility controls"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {/* Larger Text Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 hover:bg-zinc-50 transition">
            <div className="flex items-center gap-3">
              <Type className="h-5 w-5 text-zinc-700" />
              <div>
                <span className="block font-semibold text-zinc-900">Larger Text</span>
                <span className="text-xs text-zinc-500">Increase font size for comfortable reading</span>
              </div>
            </div>
            <button
              onClick={toggleLargeText}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                settings.largeText ? 'bg-[#6D5DFB]' : 'bg-zinc-300'
              }`}
              aria-pressed={settings.largeText}
              aria-label="Toggle larger text size"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  settings.largeText ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 hover:bg-zinc-50 transition">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-zinc-700" />
              <div>
                <span className="block font-semibold text-zinc-900">High Contrast</span>
                <span className="text-xs text-zinc-500">Dark contrast for maximum readability</span>
              </div>
            </div>
            <button
              onClick={toggleHighContrast}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                settings.highContrast ? 'bg-[#6D5DFB]' : 'bg-zinc-300'
              }`}
              aria-pressed={settings.highContrast}
              aria-label="Toggle high contrast mode"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 hover:bg-zinc-50 transition">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-zinc-700" />
              <div>
                <span className="block font-semibold text-zinc-900">Reduce Motion</span>
                <span className="text-xs text-zinc-500">Minimize animations and floating motion</span>
              </div>
            </div>
            <button
              onClick={toggleReduceMotion}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                settings.reduceMotion ? 'bg-[#6D5DFB]' : 'bg-zinc-300'
              }`}
              aria-pressed={settings.reduceMotion}
              aria-label="Toggle reduce motion"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  settings.reduceMotion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Voice Guidance Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 hover:bg-zinc-50 transition">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-zinc-700" />
              <div>
                <span className="block font-semibold text-zinc-900">Voice Assistance</span>
                <span className="text-xs text-zinc-500">Read payment confirmations and alerts aloud</span>
              </div>
            </div>
            <button
              onClick={toggleVoiceGuidance}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                settings.voiceGuidance ? 'bg-[#6D5DFB]' : 'bg-zinc-300'
              }`}
              aria-pressed={settings.voiceGuidance}
              aria-label="Toggle voice guidance"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  settings.voiceGuidance ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Preferred Language Selection */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Languages className="h-5 w-5 text-zinc-700" />
              <div>
                <span className="block font-semibold text-zinc-900">Preferred Language</span>
                <span className="text-xs text-zinc-500">Voice output and SMS translation language</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage('en')}
                className={`focus-ring flex items-center justify-between rounded-xl p-3 font-semibold text-sm border transition ${
                  settings.language === 'en'
                    ? 'border-[#6D5DFB] bg-[#6D5DFB]/10 text-[#6D5DFB]'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <span>English</span>
                {settings.language === 'en' && <Check className="h-4 w-4 text-[#6D5DFB]" />}
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`focus-ring flex items-center justify-between rounded-xl p-3 font-semibold text-sm border transition ${
                  settings.language === 'hi'
                    ? 'border-[#6D5DFB] bg-[#6D5DFB]/10 text-[#6D5DFB]'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <span>हिंदी (Hindi)</span>
                {settings.language === 'hi' && <Check className="h-4 w-4 text-[#6D5DFB]" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-zinc-100 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="focus-ring min-h-12 w-full rounded-2xl bg-gradient-to-r from-[#6D5DFB] to-[#4F8CFF] font-bold text-white shadow-md hover:opacity-95 transition"
          >
            Apply Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
