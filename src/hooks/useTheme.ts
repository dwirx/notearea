import { useState, useEffect, useCallback } from 'react';
import { applyTheme, getThemeById, getDefaultTheme, COLOR_THEMES, ColorTheme } from '@/lib/themes';

const THEME_KEY = 'notearea-color-theme';
const MODE_KEY = 'notearea-theme-mode';

export type ThemeMode = 'light' | 'dark' | 'system';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ColorTheme | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  // Initialize theme on mount
  useEffect(() => {
    const storedThemeId = localStorage.getItem(THEME_KEY);
    const storedMode = localStorage.getItem(MODE_KEY) as ThemeMode | null;

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
    localStorage.setItem(THEME_KEY, themeId);

    // Update mode based on theme
    const newMode = theme.isDark ? 'dark' : 'light';
    setThemeMode(newMode);
    localStorage.setItem(MODE_KEY, newMode);
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
      localStorage.setItem(THEME_KEY, newThemeId);
      localStorage.setItem(MODE_KEY, newIsDark ? 'dark' : 'light');
    }
  }, [isDark]);

  // Set theme mode (light/dark/system)
  const setMode = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem(MODE_KEY, mode);

    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultThemeId = prefersDark ? 'default-dark' : 'default-light';
      const theme = getThemeById(defaultThemeId);
      if (theme) {
        setCurrentTheme(theme);
        setIsDark(theme.isDark);
        applyTheme(theme);
        localStorage.setItem(THEME_KEY, defaultThemeId);
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
        localStorage.setItem(THEME_KEY, theme.id);
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
