import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Eye, Columns, Maximize, Target, PartyPopper } from 'lucide-react';
import { countStats } from '@/lib/compression';
import { ViewMode } from './SplitView';
import { useEffect, useState } from 'react';

interface WordCountProgress {
  current: number;
  goal: number;
  progress: number;
  isComplete: boolean;
  remaining: number;
}

interface StatusBarProps {
  content: string;
  viewMode: ViewMode;
  isSaved?: boolean;
  isSaving?: boolean;
  lastSaved?: number | null;
  isZenMode?: boolean;
  isVisible?: boolean;
  wordCountGoal?: WordCountProgress | null;
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

const getReadingTime = (words: number): string => {
  const minutes = Math.ceil(words / 200);
  if (minutes < 1) return '< 1 menit';
  return `${minutes} menit`;
};

// Progress bar colors based on percentage
const getProgressColor = (progress: number, isComplete: boolean) => {
  if (isComplete) return 'bg-green-500';
  if (progress >= 75) return 'bg-amber-500';
  if (progress >= 50) return 'bg-blue-500';
  return 'bg-primary';
};

const StatusBar = ({
  content,
  viewMode,
  isSaved,
  isSaving,
  lastSaved,
  isZenMode = false,
  isVisible = true,
  wordCountGoal,
}: StatusBarProps) => {
  const { words, chars } = countStats(content);
  const readingTime = getReadingTime(words);
  const [showCelebration, setShowCelebration] = useState(false);
  const [wasComplete, setWasComplete] = useState(false);

  // Celebration animation when goal is reached
  useEffect(() => {
    if (wordCountGoal?.isComplete && !wasComplete) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    setWasComplete(wordCountGoal?.isComplete || false);
  }, [wordCountGoal?.isComplete, wasComplete]);

  // Don't render if in zen mode and not visible
  if (isZenMode && !isVisible) {
    return null;
  }

  const viewModeLabel = viewMode === 'split' ? 'Split' : viewMode === 'preview' ? 'Preview' : null;
  const ViewModeIcon = viewMode === 'split' ? Columns : viewMode === 'preview' ? Eye : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="fixed bottom-3 left-3 xs:bottom-4 xs:left-4 sm:bottom-5 sm:left-5 md:bottom-6 md:left-6 lg:bottom-8 lg:left-8 z-40 flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 text-[10px] xs:text-[11px] sm:text-xs text-muted-foreground font-sans safe-bottom bg-background/95 backdrop-blur-md px-2.5 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-2.5 rounded-full border border-border/50 shadow-lg"
      >
        {/* Word count */}
        <div className="flex items-center gap-1">
          <span className="tabular-nums font-semibold text-foreground/80">{words.toLocaleString()}</span>
          <span className="text-muted-foreground/60 hidden xs:inline">kata</span>
        </div>

        <span className="w-0.5 h-0.5 xs:w-1 xs:h-1 rounded-full bg-muted-foreground/30" />

        {/* Character count */}
        <div className="flex items-center gap-1">
          <span className="tabular-nums font-semibold text-foreground/80">{chars.toLocaleString()}</span>
          <span className="text-muted-foreground/60 hidden sm:inline">karakter</span>
        </div>

        {/* Reading time - hidden on very small screens */}
        <span className="hidden md:flex items-center gap-1">
          <span className="w-0.5 h-0.5 xs:w-1 xs:h-1 rounded-full bg-muted-foreground/30" />
          <span className="text-muted-foreground/70">{readingTime} baca</span>
        </span>

        {/* Word Count Goal Progress */}
        {wordCountGoal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 xs:gap-2"
          >
            <span className="w-0.5 h-0.5 xs:w-1 xs:h-1 rounded-full bg-muted-foreground/30" />

            {/* Progress bar */}
            <div className="flex items-center gap-1.5">
              <Target className={`h-3 w-3 ${wordCountGoal.isComplete ? 'text-green-500' : 'text-muted-foreground'}`} />

              <div className="relative w-12 xs:w-16 sm:w-20 h-1.5 xs:h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${wordCountGoal.progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`absolute inset-y-0 left-0 rounded-full ${getProgressColor(wordCountGoal.progress, wordCountGoal.isComplete)}`}
                />
              </div>

              <span className={`tabular-nums font-medium ${wordCountGoal.isComplete ? 'text-green-500' : 'text-foreground/70'}`}>
                {Math.round(wordCountGoal.progress)}%
              </span>
            </div>

            {/* Celebration animation */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="text-amber-500"
                >
                  <PartyPopper className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Save status with improved animation */}
        <AnimatePresence mode="wait">
          {isSaving ? (
            <motion.div
              key="saving"
              initial={{ opacity: 0, scale: 0.8, x: -5 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 5 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 text-primary"
            >
              <span className="w-0.5 h-0.5 xs:w-1 xs:h-1 rounded-full bg-primary/40" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="h-3 w-3" />
              </motion.div>
              <span className="hidden xs:inline font-medium">Menyimpan...</span>
            </motion.div>
          ) : isSaved || lastSaved ? (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.8, x: -5 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 5 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1 text-green-600 dark:text-green-500"
            >
              <motion.span
                className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-green-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Check className="h-3 w-3" />
              <span className="hidden xs:inline font-medium">
                {lastSaved ? formatLastSaved(lastSaved) : 'Tersimpan'}
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* View mode indicator */}
        {viewModeLabel && ViewModeIcon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 text-primary"
          >
            <span className="w-0.5 h-0.5 xs:w-1 xs:h-1 rounded-full bg-primary/50" />
            <ViewModeIcon className="h-3 w-3" />
            <span className="hidden sm:inline font-semibold">{viewModeLabel}</span>
          </motion.div>
        )}

        {/* Zen mode indicator */}
        {isZenMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 text-purple-600 dark:text-purple-400"
          >
            <span className="w-0.5 h-0.5 xs:w-1 xs:h-1 rounded-full bg-purple-500/50" />
            <Maximize className="h-3 w-3" />
            <span className="hidden sm:inline font-semibold">Zen</span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default StatusBar;
