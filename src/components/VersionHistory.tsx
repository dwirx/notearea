import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  History,
  Clock,
  RotateCcw,
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentVersion } from '@/hooks/useDocuments';
import { cn } from '@/lib/utils';

interface VersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  versions: DocumentVersion[];
  currentContent: string;
  onRestoreVersion: (versionId: string) => void;
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRelativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;

  if (diff < 60000) return 'Baru saja';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} hari lalu`;

  return formatDate(timestamp);
};

const getPreviewText = (content: string, maxLength: number = 150): string => {
  return content
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, maxLength) || 'Konten kosong';
};

const VersionHistory = ({
  isOpen,
  onClose,
  versions,
  currentContent,
  onRestoreVersion,
}: VersionHistoryProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const sortedVersions = [...versions].sort((a, b) => b.timestamp - a.timestamp);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handlePreview = (content: string) => {
    setPreviewContent(content);
  };

  const handleRestore = (versionId: string) => {
    onRestoreVersion(versionId);
    onClose();
  };

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
            className="fixed right-0 top-0 bottom-0 z-50 w-full xs:w-[320px] sm:w-[380px] md:w-[450px] bg-card/98 backdrop-blur-xl border-l border-border/50 shadow-2xl flex flex-col safe-top safe-bottom"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 sm:py-4 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">
                    Riwayat Versi
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {versions.length} versi tersimpan
                  </p>
                </div>
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
              <div className="p-4 sm:p-5 space-y-3">
                {/* Current Version */}
                <div className="p-3 rounded-xl bg-primary/5 border-2 border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Versi Saat Ini</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {getPreviewText(currentContent)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {currentContent.trim().split(/\s+/).filter(Boolean).length} kata
                  </p>
                </div>

                {/* Version List */}
                {sortedVersions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 rounded-full bg-muted/50 mb-4">
                      <History className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Belum ada riwayat
                    </p>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      Versi akan otomatis disimpan saat Anda mengedit dokumen
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                      Versi Sebelumnya
                    </h3>
                    {sortedVersions.map((version) => {
                      const isExpanded = expandedId === version.id;

                      return (
                        <motion.div
                          key={version.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "rounded-xl border transition-all duration-200",
                            isExpanded
                              ? "bg-muted/50 border-border"
                              : "bg-card border-border/50 hover:bg-muted/30"
                          )}
                        >
                          {/* Header */}
                          <button
                            onClick={() => handleToggleExpand(version.id)}
                            className="w-full p-3 flex items-center gap-3 text-left"
                          >
                            <div className="p-1.5 rounded-lg bg-muted flex-shrink-0">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {formatRelativeTime(version.timestamp)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {version.wordCount} kata
                              </p>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-3 pb-3 space-y-3">
                                  {/* Preview */}
                                  <div className="p-2 rounded-lg bg-background border border-border/50">
                                    <p className="text-xs text-muted-foreground line-clamp-4 whitespace-pre-wrap font-mono">
                                      {getPreviewText(version.content, 300)}
                                    </p>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handlePreview(version.content)}
                                      className="flex-1 h-8 text-xs gap-1.5"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      Lihat
                                    </Button>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleRestore(version.id)}
                                      className="flex-1 h-8 text-xs gap-1.5"
                                    >
                                      <RotateCcw className="h-3.5 w-3.5" />
                                      Pulihkan
                                    </Button>
                                  </div>

                                  {/* Full Date */}
                                  <p className="text-[10px] text-muted-foreground text-center">
                                    {formatDate(version.timestamp)}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-4 py-3 sm:py-4 border-t border-border/50 bg-muted/30">
              <p className="text-[10px] xs:text-xs text-muted-foreground text-center">
                Versi disimpan otomatis setiap 1 menit
              </p>
            </div>
          </motion.div>

          {/* Preview Modal */}
          <AnimatePresence>
            {previewContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                onClick={() => setPreviewContent(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-2xl max-h-[80vh] bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden flex flex-col"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <h3 className="font-semibold text-foreground">Pratinjau Versi</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewContent(null)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-foreground">
                      {previewContent}
                    </pre>
                  </ScrollArea>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default VersionHistory;
