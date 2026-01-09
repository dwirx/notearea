/**
 * Theme System - Extensible color themes for the editor
 *
 * To add a new theme:
 * 1. Add a new entry to COLOR_THEMES array
 * 2. The theme will automatically appear in settings
 * 3. CSS variables will be applied automatically
 */

export interface ColorTheme {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  preview: {
    bg: string;
    fg: string;
    accent: string;
  };
  colors: {
    // Background colors
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;

    // Primary/Accent
    primary: string;
    primaryForeground: string;

    // Secondary
    secondary: string;
    secondaryForeground: string;

    // Muted
    muted: string;
    mutedForeground: string;

    // Accent
    accent: string;
    accentForeground: string;

    // Destructive
    destructive: string;
    destructiveForeground: string;

    // Border/Input/Ring
    border: string;
    input: string;
    ring: string;

    // Editor specific
    editorBg: string;
    editorText: string;
    editorPlaceholder: string;
    editorSelection: string;
    editorSelectionText: string;
    editorCursor: string;

    // Menu
    menuBg: string;
    menuShadow: string;

    // Sidebar
    sidebarBackground: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
  };
}

// Default Light Theme (Warm Paper)
const defaultLight: ColorTheme = {
  id: 'default-light',
  name: 'Default Light',
  description: 'Tema terang dengan nuansa kertas hangat',
  isDark: false,
  preview: {
    bg: '#fdfbf7',
    fg: '#1f1a14',
    accent: '#d97706',
  },
  colors: {
    background: '40 20% 98%',
    foreground: '30 10% 12%',
    card: '40 15% 96%',
    cardForeground: '30 10% 12%',
    popover: '40 20% 99%',
    popoverForeground: '30 10% 12%',
    primary: '32 95% 44%',
    primaryForeground: '40 20% 99%',
    secondary: '40 12% 90%',
    secondaryForeground: '30 10% 20%',
    muted: '40 10% 94%',
    mutedForeground: '30 8% 45%',
    accent: '32 80% 50%',
    accentForeground: '40 20% 99%',
    destructive: '0 72% 51%',
    destructiveForeground: '0 0% 100%',
    border: '35 15% 88%',
    input: '35 15% 88%',
    ring: '32 95% 44%',
    editorBg: '42 25% 97%',
    editorText: '30 10% 18%',
    editorPlaceholder: '30 8% 55%',
    editorSelection: '32 90% 85%',
    editorSelectionText: '30 10% 10%',
    editorCursor: '32 95% 44%',
    menuBg: '40 20% 99%',
    menuShadow: '30 15% 15%',
    sidebarBackground: '40 15% 96%',
    sidebarForeground: '30 10% 25%',
    sidebarPrimary: '32 95% 44%',
    sidebarPrimaryForeground: '40 20% 99%',
    sidebarAccent: '40 12% 92%',
    sidebarAccentForeground: '30 10% 20%',
    sidebarBorder: '35 15% 88%',
    sidebarRing: '32 95% 44%',
  },
};

