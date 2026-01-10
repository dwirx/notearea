import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command, Type, Eye, Edit3, List, Hash, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ShortcutItem {
  keys: string[];
  description: string;
  note?: string;
}

interface ShortcutGroup {
  title: string;
  icon: React.ReactNode;
  shortcuts: ShortcutItem[];
}

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Umum',
    icon: <Command className="h-4 w-4" />,
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Command Palette', note: 'Akses cepat semua fitur' },
      { keys: ['⌘', 'S'], description: 'Simpan dokumen' },
      { keys: ['⌘', 'N'], description: 'Dokumen baru' },
      { keys: ['⌘', 'O'], description: 'Buka daftar dokumen' },
      { keys: ['⌘', ','], description: 'Buka pengaturan' },
      { keys: ['⌘', '/'], description: 'Pintasan keyboard', note: 'Panel ini' },
    ],
  },
  {
    title: 'Navigasi & Pencarian',
    icon: <Eye className="h-4 w-4" />,
    shortcuts: [
      { keys: ['⌘', 'F'], description: 'Cari & Ganti' },
      { keys: ['⌘', '⇧', 'T'], description: 'Daftar Isi (TOC)' },
      { keys: ['⌘', 'Enter'], description: 'Buka link', note: 'Saat kursor di URL' },
    ],
  },
  {
    title: 'Tampilan',
    icon: <Eye className="h-4 w-4" />,
    shortcuts: [
      { keys: ['⌘', '1'], description: 'Mode Editor' },
      { keys: ['⌘', '2'], description: 'Mode Preview' },
      { keys: ['⌘', '3'], description: 'Mode Split' },
      { keys: ['⌘', '⇧', 'Z'], description: 'Zen Mode', note: 'Fokus tanpa gangguan' },
      { keys: ['⌘', '⇧', 'D'], description: 'Toggle Dark Mode' },
    ],
  },
  {
    title: 'Format Teks',
    icon: <Type className="h-4 w-4" />,
    shortcuts: [
      { keys: ['⌘', 'B'], description: 'Bold', note: '**teks**' },
      { keys: ['⌘', 'I'], description: 'Italic', note: '*teks*' },
      { keys: ['⌘', '⇧', 'X'], description: 'Strikethrough', note: '~~teks~~' },
      { keys: ['⌘', '`'], description: 'Inline Code', note: '`kode`' },
      { keys: ['⌘', '⇧', '`'], description: 'Code Block', note: '```kode```' },
      { keys: ['⌘', 'K'], description: 'Sisipkan Link', note: '[teks](url)' },
    ],
  },
  {
    title: 'Heading',
    icon: <Hash className="h-4 w-4" />,
    shortcuts: [
      { keys: ['⌘', '⌥', '1'], description: 'Heading 1', note: '# Judul' },
      { keys: ['⌘', '⌥', '2'], description: 'Heading 2', note: '## Subjudul' },
      { keys: ['⌘', '⌥', '3'], description: 'Heading 3', note: '### Bagian' },
      { keys: ['⌘', '⌥', '4'], description: 'Heading 4' },
      { keys: ['⌘', '⌥', '5'], description: 'Heading 5' },
      { keys: ['⌘', '⌥', '6'], description: 'Heading 6' },
    ],
  },
  {
    title: 'Daftar & Blok',
    icon: <List className="h-4 w-4" />,
    shortcuts: [
      { keys: ['⌘', '⇧', '8'], description: 'Bullet List', note: '- item' },
      { keys: ['⌘', '⇧', '7'], description: 'Numbered List', note: '1. item' },
      { keys: ['⌘', '⌥', 'T'], description: 'Task List', note: '- [ ] tugas' },
      { keys: ['⌘', '⇧', '.'], description: 'Blockquote', note: '> kutipan' },
    ],
  },
  {
    title: 'Edit',
    icon: <Edit3 className="h-4 w-4" />,
    shortcuts: [
      { keys: ['⌘', 'Z'], description: 'Undo' },
      { keys: ['⌘', '⇧', 'Z'], description: 'Redo' },
      { keys: ['⌘', 'A'], description: 'Pilih Semua' },
      { keys: ['Tab'], description: 'Indent (2 spasi)' },
      { keys: ['⇧', 'Tab'], description: 'Outdent' },
    ],
  },
  {
    title: 'Fitur Khusus',
    icon: <Sparkles className="h-4 w-4" />,
    shortcuts: [
      { keys: ['/'], description: 'Slash Commands', note: 'Ketik / untuk menu insert' },
      { keys: ['Drag'], description: 'Seret gambar', note: 'Drop gambar ke editor' },
      { keys: ['Paste'], description: 'Tempel gambar', note: 'Paste gambar dari clipboard' },
    ],
  },
];

