import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sliders, Type, Eye, Activity, Volume2, Languages, LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { SUPPORTED_LANGUAGES, type SupportedLanguageCode } from '../config/languages';
import { Button } from '../components/ui';


export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    settings,
    toggleLargeText,
    toggleHighContrast,
    toggleReduceMotion,
    toggleVoiceGuidance,
    setLanguage,
  } = useAccessibility();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl">
          Settings & Accessibility
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Customize display parameters, font sizing, language, and voice assistance.
        </p>
      </div>

      {/* User Profile Overview */}
      <div className="card p-6 bg-white shadow-md border border-zinc-200 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6D5DFB] to-[#4F8CFF] text-white font-bold text-xl shadow-md">
          {user?.full_name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-zinc-900">{user?.full_name}</h2>
          <p className="text-xs text-zinc-500">{user?.email}</p>
          {user?.phone && <p className="text-xs font-mono text-zinc-400">{user.phone}</p>}
        </div>
      </div>

      {/* Accessibility Toggles Card */}
      <div className="card p-6 bg-white shadow-md border border-zinc-200 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">
          Display & Speech Preferences
        </h2>

        {/* Larger text */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Type className="h-5 w-5 text-zinc-700" />
            <div>
              <span className="block font-bold text-sm text-zinc-900">Larger Text Mode</span>
              <span className="text-xs text-zinc-500">Increase global font size for comfortable reading</span>
            </div>
          </div>
          <button
            onClick={toggleLargeText}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              settings.largeText ? 'bg-[#6D5DFB]' : 'bg-zinc-300'
            }`}
            aria-label="Toggle larger text"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                settings.largeText ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* High contrast */}
        <div className="flex items-center justify-between py-2 border-t border-zinc-100">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-zinc-700" />
            <div>
              <span className="block font-bold text-sm text-zinc-900">High Contrast Mode</span>
              <span className="text-xs text-zinc-500">Maximum dark contrast for vision clarity</span>
            </div>
          </div>
          <button
            onClick={toggleHighContrast}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              settings.highContrast ? 'bg-[#6D5DFB]' : 'bg-zinc-300'
            }`}
            aria-label="Toggle high contrast"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                settings.highContrast ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Reduce motion */}
        <div className="flex items-center justify-between py-2 border-t border-zinc-100">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-zinc-700" />
            <div>
              <span className="block font-bold text-sm text-zinc-900">Reduce Motion</span>
              <span className="text-xs text-zinc-500">Disable floating motion keyframes</span>
            </div>
          </div>
          <button
            onClick={toggleReduceMotion}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              settings.reduceMotion ? 'bg-[#6D5DFB]' : 'bg-zinc-300'
            }`}
            aria-label="Toggle reduce motion"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                settings.reduceMotion ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Voice guidance */}
        <div className="flex items-center justify-between py-2 border-t border-zinc-100">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-zinc-700" />
            <div>
              <span className="block font-bold text-sm text-zinc-900">Voice Assistance Audio</span>
              <span className="text-xs text-zinc-500">Read payment confirmations and alerts aloud</span>
            </div>
          </div>
          <button
            onClick={toggleVoiceGuidance}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              settings.voiceGuidance ? 'bg-[#6D5DFB]' : 'bg-zinc-300'
            }`}
            aria-label="Toggle voice assistance"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                settings.voiceGuidance ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Language option */}

        <div className="pt-2 border-t border-zinc-100 space-y-2">
          <label className="block text-sm font-bold text-zinc-900">Interface & Voice Language</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = settings.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`focus-ring rounded-xl p-3 font-bold text-xs border transition ${
                    isSelected
                      ? 'border-[#6D5DFB] bg-[#6D5DFB]/10 text-[#6D5DFB]'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {lang.nativeName} ({lang.name})
                </button>
              );
            })}
          </div>
        </div>

      </div>

      <Button variant="danger" className="w-full font-bold" onClick={handleLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Log Out of Sahayak
      </Button>
    </div>
  );
};