// Default Dark Theme (Warm Dark)
const defaultDark: ColorTheme = {
  id: 'default-dark',
  name: 'Default Dark',
  description: 'Tema gelap dengan nuansa hangat',
  isDark: true,
  preview: {
    bg: '#1a1612',
    fg: '#e8e4de',
    accent: '#f59e0b',
  },
  colors: {
    background: '30 15% 8%',
    foreground: '40 15% 90%',
    card: '30 12% 10%',
    cardForeground: '40 15% 90%',
    popover: '30 12% 10%',
    popoverForeground: '40 15% 90%',
    primary: '35 100% 55%',
    primaryForeground: '30 15% 8%',
    secondary: '30 10% 15%',
    secondaryForeground: '40 15% 85%',
    muted: '30 10% 18%',
    mutedForeground: '40 10% 55%',
    accent: '35 100% 55%',
    accentForeground: '30 15% 8%',
    destructive: '0 72% 51%',
    destructiveForeground: '0 0% 100%',
    border: '30 10% 18%',
    input: '30 10% 18%',
    ring: '35 100% 55%',
    editorBg: '30 12% 9%',
    editorText: '40 15% 88%',
    editorPlaceholder: '30 8% 45%',
    editorSelection: '35 80% 35%',
    editorSelectionText: '40 20% 98%',
    editorCursor: '35 100% 55%',
    menuBg: '30 12% 12%',
    menuShadow: '0 0% 0%',
    sidebarBackground: '30 12% 10%',
    sidebarForeground: '40 15% 85%',
    sidebarPrimary: '35 100% 55%',
    sidebarPrimaryForeground: '30 15% 8%',
    sidebarAccent: '30 10% 15%',
    sidebarAccentForeground: '40 15% 85%',
    sidebarBorder: '30 10% 18%',
    sidebarRing: '35 100% 55%',
  },
};

// Gruvbox Light
const gruvboxLight: ColorTheme = {
  id: 'gruvbox-light',
  name: 'Gruvbox Light',
  description: 'Tema retro dengan warna hangat',
  isDark: false,
  preview: {
    bg: '#fbf1c7',
    fg: '#3c3836',
    accent: '#d65d0e',
  },
  colors: {
    background: '48 87% 88%',
    foreground: '30 5% 22%',
    card: '48 75% 84%',
    cardForeground: '30 5% 22%',
    popover: '48 87% 88%',
    popoverForeground: '30 5% 22%',
    primary: '24 100% 45%',
    primaryForeground: '48 87% 95%',
    secondary: '48 50% 78%',
    secondaryForeground: '30 5% 22%',
    muted: '48 45% 80%',
    mutedForeground: '30 5% 40%',
    accent: '27 75% 49%',
    accentForeground: '48 87% 95%',
    destructive: '6 96% 49%',
    destructiveForeground: '48 87% 95%',
    border: '48 40% 75%',
    input: '48 40% 75%',
    ring: '24 100% 45%',
    editorBg: '48 87% 88%',
    editorText: '30 5% 22%',
    editorPlaceholder: '30 5% 50%',
    editorSelection: '24 80% 75%',
    editorSelectionText: '30 5% 15%',
    editorCursor: '24 100% 45%',
    menuBg: '48 80% 86%',
    menuShadow: '30 10% 20%',
    sidebarBackground: '48 70% 82%',
    sidebarForeground: '30 5% 25%',
    sidebarPrimary: '24 100% 45%',
    sidebarPrimaryForeground: '48 87% 95%',
    sidebarAccent: '48 50% 78%',
    sidebarAccentForeground: '30 5% 22%',
    sidebarBorder: '48 40% 75%',
    sidebarRing: '24 100% 45%',
  },
};

// Gruvbox Dark
const gruvboxDark: ColorTheme = {
  id: 'gruvbox-dark',
  name: 'Gruvbox Dark',
  description: 'Tema retro gelap dengan kontras tinggi',
  isDark: true,
  preview: {
    bg: '#282828',
    fg: '#ebdbb2',
    accent: '#fe8019',
  },
  colors: {
    background: '0 0% 16%',
    foreground: '43 59% 81%',
    card: '0 0% 18%',
    cardForeground: '43 59% 81%',
    popover: '0 0% 18%',
    popoverForeground: '43 59% 81%',
    primary: '27 99% 55%',
    primaryForeground: '0 0% 10%',
    secondary: '0 0% 22%',
    secondaryForeground: '43 59% 75%',
    muted: '0 0% 24%',
    mutedForeground: '43 30% 55%',
    accent: '27 99% 55%',
    accentForeground: '0 0% 10%',
    destructive: '6 96% 55%',
    destructiveForeground: '0 0% 100%',
    border: '0 0% 26%',
    input: '0 0% 26%',
    ring: '27 99% 55%',
    editorBg: '0 0% 16%',
    editorText: '43 59% 81%',
    editorPlaceholder: '43 30% 50%',
    editorSelection: '27 70% 35%',
    editorSelectionText: '43 59% 95%',
    editorCursor: '27 99% 55%',
    menuBg: '0 0% 20%',
    menuShadow: '0 0% 0%',
    sidebarBackground: '0 0% 18%',
    sidebarForeground: '43 59% 75%',
    sidebarPrimary: '27 99% 55%',
    sidebarPrimaryForeground: '0 0% 10%',
    sidebarAccent: '0 0% 22%',
    sidebarAccentForeground: '43 59% 75%',
    sidebarBorder: '0 0% 26%',
    sidebarRing: '27 99% 55%',
  },
};

