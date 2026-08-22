import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AccessibilitySettings } from '../types';

import type { SupportedLanguageCode } from '../config/languages';

type AccessibilityContextType = {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  toggleLargeText: () => void;
  toggleHighContrast: () => void;
  toggleReduceMotion: () => void;
  toggleVoiceGuidance: () => void;
  setLanguage: (lang: SupportedLanguageCode) => void;
};


const defaultSettings: AccessibilitySettings = {
  largeText: false,
  highContrast: false,
  reduceMotion: false,
  voiceGuidance: true,
  language: 'en',
};

const STORAGE_KEY = 'sahayak_accessibility_settings';

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save accessibility settings to localStorage', e);
    }

    // Apply HTML root classes for global styling
    const root = document.documentElement;

    if (settings.largeText) {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleLargeText = () => updateSettings({ largeText: !settings.largeText });
  const toggleHighContrast = () => updateSettings({ highContrast: !settings.highContrast });
  const toggleReduceMotion = () => updateSettings({ reduceMotion: !settings.reduceMotion });
  const toggleVoiceGuidance = () => updateSettings({ voiceGuidance: !settings.voiceGuidance });
  const setLanguage = (language: SupportedLanguageCode) => updateSettings({ language });


  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        toggleLargeText,
        toggleHighContrast,
        toggleReduceMotion,
        toggleVoiceGuidance,
        setLanguage,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
