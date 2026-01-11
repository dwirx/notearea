// IndexedDB storage for documents and version history

import { Document, Folder } from '@/hooks/useDocuments';

const DB_NAME = 'catatan-db';
const DB_VERSION = 3; // Upgrade version for settings and theme stores
const DOCUMENTS_STORE = 'documents';
const FOLDERS_STORE = 'folders';
const TAGS_STORE = 'tags';
const SETTINGS_STORE = 'settings';
const LEGACY_DOC_KEY = 'current'; // For backwards compatibility

let db: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create documents store if not exists
      if (!database.objectStoreNames.contains(DOCUMENTS_STORE)) {
        const docStore = database.createObjectStore(DOCUMENTS_STORE, { keyPath: 'id' });
        docStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        docStore.createIndex('folderId', 'folderId', { unique: false });
      }

      // Create folders store if not exists
      if (!database.objectStoreNames.contains(FOLDERS_STORE)) {
        database.createObjectStore(FOLDERS_STORE, { keyPath: 'id' });
      }

      // Create tags store if not exists
      if (!database.objectStoreNames.contains(TAGS_STORE)) {
        database.createObjectStore(TAGS_STORE);
      }

      // Create settings store if not exists (for settings, theme, etc.)
      if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
        database.createObjectStore(SETTINGS_STORE);
      }
    };
  });
};

// ============ DOCUMENTS ============

export const saveDocumentsToIDB = async (documents: Document[]): Promise<void> => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(DOCUMENTS_STORE, 'readwrite');
      const store = transaction.objectStore(DOCUMENTS_STORE);

      // Clear existing documents and add new ones
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        documents.forEach(doc => {
          store.put(doc);
        });
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn('IndexedDB save documents failed:', error);
  }
};

export const loadDocumentsFromIDB = async (): Promise<Document[]> => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(DOCUMENTS_STORE, 'readonly');
      const store = transaction.objectStore(DOCUMENTS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const documents = request.result || [];
        // Sort by updatedAt descending
        documents.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.updatedAt - a.updatedAt;
        });
        resolve(documents);
      };
    });
  } catch (error) {
    console.warn('IndexedDB load documents failed:', error);
    return [];
  }
};

export const saveDocumentToIDB = async (doc: Document): Promise<void> => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(DOCUMENTS_STORE, 'readwrite');
      const store = transaction.objectStore(DOCUMENTS_STORE);
      const request = store.put(doc);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('IndexedDB save document failed:', error);
  }
};

export const deleteDocumentFromIDB = async (docId: string): Promise<void> => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(DOCUMENTS_STORE, 'readwrite');
      const store = transaction.objectStore(DOCUMENTS_STORE);
      const request = store.delete(docId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('IndexedDB delete document failed:', error);
  }
};

// ============ FOLDERS ============

export const saveFoldersToIDB = async (folders: Folder[]): Promise<void> => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(FOLDERS_STORE, 'readwrite');
      const store = transaction.objectStore(FOLDERS_STORE);

      // Clear existing folders and add new ones
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        folders.forEach(folder => {
          store.put(folder);
        });
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn('IndexedDB save folders failed:', error);
  }
};

export const loadFoldersFromIDB = async (): Promise<Folder[]> => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(FOLDERS_STORE, 'readonly');
      const store = transaction.objectStore(FOLDERS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result || []);
      };
    });
  } catch (error) {
    console.warn('IndexedDB load folders failed:', error);
    return [];
  }
};

// ============ TAGS ============

export const saveTagsToIDB = async (tags: string[]): Promise<void> => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(TAGS_STORE, 'readwrite');
      const store = transaction.objectStore(TAGS_STORE);
      const request = store.put(tags, 'all');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('IndexedDB save tags failed:', error);
  }
};

export const loadTagsFromIDB = async (): Promise<string[]> => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(TAGS_STORE, 'readonly');
      const store = transaction.objectStore(TAGS_STORE);
      const request = store.get('all');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result || []);
      };
    });
  } catch (error) {
    console.warn('IndexedDB load tags failed:', error);
    return [];
  }
};

// ============ LEGACY (for backwards compatibility) ============

export const saveToIndexedDB = async (content: string): Promise<void> => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(DOCUMENTS_STORE, 'readwrite');
      const store = transaction.objectStore(DOCUMENTS_STORE);
      const request = store.put({ id: LEGACY_DOC_KEY, content, updatedAt: Date.now() }, LEGACY_DOC_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('IndexedDB save failed:', error);
  }
};

export const loadFromIndexedDB = async (): Promise<string | null> => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(DOCUMENTS_STORE, 'readonly');
      const store = transaction.objectStore(DOCUMENTS_STORE);
      const request = store.get(LEGACY_DOC_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.content || null);
      };
    });
  } catch (error) {
    console.warn('IndexedDB load failed:', error);
    return null;
  }
};

export const clearIndexedDB = async (): Promise<void> => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(DOCUMENTS_STORE, 'readwrite');
      const store = transaction.objectStore(DOCUMENTS_STORE);
      const request = store.delete(LEGACY_DOC_KEY);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('IndexedDB clear failed:', error);
  }
};

// ============ SETTINGS ============

export const saveSettingToIDB = async <T>(key: string, value: T): Promise<void> => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(SETTINGS_STORE, 'readwrite');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.put(value, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('IndexedDB save setting failed:', error);
  }
};

export const loadSettingFromIDB = async <T>(key: string): Promise<T | null> => {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(SETTINGS_STORE, 'readonly');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result ?? null);
      };
    });
  } catch (error) {
    console.warn('IndexedDB load setting failed:', error);
    return null;
  }
};

// Convenience functions for specific settings
export const saveAppSettingsToIDB = async <T extends object>(settings: T): Promise<void> => {
  return saveSettingToIDB('app-settings', settings);
};

export const loadAppSettingsFromIDB = async <T extends object>(): Promise<T | null> => {
  return loadSettingFromIDB<T>('app-settings');
};

export const saveThemeToIDB = async (themeId: string, mode: string): Promise<void> => {
  return saveSettingToIDB('theme', { themeId, mode });
};

export const loadThemeFromIDB = async (): Promise<{ themeId: string; mode: string } | null> => {
  return loadSettingFromIDB('theme');
};

// Save legacy content (single document mode)
export const saveLegacyContentToIDB = async (content: string): Promise<void> => {
  return saveSettingToIDB('legacy-content', content);
};

export const loadLegacyContentFromIDB = async (): Promise<string | null> => {
  return loadSettingFromIDB('legacy-content');
};

// Current document ID tracking
export const saveCurrentDocIdToIDB = async (docId: string | null): Promise<void> => {
  return saveSettingToIDB('current-doc-id', docId);
};

export const loadCurrentDocIdFromIDB = async (): Promise<string | null> => {
  return loadSettingFromIDB('current-doc-id');
};
