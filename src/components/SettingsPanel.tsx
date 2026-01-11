import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Type, AlignLeft, Target, Moon, Sun, Monitor, RotateCcw, Maximize2, Palette, Check, Edit3, Focus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings as SettingsType, WORD_COUNT_PRESETS, FONT_FAMILIES, LINE_HEIGHTS, EDITOR_WIDTHS } from '@/hooks/useSettings';
import { getLightThemes, getDarkThemes, ColorTheme } from '@/lib/themes';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsType;
  onSettingChange: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => void;
  onReset: () => void;
  currentThemeId?: string;
  onThemeChange?: (themeId: string) => void;
}

// Theme preview card component
const ThemeCard = ({
  theme,
  isSelected,
  onClick,
}: {
  theme: ColorTheme;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col gap-1.5 p-2 rounded-lg border-2 transition-all hover:scale-[1.02] ${
      isSelected
        ? 'border-primary shadow-md'
        : 'border-border/50 hover:border-border'
    }`}
    style={{ background: theme.preview.bg }}
  >
    {/* Selected indicator */}
    {isSelected && (
      <div
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: theme.preview.accent }}
      >
        <Check className="w-3 h-3 text-white" />
      </div>
    )}

    {/* Color preview dots */}
    <div className="flex gap-1">
      <div
        className="w-3 h-3 rounded-full"
        style={{ background: theme.preview.accent }}
      />
      <div
        className="w-3 h-3 rounded-full"
        style={{ background: theme.preview.fg }}
      />
      <div
        className="w-3 h-3 rounded-full border"
        style={{ background: theme.preview.bg, borderColor: theme.preview.fg + '30' }}
      />
    </div>

    {/* Theme name */}
    <span
      className="text-[10px] font-medium truncate w-full text-left"
      style={{ color: theme.preview.fg }}
    >
      {theme.name.replace(' Light', '').replace(' Dark', '')}
    </span>
  </button>
);

const SettingsPanel = ({
  isOpen,
  onClose,
  settings,
  onSettingChange,
  onReset,
  currentThemeId = 'default-light',
  onThemeChange,
}: SettingsPanelProps) => {
  const lightThemes = getLightThemes();
  const darkThemes = getDarkThemes();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full xs:w-[320px] sm:w-[380px] bg-card/98 backdrop-blur-xl border-l border-border/50 shadow-2xl flex flex-col safe-top safe-bottom"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Pengaturan</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-4 sm:p-5 space-y-6 sm:space-y-7">
                {/* Color Theme Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5" />
                    Tema Warna
                  </h3>

                  {/* Light Themes */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sun className="h-3.5 w-3.5" />
                      <span>Tema Terang</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {lightThemes.map((theme) => (
                        <ThemeCard
                          key={theme.id}
                          theme={theme}
                          isSelected={currentThemeId === theme.id}
                          onClick={() => onThemeChange?.(theme.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Dark Themes */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Moon className="h-3.5 w-3.5" />
                      <span>Tema Gelap</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {darkThemes.map((theme) => (
                        <ThemeCard
                          key={theme.id}
                          theme={theme}
                          isSelected={currentThemeId === theme.id}
                          onClick={() => onThemeChange?.(theme.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* System Theme Toggle */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <Monitor className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground flex-1">Ikuti sistem</span>
                    <Button
                      variant={settings.theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onSettingChange('theme', settings.theme === 'system' ? 'light' : 'system')}
                      className="h-7 px-3 text-xs"
                    >
                      {settings.theme === 'system' ? 'Aktif' : 'Nonaktif'}
                    </Button>
                  </div>
                </div>

                {/* Typography Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tipografi
                  </h3>

                  {/* Font Size */}
                  <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-primary" />
                      <label className="text-sm font-medium text-foreground">
                        Ukuran Font
                      </label>
                      <span className="ml-auto text-sm font-semibold text-primary tabular-nums">
                        {settings.fontSize}px
                      </span>
                    </div>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={([value]) => onSettingChange('fontSize', value)}
                      min={12}
                      max={28}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>12px</span>
                      <span>28px</span>
                    </div>
                  </div>

                  {/* Font Family */}
                  <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-primary" />
                      <label className="text-sm font-medium text-foreground">
                        Jenis Font
                      </label>
                    </div>
                    <Select
                      value={settings.fontFamily}
                      onValueChange={(value) => onSettingChange('fontFamily', value)}
                    >
                      <SelectTrigger className="w-full h-10 sm:h-11">
                        <SelectValue placeholder="Pilih font" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {/* Serif fonts - Best for writers */}
                        <SelectGroup>
                          <SelectLabel className="text-xs text-primary font-semibold">Serif (Untuk Menulis)</SelectLabel>
                          {FONT_FAMILIES.filter(f => f.category === 'serif').map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              <span style={{ fontFamily: `"${font.value}", serif` }}>{font.label}</span>
                            </SelectItem>
                          ))}
                        </SelectGroup>

                        {/* Sans-serif fonts */}
                        <SelectGroup>
                          <SelectLabel className="text-xs text-primary font-semibold">Sans-Serif (Modern)</SelectLabel>
                          {FONT_FAMILIES.filter(f => f.category === 'sans').map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              <span style={{ fontFamily: `"${font.value}", sans-serif` }}>{font.label}</span>
                            </SelectItem>
                          ))}
                        </SelectGroup>

                        {/* Monospace fonts */}
                        <SelectGroup>
                          <SelectLabel className="text-xs text-primary font-semibold">Typewriter/Mono</SelectLabel>
                          {FONT_FAMILIES.filter(f => f.category === 'mono').map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              <span style={{ fontFamily: `"${font.value}", monospace` }}>{font.label}</span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {/* Font Preview */}
                    <div
                      className="p-3 rounded-lg bg-background border border-border/50 text-sm leading-relaxed"
                      style={{ fontFamily: `"${settings.fontFamily}", Georgia, serif` }}
                    >
                      <p>The quick brown fox jumps over the lazy dog.</p>
                      <p className="text-muted-foreground mt-1">1234567890 — "Quotes" & 'Apostrophes'</p>
                    </div>
                  </div>

                  {/* Line Height */}
                  <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-2">
                      <AlignLeft className="h-4 w-4 text-primary" />
                      <label className="text-sm font-medium text-foreground">
                        Jarak Baris
                      </label>
                    </div>
                    <Select
                      value={String(settings.lineHeight)}
                      onValueChange={(value) => onSettingChange('lineHeight', parseFloat(value))}
                    >
                      <SelectTrigger className="w-full h-10 sm:h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LINE_HEIGHTS.map((lh) => (
                          <SelectItem key={lh.value} value={String(lh.value)}>
                            {lh.label} ({lh.value})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Editor Width */}
                  <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-2">
                      <Maximize2 className="h-4 w-4 text-primary" />
                      <label className="text-sm font-medium text-foreground">
                        Lebar Editor
                      </label>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {EDITOR_WIDTHS.map((width) => (
                        <Button
                          key={width.value}
                          variant={settings.editorWidth === width.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => onSettingChange('editorWidth', width.value)}
                          className="text-xs h-8 sm:h-9"
                        >
                          {width.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Focus & Writing Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Focus className="h-3.5 w-3.5" />
                    Mode Fokus
                  </h3>

                  {/* Typewriter Mode */}
                  <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Edit3 className="h-4 w-4 text-primary" />
                        <label className="text-sm font-medium text-foreground">
                          Mode Typewriter
                        </label>
                      </div>
                      <Button
                        variant={settings.typewriterMode ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onSettingChange('typewriterMode', !settings.typewriterMode)}
                        className="h-7 px-3 text-xs"
                      >
                        {settings.typewriterMode ? 'Aktif' : 'Nonaktif'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Baris aktif selalu di tengah layar saat mengetik
                    </p>
                  </div>

                  {/* Focus Mode */}
                  <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Focus className="h-4 w-4 text-primary" />
                        <label className="text-sm font-medium text-foreground">
                          Mode Fokus
                        </label>
                      </div>
                      <Button
                        variant={settings.focusMode ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onSettingChange('focusMode', !settings.focusMode)}
                        className="h-7 px-3 text-xs"
                      >
                        {settings.focusMode ? 'Aktif' : 'Nonaktif'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Meredupkan teks di luar paragraf aktif
                    </p>
                  </div>
                </div>

                {/* Goals Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Target Menulis
                  </h3>

                  {/* Word Count Goal */}
                  <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <label className="text-sm font-medium text-foreground">
                        Target Kata
                      </label>
                    </div>
                    <Select
                      value={settings.wordCountGoal === null ? 'null' : String(settings.wordCountGoal)}
                      onValueChange={(value) =>
                        onSettingChange('wordCountGoal', value === 'null' ? null : parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-full h-10 sm:h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WORD_COUNT_PRESETS.map((preset) => (
                          <SelectItem
                            key={preset.value === null ? 'null' : preset.value}
                            value={preset.value === null ? 'null' : String(preset.value)}
                          >
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {settings.wordCountGoal && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Progress akan ditampilkan di status bar
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-4 py-3 sm:py-4 border-t border-border/50 bg-muted/30">
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="w-full h-9 sm:h-10 flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset ke Default</span>
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
