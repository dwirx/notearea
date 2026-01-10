import { useRef, useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import SlashCommandMenu, { useSlashCommand } from './SlashCommandMenu';

// Search highlight interface
export interface SearchHighlight {
  start: number;
  end: number;
  isCurrent: boolean;
}

interface LiveEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  editorStyles?: React.CSSProperties;
  editorWidthClass?: string;
  searchHighlights?: SearchHighlight[];
  typewriterMode?: boolean;
  focusMode?: boolean;
}

export interface LiveEditorRef {
  textarea: HTMLTextAreaElement | null;
  focus: () => void;
}

type LineTransform = {
  line: string;
  delta: number;
  shiftOffset: number;
};

const getLineRange = (text: string, start: number, end: number) => {
  const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
  let lineEnd = text.indexOf('\n', end);
  if (lineEnd === -1) lineEnd = text.length;
  return { lineStart, lineEnd };
};

const splitIndent = (line: string) => {
  const match = line.match(/^(\s*)(.*)$/);
  return {
    indent: match ? match[1] : '',
    content: match ? match[2] : line,
  };
};

// Parse line for styling - returns React elements
const renderLine = (line: string, lineIndex: number, inCodeBlock: boolean): React.ReactNode => {
  // Inside code block
  if (inCodeBlock) {
    return (
      <span key={lineIndex} className="md-code-content">{line || '\u00A0'}</span>
    );
  }

  // Code block markers
  if (line.startsWith('```')) {
    const lang = line.slice(3);
    return (
      <span key={lineIndex} className="md-code-fence">
        <span className="md-syntax">```</span>
        <span className="md-code-lang">{lang}</span>
      </span>
    );
  }

  // Headings - check from most specific (######) to least (#)
  const headingMatch = line.match(/^(#{1,6})\s(.*)$/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    const hashes = headingMatch[1];
    const content = headingMatch[2];
    return (
      <span key={lineIndex}>
        <span className="md-syntax">{hashes} </span>
        <span className={`md-h${level}`}>{parseInline(content)}</span>
      </span>
    );
  }

  // Regular line
  if (!line) {
    return <span key={lineIndex}>{'\u00A0'}</span>;
  }

  return <span key={lineIndex}>{parseInline(line)}</span>;
};

// Parse inline formatting - optimized to batch regular text
const parseInline = (text: string): React.ReactNode[] => {
  if (!text) return ['\u00A0'];

  const elements: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;
  let regularText = '';

  const flushRegularText = () => {
    if (regularText) {
      elements.push(<span key={keyIndex++}>{regularText}</span>);
      regularText = '';
    }
  };

  while (remaining.length > 0) {
    // Inline code `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      flushRegularText();
      elements.push(
        <span key={keyIndex++} className="md-inline-code">
          <span className="md-syntax">`</span>
          <span className="md-code-text">{codeMatch[1]}</span>
          <span className="md-syntax">`</span>
        </span>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      flushRegularText();
      elements.push(
        <span key={keyIndex++} className="md-bold">
          <span className="md-syntax">**</span>
          <strong>{boldMatch[1]}</strong>
          <span className="md-syntax">**</span>
        </span>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Strikethrough ~~text~~
    const strikeMatch = remaining.match(/^~~([^~]+)~~/);
    if (strikeMatch) {
      flushRegularText();
      elements.push(
        <span key={keyIndex++} className="md-strike">
          <span className="md-syntax">~~</span>
          <del>{strikeMatch[1]}</del>
          <span className="md-syntax">~~</span>
        </span>
      );
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }

    // Italic *text* (but not **)
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch && !remaining.startsWith('**')) {
      flushRegularText();
      elements.push(
        <span key={keyIndex++} className="md-italic">
          <span className="md-syntax">*</span>
          <em>{italicMatch[1]}</em>
          <span className="md-syntax">*</span>
        </span>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // URL
    const urlMatch = remaining.match(/^(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      flushRegularText();
      elements.push(
        <span key={keyIndex++} className="md-link">
          {urlMatch[1]}
        </span>
      );
      remaining = remaining.slice(urlMatch[1].length);
      continue;
    }

    // Accumulate regular characters
    regularText += remaining[0];
    remaining = remaining.slice(1);
  }

  flushRegularText();
  return elements;
};

// Process content with search highlights
const processContentWithHighlights = (
  content: string,
  searchHighlights: SearchHighlight[]
): React.ReactNode[] => {
  if (searchHighlights.length === 0) {
    return processContent(content);
  }

  // Split content into segments based on search highlights
  const segments: { text: string; isHighlight: boolean; isCurrent: boolean }[] = [];
  let lastEnd = 0;

  // Sort highlights by start position
  const sortedHighlights = [...searchHighlights].sort((a, b) => a.start - b.start);

  sortedHighlights.forEach((highlight) => {
    // Add non-highlighted text before this highlight
    if (highlight.start > lastEnd) {
      segments.push({
        text: content.slice(lastEnd, highlight.start),
        isHighlight: false,
        isCurrent: false,
      });
    }

    // Add highlighted text
    segments.push({
      text: content.slice(highlight.start, highlight.end),
      isHighlight: true,
      isCurrent: highlight.isCurrent,
    });

    lastEnd = highlight.end;
  });

  // Add remaining text
  if (lastEnd < content.length) {
    segments.push({
      text: content.slice(lastEnd),
      isHighlight: false,
      isCurrent: false,
    });
  }

  // Render segments
  const result: React.ReactNode[] = [];
  segments.forEach((segment, segmentIndex) => {
    if (segment.isHighlight) {
      // Wrap highlight text in a span with highlight class
      const highlightClass = segment.isCurrent
        ? 'search-highlight search-highlight-current'
        : 'search-highlight';
      result.push(
        <span key={`hl-${segmentIndex}`} className={highlightClass}>
          {segment.text}
        </span>
      );
    } else {
      // Process non-highlighted text normally
      const lines = segment.text.split('\n');
      let inCodeBlock = false;

      lines.forEach((line, lineIndex) => {
        if (line.startsWith('```')) {
          const wasInCodeBlock = inCodeBlock;
          inCodeBlock = !inCodeBlock;
          result.push(renderLine(line, segmentIndex * 1000 + lineIndex, wasInCodeBlock));
        } else {
          result.push(renderLine(line, segmentIndex * 1000 + lineIndex, inCodeBlock));
        }

        // Add newline except for last line of this segment
        if (lineIndex < lines.length - 1) {
          result.push('\n');
        }
      });
    }
  });

  return result;
};

// Process all lines
const processContent = (content: string): React.ReactNode[] => {
  const lines = content.split('\n');
  const result: React.ReactNode[] = [];
  let inCodeBlock = false;

  lines.forEach((line, index) => {
    if (line.startsWith('```')) {
      const wasInCodeBlock = inCodeBlock;
      inCodeBlock = !inCodeBlock;
      result.push(renderLine(line, index, wasInCodeBlock));
    } else {
      result.push(renderLine(line, index, inCodeBlock));
    }

    // Add newline except for last line
    if (index < lines.length - 1) {
      result.push('\n');
    }
  });

  return result;
};

const findUrlAtPosition = (text: string, pos: number): string | null => {
  if (pos < 0 || pos > text.length) return null;

  const lineStart = text.lastIndexOf('\n', Math.max(0, pos - 1)) + 1;
  const nextNewline = text.indexOf('\n', pos);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;

  const line = text.slice(lineStart, lineEnd);
  const posInLine = pos - lineStart;

  const urlRegex = /https?:\/\/[^\s)\]]+/g;
  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(line))) {
    const start = match.index;
    const end = start + match[0].length;
    if (posInLine >= start && posInLine <= end) return match[0];
  }

  return null;
};

interface LinkTooltip {
  url: string;
  x: number;
  y: number;
}

const LiveEditor = forwardRef<LiveEditorRef, LiveEditorProps>(({ value, onChange, placeholder = "Mulai menulis...", onFocus, onBlur, editorStyles, editorWidthClass = "max-w-3xl", searchHighlights = [], typewriterMode = false, focusMode = false }, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [linkTooltip, setLinkTooltip] = useState<LinkTooltip | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Flag to prevent selectionchange listener from interfering with programmatic selection
  const isSettingSelectionRef = useRef(false);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Slash command detection
  const { isActive: isSlashActive } = useSlashCommand(value, cursorPosition);

  // Update menu visibility based on slash command
  useEffect(() => {
    setShowSlashMenu(isSlashActive);
  }, [isSlashActive]);

  // Calculate menu position based on cursor
  const updateMenuPosition = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const rect = textarea.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 28;
    const paddingTop = parseFloat(getComputedStyle(textarea).paddingTop) || 32;
    const paddingLeft = parseFloat(getComputedStyle(textarea).paddingLeft) || 16;

    // Count lines before cursor
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLineIndex = lines.length - 1;
    const currentLine = lines[currentLineIndex];

    // Approximate character width (monospace assumption)
    const charWidth = 9.5;
    const xOffset = Math.min(currentLine.length * charWidth, 200);

    const top = rect.top + paddingTop + (currentLineIndex * lineHeight) - textarea.scrollTop + lineHeight + 5;
    const left = rect.left + paddingLeft + xOffset;

    setMenuPosition({
      top: Math.min(top, window.innerHeight - 350),
      left: Math.min(left, window.innerWidth - 280),
    });
  }, [value, cursorPosition]);

  // Update cursor position and menu position
  const handleSelectionChange = useCallback(() => {
    // Skip if we're programmatically setting selection
    if (isSettingSelectionRef.current) return;

    const textarea = textareaRef.current;
    if (textarea && document.activeElement === textarea) {
      setCursorPosition(textarea.selectionStart);
      updateMenuPosition();
    }
  }, [updateMenuPosition]);

  // Listen for selection changes
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  // Handle slash command insertion
  const handleSlashInsert = useCallback((template: string, deleteCount: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = cursorPosition - deleteCount;
    const newValue = value.slice(0, start) + template + value.slice(cursorPosition);

    // Set flag to prevent selectionchange from interfering
    isSettingSelectionRef.current = true;
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    onChange(newValue);

    // Position cursor appropriately with double RAF
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // For code blocks, position cursor between the fences
        if (template.includes('```\n\n```')) {
          const newPos = start + 4; // After the opening ```\n
          textarea.selectionStart = textarea.selectionEnd = newPos;
        } else if (template.includes('](')) {
          // For links/images, position at the URL part
          const urlStart = start + template.indexOf('](') + 2;
          textarea.selectionEnd = start + template.indexOf(')');
          textarea.selectionStart = urlStart;
        } else {
          // Default: position at end of template
          const newPos = start + template.length;
          textarea.selectionStart = textarea.selectionEnd = newPos;
        }
        textarea.focus();

        selectionTimeoutRef.current = setTimeout(() => {
          isSettingSelectionRef.current = false;
        }, 50);
      });
    });
  }, [value, cursorPosition, onChange]);

  // Close slash menu
  const handleCloseSlashMenu = useCallback(() => {
    setShowSlashMenu(false);
  }, []);

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    textarea: textareaRef.current,
    focus: () => textareaRef.current?.focus(),
  }), []);

  // Sync scroll
  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Auto-resize
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    const highlight = highlightRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.max(textarea.scrollHeight, window.innerHeight - 100);
      textarea.style.height = `${newHeight}px`;
      if (highlight) {
        highlight.style.minHeight = `${newHeight}px`;
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
    textareaRef.current?.focus();
  }, []);

  // Cleanup selection timeout on unmount
  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  // Hide tooltip when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = () => setLinkTooltip(null);
    window.addEventListener('scroll', handleClickOutside, true);
    return () => window.removeEventListener('scroll', handleClickOutside, true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setLinkTooltip(null);

    // Update current line index for focus mode
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const lineIdx = textBeforeCursor.split('\n').length - 1;
    setCurrentLineIndex(lineIdx);
  };

  // Typewriter mode: keep current line centered
  useEffect(() => {
    if (!typewriterMode) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleTypewriterScroll = () => {
      const text = value;
      const cursorPos = textarea.selectionStart;
      const textBeforeCursor = text.substring(0, cursorPos);
      const currentLine = textBeforeCursor.split('\n').length;

      // Calculate approximate scroll position to center the current line
      const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 28;
      const viewportHeight = textarea.clientHeight;
      const targetScrollTop = (currentLine * lineHeight) - (viewportHeight / 2);

      textarea.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth'
      });
    };

    textarea.addEventListener('input', handleTypewriterScroll);
    textarea.addEventListener('keyup', handleTypewriterScroll);

    return () => {
      textarea.removeEventListener('input', handleTypewriterScroll);
      textarea.removeEventListener('keyup', handleTypewriterScroll);
    };
  }, [typewriterMode, value]);

  const updateValueAndSelection = useCallback((
    textarea: HTMLTextAreaElement,
    nextValue: string,
    selectionStart: number,
    selectionEnd: number
  ) => {
    // Set flag to prevent selectionchange from interfering
    isSettingSelectionRef.current = true;

    // Clear any pending selection timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    onChange(nextValue);

    // Use double requestAnimationFrame to ensure DOM is fully updated
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (textarea && document.body.contains(textarea)) {
          textarea.selectionStart = selectionStart;
          textarea.selectionEnd = selectionEnd;

          // Reset flag after a short delay to allow natural selection changes
          selectionTimeoutRef.current = setTimeout(() => {
            isSettingSelectionRef.current = false;
          }, 50);
        } else {
          isSettingSelectionRef.current = false;
        }
      });
    });
  }, [onChange]);

  const applyInlineWrap = useCallback((
    textarea: HTMLTextAreaElement,
    left: string,
    right: string = left
  ) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const nextValue = value.slice(0, start) + left + selected + right + value.slice(end);
    const selectionStart = start + left.length;
    const selectionEnd = end + left.length;
    updateValueAndSelection(textarea, nextValue, selectionStart, selectionEnd);
  }, [value, updateValueAndSelection]);

  const applyLink = useCallback((textarea: HTMLTextAreaElement) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const linkText = `[${selected}]()`;
    const nextValue = value.slice(0, start) + linkText + value.slice(end);
    const selectionStart = start + 1;
    const selectionEnd = start + 1 + selected.length;
    updateValueAndSelection(textarea, nextValue, selectionStart, selectionEnd);
  }, [value, updateValueAndSelection]);

  const applyLineTransform = useCallback((
    textarea: HTMLTextAreaElement,
    transformLines: (lines: string[]) => LineTransform[]
  ) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const effectiveEnd = end > start && value[end - 1] === '\n' ? end - 1 : end;
    const { lineStart, lineEnd } = getLineRange(value, start, effectiveEnd);
    const block = value.slice(lineStart, lineEnd);
    const lines = block.split('\n');
    const transforms = transformLines(lines);
    const nextBlock = transforms.map((item) => item.line).join('\n');

    const selectionStartInBlock = start - lineStart;
    const selectionEndInBlock = Math.min(end, lineEnd) - lineStart;
    let newSelectionStart = selectionStartInBlock;
    let newSelectionEnd = selectionEndInBlock;
    let lineOffset = 0;

    transforms.forEach((item, index) => {
      const shiftPoint = lineOffset + item.shiftOffset;
      if (selectionStartInBlock >= shiftPoint) newSelectionStart += item.delta;
      if (selectionEndInBlock >= shiftPoint) newSelectionEnd += item.delta;
      lineOffset += lines[index].length + 1;
    });

    const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
    const blockLength = nextBlock.length;
    const selectionStart = lineStart + Math.max(0, Math.min(newSelectionStart, blockLength));
    const selectionEnd = lineStart + Math.max(0, Math.min(newSelectionEnd, blockLength));
    updateValueAndSelection(textarea, nextValue, selectionStart, selectionEnd);
  }, [value, updateValueAndSelection]);

  const toggleBlockquote = useCallback((textarea: HTMLTextAreaElement) => {
    applyLineTransform(textarea, (lines) => {
      const nonEmpty = lines.filter((line) => line.trim().length > 0);
      const shouldRemove = nonEmpty.length > 0 && nonEmpty.every((line) => {
        const { content } = splitIndent(line);
        return content.startsWith('> ');
      });

      return lines.map((line) => {
        if (!line.trim()) return { line, delta: 0, shiftOffset: 0 };
        const { indent, content } = splitIndent(line);
        const hasPrefix = content.startsWith('> ');
        if (shouldRemove && hasPrefix) {
          return { line: indent + content.slice(2), delta: -2, shiftOffset: indent.length };
        }
        if (!shouldRemove && !hasPrefix) {
          return { line: indent + '> ' + content, delta: 2, shiftOffset: indent.length };
        }
        return { line, delta: 0, shiftOffset: indent.length };
      });
    });
  }, [applyLineTransform]);

  const toggleBulletList = useCallback((textarea: HTMLTextAreaElement) => {
    applyLineTransform(textarea, (lines) => {
      const nonEmpty = lines.filter((line) => line.trim().length > 0);
      const shouldRemove = nonEmpty.length > 0 && nonEmpty.every((line) => {
        const { content } = splitIndent(line);
        return /^[-*+]\s/.test(content);
      });

      return lines.map((line) => {
        if (!line.trim()) return { line, delta: 0, shiftOffset: 0 };
        const { indent, content } = splitIndent(line);
        const match = content.match(/^([-*+])\s/);
        if (shouldRemove && match) {
          return { line: indent + content.slice(2), delta: -2, shiftOffset: indent.length };
        }
        if (!shouldRemove && !match) {
          return { line: indent + '- ' + content, delta: 2, shiftOffset: indent.length };
        }
        return { line, delta: 0, shiftOffset: indent.length };
      });
    });
  }, [applyLineTransform]);

  const toggleOrderedList = useCallback((textarea: HTMLTextAreaElement) => {
    applyLineTransform(textarea, (lines) => {
      const nonEmpty = lines.filter((line) => line.trim().length > 0);
      const shouldRemove = nonEmpty.length > 0 && nonEmpty.every((line) => {
        const { content } = splitIndent(line);
        return /^\d+\.\s/.test(content);
      });

      let index = 1;
      return lines.map((line) => {
        if (!line.trim()) return { line, delta: 0, shiftOffset: 0 };
        const { indent, content } = splitIndent(line);
        const match = content.match(/^\d+\.\s/);
        if (shouldRemove && match) {
          return { line: indent + content.slice(match[0].length), delta: -match[0].length, shiftOffset: indent.length };
        }
        if (shouldRemove) {
          return { line, delta: 0, shiftOffset: indent.length };
        }
        const stripped = match ? content.slice(match[0].length) : content;
        const prefix = `${index}. `;
        index += 1;
        return { line: indent + prefix + stripped, delta: prefix.length - (match ? match[0].length : 0), shiftOffset: indent.length };
      });
    });
  }, [applyLineTransform]);

  const toggleTaskList = useCallback((textarea: HTMLTextAreaElement) => {
    applyLineTransform(textarea, (lines) => {
      const nonEmpty = lines.filter((line) => line.trim().length > 0);
      const shouldRemove = nonEmpty.length > 0 && nonEmpty.every((line) => {
        const { content } = splitIndent(line);
        return /^-\s\[( |x|X)\]\s/.test(content);
      });

      return lines.map((line) => {
        if (!line.trim()) return { line, delta: 0, shiftOffset: 0 };
        const { indent, content } = splitIndent(line);
        const match = content.match(/^-\s\[( |x|X)\]\s/);
        if (shouldRemove && match) {
          return { line: indent + content.slice(match[0].length), delta: -match[0].length, shiftOffset: indent.length };
        }
        if (!shouldRemove && !match) {
          return { line: indent + '- [ ] ' + content, delta: 6, shiftOffset: indent.length };
        }
        return { line, delta: 0, shiftOffset: indent.length };
      });
    });
  }, [applyLineTransform]);

  const applyHeading = useCallback((textarea: HTMLTextAreaElement, level: number) => {
    const prefix = `${'#'.repeat(level)} `;
    applyLineTransform(textarea, (lines) => {
      const nonEmpty = lines.filter((line) => line.trim().length > 0);
      const shouldRemove = nonEmpty.length > 0 && nonEmpty.every((line) => {
        const { content } = splitIndent(line);
        return content.startsWith(prefix);
      });

      return lines.map((line) => {
        if (!line.trim()) return { line, delta: 0, shiftOffset: 0 };
        const { indent, content } = splitIndent(line);
        const match = content.match(/^(#{1,6})\s+/);
        const oldPrefixLength = match ? match[0].length : 0;
        const stripped = match ? content.slice(match[0].length) : content;
        if (shouldRemove && content.startsWith(prefix)) {
          return { line: indent + stripped, delta: -oldPrefixLength, shiftOffset: indent.length };
        }
        return { line: indent + prefix + stripped, delta: prefix.length - oldPrefixLength, shiftOffset: indent.length };
      });
    });
  }, [applyLineTransform]);

  const toggleCodeBlock = useCallback((textarea: HTMLTextAreaElement) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const effectiveEnd = end > start && value[end - 1] === '\n' ? end - 1 : end;
    const { lineStart, lineEnd } = getLineRange(value, start, effectiveEnd);
    const block = value.slice(lineStart, lineEnd);
    const lines = block.split('\n');
    const hasFences = lines.length >= 2 && lines[0].trim().startsWith('```') && lines[lines.length - 1].trim().startsWith('```');

    if (hasFences) {
      const inner = lines.slice(1, -1).join('\n');
      const nextValue = value.slice(0, lineStart) + inner + value.slice(lineEnd);
      const selectionStart = lineStart;
      const selectionEnd = lineStart + inner.length;
      updateValueAndSelection(textarea, nextValue, selectionStart, selectionEnd);
      return;
    }

    const prefix = '```\n';
    const suffix = '\n```';
    const nextValue = value.slice(0, lineStart) + prefix + block + suffix + value.slice(lineEnd);
    const selectionStart = lineStart + prefix.length;
    const selectionEnd = selectionStart + block.length;
    updateValueAndSelection(textarea, nextValue, selectionStart, selectionEnd);
  }, [value, updateValueAndSelection]);

  const checkForLinkAtCursor = useCallback((textarea: HTMLTextAreaElement) => {
    const pos = textarea.selectionStart;
    const url = findUrlAtPosition(value, pos);

    if (url) {
      // Get cursor position for tooltip
      const rect = textarea.getBoundingClientRect();
      const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 28;

      // Calculate approximate position
      const textBeforeCursor = value.substring(0, pos);
      const lines = textBeforeCursor.split('\n');
      const currentLineIndex = lines.length - 1;

      const paddingTop = parseFloat(getComputedStyle(textarea).paddingTop) || 32;
      const y = rect.top + paddingTop + (currentLineIndex * lineHeight) - textarea.scrollTop;
      const x = rect.left + 100;

      setLinkTooltip({ url, x, y });
    } else {
      setLinkTooltip(null);
    }
  }, [value]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;

    // Ctrl/Cmd + Click to open link immediately
    if (e.ctrlKey || e.metaKey) {
      setTimeout(() => {
        const pos = textarea.selectionStart;
        const url = findUrlAtPosition(value, pos);
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
          setLinkTooltip(null);
        }
      }, 10);
      return;
    }

    // Regular click - show tooltip
    setTimeout(() => {
      checkForLinkAtCursor(textarea);
    }, 10);
  }, [value, checkForLinkAtCursor]);

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for link when moving with arrow keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      checkForLinkAtCursor(e.currentTarget);
    }
  }, [checkForLinkAtCursor]);

  const handleOpenLink = useCallback(() => {
    if (linkTooltip?.url) {
      window.open(linkTooltip.url, '_blank', 'noopener,noreferrer');
      setLinkTooltip(null);
    }
  }, [linkTooltip]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const nativeEvent = e.nativeEvent as KeyboardEvent;
    if (nativeEvent.isComposing) return;

    // Open link with Ctrl/Cmd + Enter when on a link
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && linkTooltip?.url) {
      e.preventDefault();
      handleOpenLink();
      return;
    }

    const isModKey = e.ctrlKey || e.metaKey;
    const isAltGraph = typeof e.getModifierState === 'function' && e.getModifierState('AltGraph');
    const key = e.key.toLowerCase();
    const textarea = e.currentTarget;

    if (isModKey && !isAltGraph) {
      if (!e.shiftKey && !e.altKey && key === 'b') {
        e.preventDefault();
        applyInlineWrap(textarea, '**');
        return;
      }

      if (!e.shiftKey && !e.altKey && key === 'i') {
        e.preventDefault();
        applyInlineWrap(textarea, '*');
        return;
      }

      if (!e.shiftKey && !e.altKey && key === 'k') {
        e.preventDefault();
        applyLink(textarea);
        return;
      }

      if (e.shiftKey && !e.altKey && key === 'x') {
        e.preventDefault();
        applyInlineWrap(textarea, '~~');
        return;
      }

      if (!e.shiftKey && !e.altKey && e.code === 'Backquote') {
        e.preventDefault();
        applyInlineWrap(textarea, '`');
        return;
      }

      if (e.shiftKey && !e.altKey && e.code === 'Backquote') {
        e.preventDefault();
        toggleCodeBlock(textarea);
        return;
      }

      if (e.shiftKey && !e.altKey && e.code === 'Digit8') {
        e.preventDefault();
        toggleBulletList(textarea);
        return;
      }

      if (e.shiftKey && !e.altKey && e.code === 'Digit7') {
        e.preventDefault();
        toggleOrderedList(textarea);
        return;
      }

      if (e.shiftKey && !e.altKey && e.code === 'Period') {
        e.preventDefault();
        toggleBlockquote(textarea);
        return;
      }

      if (!e.shiftKey && e.altKey && key === 't') {
        e.preventDefault();
        toggleTaskList(textarea);
        return;
      }

      if (!e.shiftKey && e.altKey && /^[1-6]$/.test(e.key)) {
        e.preventDefault();
        applyHeading(textarea, Number(e.key));
        return;
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newValue = value.substring(0, start) + '  ' + value.substring(end);

      // Use the same robust selection mechanism
      isSettingSelectionRef.current = true;
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }

      onChange(newValue);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
          selectionTimeoutRef.current = setTimeout(() => {
            isSettingSelectionRef.current = false;
          }, 50);
        });
      });
    }

    // Hide tooltip on Escape
    if (e.key === 'Escape') {
      setLinkTooltip(null);
    }
  };

  // Convert file to base64 data URL
  const fileToDataUrl = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }, []);

  // Insert image markdown at cursor position
  const insertImageMarkdown = useCallback((dataUrl: string, fileName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Generate a cleaner name from filename
    const altText = fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    const imageMarkdown = `![${altText}](${dataUrl})`;

    const newValue = value.slice(0, start) + imageMarkdown + value.slice(end);

    // Set flag to prevent selectionchange from interfering
    isSettingSelectionRef.current = true;
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    onChange(newValue);

    // Position cursor after the inserted image with double RAF
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const newPos = start + imageMarkdown.length;
        textarea.selectionStart = textarea.selectionEnd = newPos;
        textarea.focus();

        selectionTimeoutRef.current = setTimeout(() => {
          isSettingSelectionRef.current = false;
        }, 50);
      });
    });
  }, [value, onChange]);

  // Handle paste event for images
  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();

        const file = item.getAsFile();
        if (!file) continue;

        try {
          const dataUrl = await fileToDataUrl(file);
          const fileName = file.name || `image-${Date.now()}.${item.type.split('/')[1]}`;
          insertImageMarkdown(dataUrl, fileName);
        } catch (err) {
          console.error('Failed to paste image:', err);
        }
        return;
      }
    }
  }, [fileToDataUrl, insertImageMarkdown]);

  // Handle drag over event
  const handleDragOver = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
    const hasImages = Array.from(e.dataTransfer.types).some(
      type => type === 'Files' || type.startsWith('image/')
    );

    if (hasImages) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  // Handle drop event for images
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    // Check if any files are images
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    e.preventDefault();

    // Process all dropped images
    for (const file of imageFiles) {
      try {
        const dataUrl = await fileToDataUrl(file);
        insertImageMarkdown(dataUrl, file.name);
      } catch (err) {
        console.error('Failed to drop image:', err);
      }
    }
  }, [fileToDataUrl, insertImageMarkdown]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full min-h-screen min-h-[100dvh] safe-top bg-editor-bg flex flex-col"
    >
      <div ref={containerRef} className={`live-editor-container relative flex-1 w-full mx-auto ${editorWidthClass} ${focusMode ? 'focus-mode-active' : ''}`} data-current-line={currentLineIndex}>
        {/* Highlight overlay */}
        <div
          ref={highlightRef}
          className="live-highlight pointer-events-none whitespace-pre-wrap break-words"
          aria-hidden="true"
          style={{
            ...editorStyles,
            padding: isMobile ? '1rem 0.75rem 5rem 0.75rem' : '2rem 1.5rem 6rem 1.5rem',
          }}
        >
          {value ? processContentWithHighlights(value, searchHighlights) : <span className="md-placeholder">{placeholder}</span>}
        </div>

        {/* Textarea - positioned absolutely over the highlight */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onClick={handleClick}
          onScroll={syncScroll}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          placeholder=""
          className="live-textarea absolute inset-0 w-full h-full resize-none outline-none border-0 bg-transparent"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="sentences"
          autoCorrect="on"
          onFocus={onFocus}
          onBlur={onBlur}
          style={{
            ...editorStyles,
            padding: isMobile ? '1rem 0.75rem 5rem 0.75rem' : '2rem 1.5rem 6rem 1.5rem',
            caretColor: 'hsl(var(--editor-cursor))',
          }}
        />

        {/* Link tooltip */}
        <AnimatePresence>
          {linkTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="fixed z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg bg-card border border-border"
              style={{ top: linkTooltip.y + 30, left: linkTooltip.x }}
            >
              <button
                onClick={handleOpenLink}
                className="flex items-center gap-2 text-sm text-primary hover:underline focus:outline-none"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="max-w-[200px] truncate">{linkTooltip.url}</span>
              </button>
              <span className="text-xs text-muted-foreground">(Ctrl+Enter)</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slash Command Menu */}
        {showSlashMenu && (
          <div
            style={{
              '--menu-top': `${menuPosition.top}px`,
              '--menu-left': `${menuPosition.left}px`,
            } as React.CSSProperties}
          >
            <SlashCommandMenu
              content={value}
              cursorPosition={cursorPosition}
              onInsert={handleSlashInsert}
              onClose={handleCloseSlashMenu}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
});

LiveEditor.displayName = 'LiveEditor';

export default LiveEditor;
