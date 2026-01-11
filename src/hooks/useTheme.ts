import { useState, useEffect, useCallback } from 'react';
import { applyTheme, getThemeById, getDefaultTheme, COLOR_THEMES, ColorTheme } from '@/lib/themes';
import { saveThemeToIDB, loadThemeFromIDB } from '@/lib/storage';

// localStorage keys for migration only
const THEME_KEY = 'notearea-color-theme';
const MODE_KEY = 'notearea-theme-mode';

export type ThemeMode = 'light' | 'dark' | 'system';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ColorTheme | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  // Initialize theme on mount with localStorage migration
  useEffect(() => {
    const initTheme = async () => {
      let storedThemeId: string | null = null;
      let storedMode: ThemeMode | null = null;

      // Try to load from IndexedDB first
      const idbTheme = await loadThemeFromIDB();
      if (idbTheme) {
        storedThemeId = idbTheme.themeId;
        storedMode = idbTheme.mode as ThemeMode;
      } else {
        // Migrate from localStorage if IndexedDB is empty
        storedThemeId = localStorage.getItem(THEME_KEY);
        storedMode = localStorage.getItem(MODE_KEY) as ThemeMode | null;

        if (storedThemeId || storedMode) {
          // Save to IndexedDB and remove from localStorage
          await saveThemeToIDB(storedThemeId || 'default-light', storedMode || 'system');
          localStorage.removeItem(THEME_KEY);
          localStorage.removeItem(MODE_KEY);
        }
      }

      if (storedMode) {
        setThemeMode(storedMode);
      }

      let theme: ColorTheme;

      if (storedThemeId) {
        const foundTheme = getThemeById(storedThemeId);
        theme = foundTheme || getDefaultTheme();
      } else {
        theme = getDefaultTheme();
      }

      setCurrentTheme(theme);
      setIsDark(theme.isDark);
      applyTheme(theme);
    };

    initTheme();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const defaultTheme = e.matches
        ? getThemeById('default-dark') || getDefaultTheme()
        : getThemeById('default-light') || getDefaultTheme();

      setCurrentTheme(defaultTheme);
      setIsDark(defaultTheme.isDark);
      applyTheme(defaultTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // Set a specific theme by ID
  const setTheme = useCallback((themeId: string) => {
    const theme = getThemeById(themeId);
    if (!theme) {
      console.warn(`Theme "${themeId}" not found`);
      return;
    }

    setCurrentTheme(theme);
    setIsDark(theme.isDark);
    applyTheme(theme);

    // Update mode based on theme
    const newMode = theme.isDark ? 'dark' : 'light';
    setThemeMode(newMode);

    // Save to IndexedDB
    saveThemeToIDB(themeId, newMode);
  }, []);

  // Toggle between light/dark (uses default themes)
  const toggleTheme = useCallback(() => {
    const newIsDark = !isDark;
    const newThemeId = newIsDark ? 'default-dark' : 'default-light';
    const theme = getThemeById(newThemeId);

    if (theme) {
      setCurrentTheme(theme);
      setIsDark(newIsDark);
      applyTheme(theme);
      const newMode = newIsDark ? 'dark' : 'light';
      saveThemeToIDB(newThemeId, newMode);
    }
  }, [isDark]);

  // Set theme mode (light/dark/system)
  const setMode = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);

    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultThemeId = prefersDark ? 'default-dark' : 'default-light';
      const theme = getThemeById(defaultThemeId);
      if (theme) {
        setCurrentTheme(theme);
        setIsDark(theme.isDark);
        applyTheme(theme);
        saveThemeToIDB(defaultThemeId, mode);
      }
    } else {
      // Find a theme matching the mode, prefer current theme family if possible
      const currentFamily = currentTheme?.id.replace(/-light$|-dark$/, '');
      const targetId = currentFamily
        ? `${currentFamily}-${mode}`
        : `default-${mode}`;

      let theme = getThemeById(targetId);

      // If theme family doesn't have light/dark variant, use default
      if (!theme) {
        theme = getThemeById(`default-${mode}`);
      }

      if (theme) {
        setCurrentTheme(theme);
        setIsDark(theme.isDark);
        applyTheme(theme);
        saveThemeToIDB(theme.id, mode);
      }
    }
  }, [currentTheme]);

  return {
    isDark,
    currentTheme,
    themeMode,
    setTheme,
    setMode,
    toggleTheme,
    themes: COLOR_THEMES,
  };
}