const KeyboardShortcuts = ({ isOpen, onClose }: KeyboardShortcutsProps) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-popover/95 shadow-2xl backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 px-4 sm:px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Keyboard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold">Pintasan Keyboard</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Produktif dengan pintasan cepat
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Tab Navigation */}
              <div className="border-b border-border/50 px-4 py-2 overflow-x-auto sm:hidden">
                <div className="flex gap-1 min-w-max">
                  {shortcutGroups.map((group, idx) => (
                    <button
                      key={group.title}
                      onClick={() => setActiveTab(idx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        activeTab === idx
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {group.icon}
                      <span>{group.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[55vh] sm:max-h-[60vh] overflow-y-auto overscroll-contain p-4 sm:p-6">
                {/* Mobile: Show only active tab */}
                <div className="sm:hidden">
                  <div className="space-y-2">
                    {shortcutGroups[activeTab].shortcuts.map((shortcut, idx) => (
                      <ShortcutRow key={idx} shortcut={shortcut} isMac={isMac} />
                    ))}
                  </div>
                </div>

                {/* Desktop: Show all in grid */}
                <div className="hidden sm:grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {shortcutGroups.map((group) => (
                    <div key={group.title} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {group.icon}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {group.title}
                        </h3>
                      </div>
                      <div className="space-y-1.5">
                        {group.shortcuts.map((shortcut, idx) => (
                          <ShortcutRow key={idx} shortcut={shortcut} isMac={isMac} compact />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border/50 px-4 sm:px-6 py-3 bg-muted/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <kbd className="rounded border border-border/50 bg-background/80 px-1.5 py-0.5 font-mono text-[10px]">
                      {isMac ? '⌘' : 'Ctrl'}
                    </kbd>
                    <span>= {isMac ? 'Command' : 'Control'}</span>
                    <span className="mx-2">•</span>
                    <kbd className="rounded border border-border/50 bg-background/80 px-1.5 py-0.5 font-mono text-[10px]">
                      {isMac ? '⌥' : 'Alt'}
                    </kbd>
                    <span>= {isMac ? 'Option' : 'Alt'}</span>
                    <span className="mx-2">•</span>
                    <kbd className="rounded border border-border/50 bg-background/80 px-1.5 py-0.5 font-mono text-[10px]">⇧</kbd>
                    <span>= Shift</span>
                  </div>
                  <div className="text-muted-foreground/70">
                    Tekan <kbd className="mx-1 rounded border border-border/50 bg-background/80 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> untuk menutup
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Shortcut row component
const ShortcutRow = ({
  shortcut,
  isMac,
  compact = false
}: {
  shortcut: ShortcutItem;
  isMac: boolean;
  compact?: boolean;
}) => {
  // Replace Mac symbols with Windows equivalents if not on Mac
  const getKey = (key: string) => {
    if (isMac) return key;
    switch (key) {
      case '⌘': return 'Ctrl';
      case '⌥': return 'Alt';
      case '⇧': return 'Shift';
      default: return key;
    }
  };

  return (
    <div
      className={`flex items-center justify-between rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors ${
        compact ? 'px-2.5 py-1.5' : 'px-3 py-2.5'
      }`}
    >
      <div className="flex-1 min-w-0">
        <span className={`${compact ? 'text-xs' : 'text-sm'} text-foreground`}>
          {shortcut.description}
        </span>
        {shortcut.note && (
          <span className={`block ${compact ? 'text-[10px]' : 'text-xs'} text-muted-foreground truncate`}>
            {shortcut.note}
          </span>
        )}
      </div>
      <div className="flex items-center gap-0.5 ml-2 flex-shrink-0">
        {shortcut.keys.map((key, keyIdx) => (
          <kbd
            key={keyIdx}
            className={`inline-flex items-center justify-center rounded border border-border/50 bg-background/80 font-mono font-medium ${
              compact
                ? 'h-5 min-w-[1.25rem] px-1 text-[10px]'
                : 'h-6 min-w-[1.5rem] px-1.5 text-xs'
            }`}
          >
            {getKey(key)}
          </kbd>
        ))}
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
