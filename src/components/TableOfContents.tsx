import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, FileText, List, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHeadings, Heading } from '@/hooks/useHeadings';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  content: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (position: number) => void;
  activeHeadingId?: string;
}

// Helper to create heading ID (must match markdown.ts)
const createHeadingId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
};

// Navigate to heading in preview mode
const scrollToHeading = (headingText: string) => {
  const headingId = `heading-${createHeadingId(headingText)}`;
  const element = document.getElementById(headingId);

  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    // Add highlight effect
    element.classList.add('toc-highlight');
    setTimeout(() => {
      element.classList.remove('toc-highlight');
    }, 2000);

    return true;
  }
  return false;
};

const HeadingItem = ({
  heading,
  isActive,
  onClick,
  index,
}: {
  heading: Heading;
  isActive: boolean;
  onClick: () => void;
  index: number;
}) => {
  const paddingLeft = {
    1: 0,
    2: 16,
    3: 32,
    4: 48,
    5: 64,
    6: 80,
  }[heading.level] || 0;

  const textStyle = {
    1: 'font-bold text-foreground',
    2: 'font-semibold text-foreground/95',
    3: 'font-medium text-foreground/90',
    4: 'font-normal text-foreground/85',
    5: 'font-normal text-muted-foreground',
    6: 'font-normal text-muted-foreground',
  }[heading.level] || 'font-normal';

  const dotSize = {
    1: 'w-2.5 h-2.5',
    2: 'w-2 h-2',
    3: 'w-1.5 h-1.5',
    4: 'w-1.5 h-1.5',
    5: 'w-1 h-1',
    6: 'w-1 h-1',
  }[heading.level] || 'w-1.5 h-1.5';

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full text-left py-2.5 px-4 rounded-xl transition-all duration-200 group",
        "flex items-center gap-3",
        isActive
          ? "bg-primary/15 text-primary shadow-sm"
          : "text-foreground/80 hover:bg-muted/70 hover:text-foreground"
      )}
      style={{ paddingLeft: `${paddingLeft + 16}px` }}
    >
      {/* Level indicator dot */}
      <div
        className={cn(
          "rounded-full flex-shrink-0 transition-colors",
          dotSize,
          isActive ? "bg-primary" : "bg-muted-foreground/40 group-hover:bg-primary/60"
        )}
      />

      {/* Heading text */}
      <span className={cn("truncate text-sm", textStyle)}>
        {heading.text}
      </span>

      {/* Arrow on hover */}
      <ChevronRight
        className={cn(
          "h-3.5 w-3.5 ml-auto flex-shrink-0 opacity-0 transition-all duration-200",
          "group-hover:opacity-100 group-hover:translate-x-0.5",
          isActive && "opacity-70"
        )}
      />
    </motion.button>
  );
};

const TableOfContents = ({
  content,
  isOpen,
  onClose,
  onNavigate,
  activeHeadingId,
}: TableOfContentsProps) => {
  const headings = useHeadings(content);

  const handleNavigate = (heading: Heading) => {
    // Try to scroll to heading in preview first
    const scrolled = scrollToHeading(heading.text);

    // Also navigate in editor
    onNavigate(heading.position);

    // Close on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }

    // If not scrolled, the editor navigation will handle it
    if (!scrolled) {
      console.log('Heading not found in preview, navigating in editor');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:bg-black/20"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn(
              "fixed left-0 top-0 bottom-0 z-50",
              "w-[85vw] xs:w-[320px] sm:w-[360px] md:w-[380px]",
              "bg-gradient-to-b from-card to-card/98 backdrop-blur-xl",
              "border-r border-border/40 shadow-2xl",
              "flex flex-col safe-top safe-bottom"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 shadow-sm">
                  <List className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Daftar Isi</h2>
                  <p className="text-xs text-muted-foreground">
                    {headings.length} heading ditemukan
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 rounded-full hover:bg-muted/80"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-3">
                {headings.length > 0 ? (
                  <nav className="space-y-1">
                    {headings.map((heading, index) => (
                      <HeadingItem
                        key={heading.id}
                        heading={heading}
                        isActive={activeHeadingId === heading.id}
                        onClick={() => handleNavigate(heading)}
                        index={index}
                      />
                    ))}
                  </nav>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-5 rounded-2xl bg-muted/30 mb-4">
                      <FileText className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Belum ada heading
                    </p>
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      Gunakan # untuk H1, ## untuk H2, dan seterusnya
                    </p>
                    <div className="mt-4 p-3 bg-muted/40 rounded-xl">
                      <code className="text-xs text-muted-foreground">
                        # Judul Utama<br />
                        ## Sub Judul<br />
                        ### Bagian
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer with usage tip */}
            {headings.length > 0 && (
              <div className="px-4 py-3 border-t border-border/40 bg-muted/20">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  <span>Klik heading untuk navigasi</span>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default TableOfContents;
