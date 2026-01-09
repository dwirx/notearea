import { useCallback } from 'react';

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

interface UseEditorCommandsProps {
  value: string;
  onChange: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export const useEditorCommands = ({ value, onChange, textareaRef }: UseEditorCommandsProps) => {
  const updateValueAndSelection = useCallback((
    textarea: HTMLTextAreaElement,
    nextValue: string,
    selectionStart: number,
    selectionEnd: number
  ) => {
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.selectionStart = selectionStart;
      textarea.selectionEnd = selectionEnd;
    });
  }, [onChange]);

  const applyInlineWrap = useCallback((left: string, right: string = left) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const nextValue = value.slice(0, start) + left + selected + right + value.slice(end);
    const selectionStart = start + left.length;
    const selectionEnd = end + left.length;
    updateValueAndSelection(textarea, nextValue, selectionStart, selectionEnd);
  }, [value, updateValueAndSelection, textareaRef]);

  const applyLink = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const linkText = `[${selected}]()`;
    const nextValue = value.slice(0, start) + linkText + value.slice(end);
    const selectionStart = start + 1;
    const selectionEnd = start + 1 + selected.length;
    updateValueAndSelection(textarea, nextValue, selectionStart, selectionEnd);
  }, [value, updateValueAndSelection, textareaRef]);

  const applyLineTransform = useCallback((
    transformLines: (lines: string[]) => LineTransform[]
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

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
    const selectionStartFinal = lineStart + Math.max(0, Math.min(newSelectionStart, blockLength));
    const selectionEndFinal = lineStart + Math.max(0, Math.min(newSelectionEnd, blockLength));
    updateValueAndSelection(textarea, nextValue, selectionStartFinal, selectionEndFinal);
  }, [value, updateValueAndSelection, textareaRef]);

  const toggleBlockquote = useCallback(() => {
    applyLineTransform((lines) => {
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

  const toggleBulletList = useCallback(() => {
    applyLineTransform((lines) => {
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

  const toggleOrderedList = useCallback(() => {
    applyLineTransform((lines) => {
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

  const toggleTaskList = useCallback(() => {
    applyLineTransform((lines) => {
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

  const applyHeading = useCallback((level: number) => {
    const prefix = `${'#'.repeat(level)} `;
    applyLineTransform((lines) => {
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

  const toggleCodeBlock = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

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
  }, [value, updateValueAndSelection, textareaRef]);

  const insertHorizontalRule = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const hr = '\n\n---\n\n';
    const nextValue = value.slice(0, start) + hr + value.slice(start);
    updateValueAndSelection(textarea, nextValue, start + hr.length, start + hr.length);
  }, [value, updateValueAndSelection, textareaRef]);

  // Handle formatting action from toolbar
  const handleFormat = useCallback((action: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus();

    switch (action) {
      case 'bold':
        applyInlineWrap('**');
        break;
      case 'italic':
        applyInlineWrap('*');
        break;
      case 'strike':
        applyInlineWrap('~~');
        break;
      case 'code':
        applyInlineWrap('`');
        break;
      case 'codeblock':
        toggleCodeBlock();
        break;
      case 'link':
        applyLink();
        break;
      case 'h1':
        applyHeading(1);
        break;
      case 'h2':
        applyHeading(2);
        break;
      case 'h3':
        applyHeading(3);
        break;
      case 'bullet':
        toggleBulletList();
        break;
      case 'ordered':
        toggleOrderedList();
        break;
      case 'task':
        toggleTaskList();
        break;
      case 'quote':
        toggleBlockquote();
        break;
      case 'hr':
        insertHorizontalRule();
        break;
      default:
        break;
    }
  }, [
    textareaRef,
    applyInlineWrap,
    applyLink,
    applyHeading,
    toggleBulletList,
    toggleOrderedList,
    toggleTaskList,
    toggleBlockquote,
    toggleCodeBlock,
    insertHorizontalRule,
  ]);

  return {
    handleFormat,
    applyInlineWrap,
    applyLink,
    applyHeading,
    toggleBulletList,
    toggleOrderedList,
    toggleTaskList,
    toggleBlockquote,
    toggleCodeBlock,
    insertHorizontalRule,
  };
};
