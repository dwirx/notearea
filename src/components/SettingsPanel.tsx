import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Type, AlignLeft, Target, Moon, Sun, Monitor, RotateCcw, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings as SettingsType, WORD_COUNT_PRESETS, FONT_FAMILIES, LINE_HEIGHTS, EDITOR_WIDTHS } from '@/hooks/useSettings';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsType;
  onSettingChange: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => void;
  onReset: () => void;
}

const SettingsPanel = ({
  isOpen,
  onClose,
  settings,
  onSettingChange,
  onReset,
}: SettingsPanelProps) => {
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
            className="fixed right-0 top-0 bottom-0 z-50 w-full xs:w-[320px] sm:w-[360px] bg-card/98 backdrop-blur-xl border-l border-border/50 shadow-2xl flex flex-col safe-top safe-bottom"
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
                      <SelectContent>
                        {FONT_FAMILIES.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span style={{ fontFamily: font.value }}>{font.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Font Preview */}
                    <div
                      className="p-3 rounded-lg bg-background border border-border/50 text-sm"
                      style={{ fontFamily: `"${settings.fontFamily}", system-ui, sans-serif` }}
                    >
                      The quick brown fox jumps over the lazy dog.
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

                {/* Appearance Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tampilan
                  </h3>

                  {/* Theme */}
                  <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <label className="text-sm font-medium text-foreground">
                      Tema
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={settings.theme === 'light' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onSettingChange('theme', 'light')}
                        className="flex items-center gap-1.5 h-9 sm:h-10"
                      >
                        <Sun className="h-4 w-4" />
                        <span className="text-xs">Terang</span>
                      </Button>
                      <Button
                        variant={settings.theme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onSettingChange('theme', 'dark')}
                        className="flex items-center gap-1.5 h-9 sm:h-10"
                      >
                        <Moon className="h-4 w-4" />
                        <span className="text-xs">Gelap</span>
                      </Button>
                      <Button
                        variant={settings.theme === 'system' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onSettingChange('theme', 'system')}
                        className="flex items-center gap-1.5 h-9 sm:h-10"
                      >
                        <Monitor className="h-4 w-4" />
                        <span className="text-xs">Sistem</span>
                      </Button>
                    </div>
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
