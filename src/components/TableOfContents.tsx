import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, FileText, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHeadings, Heading } from '@/hooks/useHeadings';

interface TableOfContentsProps {
  content: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (position: number) => void;
  activeHeadingId?: string;
}

const HeadingItem = ({
  heading,
  isActive,
  onClick,
}: {
  heading: Heading;
  isActive: boolean;
  onClick: () => void;
}) => {
  const indentClass = {
    1: 'pl-0',
    2: 'pl-3',
    3: 'pl-6',
    4: 'pl-9',
    5: 'pl-12',
    6: 'pl-15',
  }[heading.level] || 'pl-0';

  const textSizeClass = {
    1: 'text-sm font-semibold',
    2: 'text-sm font-medium',
    3: 'text-xs font-medium',
    4: 'text-xs',
    5: 'text-xs text-muted-foreground',
    6: 'text-xs text-muted-foreground',
  }[heading.level] || 'text-sm';

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full text-left py-2 px-3 rounded-lg transition-colors
        ${indentClass} ${textSizeClass}
        ${isActive
          ? 'bg-primary/10 text-primary border-l-2 border-primary'
          : 'text-foreground/80 hover:bg-muted hover:text-foreground border-l-2 border-transparent'
        }
      `}
    >
      <div className="flex items-center gap-2">
        <ChevronRight className={`h-3 w-3 shrink-0 transition-transform ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className="truncate">{heading.text}</span>
      </div>
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[280px] xs:w-[300px] sm:w-[320px] bg-card/95 backdrop-blur-lg border-r border-border/50 shadow-xl flex flex-col safe-top safe-bottom"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Daftar Isi</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-3">
                {headings.length > 0 ? (
                  <div className="space-y-1">
                    {headings.map((heading) => (
                      <HeadingItem
                        key={heading.id}
                        heading={heading}
                        isActive={activeHeadingId === heading.id}
                        onClick={() => {
                          onNavigate(heading.position);
                          // Close on mobile after navigation
                          if (window.innerWidth < 1024) {
                            onClose();
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Belum ada heading
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Gunakan # untuk menambah heading
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                {headings.length} heading ditemukan
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default TableOfContents;