// Nord Light (Snow Storm)
const nordLight: ColorTheme = {
  id: 'nord-light',
  name: 'Nord Light',
  description: 'Tema terang dengan nuansa kutub',
  isDark: false,
  preview: {
    bg: '#eceff4',
    fg: '#2e3440',
    accent: '#5e81ac',
  },
  colors: {
    background: '218 27% 94%',
    foreground: '220 16% 22%',
    card: '218 27% 92%',
    cardForeground: '220 16% 22%',
    popover: '218 27% 94%',
    popoverForeground: '220 16% 22%',
    primary: '213 32% 52%',
    primaryForeground: '218 27% 98%',
    secondary: '218 27% 88%',
    secondaryForeground: '220 16% 25%',
    muted: '218 20% 90%',
    mutedForeground: '220 10% 45%',
    accent: '213 32% 52%',
    accentForeground: '218 27% 98%',
    destructive: '354 42% 56%',
    destructiveForeground: '218 27% 98%',
    border: '218 20% 85%',
    input: '218 20% 85%',
    ring: '213 32% 52%',
    editorBg: '218 27% 94%',
    editorText: '220 16% 22%',
    editorPlaceholder: '220 10% 50%',
    editorSelection: '213 40% 80%',
    editorSelectionText: '220 16% 15%',
    editorCursor: '213 32% 52%',
    menuBg: '218 27% 92%',
    menuShadow: '220 16% 30%',
    sidebarBackground: '218 27% 90%',
    sidebarForeground: '220 16% 28%',
    sidebarPrimary: '213 32% 52%',
    sidebarPrimaryForeground: '218 27% 98%',
    sidebarAccent: '218 27% 86%',
    sidebarAccentForeground: '220 16% 25%',
    sidebarBorder: '218 20% 85%',
    sidebarRing: '213 32% 52%',
  },
};

// Nord Dark (Polar Night)
const nordDark: ColorTheme = {
  id: 'nord-dark',
  name: 'Nord Dark',
  description: 'Tema gelap dengan nuansa kutub',
  isDark: true,
  preview: {
    bg: '#2e3440',
    fg: '#eceff4',
    accent: '#88c0d0',
  },
  colors: {
    background: '220 16% 22%',
    foreground: '218 27% 94%',
    card: '220 16% 24%',
    cardForeground: '218 27% 94%',
    popover: '220 16% 24%',
    popoverForeground: '218 27% 94%',
    primary: '193 43% 67%',
    primaryForeground: '220 16% 15%',
    secondary: '220 16% 28%',
    secondaryForeground: '218 27% 88%',
    muted: '220 16% 30%',
    mutedForeground: '218 20% 60%',
    accent: '193 43% 67%',
    accentForeground: '220 16% 15%',
    destructive: '354 42% 56%',
    destructiveForeground: '218 27% 98%',
    border: '220 16% 32%',
    input: '220 16% 32%',
    ring: '193 43% 67%',
    editorBg: '220 16% 22%',
    editorText: '218 27% 94%',
    editorPlaceholder: '218 20% 55%',
    editorSelection: '193 40% 35%',
    editorSelectionText: '218 27% 98%',
    editorCursor: '193 43% 67%',
    menuBg: '220 16% 26%',
    menuShadow: '0 0% 0%',
    sidebarBackground: '220 16% 24%',
    sidebarForeground: '218 27% 88%',
    sidebarPrimary: '193 43% 67%',
    sidebarPrimaryForeground: '220 16% 15%',
    sidebarAccent: '220 16% 28%',
    sidebarAccentForeground: '218 27% 88%',
    sidebarBorder: '220 16% 32%',
    sidebarRing: '193 43% 67%',
  },
};

