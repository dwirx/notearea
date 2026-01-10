import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  X,
  Clock,
  FolderOpen,
  FolderPlus,
  Pin,
  PinOff,
  ChevronRight,
  MoreVertical,
  Edit2,
  Check,
  Hash,
  GripVertical
} from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Document, Folder as FolderType, FOLDER_COLORS } from '@/hooks/useDocuments';
import { cn } from '@/lib/utils';
import { timeAgoShort } from '@/lib/timeago';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DocumentsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  folders: FolderType[];
  allTags: string[];
  currentDocId: string | null;
  onSelectDocument: (id: string) => void;
  onNewDocument: (folderId?: string | null) => void;
  onDeleteDocument: (id: string) => void;
  onTogglePin: (id: string) => void;
  onMoveToFolder: (docId: string, folderId: string | null) => void;
  onCreateFolder: (name: string, color: string) => void;
  onUpdateFolder: (id: string, updates: { name?: string; color?: string }) => void;
  onDeleteFolder: (id: string) => void;
}

const formatDate = (timestamp: number): string => {
  return timeAgoShort(timestamp);
};

const getPreviewText = (content: string): string => {
  return content
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .trim()
    .substring(0, 80) || 'Dokumen kosong';
};

type ViewFilter = 'all' | 'folder' | 'tag';

