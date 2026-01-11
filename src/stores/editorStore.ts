import { create } from 'zustand';
import { mutative } from 'zustand-mutative';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ViewMode = 'editor' | 'preview' | 'split';

interface EditorState {
  // View state
  viewMode: ViewMode;
  isZenMode: boolean;
  splitPercent: number;

  // UI panels
  showSidebar: boolean;
  showTOC: boolean;
  showSearch: boolean;
  showSettings: boolean;
  showCommandPalette: boolean;
  showShortcuts: boolean;
  showVersionHistory: boolean;
  showQR: boolean;

  // Editor state
  isEditorFocused: boolean;
  isSaving: boolean;
  lastSaved: number | null;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  toggleZenMode: () => void;
  setSplitPercent: (percent: number) => void;

  // Panel actions
  setShowSidebar: (show: boolean) => void;
  setShowTOC: (show: boolean) => void;
  setShowSearch: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowCommandPalette: (show: boolean) => void;
  setShowShortcuts: (show: boolean) => void;
  setShowVersionHistory: (show: boolean) => void;
  setShowQR: (show: boolean) => void;

  // Editor actions
  setEditorFocused: (focused: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setLastSaved: (time: number | null) => void;

  // Utility
  closeAllPanels: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    mutative((set) => ({
      // Initial state
      viewMode: 'editor',
      isZenMode: false,
      splitPercent: 50,

      showSidebar: false,
      showTOC: false,
      showSearch: false,
      showSettings: false,
      showCommandPalette: false,
      showShortcuts: false,
      showVersionHistory: false,
      showQR: false,

      isEditorFocused: false,
      isSaving: false,
      lastSaved: null,

      // Actions
      setViewMode: (mode) => set((state) => {
        state.viewMode = mode;
      }),

      toggleZenMode: () => set((state) => {
        state.isZenMode = !state.isZenMode;
      }),

      setSplitPercent: (percent) => set((state) => {
        state.splitPercent = Math.min(75, Math.max(25, percent));
      }),

      // Panel actions
      setShowSidebar: (show) => set((state) => {
        state.showSidebar = show;
      }),

      setShowTOC: (show) => set((state) => {
        state.showTOC = show;
      }),

      setShowSearch: (show) => set((state) => {
        state.showSearch = show;
      }),

      setShowSettings: (show) => set((state) => {
        state.showSettings = show;
      }),

      setShowCommandPalette: (show) => set((state) => {
        state.showCommandPalette = show;
      }),

      setShowShortcuts: (show) => set((state) => {
        state.showShortcuts = show;
      }),

      setShowVersionHistory: (show) => set((state) => {
        state.showVersionHistory = show;
      }),

      setShowQR: (show) => set((state) => {
        state.showQR = show;
      }),

      // Editor actions
      setEditorFocused: (focused) => set((state) => {
        state.isEditorFocused = focused;
      }),

      setIsSaving: (saving) => set((state) => {
        state.isSaving = saving;
      }),

      setLastSaved: (time) => set((state) => {
        state.lastSaved = time;
      }),

      // Utility
      closeAllPanels: () => set((state) => {
        state.showSidebar = false;
        state.showTOC = false;
        state.showSearch = false;
        state.showSettings = false;
        state.showCommandPalette = false;
        state.showShortcuts = false;
        state.showVersionHistory = false;
        state.showQR = false;
      }),
    })),
    {
      name: 'editor-ui-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        splitPercent: state.splitPercent,
        isZenMode: state.isZenMode,
      }),
    }
  )
);