// Dracula
const dracula: ColorTheme = {
  id: 'dracula',
  name: 'Dracula',
  description: 'Tema gelap dengan warna cerah',
  isDark: true,
  preview: {
    bg: '#282a36',
    fg: '#f8f8f2',
    accent: '#bd93f9',
  },
  colors: {
    background: '231 15% 18%',
    foreground: '60 30% 96%',
    card: '231 15% 20%',
    cardForeground: '60 30% 96%',
    popover: '231 15% 20%',
    popoverForeground: '60 30% 96%',
    primary: '265 89% 78%',
    primaryForeground: '231 15% 15%',
    secondary: '231 15% 25%',
    secondaryForeground: '60 30% 90%',
    muted: '231 15% 28%',
    mutedForeground: '60 20% 60%',
    accent: '265 89% 78%',
    accentForeground: '231 15% 15%',
    destructive: '0 100% 67%',
    destructiveForeground: '231 15% 15%',
    border: '231 15% 30%',
    input: '231 15% 30%',
    ring: '265 89% 78%',
    editorBg: '231 15% 18%',
    editorText: '60 30% 96%',
    editorPlaceholder: '60 10% 50%',
    editorSelection: '265 60% 40%',
    editorSelectionText: '60 30% 98%',
    editorCursor: '265 89% 78%',
    menuBg: '231 15% 22%',
    menuShadow: '0 0% 0%',
    sidebarBackground: '231 15% 20%',
    sidebarForeground: '60 30% 90%',
    sidebarPrimary: '265 89% 78%',
    sidebarPrimaryForeground: '231 15% 15%',
    sidebarAccent: '231 15% 25%',
    sidebarAccentForeground: '60 30% 90%',
    sidebarBorder: '231 15% 30%',
    sidebarRing: '265 89% 78%',
  },
};

// Solarized Light
const solarizedLight: ColorTheme = {
  id: 'solarized-light',
  name: 'Solarized Light',
  description: 'Tema terang dengan kontras rendah',
  isDark: false,
  preview: {
    bg: '#fdf6e3',
    fg: '#657b83',
    accent: '#268bd2',
  },
  colors: {
    background: '44 87% 94%',
    foreground: '194 14% 45%',
    card: '44 75% 90%',
    cardForeground: '194 14% 40%',
    popover: '44 87% 94%',
    popoverForeground: '194 14% 40%',
    primary: '205 82% 45%',
    primaryForeground: '44 87% 98%',
    secondary: '44 60% 86%',
    secondaryForeground: '194 14% 35%',
    muted: '44 50% 88%',
    mutedForeground: '194 14% 50%',
    accent: '205 82% 45%',
    accentForeground: '44 87% 98%',
    destructive: '1 71% 52%',
    destructiveForeground: '44 87% 98%',
    border: '44 40% 82%',
    input: '44 40% 82%',
    ring: '205 82% 45%',
    editorBg: '44 87% 94%',
    editorText: '192 81% 14%',
    editorPlaceholder: '194 14% 55%',
    editorSelection: '205 70% 80%',
    editorSelectionText: '192 81% 10%',
    editorCursor: '205 82% 45%',
    menuBg: '44 80% 92%',
    menuShadow: '194 14% 30%',
    sidebarBackground: '44 70% 88%',
    sidebarForeground: '194 14% 40%',
    sidebarPrimary: '205 82% 45%',
    sidebarPrimaryForeground: '44 87% 98%',
    sidebarAccent: '44 60% 84%',
    sidebarAccentForeground: '194 14% 35%',
    sidebarBorder: '44 40% 82%',
    sidebarRing: '205 82% 45%',
  },
};