const DocumentsSidebar = ({
  isOpen,
  onClose,
  documents,
  folders,
  allTags,
  currentDocId,
  onSelectDocument,
  onNewDocument,
  onDeleteDocument,
  onTogglePin,
  onMoveToFolder,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
}: DocumentsSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  // Drag and drop state
  const [draggingDocId, setDraggingDocId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverRoot, setDragOverRoot] = useState(false);

  // Reset state when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setDeleteConfirm(null);
      setShowNewFolder(false);
      setEditingFolderId(null);
      setDraggingDocId(null);
      setDragOverFolderId(null);
      setDragOverRoot(false);
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
    let docs = documents;

    // Apply folder/tag filter
    if (viewFilter === 'folder' && selectedFolderId !== null) {
      docs = docs.filter(doc => doc.folderId === selectedFolderId);
    } else if (viewFilter === 'tag' && selectedTag) {
      docs = docs.filter(doc => doc.tags.includes(selectedTag));
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.content.toLowerCase().includes(query) ||
        doc.tags.some(tag => tag.includes(query))
      );
    }

    // Sort: pinned first, then by updatedAt
    return [...docs].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [documents, searchQuery, viewFilter, selectedFolderId, selectedTag]);

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
    onNewDocument(viewFilter === 'folder' ? selectedFolderId : null);
    onClose();
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), newFolderColor);
      setNewFolderName('');
      setNewFolderColor(FOLDER_COLORS[0]);
      setShowNewFolder(false);
    }
  };

  const handleSaveFolder = (id: string) => {
    if (editingFolderName.trim()) {
      onUpdateFolder(id, { name: editingFolderName.trim() });
    }
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const handleFolderClick = (folderId: string) => {
    setViewFilter('folder');
    setSelectedFolderId(folderId);
    setSelectedTag(null);
  };

  const handleTagClick = (tag: string) => {
    setViewFilter('tag');
    setSelectedTag(tag);
    setSelectedFolderId(null);
  };

  const handleShowAll = () => {
    setViewFilter('all');
    setSelectedFolderId(null);
    setSelectedTag(null);
  };

  // Drag handlers for documents
  const handleDragStart = useCallback((e: React.DragEvent, docId: string) => {
    setDraggingDocId(docId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', docId);

    // Add dragging class for visual feedback
    const target = e.target as HTMLElement;
    requestAnimationFrame(() => {
      target.style.opacity = '0.5';
    });
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setDraggingDocId(null);
    setDragOverFolderId(null);
    setDragOverRoot(false);
  }, []);

  const handleFolderDragOver = useCallback((e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverFolderId !== folderId) {
      setDragOverFolderId(folderId);
      setDragOverRoot(false);
    }
  }, [dragOverFolderId]);

  const handleFolderDragLeave = useCallback(() => {
    setDragOverFolderId(null);
  }, []);

  const handleFolderDrop = useCallback((e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    const docId = e.dataTransfer.getData('text/plain');
    if (docId && draggingDocId) {
      onMoveToFolder(docId, folderId);
    }
    setDraggingDocId(null);
    setDragOverFolderId(null);
    setDragOverRoot(false);
  }, [draggingDocId, onMoveToFolder]);

  const handleRootDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverRoot(true);
    setDragOverFolderId(null);
  }, []);

  const handleRootDragLeave = useCallback(() => {
    setDragOverRoot(false);
  }, []);

  const handleRootDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const docId = e.dataTransfer.getData('text/plain');
    if (docId && draggingDocId) {
      onMoveToFolder(docId, null);
    }
    setDraggingDocId(null);
    setDragOverFolderId(null);
    setDragOverRoot(false);
  }, [draggingDocId, onMoveToFolder]);

  const selectedFolder = folders.find(f => f.id === selectedFolderId);

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
            className="fixed left-0 top-0 bottom-0 w-[90vw] xs:w-[340px] sm:w-[380px] md:w-[420px] bg-gradient-to-b from-card to-card/95 border-r border-border/50 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 xs:p-5 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 shadow-sm">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-base xs:text-lg text-foreground">Dokumen Saya</h2>
                  <p className="text-xs text-muted-foreground">
                    {documents.length} dokumen • {folders.length} folder
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 rounded-full hover:bg-muted/80"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search & New */}
            <div className="p-4 space-y-3 border-b border-border/30">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari dokumen, folder, atau tag..."
                  className="pl-10 pr-8 h-11 bg-muted/40 border-border/30 text-sm rounded-xl focus:ring-2 focus:ring-primary/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <Button
                onClick={handleNewDoc}
                className="w-full h-11 gap-2 text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <Plus className="h-4 w-4" />
                Dokumen Baru
              </Button>
            </div>

            {/* Folders & Tags Section */}
            <div className="border-b border-border/30 p-3 space-y-3">
              {/* View Filter Breadcrumb */}
              {viewFilter !== 'all' && (
                <button
                  onClick={handleShowAll}
                  className="flex items-center gap-2 text-xs text-primary hover:underline px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <ChevronRight className="h-3 w-3 rotate-180" />
                  Kembali ke Semua Dokumen
                </button>
              )}

              {viewFilter === 'folder' && selectedFolder && (
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-muted/50">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: selectedFolder.color }}
                  />
                  <span className="font-semibold text-sm">{selectedFolder.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {filteredDocuments.length} dokumen
                  </span>
                </div>
              )}

              {viewFilter === 'tag' && selectedTag && (
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-primary/10">
                  <Hash className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm text-primary">{selectedTag}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {filteredDocuments.length} dokumen
                  </span>
                </div>
              )}

              {viewFilter === 'all' && (
                <>
                  {/* Root drop zone for removing from folder */}
                  {draggingDocId && (
                    <div
                      onDragOver={handleRootDragOver}
                      onDragLeave={handleRootDragLeave}
                      onDrop={handleRootDrop}
                      className={cn(
                        "px-3 py-2.5 rounded-xl border-2 border-dashed transition-all text-center text-sm",
                        dragOverRoot
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted-foreground/30 text-muted-foreground"
                      )}
                    >
                      <FolderOpen className="h-4 w-4 mx-auto mb-1" />
                      Lepas di sini untuk menghapus dari folder
                    </div>
                  )}

                  {/* Folders */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Folder
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewFolder(true)}
                        className="h-7 w-7 p-0 hover:bg-primary/10"
                      >
                        <FolderPlus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* New Folder Input */}
                    <AnimatePresence>
                      {showNewFolder && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-2 space-y-2 overflow-hidden"
                        >
                          <div className="flex gap-2">
                            <Input
                              value={newFolderName}
                              onChange={(e) => setNewFolderName(e.target.value)}
                              placeholder="Nama folder baru..."
                              className="h-9 text-sm rounded-lg"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateFolder();
                                if (e.key === 'Escape') setShowNewFolder(false);
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={handleCreateFolder}
                              disabled={!newFolderName.trim()}
                              className="h-9 px-3"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowNewFolder(false)}
                              className="h-9 px-3"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex gap-1.5 px-1">
                            {FOLDER_COLORS.map((color) => (
                              <button
                                key={color}
                                onClick={() => setNewFolderColor(color)}
                                className={cn(
                                  "w-6 h-6 rounded-full transition-all shadow-sm hover:scale-110",
                                  newFolderColor === color && "ring-2 ring-offset-2 ring-offset-card ring-primary scale-110"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Folder List */}
                    <div className="space-y-1">
                      {folders.map((folder) => {
                        const docCount = documents.filter(d => d.folderId === folder.id).length;
                        const isEditing = editingFolderId === folder.id;
                        const isDragOver = dragOverFolderId === folder.id;

                        return (
                          <div
                            key={folder.id}
                            onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                            onDragLeave={handleFolderDragLeave}
                            onDrop={(e) => handleFolderDrop(e, folder.id)}
                            className={cn(
                              "flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group cursor-pointer",
                              isDragOver
                                ? "bg-primary/20 ring-2 ring-primary ring-inset scale-[1.02]"
                                : "hover:bg-muted/60"
                            )}
                          >
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: folder.color }}
                            />

                            {isEditing ? (
                              <Input
                                value={editingFolderName}
                                onChange={(e) => setEditingFolderName(e.target.value)}
                                className="h-7 text-sm flex-1 rounded-lg"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveFolder(folder.id);
                                  if (e.key === 'Escape') setEditingFolderId(null);
                                }}
                                onBlur={() => handleSaveFolder(folder.id)}
                              />
                            ) : (
                              <button
                                onClick={() => handleFolderClick(folder.id)}
                                className="flex-1 text-left text-sm font-medium truncate hover:text-primary transition-colors"
                              >
                                {folder.name}
                              </button>
                            )}

                            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                              {docCount}
                            </span>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingFolderId(folder.id);
                                    setEditingFolderName(folder.name);
                                  }}
                                >
                                  <Edit2 className="h-3.5 w-3.5 mr-2" />
                                  Ubah Nama
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <div
                                        className="w-3.5 h-3.5 rounded-full mr-2 shadow-sm"
                                        style={{ backgroundColor: folder.color }}
                                      />
                                      Ubah Warna
                                    </DropdownMenuItem>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-3">
                                    <div className="flex gap-2">
                                      {FOLDER_COLORS.map((color) => (
                                        <button
                                          key={color}
                                          onClick={() => onUpdateFolder(folder.id, { color })}
                                          className={cn(
                                            "w-7 h-7 rounded-full transition-all hover:scale-110 shadow-sm",
                                            folder.color === color && "ring-2 ring-offset-2 ring-primary"
                                          )}
                                          style={{ backgroundColor: color }}
                                        />
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onDeleteFolder(folder.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Hapus Folder
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        );
                      })}

                      {folders.length === 0 && !showNewFolder && (
                        <p className="text-xs text-muted-foreground px-3 py-2 italic">
                          Belum ada folder. Buat folder untuk mengorganisir dokumen.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {allTags.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                        Tag
                      </span>
                      <div className="flex flex-wrap gap-1.5 px-2">
                        {allTags.slice(0, 12).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors shadow-sm"
                          >
                            <Hash className="h-3 w-3" />
                            {tag}
                          </button>
                        ))}
                        {allTags.length > 12 && (
                          <span className="text-xs text-muted-foreground px-2 py-1">
                            +{allTags.length - 12} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Documents List - Virtualized */}
            <div className="flex-1 overflow-hidden">
              {filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="p-5 rounded-2xl bg-muted/30 mb-4">
                    <FileText className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                  <p className="text-base font-semibold text-foreground mb-1">
                    {searchQuery ? 'Tidak ditemukan' : 'Belum ada dokumen'}
                  </p>
                  <p className="text-sm text-muted-foreground max-w-[200px]">
                    {searchQuery
                      ? 'Coba kata kunci lain atau periksa filter yang aktif'
                      : 'Klik "Dokumen Baru" untuk memulai menulis'
                    }
                  </p>
                </div>
              ) : (
                <Virtuoso
                  style={{ height: '100%' }}
                  data={filteredDocuments}
                  overscan={5}
                  itemContent={(_index, doc) => {
                    const folder = folders.find(f => f.id === doc.folderId);
                    const isDraggingItem = draggingDocId === doc.id;

                    return (
                      <div className="px-3 py-1">
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, doc.id)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "w-full text-left p-4 rounded-2xl transition-all duration-200 group relative cursor-pointer",
                            isDraggingItem && "opacity-50 scale-95",
                            currentDocId === doc.id
                              ? "bg-primary/10 border-2 border-primary/30 shadow-md"
                              : "bg-muted/20 hover:bg-muted/50 border-2 border-transparent hover:border-border/50"
                          )}
                          onClick={() => handleSelect(doc.id)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Drag handle */}
                            <div className="p-1 rounded-md opacity-0 group-hover:opacity-50 hover:opacity-100 cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>

                            <div className={cn(
                              "p-2 rounded-xl flex-shrink-0 relative shadow-sm",
                              currentDocId === doc.id ? "bg-primary/20" : "bg-muted/50"
                            )}>
                              <FileText className={cn(
                                "h-4 w-4",
                                currentDocId === doc.id ? "text-primary" : "text-muted-foreground"
                              )} />
                              {doc.isPinned && (
                                <Pin className="absolute -top-1 -right-1 h-3 w-3 text-primary fill-primary" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 pr-10">
                              <h3 className={cn(
                                "font-semibold text-sm truncate",
                                currentDocId === doc.id ? "text-primary" : "text-foreground"
                              )}>
                                {doc.title}
                              </h3>

                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                {getPreviewText(doc.content)}
                              </p>

                              {/* Tags */}
                              {doc.tags.length > 0 && (
                                <div className="flex items-center gap-1 mt-2 flex-wrap">
                                  {doc.tags.slice(0, 3).map(tag => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] font-medium"
                                    >
                                      <Hash className="h-2 w-2" />
                                      {tag}
                                    </span>
                                  ))}
                                  {doc.tags.length > 3 && (
                                    <span className="text-[10px] text-muted-foreground">
                                      +{doc.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                                {folder && (
                                  <>
                                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full">
                                      <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: folder.color }}
                                      />
                                      <span className="truncate max-w-[80px]">{folder.name}</span>
                                    </div>
                                    <span className="text-muted-foreground/50">•</span>
                                  </>
                                )}
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDate(doc.updatedAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="absolute right-3 top-3 flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePin(doc.id);
                              }}
                              className={cn(
                                "p-2 rounded-lg transition-all duration-200",
                                doc.isPinned
                                  ? "text-primary bg-primary/10 hover:bg-primary/20"
                                  : "opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground"
                              )}
                              title={doc.isPinned ? "Lepas pin" : "Pin dokumen"}
                            >
                              {doc.isPinned ? (
                                <PinOff className="h-4 w-4" />
                              ) : (
                                <Pin className="h-4 w-4" />
                              )}
                            </button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                {/* Move to folder */}
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveToFolder(doc.id, null);
                                  }}
                                  disabled={!doc.folderId}
                                >
                                  <FolderOpen className="h-4 w-4 mr-2" />
                                  Keluarkan dari Folder
                                </DropdownMenuItem>
                                {folders.length > 0 && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                      Pindahkan ke:
                                    </div>
                                    {folders.map(f => (
                                      <DropdownMenuItem
                                        key={f.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onMoveToFolder(doc.id, f.id);
                                        }}
                                        className={cn(
                                          doc.folderId === f.id && "bg-muted"
                                        )}
                                      >
                                        <div
                                          className="w-3.5 h-3.5 rounded-full mr-2 shadow-sm"
                                          style={{ backgroundColor: f.color }}
                                        />
                                        {f.name}
                                        {doc.folderId === f.id && (
                                          <Check className="h-3.5 w-3.5 ml-auto text-primary" />
                                        )}
                                      </DropdownMenuItem>
                                    ))}
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => handleDelete(doc.id, e as unknown as React.MouseEvent)}
                                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {deleteConfirm === doc.id ? 'Klik lagi untuk hapus' : 'Hapus Dokumen'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/30 bg-muted/20">
              <p className="text-xs text-muted-foreground text-center">
                Seret dokumen ke folder untuk mengorganisir • Tersimpan otomatis
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default DocumentsSidebar;
