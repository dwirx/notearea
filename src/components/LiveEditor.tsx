import { useRef, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LiveEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Parse line and return React elements with inline markdown styling
const renderLine = (line: string, lineIndex: number) => {
  // Heading 6
  if (line.startsWith('###### ')) {
    return (
      <div key={lineIndex} className="live-h6">
        <span className="text-muted-foreground opacity-50">######</span>
        <span className="font-semibold">{line.slice(7)}</span>
      </div>
    );
  }
  // Heading 5
  if (line.startsWith('##### ')) {
    return (
      <div key={lineIndex} className="live-h5">
        <span className="text-muted-foreground opacity-50">#####</span>
        <span className="font-semibold">{line.slice(6)}</span>
      </div>
    );
  }
  // Heading 4
  if (line.startsWith('#### ')) {
    return (
      <div key={lineIndex} className="live-h4">
        <span className="text-muted-foreground opacity-50">####</span>
        <span className="font-semibold">{line.slice(5)}</span>
      </div>
    );
  }
  // Heading 3
  if (line.startsWith('### ')) {
    return (
      <div key={lineIndex} className="live-h3">
        <span className="text-muted-foreground opacity-50">###</span>
        <span className="font-semibold">{line.slice(4)}</span>
      </div>
    );
  }
  // Heading 2
  if (line.startsWith('## ')) {
    return (
      <div key={lineIndex} className="live-h2">
        <span className="text-muted-foreground opacity-50">##</span>
        <span className="font-bold">{line.slice(3)}</span>
      </div>
    );
  }
  // Heading 1
  if (line.startsWith('# ')) {
    return (
      <div key={lineIndex} className="live-h1">
        <span className="text-muted-foreground opacity-50">#</span>
        <span className="font-bold">{line.slice(2)}</span>
      </div>
    );
  }
  
  // Code block markers
  if (line.startsWith('```')) {
    return (
      <div key={lineIndex} className="live-code-marker">
        <span className="text-primary/70">{line}</span>
      </div>
    );
  }

  // Regular line with inline formatting
  return (
    <div key={lineIndex} className="live-line">
      {renderInlineFormatting(line)}
    </div>
  );
};

// Render inline formatting (bold, italic, code, strikethrough, links)
const renderInlineFormatting = (text: string) => {
  if (!text) return <span>&nbsp;</span>;

  const elements: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Inline code `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      elements.push(
        <span key={keyIndex++} className="live-inline-code">
          <span className="text-muted-foreground opacity-50">`</span>
          <span className="text-primary">{codeMatch[1]}</span>
          <span className="text-muted-foreground opacity-50">`</span>
        </span>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      elements.push(
        <span key={keyIndex++} className="live-bold">
          <span className="text-muted-foreground opacity-50">**</span>
          <span className="font-bold">{boldMatch[1]}</span>
          <span className="text-muted-foreground opacity-50">**</span>
        </span>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Strikethrough ~~text~~
    const strikeMatch = remaining.match(/^~~([^~]+)~~/);
    if (strikeMatch) {
      elements.push(
        <span key={keyIndex++} className="live-strike">
          <span className="text-muted-foreground opacity-50">~~</span>
          <span className="line-through">{strikeMatch[1]}</span>
          <span className="text-muted-foreground opacity-50">~~</span>
        </span>
      );
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }

    // Italic *text*
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      elements.push(
        <span key={keyIndex++} className="live-italic">
          <span className="text-muted-foreground opacity-50">*</span>
          <span className="italic">{italicMatch[1]}</span>
          <span className="text-muted-foreground opacity-50">*</span>
        </span>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // URL detection
    const urlMatch = remaining.match(/^(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      elements.push(
        <a 
          key={keyIndex++} 
          href={urlMatch[1]} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:opacity-80"
        >
          {urlMatch[1]}
        </a>
      );
      remaining = remaining.slice(urlMatch[0].length);
      continue;
    }

    // Regular character
    elements.push(<span key={keyIndex++}>{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return elements;
};

// Check if we're inside a code block
const processLines = (lines: string[]) => {
  const result: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockStart = -1;
  let codeBlockLang = '';

  lines.forEach((line, index) => {
    if (line.startsWith('```') && !inCodeBlock) {
      inCodeBlock = true;
      codeBlockStart = index;
      codeBlockLang = line.slice(3);
      codeBlockLines = [];
      result.push(
        <div key={`code-start-${index}`} className="live-code-marker">
          <span className="text-primary/60">```</span>
          <span className="text-primary/80">{codeBlockLang}</span>
        </div>
      );
    } else if (line === '```' && inCodeBlock) {
      inCodeBlock = false;
      result.push(
        <div key={`code-end-${index}`} className="live-code-marker">
          <span className="text-primary/60">```</span>
        </div>
      );
    } else if (inCodeBlock) {
      result.push(
        <div key={`code-line-${index}`} className="live-code-line">
          {renderCodeLine(line)}
        </div>
      );
    } else {
      result.push(renderLine(line, index));
    }
  });

  return result;
};

// Simple syntax highlighting for code
const renderCodeLine = (line: string) => {
  // Highlight keywords
  const keywords = ['function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'class', 'extends'];
  let result = line;
  
  // Just return with monospace styling, could add more highlighting later
  return <span className="text-foreground">{line || '\u00A0'}</span>;
};

const LiveEditor = ({ value, onChange, placeholder = "Mulai menulis..." }: LiveEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const lines = value.split('\n');

  // Sync scroll between textarea and overlay
  const handleScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      setScrollTop(textareaRef.current.scrollTop);
    }
  }, []);

  // Auto-resize
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.max(textarea.scrollHeight, window.innerHeight - 200);
      textarea.style.height = `${newHeight}px`;
      if (overlay) {
        overlay.style.height = `${newHeight}px`;
      }
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  useEffect(() => {
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [adjustHeight]);

  // Focus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Handle tab key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  const showPlaceholder = !value;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full min-h-screen safe-top relative"
      ref={containerRef}
    >
      {/* Overlay with rendered markdown */}
      <div
        ref={overlayRef}
        className="live-editor-overlay absolute inset-0 pointer-events-none overflow-hidden px-4 py-8 sm:px-6 sm:py-12 md:px-12 md:py-16 lg:px-20 lg:py-20"
        style={{ 
          transform: `translateY(-${scrollTop}px)`,
        }}
        aria-hidden="true"
      >
        <div className="live-editor-content">
          {showPlaceholder ? (
            <div className="text-muted-foreground italic opacity-60">{placeholder}</div>
          ) : (
            processLines(lines)
          )}
        </div>
      </div>

      {/* Hidden textarea for input */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        className="live-editor-input w-full min-h-screen resize-none outline-none border-0 px-4 py-8 sm:px-6 sm:py-12 md:px-12 md:py-16 lg:px-20 lg:py-20 text-base sm:text-lg md:text-xl leading-relaxed pb-32"
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="sentences"
        autoCorrect="on"
      />
    </motion.div>
  );
};

export default LiveEditor;