// Solarized Dark
const solarizedDark: ColorTheme = {
  id: 'solarized-dark',
  name: 'Solarized Dark',
  description: 'Tema gelap dengan kontras rendah',
  isDark: true,
  preview: {
    bg: '#002b36',
    fg: '#839496',
    accent: '#268bd2',
  },
  colors: {
    background: '192 100% 11%',
    foreground: '186 8% 55%',
    card: '192 100% 13%',
    cardForeground: '186 8% 60%',
    popover: '192 100% 13%',
    popoverForeground: '186 8% 60%',
    primary: '205 82% 45%',
    primaryForeground: '192 100% 5%',
    secondary: '192 80% 16%',
    secondaryForeground: '186 8% 70%',
    muted: '192 70% 18%',
    mutedForeground: '186 8% 50%',
    accent: '205 82% 45%',
    accentForeground: '192 100% 5%',
    destructive: '1 71% 52%',
    destructiveForeground: '192 100% 95%',
    border: '192 60% 20%',
    input: '192 60% 20%',
    ring: '205 82% 45%',
    editorBg: '192 100% 11%',
    editorText: '44 87% 94%',
    editorPlaceholder: '186 8% 45%',
    editorSelection: '205 60% 30%',
    editorSelectionText: '44 87% 98%',
    editorCursor: '205 82% 45%',
    menuBg: '192 90% 14%',
    menuShadow: '0 0% 0%',
    sidebarBackground: '192 100% 13%',
    sidebarForeground: '186 8% 65%',
    sidebarPrimary: '205 82% 45%',
    sidebarPrimaryForeground: '192 100% 5%',
    sidebarAccent: '192 80% 16%',
    sidebarAccentForeground: '186 8% 70%',
    sidebarBorder: '192 60% 20%',
    sidebarRing: '205 82% 45%',
  },
};

// Tokyo Night
const tokyoNight: ColorTheme = {
  id: 'tokyo-night',
  name: 'Tokyo Night',
  description: 'Tema gelap terinspirasi dari Tokyo',
  isDark: true,
  preview: {
    bg: '#1a1b26',
    fg: '#a9b1d6',
    accent: '#7aa2f7',
  },
  colors: {
    background: '235 21% 13%',
    foreground: '229 31% 75%',
    card: '235 21% 15%',
    cardForeground: '229 31% 75%',
    popover: '235 21% 15%',
    popoverForeground: '229 31% 75%',
    primary: '220 91% 72%',
    primaryForeground: '235 21% 10%',
    secondary: '235 21% 20%',
    secondaryForeground: '229 31% 85%',
    muted: '235 21% 23%',
    mutedForeground: '229 20% 55%',
    accent: '220 91% 72%',
    accentForeground: '235 21% 10%',
    destructive: '348 86% 61%',
    destructiveForeground: '235 21% 10%',
    border: '235 21% 26%',
    input: '235 21% 26%',
    ring: '220 91% 72%',
    editorBg: '235 21% 13%',
    editorText: '229 31% 80%',
    editorPlaceholder: '229 20% 45%',
    editorSelection: '220 60% 35%',
    editorSelectionText: '229 31% 95%',
    editorCursor: '220 91% 72%',
    menuBg: '235 21% 17%',
    menuShadow: '0 0% 0%',
    sidebarBackground: '235 21% 15%',
    sidebarForeground: '229 31% 75%',
    sidebarPrimary: '220 91% 72%',
    sidebarPrimaryForeground: '235 21% 10%',
    sidebarAccent: '235 21% 20%',
    sidebarAccentForeground: '229 31% 85%',
    sidebarBorder: '235 21% 26%',
    sidebarRing: '220 91% 72%',
  },
};

