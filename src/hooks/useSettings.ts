import { useState, useEffect, useCallback } from 'react';

export interface Settings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  wordCountGoal: number | null;
  autoSave: boolean;
  autoSaveInterval: number;
  theme: 'light' | 'dark' | 'system';
  colorTheme: string; // Theme ID from themes.ts
  editorWidth: 'narrow' | 'medium' | 'wide' | 'full';
  typewriterMode: boolean; // Keep current line centered while typing
  focusMode: boolean; // Fade non-active paragraphs
}

const DEFAULT_SETTINGS: Settings = {
  fontSize: 18,
  fontFamily: 'Inter',
  lineHeight: 1.8,
  wordCountGoal: null,
  autoSave: true,
  autoSaveInterval: 1500,
  theme: 'system',
  colorTheme: 'default-light', // Will be adjusted based on system preference
  editorWidth: 'medium',
  typewriterMode: false,
  focusMode: false,
};

const STORAGE_KEY = 'notearea-settings';

/**
 * Hook for managing app settings with localStorage persistence
 */
export const useSettings = () => {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettingsState({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Settings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, []);

  // Update a single setting
  const setSetting = useCallback(<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettingsState((prev) => {
      const newSettings = { ...prev, [key]: value };
      saveSettings(newSettings);
      return newSettings;
    });
  }, [saveSettings]);

  // Update multiple settings
  const setSettings = useCallback((partial: Partial<Settings>) => {
    setSettingsState((prev) => {
      const newSettings = { ...prev, ...partial };
      saveSettings(newSettings);
      return newSettings;
    });
  }, [saveSettings]);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  // Get word count goal progress
  const getWordCountProgress = useCallback((wordCount: number) => {
    if (!settings.wordCountGoal || settings.wordCountGoal <= 0) {
      return null;
    }

    const progress = Math.min((wordCount / settings.wordCountGoal) * 100, 100);
    const isComplete = wordCount >= settings.wordCountGoal;

    return {
      current: wordCount,
      goal: settings.wordCountGoal,
      progress,
      isComplete,
      remaining: Math.max(settings.wordCountGoal - wordCount, 0),
    };
  }, [settings.wordCountGoal]);

  return {
    settings,
    isLoaded,
    setSetting,
    setSettings,
    resetSettings,
    getWordCountProgress,
  };
};

// Preset word count goals
export const WORD_COUNT_PRESETS = [
  { label: 'Tidak ada', value: null },
  { label: '250 kata (Tweet thread)', value: 250 },
  { label: '500 kata (Blog pendek)', value: 500 },
  { label: '1,000 kata (Artikel)', value: 1000 },
  { label: '1,500 kata (Blog panjang)', value: 1500 },
  { label: '2,000 kata (Essay)', value: 2000 },
  { label: '3,000 kata (Laporan)', value: 3000 },
  { label: '5,000 kata (Makalah)', value: 5000 },
];

