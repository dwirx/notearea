import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { parseMarkdown, getMermaidDiagrams } from '@/lib/markdown';
import mermaid from 'mermaid';
import ImageLightbox from './ImageLightbox';
import MermaidViewer from './MermaidViewer';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
  },
  sequence: {
    useMaxWidth: false,
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
          const diagrams = getMermaidDiagrams();
          const diagramCode = diagrams[index] || '';

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

    const diagrams = getMermaidDiagrams();
    if (diagrams.length === 0) return;

    // Clear SVG cache for fresh render
    mermaidSvgCache.current.clear();

    const mermaidElements = containerRef.current.querySelectorAll('.mermaid-diagram');

    mermaidElements.forEach(async (element, index) => {
      const diagramCode = diagrams[index];
      if (!diagramCode) return;

      try {
        const id = `mermaid-${Date.now()}-${index}`;
        const { svg } = await mermaid.render(id, diagramCode);

        // Store SVG content in cache
        mermaidSvgCache.current.set(index, svg);

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
        element.innerHTML = `<div class="mermaid-error">Diagram error: ${err instanceof Error ? err.message : 'Unknown error'}</div>`;
      }
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
