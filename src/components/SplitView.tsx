import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import LiveEditor, { LiveEditorRef, SearchHighlight } from './LiveEditor';
import MarkdownPreview from './MarkdownPreview';
import { Settings, getEditorStyles, getEditorWidthClass } from '@/hooks/useSettings';
import { useEditorStore } from '@/stores/editorStore';
import { toast } from 'sonner';

export type ViewMode = 'editor' | 'preview' | 'split';

// Minimum screen width for split view (tablet and above)
const MIN_SPLIT_WIDTH = 768;
// Minimum panel width percentage
const MIN_PANEL_PERCENT = 25;
const MAX_PANEL_PERCENT = 75;

interface SplitViewProps {
  content: string;
  onChange: (content: string) => void;
  viewMode: ViewMode;
  placeholder?: string;
  onEditorFocus?: () => void;
  onEditorBlur?: () => void;
  editorRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
  settings?: Settings;
  searchHighlights?: SearchHighlight[];
  onViewModeChange?: (mode: ViewMode) => void;
}

const SplitView = ({
  content,
  onChange,
  viewMode,
  placeholder,
  onEditorFocus,
  onEditorBlur,
  editorRef,
  settings,
  searchHighlights = [],
  onViewModeChange,
}: SplitViewProps) => {
  const liveEditorRef = useRef<LiveEditorRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  // Use zustand store for split percent
  const { splitPercent, setSplitPercent } = useEditorStore();

  // Resizable split state
  const [isDragging, setIsDragging] = useState(false);
  const [canUseSplit, setCanUseSplit] = useState(true);

  // Check if screen is wide enough for split view
  useEffect(() => {
    const checkScreenWidth = () => {
      const canSplit = window.innerWidth >= MIN_SPLIT_WIDTH;
      setCanUseSplit(canSplit);

      // Auto-switch to editor mode if screen too small for split
      if (!canSplit && viewMode === 'split') {
        onViewModeChange?.('editor');
        toast.info('Split view tidak tersedia di layar kecil', {
          duration: 2000,
        });
      }
    };

    checkScreenWidth();
    window.addEventListener('resize', checkScreenWidth);
    return () => window.removeEventListener('resize', checkScreenWidth);
  }, [viewMode, onViewModeChange]);

  // Sync the internal ref to the external editorRef
  useEffect(() => {
    if (editorRef && liveEditorRef.current) {
      editorRef.current = liveEditorRef.current.textarea;
    }
  }, [editorRef, viewMode]);

  // Get editor styles from settings
  const editorStyles = useMemo(() => {
    if (!settings) return undefined;
    return getEditorStyles(settings);
  }, [settings]);

  // Get editor width class
  const editorWidthClass = useMemo(() => {
    if (!settings) return 'max-w-3xl';
    return getEditorWidthClass(settings.editorWidth);
  }, [settings?.editorWidth]);

  // Divider drag handlers
  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDividerTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(MAX_PANEL_PERCENT, Math.max(MIN_PANEL_PERCENT, percent)));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || !e.touches[0]) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(MAX_PANEL_PERCENT, Math.max(MIN_PANEL_PERCENT, percent)));
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, setSplitPercent]);

  // Reset split to 50/50 on double click
  const handleDividerDoubleClick = useCallback(() => {
    setSplitPercent(50);
  }, [setSplitPercent]);

  // Preview only mode
  if (viewMode === 'preview') {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-editor-bg">
        <MarkdownPreview content={content} editorStyles={editorStyles} />
      </div>
    );
  }

  // Editor only mode
  if (viewMode === 'editor') {
    return (
      <LiveEditor
        ref={liveEditorRef}
        value={content}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={onEditorFocus}
        onBlur={onEditorBlur}
        editorStyles={editorStyles}
        editorWidthClass={editorWidthClass}
        searchHighlights={searchHighlights}
        typewriterMode={settings?.typewriterMode}
        focusMode={settings?.focusMode}
      />
    );
  }

  // Split view not available on small screens - fallback to editor
  if (!canUseSplit) {
    return (
      <LiveEditor
        ref={liveEditorRef}
        value={content}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={onEditorFocus}
        onBlur={onEditorBlur}
        editorStyles={editorStyles}
        editorWidthClass={editorWidthClass}
        searchHighlights={searchHighlights}
        typewriterMode={settings?.typewriterMode}
        focusMode={settings?.focusMode}
      />
    );
  }

  // Split view with react-scroll-sync and resizable divider
  return (
    <ScrollSync proportional={true} vertical={true} horizontal={false}>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex h-screen h-[100dvh] w-full ${isDragging ? 'select-none cursor-col-resize' : ''}`}
      >
        {/* Editor Panel */}
        <ScrollSyncPane>
          <div
            className="h-full overflow-y-auto overflow-x-hidden"
            style={{ width: `${splitPercent}%` }}
          >
            <LiveEditor
              ref={liveEditorRef}
              value={content}
              onChange={onChange}
              placeholder={placeholder}
              onFocus={onEditorFocus}
              onBlur={onEditorBlur}
              editorStyles={editorStyles}
              editorWidthClass="max-w-full"
              searchHighlights={searchHighlights}
              typewriterMode={settings?.typewriterMode}
              focusMode={settings?.focusMode}
            />
          </div>
        </ScrollSyncPane>

        {/* Resizable Divider */}
        <div
          ref={dividerRef}
          className={`
            relative flex-shrink-0 w-1.5 cursor-col-resize
            bg-border/40 hover:bg-primary/50 active:bg-primary
            transition-colors duration-150
            group
            ${isDragging ? 'bg-primary' : ''}
          `}
          onMouseDown={handleDividerMouseDown}
          onTouchStart={handleDividerTouchStart}
          onDoubleClick={handleDividerDoubleClick}
          title="Drag untuk resize, double-click untuk reset"
        >
          {/* Drag handle indicator */}
          <div className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            flex items-center justify-center
            w-5 h-10 rounded-full
            bg-muted/90 border border-border/50 shadow-sm
            opacity-0 group-hover:opacity-100 transition-opacity
            ${isDragging ? 'opacity-100 bg-primary/20' : ''}
          `}>
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Preview Panel */}
        <ScrollSyncPane>
          <div
            className="h-full overflow-y-auto overflow-x-hidden bg-background"
            style={{ width: `calc(${100 - splitPercent}% - 6px)` }}
          >
            <div className="sticky top-0 z-10 px-4 py-2.5 bg-muted/60 backdrop-blur-md border-b border-border/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Pratinjau
                </span>
                <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                  {Math.round(100 - splitPercent)}%
                </span>
              </div>
            </div>
            <MarkdownPreview content={content} editorStyles={editorStyles} />
          </div>
        </ScrollSyncPane>
      </motion.div>
    </ScrollSync>
  );
};

export default SplitView;
