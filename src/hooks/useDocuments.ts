import { useState, useEffect, useCallback, useRef } from 'react';
import {
  saveDocumentsToIDB,
  loadDocumentsFromIDB,
  saveFoldersToIDB,
  loadFoldersFromIDB,
  saveTagsToIDB,
  loadTagsFromIDB,
} from '@/lib/storage';

// Version history entry
export interface DocumentVersion {
  id: string;
  content: string;
  timestamp: number;
  wordCount: number;
}

// Folder interface
export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  folderId: string | null;
  tags: string[];
  versions: DocumentVersion[];
  isPinned: boolean;
}

const MAX_VERSIONS = 20; // Maximum versions to keep per document
const VERSION_INTERVAL = 120000; // Minimum 2 minutes between auto-versions
const SAVE_DEBOUNCE = 500; // Debounce saves

// localStorage keys for migration only
const STORAGE_KEY = 'catatan_documents';
const FOLDERS_KEY = 'catatan_folders';
const TAGS_KEY = 'catatan_tags';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const extractTitle = (content: string): string => {
  // Try to extract title from first heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].substring(0, 50);
  }

  // Use first non-empty line
  const firstLine = content.split('\n').find(line => line.trim().length > 0);
  if (firstLine) {
    return firstLine.replace(/^#+\s*/, '').substring(0, 50);
  }

  return 'Dokumen Tanpa Judul';
};

const countWords = (content: string): number => {
  return content.trim().split(/\s+/).filter(Boolean).length;
};

