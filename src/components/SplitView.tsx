import { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import LiveEditor, { LiveEditorRef } from './LiveEditor';
import MarkdownPreview from './MarkdownPreview';
import { Settings, getEditorStyles, getEditorWidthClass } from '@/hooks/useSettings';

export type ViewMode = 'editor' | 'preview' | 'split';

interface SplitViewProps {
  content: string;
  onChange: (content: string) => void;
  viewMode: ViewMode;
  placeholder?: string;
  onEditorFocus?: () => void;
  onEditorBlur?: () => void;
  editorRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
  settings?: Settings;
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
}: SplitViewProps) => {
  const liveEditorRef = useRef<LiveEditorRef>(null);

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

  if (viewMode === 'preview') {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-editor-bg">
        <MarkdownPreview content={content} editorStyles={editorStyles} />
      </div>
    );
  }

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
      />
    );
  }

  // Split view
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-screen h-[100dvh] w-full"
    >
      {/* Editor Panel */}
      <div className="w-1/2 h-full border-r border-border/30 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <LiveEditor
            ref={liveEditorRef}
            value={content}
            onChange={onChange}
            placeholder={placeholder}
            onFocus={onEditorFocus}
            onBlur={onEditorBlur}
            editorStyles={editorStyles}
            editorWidthClass="max-w-full"
          />
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 h-full overflow-y-auto bg-background">
        <div className="sticky top-0 z-10 px-4 py-2.5 bg-muted/60 backdrop-blur-md border-b border-border/30">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pratinjau
          </span>
        </div>
        <MarkdownPreview content={content} editorStyles={editorStyles} />
      </div>
    </motion.div>
  );
};

export default SplitView;
