import hljs from 'highlight.js';
import katex from 'katex';

// Store for mermaid diagrams and math expressions
let mermaidDiagrams: string[] = [];
let mathBlocks: string[] = [];
let mathInlines: string[] = [];

// Get stored mermaid diagrams
export function getMermaidDiagrams(): string[] {
  return mermaidDiagrams;
}

// Get stored math blocks
export function getMathBlocks(): string[] {
  return mathBlocks;
}

// Get stored inline math
export function getMathInlines(): string[] {
  return mathInlines;
}

// Render LaTeX math to HTML using KaTeX
function renderMath(latex: string, displayMode: boolean = false): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
    });
  } catch {
    return `<span class="math-error">${latex}</span>`;
  }
}

// Simple markdown parser for preview with HTML support
export function parseMarkdown(text: string): string {
  if (!text) return '';

  // Reset storage arrays
  mermaidDiagrams = [];
  mathBlocks = [];
  mathInlines = [];

  let html = text;

  // Debug: Check for mermaid blocks in input
  const hasMermaid = text.includes('```mermaid');
  if (hasMermaid) {
    console.log('[parseMarkdown] Input has mermaid block. Text length:', text.length);
    // Check line endings
    console.log('[parseMarkdown] Has CRLF:', text.includes('\r\n'), 'Has LF:', text.includes('\n'));
  }

  // ===== STEP 1: Extract and store special blocks with placeholders =====
  // This prevents them from being corrupted by later processing

  // Placeholder markers - using simple alphanumeric format
  const MERMAID_PLACEHOLDER = 'ZZMERMAIDBLOCKZZ';
  const CODE_PLACEHOLDER = 'ZZCODEBLOCKZZ';
  const MATH_BLOCK_PLACEHOLDER = 'ZZMATHBLOCKZZ';

  // Store for placeholders
  const mermaidPlaceholders: string[] = [];
  const codePlaceholders: string[] = [];
  const mathBlockPlaceholders: string[] = [];

  // Extract Mermaid blocks FIRST (before any other processing)
  // Handle both LF and CRLF line endings
  html = html.replace(/```mermaid\s*[\r\n]+([\s\S]*?)```/g, (_, code) => {
    const trimmedCode = code.trim();
    console.log('[Markdown] Found mermaid block:', trimmedCode.substring(0, 50));
    if (!trimmedCode) return '';
    mermaidDiagrams.push(trimmedCode);
    const index = mermaidDiagrams.length - 1;
    // Base64 encode the mermaid code to safely store in data attribute
    // This avoids issues with special characters being interpreted as HTML
    const encodedCode = btoa(unescape(encodeURIComponent(trimmedCode)));
    const placeholder = `<div class="mermaid-diagram" data-mermaid-index="${index}" data-mermaid-code="${encodedCode}"><div class="mermaid-loading">Memuat diagram...</div></div>`;
    mermaidPlaceholders.push(placeholder);
    console.log('[Markdown] Created placeholder:', index);
    return `${MERMAID_PLACEHOLDER}${mermaidPlaceholders.length - 1}${MERMAID_PLACEHOLDER}`;
  });

  // Extract code blocks (skip if already handled as mermaid)
  html = html.replace(/```(\w*)[\r\n]?([\s\S]*?)```/g, (match, lang, code) => {
    // Skip if this looks like a mermaid placeholder (shouldn't happen, but safeguard)
    if (match.includes('ZZMERMAIDBLOCKZZ')) return match;
    const trimmedCode = code.trim();
    let highlighted: string;
    try {
      highlighted = lang && hljs.getLanguage(lang)
        ? hljs.highlight(trimmedCode, { language: lang }).value
        : hljs.highlightAuto(trimmedCode).value;
    } catch {
      highlighted = trimmedCode;
    }
    const placeholder = `<pre><code class="hljs language-${lang || 'plaintext'}">${highlighted}</code></pre>`;
    codePlaceholders.push(placeholder);
    return `${CODE_PLACEHOLDER}${codePlaceholders.length - 1}${CODE_PLACEHOLDER}`;
  });

  // Extract math block expressions $$...$$
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
    const trimmedLatex = latex.trim();
    mathBlocks.push(trimmedLatex);
    const rendered = renderMath(trimmedLatex, true);
    const placeholder = `<div class="math-block">${rendered}</div>`;
    mathBlockPlaceholders.push(placeholder);
    return `${MATH_BLOCK_PLACEHOLDER}${mathBlockPlaceholders.length - 1}${MATH_BLOCK_PLACEHOLDER}`;
  });

  // Extract \[...\] (LaTeX display math)
  html = html.replace(/\\\[([\s\S]*?)\\\]/g, (_, latex) => {
    const trimmedLatex = latex.trim();
    mathBlocks.push(trimmedLatex);
    const rendered = renderMath(trimmedLatex, true);
    const placeholder = `<div class="math-block">${rendered}</div>`;
    mathBlockPlaceholders.push(placeholder);
    return `${MATH_BLOCK_PLACEHOLDER}${mathBlockPlaceholders.length - 1}${MATH_BLOCK_PLACEHOLDER}`;
  });

  // ===== STEP 2: Store HTML blocks to preserve them =====
  const htmlBlocks: string[] = [];
  const htmlBlockPlaceholder = 'ZZHTMLBLOCKZZ';

  // Preserve HTML blocks (block-level HTML tags)
  html = html.replace(/(<(?:p|div|table|thead|tbody|tr|td|th|img|a|center|br|hr)[^>]*>[\s\S]*?<\/(?:p|div|table|thead|tbody|tr|td|th|a|center)>|<(?:img|br|hr)[^>]*\/?>)/gi, (match) => {
    htmlBlocks.push(match);
    return `${htmlBlockPlaceholder}${htmlBlocks.length - 1}${htmlBlockPlaceholder}`;
  });

  // Store inline HTML tags
  const inlineHtml: string[] = [];
  const inlineHtmlPlaceholder = 'ZZINLINEHTMLZZ';
  html = html.replace(/<[^>]+>/g, (match) => {
    inlineHtml.push(match);
    return `${inlineHtmlPlaceholder}${inlineHtml.length - 1}${inlineHtmlPlaceholder}`;
  });

  // Escape remaining HTML entities
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Restore inline HTML
  html = html.replace(new RegExp(`${inlineHtmlPlaceholder}(\\d+)${inlineHtmlPlaceholder}`, 'g'), (_, index) => {
    return inlineHtml[parseInt(index)];
  });

  // Restore HTML blocks
  html = html.replace(new RegExp(`${htmlBlockPlaceholder}(\\d+)${htmlBlockPlaceholder}`, 'g'), (_, index) => {
    return htmlBlocks[parseInt(index)];
  });

  // ===== STEP 3: Process remaining markdown =====

  // Inline math expressions $...$
  html = html.replace(/(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/g, (_, latex) => {
    const trimmedLatex = latex.trim();
    mathInlines.push(trimmedLatex);
    const rendered = renderMath(trimmedLatex, false);
    return `<span class="math-inline">${rendered}</span>`;
  });

  // Checklist / Task list - must be before unordered lists
  html = html.replace(/^- \[x\] (.+)$/gim, '<li class="task-item checked"><input type="checkbox" checked disabled /><span>$1</span></li>');
  html = html.replace(/^- \[ \] (.+)$/gm, '<li class="task-item"><input type="checkbox" disabled /><span>$1</span></li>');

  // Images ![alt](url) or ![alt](url "title") - with data attributes for lightbox
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, url, title) => {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<figure class="md-image"><img src="${url}" alt="${alt}"${titleAttr} loading="lazy" data-lightbox="true" />${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`;
  });

  // Inline code with special styling
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Helper to create heading ID from text
  const createHeadingId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  };

  // Headers (H1-H6) with IDs for navigation
  html = html.replace(/^###### (.+)$/gm, (_, text) => {
    const id = createHeadingId(text);
    return `<h6 id="heading-${id}">${text}</h6>`;
  });
  html = html.replace(/^##### (.+)$/gm, (_, text) => {
    const id = createHeadingId(text);
    return `<h5 id="heading-${id}">${text}</h5>`;
  });
  html = html.replace(/^#### (.+)$/gm, (_, text) => {
    const id = createHeadingId(text);
    return `<h4 id="heading-${id}">${text}</h4>`;
  });
  html = html.replace(/^### (.+)$/gm, (_, text) => {
    const id = createHeadingId(text);
    return `<h3 id="heading-${id}">${text}</h3>`;
  });
  html = html.replace(/^## (.+)$/gm, (_, text) => {
    const id = createHeadingId(text);
    return `<h2 id="heading-${id}">${text}</h2>`;
  });
  html = html.replace(/^# (.+)$/gm, (_, text) => {
    const id = createHeadingId(text);
    return `<h1 id="heading-${id}">${text}</h1>`;
  });

  // Tables - Parse markdown tables
  html = parseMarkdownTables(html);

  // Bold and italic combined
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Markdown links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Auto-link URLs (not already in href or src)
  html = html.replace(
    /(?<!href=["']|src=["'])(https?:\/\/[^\s<>"')\]]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Paragraphs (lines that aren't already wrapped)
  const lines = html.split('\n');
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<')) return line;
    // Don't wrap placeholder lines (using ZZ marker)
    if (trimmed.includes('ZZ') && trimmed.includes('BLOCKZZ')) return line;
    return `<p>${line}</p>`;
  });

  html = processedLines.join('\n');

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');

  // Fix consecutive blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '<br>');

  // ===== STEP 4: Restore special blocks from placeholders =====

  // Restore mermaid blocks
  html = html.replace(new RegExp(`${MERMAID_PLACEHOLDER}(\\d+)${MERMAID_PLACEHOLDER}`, 'g'), (_, index) => {
    const result = mermaidPlaceholders[parseInt(index)] || '';
    console.log('[parseMarkdown] Restoring mermaid placeholder', index, '-> length:', result.length);
    return result;
  });

  // Restore code blocks
  html = html.replace(new RegExp(`${CODE_PLACEHOLDER}(\\d+)${CODE_PLACEHOLDER}`, 'g'), (_, index) => {
    return codePlaceholders[parseInt(index)] || '';
  });

  // Restore math blocks
  html = html.replace(new RegExp(`${MATH_BLOCK_PLACEHOLDER}(\\d+)${MATH_BLOCK_PLACEHOLDER}`, 'g'), (_, index) => {
    return mathBlockPlaceholders[parseInt(index)] || '';
  });

  // Clean up any paragraphs wrapping block elements
  html = html.replace(/<p>(<div[^>]*>)/g, '$1');
  html = html.replace(/(<\/div>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');

  // Debug: Check final output
  if (hasMermaid) {
    console.log('[parseMarkdown] Final HTML has mermaid-diagram?', html.includes('mermaid-diagram'));
    console.log('[parseMarkdown] mermaidDiagrams array length:', mermaidDiagrams.length);
  }

  return html;
}

// Parse markdown tables
function parseMarkdownTables(html: string): string {
  const lines = html.split('\n');
  const result: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];
  let alignments: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if line is a table row (starts and ends with |, or has | in between)
    const isTableRow = line.includes('|') && line.match(/\|.*\|/);

    // Check if line is separator row (like |---|---|)
    const isSeparator = line.match(/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?$/);

    if (isTableRow && !isSeparator) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
        alignments = [];
      }
      tableRows.push(line);
    } else if (isSeparator && inTable && tableRows.length === 1) {
      // Parse alignments from separator
      alignments = line.split('|')
        .filter(cell => cell.trim())
        .map(cell => {
          const trimmed = cell.trim();
          if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
          if (trimmed.endsWith(':')) return 'right';
          return 'left';
        });
    } else {
      if (inTable && tableRows.length > 0) {
        // Finish table and add to result
        result.push(buildTable(tableRows, alignments));
        inTable = false;
        tableRows = [];
        alignments = [];
      }
      result.push(lines[i]);
    }
  }

  // Handle table at end of content
  if (inTable && tableRows.length > 0) {
    result.push(buildTable(tableRows, alignments));
  }

  return result.join('\n');
}

function buildTable(rows: string[], alignments: string[]): string {
  if (rows.length === 0) return '';

  let tableHtml = '<div class="table-wrapper"><table>';

  rows.forEach((row, rowIndex) => {
    const cells = row.split('|')
      .map(cell => cell.trim())
      .filter((_, i, arr) => {
        // Remove empty first/last elements from |cell|cell| format
        if (i === 0 && arr[0] === '') return false;
        if (i === arr.length - 1 && arr[arr.length - 1] === '') return false;
        return true;
      });

    if (rowIndex === 0) {
      // Header row
      tableHtml += '<thead><tr>';
      cells.forEach((cell, cellIndex) => {
        const align = alignments[cellIndex] || 'left';
        tableHtml += `<th style="text-align: ${align}">${cell}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
    } else {
      // Body rows
      tableHtml += '<tr>';
      cells.forEach((cell, cellIndex) => {
        const align = alignments[cellIndex] || 'left';
        tableHtml += `<td style="text-align: ${align}">${cell}</td>`;
      });
      tableHtml += '</tr>';
    }
  });

  tableHtml += '</tbody></table></div>';
  return tableHtml;
}
