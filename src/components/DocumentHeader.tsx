import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Undo2,
  Redo2,
  Settings,
  Loader2,
  Check,
  Search,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractTitle } from '@/lib/compression';

interface DocumentHeaderProps {
  content: string;
  isSaving?: boolean;
  isSaved?: boolean;
  lastSaved?: number | null;
  onToggleTOC?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onOpenSettings?: () => void;
  onOpenSearch?: () => void;
  showTOC?: boolean;
  isZenMode?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
}

const formatLastSaved = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 5000) return 'Baru saja';
  if (diff < 60000) return `${Math.floor(diff / 1000)}d lalu`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m lalu`;

  return new Date(timestamp).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const DocumentHeader = ({
  content,
  isSaving,
  isSaved,
  lastSaved,
  onToggleTOC,
  onUndo,
  onRedo,
  onOpenSettings,
  onOpenSearch,
  showTOC = false,
  isZenMode = false,
  canUndo = false,
  canRedo = false,
}: DocumentHeaderProps) => {
  const title = extractTitle(content) || 'Dokumen Tanpa Judul';

  // Don't render in zen mode
  if (isZenMode) return null;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm safe-top"
    >
      <div className="flex items-center justify-between h-12 xs:h-13 sm:h-14 px-2 xs:px-3 sm:px-4 md:px-6">
        {/* Left Section: TOC Toggle & Title */}
        <div className="flex items-center gap-1 xs:gap-2 sm:gap-3 flex-1 min-w-0">
          {/* TOC Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTOC}
            className={`h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 p-0 rounded-lg transition-colors ${
              showTOC ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Toggle table of contents"
          >
            <List className="h-4 w-4 xs:h-5 xs:w-5" />
          </Button>

          {/* Document Icon & Title */}
          <div className="flex items-center gap-1.5 xs:gap-2 min-w-0 flex-1">
            <FileText className="h-4 w-4 xs:h-5 xs:w-5 text-primary shrink-0" />
            <h1 className="text-sm xs:text-base sm:text-lg font-semibold text-foreground truncate">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Section: Actions & Status */}
        <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSearch}
            className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 p-0 rounded-lg text-muted-foreground hover:text-foreground hidden xs:flex"
            aria-label="Search"
          >
            <Search className="h-4 w-4 xs:h-5 xs:w-5" />
          </Button>

          {/* Undo Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 p-0 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 hidden sm:flex"
            aria-label="Undo"
          >
            <Undo2 className="h-4 w-4 xs:h-5 xs:w-5" />
          </Button>

          {/* Redo Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 p-0 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 hidden sm:flex"
            aria-label="Redo"
          >
            <Redo2 className="h-4 w-4 xs:h-5 xs:w-5" />
          </Button>

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 p-0 rounded-lg text-muted-foreground hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4 xs:h-5 xs:w-5" />
          </Button>

          {/* Save Status */}
          <AnimatePresence mode="wait">
            {isSaving ? (
              <motion.div
                key="saving"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 rounded-full bg-primary/10 text-primary"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="h-3 w-3 xs:h-3.5 xs:w-3.5" />
                </motion.div>
                <span className="text-[10px] xs:text-xs font-medium hidden xs:inline">Menyimpan...</span>
              </motion.div>
            ) : isSaved || lastSaved ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-500"
              >
                <motion.div
                  className="relative"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />
                  <span className="relative block h-2 w-2 rounded-full bg-green-500" />
                </motion.div>
                <Check className="h-3 w-3 xs:h-3.5 xs:w-3.5" />
                <span className="text-[10px] xs:text-xs font-medium hidden sm:inline">
                  {lastSaved ? formatLastSaved(lastSaved) : 'Tersimpan'}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="unsaved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted text-muted-foreground"
              >
                <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                <span className="text-xs font-medium hidden sm:inline">Belum disimpan</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};

export default DocumentHeader;
