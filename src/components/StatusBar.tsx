import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, Check } from 'lucide-react';
import { countStats } from '@/lib/compression';

interface StatusBarProps {
  content: string;
  isPreview: boolean;
  isSaved?: boolean;
  isSaving?: boolean;
  lastSaved?: number | null;
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

const StatusBar = ({ content, isPreview, isSaved, isSaving, lastSaved }: StatusBarProps) => {
  const { words, chars } = countStats(content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="fixed bottom-4 left-4 xs:bottom-5 xs:left-5 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 z-40 flex items-center gap-2 xs:gap-2.5 sm:gap-3 text-[10px] xs:text-[11px] sm:text-xs text-muted-foreground font-sans safe-bottom bg-background/95 backdrop-blur-md px-2.5 py-1.5 xs:px-3 xs:py-2 sm:px-4 sm:py-2.5 rounded-full border border-border/50 shadow-lg"
    >
      {/* Word count */}
      <span className="tabular-nums font-medium">{words}</span>
      <span className="text-muted-foreground/60 hidden xs:inline">kata</span>
      
      <span className="w-0.5 h-0.5 xs:w-1 xs:h-1 rounded-full bg-muted-foreground/30" />
      
      {/* Character count */}
      <span className="tabular-nums font-medium">{chars}</span>
      <span className="text-muted-foreground/60 hidden sm:inline">karakter</span>

      {/* Save status */}
      <AnimatePresence mode="wait">
        {isSaving ? (
          <motion.div
            key="saving"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 text-primary"
          >
            <span className="w-0.5 h-0.5 xs:w-1 xs:h-1 rounded-full bg-primary/40" />
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="hidden xs:inline font-medium">Menyimpan...</span>
          </motion.div>
        ) : isSaved || lastSaved ? (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 text-green-600"
          >
            <span className="w-0.5 h-0.5 xs:w-1 xs:h-1 rounded-full bg-green-500/40" />
            <Check className="h-3 w-3" />
            <span className="hidden xs:inline font-medium">
              {lastSaved ? formatLastSaved(lastSaved) : 'Tersimpan'}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Preview indicator */}
      {isPreview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1"
        >
          <span className="w-0.5 h-0.5 xs:w-1 xs:h-1 rounded-full bg-primary/50" />
          <span className="text-primary font-semibold">Preview</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatusBar;