// Font family options with proper CSS font-family values
// Organized by category for better UX
export const FONT_FAMILIES = [
  // === ELEGANT SERIF (Best for long-form writing) ===
  { label: 'Lora (Elegant)', value: 'Lora', preview: 'font-serif', category: 'serif' },
  { label: 'Merriweather (Classic)', value: 'Merriweather', preview: 'font-serif', category: 'serif' },
  { label: 'Crimson Pro (Book Style)', value: 'Crimson Pro', preview: 'font-serif', category: 'serif' },
  { label: 'Literata (Reading)', value: 'Literata', preview: 'font-serif', category: 'serif' },
  { label: 'Source Serif Pro', value: 'Source Serif 4', preview: 'font-serif', category: 'serif' },
  { label: 'Spectral (Elegant)', value: 'Spectral', preview: 'font-serif', category: 'serif' },
  { label: 'EB Garamond (Classical)', value: 'EB Garamond', preview: 'font-serif', category: 'serif' },
  { label: 'Libre Baskerville', value: 'Libre Baskerville', preview: 'font-serif', category: 'serif' },
  { label: 'Playfair Display', value: 'Playfair Display', preview: 'font-serif', category: 'serif' },
  { label: 'Georgia (System)', value: 'Georgia', preview: 'font-serif', category: 'serif' },

  // === CLEAN SANS-SERIF (Modern & Minimal) ===
  { label: 'Inter (Modern)', value: 'Inter', preview: 'font-sans', category: 'sans' },
  { label: 'Open Sans (Friendly)', value: 'Open Sans', preview: 'font-sans', category: 'sans' },
  { label: 'Nunito (Soft)', value: 'Nunito', preview: 'font-sans', category: 'sans' },
  { label: 'Poppins (Clean)', value: 'Poppins', preview: 'font-sans', category: 'sans' },
  { label: 'Work Sans (Professional)', value: 'Work Sans', preview: 'font-sans', category: 'sans' },
  { label: 'System UI', value: 'system-ui', preview: 'font-sans', category: 'sans' },

  // === TYPEWRITER & MONOSPACE (For that classic feel) ===
  { label: 'Courier Prime (Screenplay)', value: 'Courier Prime', preview: 'font-mono', category: 'mono' },
  { label: 'Special Elite (Vintage)', value: 'Special Elite', preview: 'font-mono', category: 'mono' },
  { label: 'iA Writer Mono', value: 'iA Writer Mono S', preview: 'font-mono', category: 'mono' },
  { label: 'iA Writer Duo', value: 'iA Writer Duo S', preview: 'font-mono', category: 'mono' },
  { label: 'JetBrains Mono', value: 'JetBrains Mono', preview: 'font-mono', category: 'mono' },
  { label: 'Fira Code', value: 'Fira Code', preview: 'font-mono', category: 'mono' },
  { label: 'IBM Plex Mono', value: 'IBM Plex Mono', preview: 'font-mono', category: 'mono' },
  { label: 'Source Code Pro', value: 'Source Code Pro', preview: 'font-mono', category: 'mono' },
  { label: 'Inconsolata', value: 'Inconsolata', preview: 'font-mono', category: 'mono' },
  { label: 'Roboto Mono', value: 'Roboto Mono', preview: 'font-mono', category: 'mono' },
  { label: 'VT323 (Retro)', value: 'VT323', preview: 'font-mono', category: 'mono' },
  { label: 'Courier New', value: 'Courier New', preview: 'font-mono', category: 'mono' },
];

// Line height options
export const LINE_HEIGHTS = [
  { label: 'Compact', value: 1.4 },
  { label: 'Normal', value: 1.6 },
  { label: 'Relaxed', value: 1.8 },
  { label: 'Loose', value: 2.0 },
  { label: 'Extra Loose', value: 2.2 },
];

// Editor width options
export const EDITOR_WIDTHS = [
  { label: 'Narrow', value: 'narrow' as const, maxWidth: '640px' },
  { label: 'Medium', value: 'medium' as const, maxWidth: '768px' },
  { label: 'Wide', value: 'wide' as const, maxWidth: '1024px' },
  { label: 'Full', value: 'full' as const, maxWidth: '100%' },
];

// Helper to get CSS styles from settings
export const getEditorStyles = (settings: Settings): React.CSSProperties => {
  // Find font category from FONT_FAMILIES
  const fontConfig = FONT_FAMILIES.find(f => f.value === settings.fontFamily);
  const category = fontConfig?.category || 'sans';

  // Determine fallback font based on category
  const fallback = category === 'mono'
    ? 'monospace'
    : category === 'serif'
    ? 'Georgia, serif'
    : 'system-ui, sans-serif';

  return {
    fontSize: `${settings.fontSize}px`,
    fontFamily: `"${settings.fontFamily}", ${fallback}`,
    lineHeight: settings.lineHeight,
  };
};

// Helper to get editor max-width class
export const getEditorWidthClass = (width: Settings['editorWidth']): string => {
  switch (width) {
    case 'narrow': return 'max-w-2xl';
    case 'medium': return 'max-w-3xl';
    case 'wide': return 'max-w-5xl';
    case 'full': return 'max-w-full';
    default: return 'max-w-3xl';
  }
};
