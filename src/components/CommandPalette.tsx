import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  Search,
  Plus,
  Save,
  Download,
  Share2,
  Moon,
  Sun,
  Columns,
  Eye,
  Edit3,
  Settings,
  List,
  Maximize,
  Minimize,
  QrCode,
  FolderOpen,
  FileDown,
  FileUp,
  Keyboard,
} from 'lucide-react';
import { ViewMode } from './SplitView';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: 'file' | 'view' | 'edit' | 'tools' | 'navigation';
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  // File actions
  onNew: () => void;
  onSave: () => void;
  onShare: () => void;
  onDownloadHtml: () => void;
  onDownloadText: () => void;
  onDownloadMarkdown: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onShowQR: () => void;
  // View actions
  onViewModeChange: (mode: ViewMode) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  // Navigation
  onOpenDocuments: () => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onOpenTOC: () => void;
  onOpenShortcuts: () => void;
}

const CommandPalette = ({
  isOpen,
  onClose,
  onNew,
  onSave,
  onShare,
  onDownloadHtml,
  onDownloadText,
  onDownloadMarkdown,
  onExportBackup,
  onImportBackup,
  onShowQR,
  onViewModeChange,
  isDark,
  onToggleTheme,
  isZenMode,
  onToggleZenMode,
  onOpenDocuments,
  onOpenSettings,
  onOpenSearch,
  onOpenTOC,
  onOpenShortcuts,
}: CommandPaletteProps) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useMemo<CommandItem[]>(() => [
    // File commands
    {
      id: 'new',
      label: 'Dokumen Baru',
      description: 'Buat dokumen kosong baru',
      icon: <Plus className="w-4 h-4" />,
      shortcut: '⌘N',
      category: 'file',
      action: onNew,
      keywords: ['new', 'create', 'baru'],
    },
    {
      id: 'save',
      label: 'Simpan Dokumen',
      description: 'Simpan perubahan ke penyimpanan lokal',
      icon: <Save className="w-4 h-4" />,
      shortcut: '⌘S',
      category: 'file',
      action: onSave,
      keywords: ['save', 'simpan'],
    },
    {
      id: 'open',
      label: 'Buka Dokumen',
      description: 'Lihat semua dokumen tersimpan',
      icon: <FolderOpen className="w-4 h-4" />,
      shortcut: '⌘O',
      category: 'file',
      action: onOpenDocuments,
      keywords: ['open', 'buka', 'documents'],
    },
    {
      id: 'share',
      label: 'Bagikan Link',
      description: 'Salin link dokumen ke clipboard',
      icon: <Share2 className="w-4 h-4" />,
      category: 'file',
      action: onShare,
      keywords: ['share', 'bagikan', 'link', 'copy'],
    },
    {
      id: 'qr',
      label: 'Tampilkan QR Code',
      description: 'Generate QR code untuk sharing',
      icon: <QrCode className="w-4 h-4" />,
      category: 'file',
      action: onShowQR,
      keywords: ['qr', 'code', 'scan'],
    },
    {
      id: 'download-md',
      label: 'Download Markdown',
      description: 'Unduh sebagai file .md',
      icon: <FileDown className="w-4 h-4" />,
      category: 'file',
      action: onDownloadMarkdown,
      keywords: ['download', 'export', 'markdown', 'md'],
    },
    {
      id: 'download-html',
      label: 'Download HTML',
      description: 'Unduh sebagai file .html',
      icon: <FileDown className="w-4 h-4" />,
      category: 'file',
      action: onDownloadHtml,
      keywords: ['download', 'export', 'html'],
    },
    {
      id: 'download-txt',
      label: 'Download Text',
      description: 'Unduh sebagai file .txt',
      icon: <FileDown className="w-4 h-4" />,
      category: 'file',
      action: onDownloadText,
      keywords: ['download', 'export', 'text', 'txt'],
    },
    {
      id: 'export-backup',
      label: 'Export Semua Dokumen',
      description: 'Backup semua dokumen ke JSON',
      icon: <FileUp className="w-4 h-4" />,
      category: 'file',
      action: onExportBackup,
      keywords: ['export', 'backup', 'json', 'all'],
    },
    {
      id: 'import-backup',
      label: 'Import Backup',
      description: 'Restore dokumen dari file backup',
      icon: <Download className="w-4 h-4" />,
      category: 'file',
      action: onImportBackup,
      keywords: ['import', 'restore', 'backup'],
    },

    // View commands
    {
      id: 'view-editor',
      label: 'Mode Editor',
      description: 'Tampilkan hanya editor',
      icon: <Edit3 className="w-4 h-4" />,
      category: 'view',
      action: () => onViewModeChange('editor'),
      keywords: ['editor', 'write', 'tulis'],
    },
    {
      id: 'view-preview',
      label: 'Mode Preview',
      description: 'Tampilkan hanya preview',
      icon: <Eye className="w-4 h-4" />,
      category: 'view',
      action: () => onViewModeChange('preview'),
      keywords: ['preview', 'lihat', 'read'],
    },
    {
      id: 'view-split',
      label: 'Mode Split',
      description: 'Tampilkan editor dan preview',
      icon: <Columns className="w-4 h-4" />,
      category: 'view',
      action: () => onViewModeChange('split'),
      keywords: ['split', 'dual', 'both'],
    },
    {
      id: 'toggle-theme',
      label: isDark ? 'Mode Terang' : 'Mode Gelap',
      description: `Ganti ke tema ${isDark ? 'terang' : 'gelap'}`,
      icon: isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      shortcut: '⌘⇧D',
      category: 'view',
      action: onToggleTheme,
      keywords: ['theme', 'dark', 'light', 'gelap', 'terang'],
    },
    {
      id: 'toggle-zen',
      label: isZenMode ? 'Keluar Zen Mode' : 'Zen Mode',
      description: 'Mode fokus tanpa distraksi',
      icon: isZenMode ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />,
      shortcut: '⌘⇧Z',
      category: 'view',
      action: onToggleZenMode,
      keywords: ['zen', 'focus', 'fullscreen', 'distraction'],
    },

    // Tools
    {
      id: 'search',
      label: 'Cari & Ganti',
      description: 'Cari teks dalam dokumen',
      icon: <Search className="w-4 h-4" />,
      shortcut: '⌘F',
      category: 'tools',
      action: onOpenSearch,
      keywords: ['search', 'find', 'replace', 'cari', 'ganti'],
    },
    {
      id: 'toc',
      label: 'Daftar Isi',
      description: 'Lihat struktur dokumen',
      icon: <List className="w-4 h-4" />,
      shortcut: '⌘⇧T',
      category: 'tools',
      action: onOpenTOC,
      keywords: ['toc', 'table of contents', 'outline', 'daftar isi'],
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      description: 'Konfigurasi editor',
      icon: <Settings className="w-4 h-4" />,
      shortcut: '⌘,',
      category: 'tools',
      action: onOpenSettings,
      keywords: ['settings', 'preferences', 'pengaturan', 'config'],
    },
    {
      id: 'shortcuts',
      label: 'Pintasan Keyboard',
      description: 'Lihat semua pintasan keyboard',
      icon: <Keyboard className="w-4 h-4" />,
      shortcut: '⌘/',
      category: 'tools',
      action: onOpenShortcuts,
      keywords: ['shortcuts', 'keyboard', 'hotkey', 'pintasan'],
    },
  ], [
    onNew, onSave, onOpenDocuments, onShare, onShowQR,
    onDownloadMarkdown, onDownloadHtml, onDownloadText,
    onExportBackup, onImportBackup, onViewModeChange,
    isDark, onToggleTheme, isZenMode, onToggleZenMode,
    onOpenSearch, onOpenTOC, onOpenSettings, onOpenShortcuts,
  ]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter((cmd) => {
      const matchLabel = cmd.label.toLowerCase().includes(lowerQuery);
      const matchDesc = cmd.description?.toLowerCase().includes(lowerQuery);
      const matchKeywords = cmd.keywords?.some((kw) => kw.includes(lowerQuery));
      return matchLabel || matchDesc || matchKeywords;
    });
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      file: [],
      view: [],
      tools: [],
      edit: [],
      navigation: [],
    };

    filteredCommands.forEach((cmd) => {
      if (groups[cmd.category]) {
        groups[cmd.category].push(cmd);
      }
    });

    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [filteredCommands]);

  const categoryLabels: Record<string, string> = {
    file: 'File',
    view: 'Tampilan',
    tools: 'Alat',
    edit: 'Edit',
    navigation: 'Navigasi',
  };

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredCommands, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const selectedItem = list.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  let flatIndex = 0;

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

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-[15%] z-50 w-[95%] max-w-xl -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-popover/95 shadow-2xl backdrop-blur-xl">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
                <Command className="h-5 w-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ketik perintah atau cari..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
                />
                <kbd className="hidden rounded-md border border-border/50 bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground sm:inline-block">
                  ESC
                </kbd>
              </div>

              {/* Command List */}
              <div
                ref={listRef}
                className="max-h-[60vh] overflow-y-auto overscroll-contain p-2"
              >
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Tidak ada perintah yang cocok
                  </div>
                ) : (
                  groupedCommands.map(([category, items]) => (
                    <div key={category} className="mb-2">
                      <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                        {categoryLabels[category]}
                      </div>
                      {items.map((cmd) => {
                        const currentIndex = flatIndex++;
                        const isSelected = currentIndex === selectedIndex;

                        return (
                          <button
                            key={cmd.id}
                            data-index={currentIndex}
                            onClick={() => {
                              cmd.action();
                              onClose();
                            }}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                              isSelected
                                ? 'bg-primary/10 text-primary'
                                : 'text-foreground hover:bg-muted/50'
                            }`}
                          >
                            <span
                              className={`flex-shrink-0 ${
                                isSelected ? 'text-primary' : 'text-muted-foreground'
                              }`}
                            >
                              {cmd.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{cmd.label}</div>
                              {cmd.description && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {cmd.description}
                                </div>
                              )}
                            </div>
                            {cmd.shortcut && (
                              <kbd className="hidden flex-shrink-0 rounded border border-border/50 bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground sm:inline-block">
                                {cmd.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="border-t border-border/50 px-4 py-2 text-xs text-muted-foreground/70">
                <span className="hidden sm:inline">
                  <kbd className="mr-1 rounded border border-border/50 bg-muted/50 px-1">↑↓</kbd>
                  navigasi
                  <span className="mx-2">•</span>
                  <kbd className="mr-1 rounded border border-border/50 bg-muted/50 px-1">↵</kbd>
                  pilih
                  <span className="mx-2">•</span>
                  <kbd className="mr-1 rounded border border-border/50 bg-muted/50 px-1">esc</kbd>
                  tutup
                </span>
                <span className="sm:hidden">
                  Tap untuk memilih perintah
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