// Catppuccin Mocha
const catppuccinMocha: ColorTheme = {
  id: 'catppuccin-mocha',
  name: 'Catppuccin Mocha',
  description: 'Tema gelap yang lembut dan nyaman',
  isDark: true,
  preview: {
    bg: '#1e1e2e',
    fg: '#cdd6f4',
    accent: '#cba6f7',
  },
  colors: {
    background: '240 21% 15%',
    foreground: '226 64% 88%',
    card: '240 21% 17%',
    cardForeground: '226 64% 88%',
    popover: '240 21% 17%',
    popoverForeground: '226 64% 88%',
    primary: '267 84% 81%',
    primaryForeground: '240 21% 12%',
    secondary: '240 21% 22%',
    secondaryForeground: '226 64% 85%',
    muted: '240 21% 25%',
    mutedForeground: '226 40% 55%',
    accent: '267 84% 81%',
    accentForeground: '240 21% 12%',
    destructive: '343 81% 75%',
    destructiveForeground: '240 21% 12%',
    border: '240 21% 28%',
    input: '240 21% 28%',
    ring: '267 84% 81%',
    editorBg: '240 21% 15%',
    editorText: '226 64% 88%',
    editorPlaceholder: '226 40% 50%',
    editorSelection: '267 50% 35%',
    editorSelectionText: '226 64% 95%',
    editorCursor: '267 84% 81%',
    menuBg: '240 21% 19%',
    menuShadow: '0 0% 0%',
    sidebarBackground: '240 21% 17%',
    sidebarForeground: '226 64% 85%',
    sidebarPrimary: '267 84% 81%',
    sidebarPrimaryForeground: '240 21% 12%',
    sidebarAccent: '240 21% 22%',
    sidebarAccentForeground: '226 64% 85%',
    sidebarBorder: '240 21% 28%',
    sidebarRing: '267 84% 81%',
  },
};

// Catppuccin Latte
const catppuccinLatte: ColorTheme = {
  id: 'catppuccin-latte',
  name: 'Catppuccin Latte',
  description: 'Tema terang yang lembut',
  isDark: false,
  preview: {
    bg: '#eff1f5',
    fg: '#4c4f69',
    accent: '#8839ef',
  },
  colors: {
    background: '220 23% 95%',
    foreground: '234 16% 35%',
    card: '220 23% 92%',
    cardForeground: '234 16% 35%',
    popover: '220 23% 95%',
    popoverForeground: '234 16% 35%',
    primary: '267 83% 58%',
    primaryForeground: '220 23% 98%',
    secondary: '220 23% 88%',
    secondaryForeground: '234 16% 30%',
    muted: '220 20% 90%',
    mutedForeground: '234 16% 50%',
    accent: '267 83% 58%',
    accentForeground: '220 23% 98%',
    destructive: '347 87% 44%',
    destructiveForeground: '220 23% 98%',
    border: '220 20% 85%',
    input: '220 20% 85%',
    ring: '267 83% 58%',
    editorBg: '220 23% 95%',
    editorText: '234 16% 30%',
    editorPlaceholder: '234 16% 55%',
    editorSelection: '267 70% 85%',
    editorSelectionText: '234 16% 20%',
    editorCursor: '267 83% 58%',
    menuBg: '220 23% 93%',
    menuShadow: '234 16% 40%',
    sidebarBackground: '220 23% 92%',
    sidebarForeground: '234 16% 38%',
    sidebarPrimary: '267 83% 58%',
    sidebarPrimaryForeground: '220 23% 98%',
    sidebarAccent: '220 23% 88%',
    sidebarAccentForeground: '234 16% 30%',
    sidebarBorder: '220 20% 85%',
    sidebarRing: '267 83% 58%',
  },
};

