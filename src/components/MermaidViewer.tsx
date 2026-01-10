import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Download,
  Copy,
  Check,
  Smartphone,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MermaidViewerProps {
  isOpen: boolean;
  onClose: () => void;
  svgContent: string;
  diagramCode: string;
}

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.25;

const MermaidViewer = ({ isOpen, onClose, svgContent, diagramCode }: MermaidViewerProps) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect device type
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setCopied(false);
      setShowControls(true);

      // Auto fit on open for better initial view
      setTimeout(() => {
        handleFitToScreen();
      }, 100);
    }
  }, [isOpen]);

  // Auto-hide controls on mobile after inactivity
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const resetControlsTimer = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    resetControlsTimer();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isMobile, isOpen, zoom, position]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleReset();
      } else if (e.key === 'f' || e.key === 'F') {
        handleFitToScreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const content = contentRef.current.getBoundingClientRect();

    // Calculate optimal zoom based on container size
    const padding = isMobile ? 40 : 80;
    const scaleX = (container.width - padding) / (content.width / zoom);
    const scaleY = (container.height - padding) / (content.height / zoom);
    const newZoom = Math.min(scaleX, scaleY, MAX_ZOOM);

    setZoom(Math.max(newZoom, MIN_ZOOM));
    setPosition({ x: 0, y: 0 });
  }, [zoom, isMobile]);

  // Mouse wheel zoom with position-aware zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
  }, []);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Get distance between two touch points
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Touch handlers with pinch-to-zoom support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Show controls on touch
    setShowControls(true);

    if (e.touches.length === 2) {
      // Pinch start
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      // Single touch drag
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
      setLastTouchDistance(null);
    }
  }, [position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 2) {
      // Pinch zoom
      const newDistance = getTouchDistance(e.touches);
      if (newDistance && lastTouchDistance) {
        const scale = newDistance / lastTouchDistance;
        setZoom(prev => {
          const newZoom = prev * scale;
          return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
        });
        setLastTouchDistance(newDistance);
      }
    } else if (e.touches.length === 1 && isDragging) {
      // Single touch pan
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, lastTouchDistance]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastTouchDistance(null);
  }, []);

  // Copy diagram code
  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(diagramCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [diagramCode]);

  // Download as SVG
  const handleDownload = useCallback(() => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mermaid-diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [svgContent]);

  // Download as PNG
  const handleDownloadPng = useCallback(() => {
    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 3; // Higher resolution for quality
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `mermaid-diagram-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pngUrl);
          }
        }, 'image/png');
      }
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }, [svgContent]);

  // Toggle controls visibility on mobile
  const handleContainerTap = useCallback(() => {
    if (isMobile) {
      setShowControls(prev => !prev);
    }
  }, [isMobile]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Viewer Container - Responsive */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative bg-card shadow-2xl overflow-hidden flex flex-col",
              // Responsive sizing
              "w-[100vw] h-[100vh]",
              "sm:w-[95vw] sm:h-[92vh] sm:rounded-xl",
              "md:w-[90vw] md:h-[90vh] md:rounded-2xl md:max-w-6xl",
              "lg:max-w-7xl"
            )}
          >
            {/* Header - Responsive */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: showControls ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent",
                "px-3 py-2 sm:px-4 sm:py-3",
                !showControls && "pointer-events-none"
              )}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  {isMobile ? (
                    <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  ) : (
                    <Monitor className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm">Mermaid Viewer</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Zoom: {Math.round(zoom * 100)}%
                  </p>
                </div>
              </div>

              {/* Controls - Responsive */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Zoom Controls - Hide percentage on mobile */}
                <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/50 rounded-lg p-0.5 sm:p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomOut}
                    disabled={zoom <= MIN_ZOOM}
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-md"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <span className="hidden sm:inline-block w-12 text-center text-xs font-medium">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomIn}
                    disabled={zoom >= MAX_ZOOM}
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-md"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>

                {/* Other Controls */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg"
                  title="Reset"
                >
                  <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFitToScreen}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg"
                  title="Fit to Screen"
                >
                  <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>

                <div className="hidden sm:block w-px h-6 bg-border mx-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyCode}
                  className="hidden sm:flex h-7 w-7 sm:h-8 sm:w-8 rounded-lg"
                  title="Copy Code"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className="hidden sm:flex h-7 w-7 sm:h-8 sm:w-8 rounded-lg"
                  title="Download SVG"
                >
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>

                <div className="w-px h-5 sm:h-6 bg-border mx-0.5 sm:mx-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                  title="Close"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Diagram Area */}
            <div
              ref={containerRef}
              className={cn(
                "flex-1 overflow-hidden relative touch-none",
                "bg-gradient-to-br from-muted/30 to-muted/10",
                isDragging ? "cursor-grabbing" : "cursor-grab"
              )}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={handleContainerTap}
            >
              {/* Grid Background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(hsl(var(--border) / 0.4) 1px, transparent 1px),
                    linear-gradient(90deg, hsl(var(--border) / 0.4) 1px, transparent 1px)
                  `,
                  backgroundSize: isMobile ? '15px 15px' : '20px 20px'
                }}
              />

              {/* SVG Content */}
              <div
                ref={contentRef}
                className="absolute left-1/2 top-1/2 transition-transform duration-75"
                style={{
                  transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: 'center center'
                }}
              >
                <div
                  className="mermaid-viewer-content p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-lg"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              </div>

              {/* Drag/Pinch hint - Responsive */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: showControls ? 1 : 0, y: 0 }}
                className={cn(
                  "absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2",
                  "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2",
                  "bg-card/90 backdrop-blur-sm rounded-full shadow-lg",
                  "text-[10px] sm:text-xs text-muted-foreground"
                )}
              >
                {isMobile ? (
                  <>
                    <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path d="M9 12h6m-3-3v6" />
                    </svg>
                    <span>Cubit untuk zoom • Geser untuk pindah</span>
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>
                    </svg>
                    <span>Drag untuk geser • Scroll untuk zoom • F untuk fit</span>
                  </>
                )}
              </motion.div>
            </div>

            {/* Footer with download options - Responsive */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: showControls ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "flex items-center justify-between border-t border-border/50 bg-muted/20",
                "px-3 py-2 sm:px-4 sm:py-3",
                !showControls && "pointer-events-none"
              )}
            >
              <div className="hidden sm:block text-xs text-muted-foreground">
                +/- zoom • 0 reset • F fit • Esc tutup
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
                {/* Mobile: Show copy button here */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="sm:hidden h-7 px-2 gap-1 text-[10px]"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="h-7 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-2 text-[10px] sm:text-xs"
                >
                  <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  SVG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPng}
                  className="h-7 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-2 text-[10px] sm:text-xs"
                >
                  <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  PNG
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MermaidViewer;
