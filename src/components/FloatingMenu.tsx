import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  FileText,
  Download,
  QrCode,
  Eye,
  Edit3,
  Check,
  Moon,
  Sun,
  Link,
  ClipboardCopy,
  Save,
  FolderOpen,
  Upload,
  DatabaseBackup,
  Keyboard,
  Columns,
  Maximize,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { compressText } from '@/lib/compression';
import { ViewMode } from './SplitView';

interface FloatingMenuProps {
  onNew: () => void;
  onShare: () => void;
  onSave: () => void;
  onOpenDocuments: () => void;
  onDownloadHtml: () => void;
  onDownloadText: () => void;
  onDownloadMarkdown: () => void;
  onShowQR: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  content: string;
  hasDocuments: boolean;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  isVisible?: boolean;
}

const shortcutSections = [
  {
    title: 'Markdown',
    subtitle: 'Formatting dasar',
    items: [
      { label: 'Bold', keys: ['Ctrl/Cmd', 'B'] },
      { label: 'Italic', keys: ['Ctrl/Cmd', 'I'] },
      { label: 'Strikethrough', keys: ['Ctrl/Cmd', 'Shift', 'X'] },
      { label: 'Inline Code', keys: ['Ctrl/Cmd', '`'] },
      { label: 'Code Block', keys: ['Ctrl/Cmd', 'Shift', '`'] },
      { label: 'Link', keys: ['Ctrl/Cmd', 'K'] },
    ],
  },
  {
    title: 'Heading & List',
    subtitle: 'Struktur dokumen',
    items: [
      { label: 'Heading 1-6', keys: ['Ctrl/Cmd', 'Alt/Option', '1-6'] },
      { label: 'Bullet List', keys: ['Ctrl/Cmd', 'Shift', '8'] },
      { label: 'Ordered List', keys: ['Ctrl/Cmd', 'Shift', '7'] },
      { label: 'Task List', keys: ['Ctrl/Cmd', 'Alt/Option', 'T'] },
      { label: 'Blockquote', keys: ['Ctrl/Cmd', 'Shift', '.'] },
    ],
  },
  {
    title: 'Cari & Ganti',
    subtitle: 'Pencarian teks',
    items: [
      { label: 'Buka Cari & Ganti', keys: ['Ctrl/Cmd', 'F'] },
      { label: 'Hasil Berikutnya', keys: ['Enter'] },
      { label: 'Hasil Sebelumnya', keys: ['Shift', 'Enter'] },
      { label: 'Tutup Panel', keys: ['Esc'] },
    ],
  },
  {
    title: 'Editor & Link',
    subtitle: 'Navigasi cepat',
    items: [
      { label: 'Buka link (kursor di link)', keys: ['Ctrl/Cmd', 'Enter'] },
      { label: 'Buka link (Ctrl/Cmd + Click)', keys: ['Ctrl/Cmd', 'Click'] },
      { label: 'Indent (2 spasi)', keys: ['Tab'] },
    ],
  },
  {
    title: 'Pratinjau Gambar',
    subtitle: 'Lightbox',
    items: [
      { label: 'Tutup', keys: ['Esc'] },
      { label: 'Zoom in/out', keys: ['+/-'] },
      { label: 'Rotate', keys: ['R'] },
      { label: 'Reset', keys: ['0'] },
    ],
  },
];

const shortcutNotes = [
  'Ctrl = Windows/Linux, Cmd = macOS',
  'Alt/Option untuk heading & task list',
];

