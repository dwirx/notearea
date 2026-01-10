import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { parseMarkdown } from '@/lib/markdown';
import mermaid from 'mermaid';
import ImageLightbox from './ImageLightbox';
import MermaidViewer from './MermaidViewer';

// Initialize mermaid with better error handling
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
  suppressErrorRendering: true, // Suppress mermaid's own error rendering, we handle it ourselves
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
    curve: 'basis',
  },
  sequence: {
    useMaxWidth: false,
    diagramMarginX: 50,
    diagramMarginY: 10,
  },
  gantt: {
    useMaxWidth: false,
  },
  timeline: {
    useMaxWidth: false,
  },
});

export interface MarkdownPreviewProps {
  content: string;
  editorStyles?: React.CSSProperties;
}

interface LightboxState {
  isOpen: boolean;
  src: string;
  alt: string;
}

interface MermaidViewerState {
  isOpen: boolean;
  svgContent: string;
  diagramCode: string;
}

const MarkdownPreview = ({ content, editorStyles }: MarkdownPreviewProps) => {
  const html = parseMarkdown(content);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    src: '',
    alt: ''
  });
  const [mermaidViewer, setMermaidViewer] = useState<MermaidViewerState>({
    isOpen: false,
    svgContent: '',
    diagramCode: ''
  });

  // Store rendered SVG content for mermaid diagrams
  const mermaidSvgCache = useRef<Map<number, string>>(new Map());

  const handleCopyCode = useCallback(async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const openLightbox = useCallback((src: string, alt: string) => {
    setLightbox({ isOpen: true, src, alt });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Open mermaid viewer
  const openMermaidViewer = useCallback((svgContent: string, diagramCode: string) => {
    setMermaidViewer({ isOpen: true, svgContent, diagramCode });
  }, []);

  // Close mermaid viewer
  const closeMermaidViewer = useCallback(() => {
    setMermaidViewer(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Handle image click using event delegation
  const handleContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Check if clicked element is an image with lightbox attribute
    if (target.tagName === 'IMG' && target.getAttribute('data-lightbox') === 'true') {
      const img = target as HTMLImageElement;
      openLightbox(img.src, img.alt || 'Image');
      return;
    }

    // Only open mermaid viewer when clicking the expand button, not the whole diagram
    const expandButton = target.closest('.mermaid-expand-btn') as HTMLElement;
    if (expandButton) {
      const mermaidElement = expandButton.closest('.mermaid-diagram') as HTMLElement;
      if (mermaidElement) {
        const indexStr = mermaidElement.getAttribute('data-mermaid-index');
        if (indexStr !== null) {
          const index = parseInt(indexStr, 10);
          const svgContent = mermaidSvgCache.current.get(index);
          // Get diagram code from data attribute (stored when rendering)
          const diagramCode = mermaidElement.getAttribute('data-mermaid-code') || '';

          if (svgContent) {
            openMermaidViewer(svgContent, diagramCode);
          }
        }
      }
    }
  }, [openLightbox, openMermaidViewer]);

  // Render mermaid diagrams
  useEffect(() => {
    if (!containerRef.current) return;

    const mermaidElements = containerRef.current.querySelectorAll('.mermaid-diagram:not(.mermaid-rendered):not(.mermaid-error-shown)');

    if (mermaidElements.length === 0) return;

    // Clear SVG cache for fresh render
    mermaidSvgCache.current.clear();

    // Clean up any previous mermaid error elements that might be in the DOM body
    // Mermaid creates error elements directly in body when parsing fails
    const cleanupMermaidErrors = () => {
      document.querySelectorAll('body > [id^="d"], body > svg[id^="mermaid"], body > .error-icon').forEach(el => {
        el.remove();
      });
      // Also remove any stray text/pre elements that mermaid might have created
      document.querySelectorAll('body > pre:empty, body > div:empty:not([class])').forEach(el => {
        el.remove();
      });
    };

    cleanupMermaidErrors();

    // Process diagrams
    const processDiagrams = async () => {
      const elements = Array.from(mermaidElements);

      for (const element of elements) {
        // Get diagram code from base64 encoded data attribute
        const encodedCode = element.getAttribute('data-mermaid-code');
        const diagramIndex = parseInt(element.getAttribute('data-mermaid-index') || '0', 10);

        if (!encodedCode) {
          continue;
        }

        // Decode the base64 mermaid code
        let diagramCode: string;
        try {
          diagramCode = decodeURIComponent(escape(atob(encodedCode)));
        } catch {
          continue;
        }

        // Skip if already rendered
        if (element.classList.contains('mermaid-rendered') || element.classList.contains('mermaid-error-shown')) {
          continue;
        }

        // Validate mermaid code - must have a valid diagram type
        const validTypes = ['flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'gantt', 'pie', 'gitGraph', 'mindmap', 'timeline', 'journey', 'quadrantChart', 'xychart', 'sankey', 'block'];
        const firstLine = diagramCode.trim().split('\n')[0].trim().toLowerCase();
        const hasValidType = validTypes.some(type => firstLine.startsWith(type.toLowerCase()));

        if (!hasValidType) {
          element.innerHTML = `
            <div class="mermaid-error">
              <div class="mermaid-error-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Tipe Diagram Tidak Valid
              </div>
              <div class="mermaid-error-message">Diagram harus dimulai dengan tipe yang valid: flowchart, graph, sequenceDiagram, dll.</div>
              <div class="mermaid-error-hint">Contoh: flowchart TD atau graph LR</div>
              <pre class="mermaid-error-code"><code>${diagramCode}</code></pre>
            </div>
          `;
          element.classList.add('mermaid-error-shown');
          continue;
        }

        try {
          const id = `mermaid-${Date.now()}-${diagramIndex}-${Math.random().toString(36).slice(2, 11)}`;

          // Create a temporary visible container for mermaid to render into
          // Mermaid needs the element to be in the DOM and visible for getBBox to work
          const tempContainer = document.createElement('div');
          tempContainer.id = id;
          tempContainer.style.cssText = 'position: fixed; left: -9999px; top: 0; visibility: visible;';
          tempContainer.textContent = diagramCode;
          document.body.appendChild(tempContainer);

          // Use mermaid.run() to render the diagram
          await mermaid.run({
            nodes: [tempContainer],
            suppressErrors: false,
          });

          // Get the rendered SVG from the temp container
          const svg = tempContainer.innerHTML;

          // Clean up temp container
          tempContainer.remove();

          if (!svg || svg.length < 100) {
            throw new Error('SVG output is too small or empty');
          }

          // Store SVG content in cache
          mermaidSvgCache.current.set(diagramIndex, svg);

          // Create wrapper with expand button
          element.innerHTML = `
            <div class="mermaid-content">${svg}</div>
            <button class="mermaid-expand-btn" title="Klik untuk memperbesar diagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              <span>Layar Penuh</span>
            </button>
          `;
          // Store diagram code in data attribute for later retrieval (fullscreen view)
          element.setAttribute('data-mermaid-code', encodedCode);
          element.classList.add('mermaid-rendered');

          // Check if diagram is wider than container (needs scroll)
          requestAnimationFrame(() => {
            const el = element as HTMLElement;
            if (el.scrollWidth > el.clientWidth) {
              el.classList.add('has-scroll');

              // Add scroll listener for scroll hint
              el.addEventListener('scroll', () => {
                const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
                if (isAtEnd) {
                  el.classList.add('scrolled-end');
                } else {
                  el.classList.remove('scrolled-end');
                }
              });

              // Add drag-to-scroll for desktop
              let isDown = false;
              let startX: number;
              let scrollLeft: number;

              el.addEventListener('mousedown', (e) => {
                // Don't start drag if clicking on button
                if ((e.target as HTMLElement).closest('.mermaid-expand-btn')) return;
                isDown = true;
                el.style.cursor = 'grabbing';
                startX = e.pageX - el.offsetLeft;
                scrollLeft = el.scrollLeft;
              });

              el.addEventListener('mouseleave', () => {
                isDown = false;
                el.style.cursor = 'grab';
              });

              el.addEventListener('mouseup', () => {
                isDown = false;
                el.style.cursor = 'grab';
              });

              el.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - el.offsetLeft;
                const walk = (x - startX) * 1.5;
                el.scrollLeft = scrollLeft - walk;
              });
            }
          });
        } catch (err) {
          console.error('Mermaid render error:', err);
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          // Parse error to extract line number if available
          const lineMatch = errorMessage.match(/line (\d+)/i);
          const lineInfo = lineMatch ? ` (baris ${lineMatch[1]})` : '';

          element.innerHTML = `
            <div class="mermaid-error">
              <div class="mermaid-error-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                Diagram Error${lineInfo}
              </div>
              <div class="mermaid-error-message">${errorMessage}</div>
              <div class="mermaid-error-hint">Periksa sintaks diagram Mermaid Anda</div>
              <pre class="mermaid-error-code"><code>${diagramCode}</code></pre>
            </div>
          `;
          element.classList.add('mermaid-error-shown');

          // Clean up mermaid error elements from body after error
          cleanupMermaidErrors();
        }
      }

      // Final cleanup after all diagrams processed
      cleanupMermaidErrors();
    };

    // Wait for next frame to ensure DOM is ready
    requestAnimationFrame(() => {
      processDiagrams();
    });
  }, [html]);

  useEffect(() => {
    if (!containerRef.current) return;

    const preElements = containerRef.current.querySelectorAll('pre');

    preElements.forEach((pre, index) => {
      // Skip if button already exists
      if (pre.querySelector('.copy-code-btn')) return;

      // Wrap pre in relative container
      pre.style.position = 'relative';

      const codeElement = pre.querySelector('code');
      const codeText = codeElement?.textContent || '';

      const button = document.createElement('button');
      button.className = 'copy-code-btn';
      button.setAttribute('aria-label', 'Salin kode');
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

      button.addEventListener('click', () => handleCopyCode(codeText, index));

      pre.appendChild(button);
    });
  }, [html, handleCopyCode]);

  // Update button states when copiedIndex changes
  useEffect(() => {
    if (!containerRef.current) return;

    const buttons = containerRef.current.querySelectorAll('.copy-code-btn');
    buttons.forEach((btn, index) => {
      if (copiedIndex === index) {
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500"><path d="M20 6 9 17l-5-5"/></svg>`;
        btn.classList.add('copied');
      } else {
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
        btn.classList.remove('copied');
      }
    });
  }, [copiedIndex]);

  if (!content) {
    return (
      <div
        className="w-full max-w-3xl mx-auto px-4 py-6 xs:px-5 xs:py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 text-muted-foreground italic"
        style={editorStyles}
      >
        Tidak ada konten untuk ditampilkan...
      </div>
    );
  }

  return (
    <>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="markdown-preview w-full max-w-3xl mx-auto px-4 py-6 xs:px-5 xs:py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-12 lg:py-14 pb-20 xs:pb-24 sm:pb-28 md:pb-32"
        onClick={handleContainerClick}
        dangerouslySetInnerHTML={{ __html: html }}
        style={editorStyles}
      />

      <ImageLightbox
        src={lightbox.src}
        alt={lightbox.alt}
        isOpen={lightbox.isOpen}
        onClose={closeLightbox}
      />

      <MermaidViewer
        isOpen={mermaidViewer.isOpen}
        onClose={closeMermaidViewer}
        svgContent={mermaidViewer.svgContent}
        diagramCode={mermaidViewer.diagramCode}
      />
    </>
  );
};

export default MarkdownPreview;
