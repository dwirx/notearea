import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  ChevronLeft,
  Clock,
  FolderOpen,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Document } from '@/hooks/useDocuments';
import { cn } from '@/lib/utils';

interface DocumentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  currentDocId: string | null;
  onSelectDocument: (id: string) => void;
  onNewDocument: () => void;
  onDeleteDocument: (id: string) => void;
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Baru saja';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m lalu`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}j lalu`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}h lalu`;
  
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

const getPreviewText = (content: string): string => {
  // Remove markdown syntax for preview
  return content
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .trim()
    .substring(0, 80) || 'Dokumen kosong';
};

const DocumentsSidebar = ({
  isOpen,
  onClose,
  documents,
  currentDocId,
  onSelectDocument,
  onNewDocument,
  onDeleteDocument,
}: DocumentsSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Reset search when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setDeleteConfirm(null);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    
    const query = searchQuery.toLowerCase();
    return documents.filter(doc =>
      doc.title.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirm === id) {
      onDeleteDocument(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleSelect = (id: string) => {
    onSelectDocument(id);
    onClose();
  };

  const handleNewDoc = () => {
    onNewDocument();
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed left-0 top-0 bottom-0 w-[85vw] xs:w-[320px] sm:w-[360px] md:w-[400px] bg-card border-r border-border z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 xs:p-4 border-b border-border bg-card/95 backdrop-blur-sm">
              <div className="flex items-center gap-2 xs:gap-3">
                <div className="p-1.5 xs:p-2 rounded-lg bg-primary/10">
                  <FolderOpen className="h-4 w-4 xs:h-5 xs:w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-sm xs:text-base text-foreground">Dokumen Saya</h2>
                  <p className="text-[10px] xs:text-xs text-muted-foreground">
                    {documents.length} dokumen tersimpan
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 xs:h-9 xs:w-9 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4 xs:h-5 xs:w-5" />
              </Button>
            </div>

            {/* Search & New */}
            <div className="p-3 xs:p-4 space-y-2 xs:space-y-3 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari dokumen..."
                  className="pl-9 pr-8 h-9 xs:h-10 bg-muted/50 border-border/50 text-sm rounded-xl"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              
              <Button
                onClick={handleNewDoc}
                className="w-full h-9 xs:h-10 gap-2 text-sm font-semibold rounded-xl"
              >
                <Plus className="h-4 w-4" />
                Dokumen Baru
              </Button>
            </div>

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto p-2 xs:p-3">
              {filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="p-4 rounded-full bg-muted/50 mb-4">
                    <FileText className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {searchQuery ? 'Tidak ditemukan' : 'Belum ada dokumen'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {searchQuery 
                      ? 'Coba kata kunci lain'
                      : 'Ketik sesuatu untuk menyimpan dokumen pertama'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 xs:space-y-2">
                  {filteredDocuments.map((doc, index) => (
                    <motion.button
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleSelect(doc.id)}
                      className={cn(
                        "w-full text-left p-3 xs:p-4 rounded-xl transition-all duration-200 group relative",
                        currentDocId === doc.id
                          ? "bg-primary/10 border-2 border-primary/40 shadow-sm"
                          : "bg-muted/30 hover:bg-muted/60 border-2 border-transparent"
                      )}
                    >
                      <div className="flex items-start gap-2.5 xs:gap-3">
                        <div className={cn(
                          "p-1.5 rounded-lg flex-shrink-0 mt-0.5",
                          currentDocId === doc.id ? "bg-primary/20" : "bg-muted"
                        )}>
                          <FileText className={cn(
                            "h-3.5 w-3.5 xs:h-4 xs:w-4",
                            currentDocId === doc.id ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        
                        <div className="flex-1 min-w-0 pr-6">
                          <h3 className={cn(
                            "font-semibold text-sm xs:text-base truncate",
                            currentDocId === doc.id ? "text-primary" : "text-foreground"
                          )}>
                            {doc.title}
                          </h3>
                          
                          <p className="text-[11px] xs:text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                            {getPreviewText(doc.content)}
                          </p>
                          
                          <div className="flex items-center gap-1.5 mt-2 text-[10px] xs:text-[11px] text-muted-foreground/80">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(doc.updatedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDelete(doc.id, e)}
                        className={cn(
                          "absolute right-2 top-2 p-1.5 xs:p-2 rounded-lg transition-all duration-200",
                          deleteConfirm === doc.id
                            ? "bg-destructive text-destructive-foreground scale-110"
                            : "opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        )}
                        title={deleteConfirm === doc.id ? "Klik lagi untuk hapus" : "Hapus dokumen"}
                      >
                        {deleteConfirm === doc.id ? (
                          <AlertCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5 xs:h-4 xs:w-4" />
                        )}
                      </button>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 xs:p-4 border-t border-border/50 bg-muted/30">
              <p className="text-[10px] xs:text-xs text-muted-foreground text-center">
                💾 Tersimpan otomatis di browser
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default DocumentsSidebar;