const FloatingMenu = ({
  onNew,
  onShare,
  onSave,
  onOpenDocuments,
  onDownloadHtml,
  onDownloadText,
  onDownloadMarkdown,
  onShowQR,
  viewMode,
  onViewModeChange,
  isDark,
  onToggleTheme,
  content,
  hasDocuments,
  onExportBackup,
  onImportBackup,
  isZenMode,
  onToggleZenMode,
  isVisible = true,
}: FloatingMenuProps) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isShortcutHelpOpen, setIsShortcutHelpOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
      e.target.value = '';
    }
  };

  // Generate clean shareable URL with compressed content
  const generateShareableUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    if (!content) return baseUrl;
    const compressed = compressText(content);
    return `${baseUrl}#${compressed}`;
  };

  const handleCopyUrl = async () => {
    try {
      const shareableUrl = generateShareableUrl();
      
      // Try native share first on mobile
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: shareableUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareableUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      }
      onShare();
    } catch (error) {
      // Fallback to clipboard
      try {
        const shareableUrl = generateShareableUrl();
        await navigator.clipboard.writeText(shareableUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
        onShare();
      } catch (clipError) {
        console.error('Failed to share:', clipError);
      }
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="fixed bottom-3 right-3 xs:bottom-4 xs:right-4 sm:bottom-5 sm:right-5 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8 z-40 safe-bottom"
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="floating-menu h-12 w-12 xs:h-13 xs:w-13 sm:h-14 sm:w-14 md:h-15 md:w-15 lg:h-16 lg:w-16 rounded-full shadow-2xl hover:shadow-3xl active:scale-95 transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 touch-manipulation ring-2 ring-primary/30"
          >
            <MoreVertical className="h-5 w-5 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="top"
          sideOffset={14}
          className="floating-menu w-[85vw] max-w-[280px] xs:w-64 sm:w-72 md:w-80 rounded-2xl p-2 xs:p-2.5 sm:p-3 max-h-[70vh] overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Document Management */}
            <DropdownMenuItem
              onClick={onOpenDocuments}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              <FolderOpen className="h-4 w-4" />
              <span>Dokumen Tersimpan</span>
              {hasDocuments && (
                <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  •
                </span>
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onSave}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Dokumen</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onNew}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              <FileText className="h-4 w-4" />
              <span>Dokumen Baru</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1.5 sm:my-2" />

            {/* View Mode Options */}
            <DropdownMenuItem
              onClick={() => onViewModeChange(viewMode === 'editor' ? 'preview' : 'editor')}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              {viewMode === 'preview' ? (
                <>
                  <Edit3 className="h-4 w-4" />
                  <span>Mode Edit</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Pratinjau</span>
                </>
              )}
            </DropdownMenuItem>

            {/* Split View - only on tablet/desktop */}
            <DropdownMenuItem
              onClick={() => onViewModeChange(viewMode === 'split' ? 'editor' : 'split')}
              className="hidden sm:flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              <Columns className="h-4 w-4" />
              <span>{viewMode === 'split' ? 'Mode Normal' : 'Split View'}</span>
              {viewMode === 'split' && (
                <Check className="h-3 w-3 ml-auto text-primary" />
              )}
            </DropdownMenuItem>

            {/* Zen Mode */}
            <DropdownMenuItem
              onClick={onToggleZenMode}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              <Maximize className="h-4 w-4" />
              <span>Mode Fokus</span>
              {isZenMode && (
                <Check className="h-3 w-3 ml-auto text-primary" />
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setIsShortcutHelpOpen(true)}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              <Keyboard className="h-4 w-4" />
              <span>Bantuan Shortcut</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1.5 sm:my-2" />

            <DropdownMenuItem
              onClick={handleCopyText}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              <AnimatePresence mode="wait">
                {copiedText ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Tersalin!</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-3"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    <span>Salin Teks</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleCopyUrl}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              <AnimatePresence mode="wait">
                {copiedUrl ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Tersalin!</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="link"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-3"
                  >
                    <Link className="h-4 w-4" />
                    <span>Salin URL</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onShowQR}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              <QrCode className="h-4 w-4" />
              <span>Kode QR</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1.5 sm:my-2" />

            <DropdownMenuItem
              onClick={onDownloadMarkdown}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              <Download className="h-4 w-4" />
              <span>Unduh MD</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onDownloadHtml}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              <Download className="h-4 w-4" />
              <span>Unduh HTML</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onDownloadText}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              <Download className="h-4 w-4" />
              <span>Unduh TXT</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1.5 sm:my-2" />

            <DropdownMenuItem
              onClick={onExportBackup}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              <DatabaseBackup className="h-4 w-4" />
              <span>Ekspor Backup</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={handleImportClick}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              <Upload className="h-4 w-4" />
              <span>Impor Backup</span>
            </DropdownMenuItem>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <DropdownMenuSeparator className="my-1.5 sm:my-2" />

            <DropdownMenuItem
              onClick={onToggleTheme}
              className="flex items-center gap-3 py-2.5 sm:py-3 px-3 rounded-lg cursor-pointer touch-manipulation"
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span>Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span>Mode Gelap</span>
                </>
              )}
            </DropdownMenuItem>
          </motion.div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isShortcutHelpOpen} onOpenChange={setIsShortcutHelpOpen}>
        <DialogContent className="max-h-[85vh] w-[95vw] max-w-2xl rounded-2xl border border-border/70 bg-card/95 p-0 shadow-2xl backdrop-blur">
          <div className="rounded-t-2xl border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-background px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Keyboard className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-foreground">
                  Bantuan Shortcut
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Tips cepat untuk formatting, daftar, dan navigasi.
                </DialogDescription>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-[65vh]">
            <div className="grid gap-4 px-5 py-4 sm:grid-cols-2 sm:gap-5 sm:px-6">
              {shortcutSections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm"
                >
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-foreground">{section.title}</p>
                    <p className="text-[11px] text-muted-foreground">{section.subtitle}</p>
                  </div>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3">
                        <span className="text-xs text-foreground/90">{item.label}</span>
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          {item.keys.map((key) => (
                            <kbd
                              key={`${item.label}-${key}`}
                              className="rounded-md border border-border/80 bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground"
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
          </ScrollArea>

          <div className="flex flex-col gap-2 border-t border-border/60 bg-muted/40 px-5 py-3 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex flex-wrap gap-3">
              {shortcutNotes.map((note) => (
                <span key={note} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                  {note}
                </span>
              ))}
            </div>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">Tip: pilih teks dulu agar auto-wrap</span>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default FloatingMenu;