// Default folder colors
export const FOLDER_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Refs for debounced saving
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDocsRef = useRef<Document[] | null>(null);
  const idbSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load documents from IndexedDB with localStorage migration
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from IndexedDB first
        let docs = await loadDocumentsFromIDB();

        // Migrate from localStorage if IndexedDB is empty
        if (docs.length === 0) {
          const storedDocs = localStorage.getItem(STORAGE_KEY);
          if (storedDocs) {
            const parsed = JSON.parse(storedDocs) as Document[];
            docs = parsed.map(doc => ({
              ...doc,
              folderId: doc.folderId ?? null,
              tags: doc.tags ?? [],
              versions: doc.versions ?? [],
              isPinned: doc.isPinned ?? false,
            }));
            // Migrate to IndexedDB and remove from localStorage
            await saveDocumentsToIDB(docs);
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        // Sort documents
        docs.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.updatedAt - a.updatedAt;
        });
        setDocuments(docs);

        // Load folders from IndexedDB with localStorage migration
        let fldrs = await loadFoldersFromIDB();
        if (fldrs.length === 0) {
          const storedFolders = localStorage.getItem(FOLDERS_KEY);
          if (storedFolders) {
            fldrs = JSON.parse(storedFolders);
            await saveFoldersToIDB(fldrs);
            localStorage.removeItem(FOLDERS_KEY);
          }
        }
        setFolders(fldrs);

        // Load tags from IndexedDB with localStorage migration
        let tags = await loadTagsFromIDB();
        if (tags.length === 0) {
          const storedTags = localStorage.getItem(TAGS_KEY);
          if (storedTags) {
            tags = JSON.parse(storedTags);
            await saveTagsToIDB(tags);
            localStorage.removeItem(TAGS_KEY);
          }
        }
        setAllTags(tags);

      } catch (err) {
        console.error('Failed to load documents from IndexedDB:', err);
      }
      setIsLoaded(true);
    };

    loadData();
  }, []);

  // Save documents to IndexedDB with debounce
  const saveToStorage = useCallback((docs: Document[]) => {
    pendingDocsRef.current = docs;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      try {
        if (pendingDocsRef.current) {
          // Save to IndexedDB only
          saveDocumentsToIDB(pendingDocsRef.current).catch(err => {
            console.error('Failed to save to IndexedDB:', err);
          });

          pendingDocsRef.current = null;
        }
      } catch (err) {
        console.error('Failed to save documents:', err);
      }
    }, SAVE_DEBOUNCE);
  }, []);

  // Cleanup: flush pending saves on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (idbSaveTimerRef.current) {
        clearTimeout(idbSaveTimerRef.current);
      }
      // Flush any pending saves to IndexedDB
      if (pendingDocsRef.current) {
        saveDocumentsToIDB(pendingDocsRef.current);
      }
    };
  }, []);

  // Save folders to IndexedDB
  const saveFoldersToStorage = useCallback((fldrs: Folder[]) => {
    saveFoldersToIDB(fldrs).catch(err => {
      console.error('Failed to save folders to IndexedDB:', err);
    });
  }, []);

  // Save tags to IndexedDB
  const saveTagsToStorage = useCallback((tags: string[]) => {
    saveTagsToIDB(tags).catch(err => {
      console.error('Failed to save tags to IndexedDB:', err);
    });
  }, []);

  // Create new document
  const createDocument = useCallback((content: string = '', folderId: string | null = null): Document => {
    const now = Date.now();
    const newDoc: Document = {
      id: generateId(),
      title: content ? extractTitle(content) : 'Dokumen Baru',
      content,
      createdAt: now,
      updatedAt: now,
      folderId,
      tags: [],
      versions: [],
      isPinned: false,
    };

    setDocuments(prev => {
      const updated = [newDoc, ...prev];
      saveToStorage(updated);
      return updated;
    });

    setCurrentDocId(newDoc.id);
    return newDoc;
  }, [saveToStorage]);

  // Update document with version history
  const updateDocument = useCallback((id: string, content: string) => {
    setDocuments(prev => {
      const updated = prev.map(doc => {
        if (doc.id === id) {
          const now = Date.now();
          let newVersions = [...doc.versions];

          // Create version if enough time has passed and content changed significantly
          const lastVersion = newVersions[newVersions.length - 1];
          const shouldCreateVersion =
            !lastVersion ||
            (now - lastVersion.timestamp > VERSION_INTERVAL && doc.content !== content);

          if (shouldCreateVersion && doc.content.trim()) {
            newVersions.push({
              id: generateId(),
              content: doc.content,
              timestamp: doc.updatedAt,
              wordCount: countWords(doc.content),
            });

            // Keep only last MAX_VERSIONS
            if (newVersions.length > MAX_VERSIONS) {
              newVersions = newVersions.slice(-MAX_VERSIONS);
            }
          }

          return {
            ...doc,
            title: extractTitle(content),
            content,
            updatedAt: now,
            versions: newVersions,
          };
        }
        return doc;
      }).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });

      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Delete document (move to trash or permanently delete)
  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => {
      const updated = prev.filter(doc => doc.id !== id);
      saveToStorage(updated);
      return updated;
    });

    if (currentDocId === id) {
      setCurrentDocId(null);
    }
  }, [currentDocId, saveToStorage]);

  // Toggle pin document
  const togglePinDocument = useCallback((id: string) => {
    setDocuments(prev => {
      const updated = prev.map(doc => {
        if (doc.id === id) {
          return { ...doc, isPinned: !doc.isPinned };
        }
        return doc;
      }).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Move document to folder
  const moveToFolder = useCallback((docId: string, folderId: string | null) => {
    setDocuments(prev => {
      const updated = prev.map(doc => {
        if (doc.id === docId) {
          return { ...doc, folderId };
        }
        return doc;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Add tag to document
  const addTagToDocument = useCallback((docId: string, tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (!normalizedTag) return;

    setDocuments(prev => {
      const updated = prev.map(doc => {
        if (doc.id === docId && !doc.tags.includes(normalizedTag)) {
          return { ...doc, tags: [...doc.tags, normalizedTag] };
        }
        return doc;
      });
      saveToStorage(updated);
      return updated;
    });

    // Add to global tags if new
    if (!allTags.includes(normalizedTag)) {
      const newTags = [...allTags, normalizedTag];
      setAllTags(newTags);
      saveTagsToStorage(newTags);
    }
  }, [allTags, saveToStorage, saveTagsToStorage]);

  // Remove tag from document
  const removeTagFromDocument = useCallback((docId: string, tag: string) => {
    setDocuments(prev => {
      const updated = prev.map(doc => {
        if (doc.id === docId) {
          return { ...doc, tags: doc.tags.filter(t => t !== tag) };
        }
        return doc;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Restore document version - returns the restored content
  const restoreVersion = useCallback((docId: string, versionId: string): string | null => {
    let restoredContent: string | null = null;

    setDocuments(prev => {
      const updated = prev.map(doc => {
        if (doc.id === docId) {
          const version = doc.versions.find(v => v.id === versionId);
          if (version) {
            // Save current as new version before restoring
            const now = Date.now();
            const newVersions = [...doc.versions, {
              id: generateId(),
              content: doc.content,
              timestamp: doc.updatedAt,
              wordCount: countWords(doc.content),
            }].slice(-MAX_VERSIONS);

            restoredContent = version.content;

            return {
              ...doc,
              content: version.content,
              title: extractTitle(version.content),
              updatedAt: now,
              versions: newVersions,
            };
          }
        }
        return doc;
      });
      saveToStorage(updated);
      return updated;
    });

    return restoredContent;
  }, [saveToStorage]);

  // Delete a single version
  const deleteVersion = useCallback((docId: string, versionId: string) => {
    setDocuments(prev => {
      const updated = prev.map(doc => {
        if (doc.id === docId) {
          return {
            ...doc,
            versions: doc.versions.filter(v => v.id !== versionId),
          };
        }
        return doc;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Clear all versions for a document
  const clearAllVersions = useCallback((docId: string) => {
    setDocuments(prev => {
      const updated = prev.map(doc => {
        if (doc.id === docId) {
          return {
            ...doc,
            versions: [],
          };
        }
        return doc;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Folder CRUD operations
  const createFolder = useCallback((name: string, color: string = FOLDER_COLORS[0]): Folder => {
    const newFolder: Folder = {
      id: generateId(),
      name,
      color,
      createdAt: Date.now(),
    };

    setFolders(prev => {
      const updated = [...prev, newFolder];
      saveFoldersToStorage(updated);
      return updated;
    });

    return newFolder;
  }, [saveFoldersToStorage]);

  const updateFolder = useCallback((id: string, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>) => {
    setFolders(prev => {
      const updated = prev.map(folder => {
        if (folder.id === id) {
          return { ...folder, ...updates };
        }
        return folder;
      });
      saveFoldersToStorage(updated);
      return updated;
    });
  }, [saveFoldersToStorage]);

  const deleteFolder = useCallback((id: string) => {
    // Move all documents in this folder to root
    setDocuments(prev => {
      const updated = prev.map(doc => {
        if (doc.folderId === id) {
          return { ...doc, folderId: null };
        }
        return doc;
      });
      saveToStorage(updated);
      return updated;
    });

    setFolders(prev => {
      const updated = prev.filter(folder => folder.id !== id);
      saveFoldersToStorage(updated);
      return updated;
    });
  }, [saveToStorage, saveFoldersToStorage]);

  // Get current document
  const currentDocument = documents.find(doc => doc.id === currentDocId);

  // Search documents
  const searchDocuments = useCallback((query: string): Document[] => {
    if (!query.trim()) return documents;

    const lowerQuery = query.toLowerCase();
    return documents.filter(doc =>
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.content.toLowerCase().includes(lowerQuery) ||
      doc.tags.some(tag => tag.includes(lowerQuery))
    );
  }, [documents]);

  // Get documents by folder
  const getDocumentsByFolder = useCallback((folderId: string | null): Document[] => {
    return documents.filter(doc => doc.folderId === folderId);
  }, [documents]);

  // Get documents by tag
  const getDocumentsByTag = useCallback((tag: string): Document[] => {
    return documents.filter(doc => doc.tags.includes(tag));
  }, [documents]);

  return {
    documents,
    folders,
    allTags,
    currentDocument,
    currentDocId,
    isLoaded,
    setCurrentDocId,
    createDocument,
    updateDocument,
    deleteDocument,
    togglePinDocument,
    moveToFolder,
    addTagToDocument,
    removeTagFromDocument,
    restoreVersion,
    deleteVersion,
    clearAllVersions,
    createFolder,
    updateFolder,
    deleteFolder,
    searchDocuments,
    getDocumentsByFolder,
    getDocumentsByTag,
  };
};
