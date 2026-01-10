import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutItem[];
}

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Umum',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Buka Command Palette' },
      { keys: ['⌘', 'S'], description: 'Simpan dokumen' },
      { keys: ['⌘', 'N'], description: 'Dokumen baru' },
      { keys: ['⌘', 'O'], description: 'Buka dokumen' },
      { keys: ['⌘', ','], description: 'Pengaturan' },
    ],
  },
  {
    title: 'Navigasi',
    shortcuts: [
      { keys: ['⌘', 'F'], description: 'Cari & Ganti' },
      { keys: ['⌘', '⇧', 'T'], description: 'Daftar Isi' },
      { keys: ['⌘', '/'], description: 'Pintasan Keyboard' },
    ],
  },
  {
    title: 'Tampilan',
    shortcuts: [
      { keys: ['⌘', '⇧', 'D'], description: 'Toggle Dark Mode' },
      { keys: ['⌘', '⇧', 'Z'], description: 'Toggle Zen Mode' },
      { keys: ['⌘', '1'], description: 'Mode Editor' },
      { keys: ['⌘', '2'], description: 'Mode Preview' },
      { keys: ['⌘', '3'], description: 'Mode Split' },
    ],
  },
  {
    title: 'Format Teks',
    shortcuts: [
      { keys: ['⌘', 'B'], description: 'Bold' },
      { keys: ['⌘', 'I'], description: 'Italic' },
      { keys: ['⌘', 'U'], description: 'Underline' },
      { keys: ['⌘', '⇧', 'X'], description: 'Strikethrough' },
      { keys: ['⌘', '`'], description: 'Inline Code' },
      { keys: ['⌘', '⇧', 'C'], description: 'Code Block' },
    ],
  },
  {
    title: 'Edit',
    shortcuts: [
      { keys: ['⌘', 'Z'], description: 'Undo' },
      { keys: ['⌘', '⇧', 'Z'], description: 'Redo' },
      { keys: ['⌘', 'A'], description: 'Pilih Semua' },
      { keys: ['Tab'], description: 'Indent' },
      { keys: ['⇧', 'Tab'], description: 'Outdent' },
    ],
  },
];

const KeyboardShortcuts = ({ isOpen, onClose }: KeyboardShortcutsProps) => {
  if (!isOpen) return null;

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 z-50 w-[95%] max-w-2xl -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-popover/95 shadow-2xl backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Keyboard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Pintasan Keyboard</h2>
                    <p className="text-sm text-muted-foreground">
                      Akses cepat dengan keyboard
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

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain p-5">
                <div className="grid gap-6 sm:grid-cols-2">
                  {shortcutGroups.map((group) => (
                    <div key={group.title}>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                        {group.title}
                      </h3>
                      <div className="space-y-2">
                        {group.shortcuts.map((shortcut, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
                          >
                            <span className="text-sm">{shortcut.description}</span>
                            <div className="flex items-center gap-1">
                              {shortcut.keys.map((key, keyIdx) => (
                                <kbd
                                  key={keyIdx}
                                  className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded border border-border/50 bg-background/80 px-1.5 text-xs font-medium"
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border/50 px-5 py-3 text-center text-xs text-muted-foreground/70">
                Tekan <kbd className="mx-1 rounded border border-border/50 bg-muted/50 px-1.5 py-0.5">⌘</kbd> pada Mac atau{' '}
                <kbd className="mx-1 rounded border border-border/50 bg-muted/50 px-1.5 py-0.5">Ctrl</kbd> pada Windows/Linux
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcuts;