/**
 * All available color themes
 * Add new themes to this array to make them available in settings
 */
export const COLOR_THEMES: ColorTheme[] = [
  defaultLight,
  defaultDark,
  gruvboxLight,
  gruvboxDark,
  nordLight,
  nordDark,
  dracula,
  solarizedLight,
  solarizedDark,
  tokyoNight,
  catppuccinMocha,
  catppuccinLatte,
];

/**
 * Get theme by ID
 */
export const getThemeById = (id: string): ColorTheme | undefined => {
  return COLOR_THEMES.find(theme => theme.id === id);
};

/**
 * Get themes filtered by light/dark
 */
export const getLightThemes = (): ColorTheme[] => {
  return COLOR_THEMES.filter(theme => !theme.isDark);
};

export const getDarkThemes = (): ColorTheme[] => {
  return COLOR_THEMES.filter(theme => theme.isDark);
};

/**
 * Apply theme CSS variables to document root
 */
export const applyTheme = (theme: ColorTheme): void => {
  const root = document.documentElement;

  // Set CSS variables
  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--foreground', theme.colors.foreground);
  root.style.setProperty('--card', theme.colors.card);
  root.style.setProperty('--card-foreground', theme.colors.cardForeground);
  root.style.setProperty('--popover', theme.colors.popover);
  root.style.setProperty('--popover-foreground', theme.colors.popoverForeground);
  root.style.setProperty('--primary', theme.colors.primary);
  root.style.setProperty('--primary-foreground', theme.colors.primaryForeground);
  root.style.setProperty('--secondary', theme.colors.secondary);
  root.style.setProperty('--secondary-foreground', theme.colors.secondaryForeground);
  root.style.setProperty('--muted', theme.colors.muted);
  root.style.setProperty('--muted-foreground', theme.colors.mutedForeground);
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--accent-foreground', theme.colors.accentForeground);
  root.style.setProperty('--destructive', theme.colors.destructive);
  root.style.setProperty('--destructive-foreground', theme.colors.destructiveForeground);
  root.style.setProperty('--border', theme.colors.border);
  root.style.setProperty('--input', theme.colors.input);
  root.style.setProperty('--ring', theme.colors.ring);
  root.style.setProperty('--editor-bg', theme.colors.editorBg);
  root.style.setProperty('--editor-text', theme.colors.editorText);
  root.style.setProperty('--editor-placeholder', theme.colors.editorPlaceholder);
  root.style.setProperty('--editor-selection', theme.colors.editorSelection);
  root.style.setProperty('--editor-selection-text', theme.colors.editorSelectionText);
  root.style.setProperty('--editor-cursor', theme.colors.editorCursor);
  root.style.setProperty('--menu-bg', theme.colors.menuBg);
  root.style.setProperty('--menu-shadow', theme.colors.menuShadow);
  root.style.setProperty('--sidebar-background', theme.colors.sidebarBackground);
  root.style.setProperty('--sidebar-foreground', theme.colors.sidebarForeground);
  root.style.setProperty('--sidebar-primary', theme.colors.sidebarPrimary);
  root.style.setProperty('--sidebar-primary-foreground', theme.colors.sidebarPrimaryForeground);
  root.style.setProperty('--sidebar-accent', theme.colors.sidebarAccent);
  root.style.setProperty('--sidebar-accent-foreground', theme.colors.sidebarAccentForeground);
  root.style.setProperty('--sidebar-border', theme.colors.sidebarBorder);
  root.style.setProperty('--sidebar-ring', theme.colors.sidebarRing);

  // Toggle dark class based on theme
  root.classList.toggle('dark', theme.isDark);
};

/**
 * Get default theme based on system preference
 */
export const getDefaultTheme = (): ColorTheme => {
  if (typeof window !== 'undefined') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? defaultDark : defaultLight;
  }
  return defaultLight;
};
