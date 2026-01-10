import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Replace,
  ChevronUp,
  ChevronDown,
  CaseSensitive,
  WholeWord,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearch, SearchMatch } from '@/hooks/useSearch';
import { toast } from 'sonner';

interface SearchReplaceProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentChange: (content: string) => void;
  onNavigateToPosition: (position: number) => void;
  onSearchStateChange?: (matches: SearchMatch[], currentIndex: number) => void;
}

const SearchReplace = ({
  isOpen,
  onClose,
  content,
  onContentChange,
  onNavigateToPosition,
  onSearchStateChange,
}: SearchReplaceProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    replaceText,
    setReplaceText,
    caseSensitive,
    setCaseSensitive,
    wholeWord,
    setWholeWord,
    matches,
    currentMatchIndex,
    goToNextMatch,
    goToPrevMatch,
    replace,
    replaceAll,
    currentMatch,
  } = useSearch(content);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 100);
    }
  }, [isOpen]);

  // Navigate to current match
  useEffect(() => {
    if (currentMatch && isOpen) {
      onNavigateToPosition(currentMatch.start);
    }
  }, [currentMatch, isOpen, onNavigateToPosition]);

  // Notify parent of search state changes for highlighting
  useEffect(() => {
    if (onSearchStateChange) {
      if (isOpen && matches.length > 0) {
        onSearchStateChange(matches, currentMatchIndex);
      } else {
        onSearchStateChange([], 0);
      }
    }
  }, [matches, currentMatchIndex, isOpen, onSearchStateChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Escape to close
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Enter to go to next match
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        goToNextMatch();
        return;
      }

      // Shift+Enter to go to previous match
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        goToPrevMatch();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goToNextMatch, goToPrevMatch]);

  const handleReplace = () => {
    if (!currentMatch) {
      toast.error('Tidak ada yang cocok untuk diganti');
      return;
    }

    const newContent = replace();
    onContentChange(newContent);
    toast.success('Berhasil mengganti');
  };

  const handleReplaceAll = () => {
    if (matches.length === 0) {
      toast.error('Tidak ada yang cocok untuk diganti');
      return;
    }

    const newContent = replaceAll();
    onContentChange(newContent);
    toast.success(`Berhasil mengganti ${matches.length} teks`);
    setQuery(''); // Clear search after replace all
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-14 right-2 xs:right-4 sm:right-6 z-50 w-[calc(100%-1rem)] xs:w-[380px] sm:w-[420px] bg-card/95 backdrop-blur-lg border border-border/50 rounded-xl shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Cari & Ganti</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-3 space-y-3">
            {/* Search Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Cari teks..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onFocus={(e) => e.target.select()}
                    className="pl-9 pr-16 h-9 text-sm"
                  />
                  {query && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {matches.length > 0
                        ? `${currentMatchIndex + 1}/${matches.length}`
                        : '0 hasil'}
                    </span>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevMatch}
                    disabled={matches.length === 0}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextMatch}
                    disabled={matches.length === 0}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-2">
                <Button
                  variant={caseSensitive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCaseSensitive(!caseSensitive)}
                  className="h-7 px-2 text-xs gap-1"
                >
                  <CaseSensitive className="h-3 w-3" />
                  <span className="hidden xs:inline">Case</span>
                </Button>
                <Button
                  variant={wholeWord ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setWholeWord(!wholeWord)}
                  className="h-7 px-2 text-xs gap-1"
                >
                  <WholeWord className="h-3 w-3" />
                  <span className="hidden xs:inline">Kata Utuh</span>
                </Button>
              </div>
            </div>

            {/* Replace Input */}
            <div className="space-y-2">
              <div className="relative">
                <Replace className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ganti dengan..."
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              {/* Replace Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReplace}
                  disabled={matches.length === 0}
                  className="flex-1 h-8 text-xs"
                >
                  Ganti
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleReplaceAll}
                  disabled={matches.length === 0}
                  className="flex-1 h-8 text-xs"
                >
                  Ganti Semua ({matches.length})
                </Button>
              </div>
            </div>
          </div>

          {/* Footer with keyboard hints */}
          <div className="px-3 py-2 border-t border-border/50 bg-muted/30 rounded-b-xl">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Enter: Berikutnya</span>
              <span>Shift+Enter: Sebelumnya</span>
              <span>Esc: Tutup</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchReplace;
