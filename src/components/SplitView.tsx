import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import LiveEditor, { LiveEditorRef } from './LiveEditor';
import MarkdownPreview from './MarkdownPreview';

export type ViewMode = 'editor' | 'preview' | 'split';

interface SplitViewProps {
  content: string;
  onChange: (content: string) => void;
  viewMode: ViewMode;
  placeholder?: string;
  onEditorFocus?: () => void;
  onEditorBlur?: () => void;
  editorRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
}

const SplitView = ({
  content,
  onChange,
  viewMode,
  placeholder,
  onEditorFocus,
  onEditorBlur,
  editorRef,
}: SplitViewProps) => {
  const liveEditorRef = useRef<LiveEditorRef>(null);

  // Sync the internal ref to the external editorRef
  useEffect(() => {
    if (editorRef && liveEditorRef.current) {
      editorRef.current = liveEditorRef.current.textarea;
    }
  }, [editorRef, viewMode]);

  if (viewMode === 'preview') {
    return <MarkdownPreview content={content} />;
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
          />
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 h-full overflow-y-auto bg-background">
        <div className="sticky top-0 z-10 px-4 py-2 bg-muted/50 backdrop-blur-sm border-b border-border/30">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Pratinjau
          </span>
        </div>
        <MarkdownPreview content={content} />
      </div>
    </motion.div>
  );
};

export default SplitView;
