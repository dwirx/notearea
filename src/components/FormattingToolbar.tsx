import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Link,
  Minus,
  MoreHorizontal,
} from 'lucide-react';
import { useState } from 'react';

interface FormattingToolbarProps {
  isVisible: boolean;
  onFormat: (action: string) => void;
  className?: string;
}

interface ToolbarButton {
  icon: React.ReactNode;
  action: string;
  label: string;
}

const primaryButtons: ToolbarButton[] = [
  { icon: <Bold className="w-4 h-4" />, action: 'bold', label: 'Bold' },
  { icon: <Italic className="w-4 h-4" />, action: 'italic', label: 'Italic' },
  { icon: <Heading1 className="w-4 h-4" />, action: 'h1', label: 'Heading 1' },
  { icon: <Heading2 className="w-4 h-4" />, action: 'h2', label: 'Heading 2' },
  { icon: <List className="w-4 h-4" />, action: 'bullet', label: 'Bullet List' },
  { icon: <CheckSquare className="w-4 h-4" />, action: 'task', label: 'Task List' },
  { icon: <Code className="w-4 h-4" />, action: 'code', label: 'Code' },
];

const secondaryButtons: ToolbarButton[] = [
  { icon: <Strikethrough className="w-4 h-4" />, action: 'strike', label: 'Strikethrough' },
  { icon: <ListOrdered className="w-4 h-4" />, action: 'ordered', label: 'Ordered List' },
  { icon: <Quote className="w-4 h-4" />, action: 'quote', label: 'Quote' },
  { icon: <Link className="w-4 h-4" />, action: 'link', label: 'Link' },
  { icon: <Minus className="w-4 h-4" />, action: 'hr', label: 'Horizontal Rule' },
  { icon: <Code className="w-4 h-4" />, action: 'codeblock', label: 'Code Block' },
];

const FormattingToolbar = ({ isVisible, onFormat, className = '' }: FormattingToolbarProps) => {
  const [showMore, setShowMore] = useState(false);

  const handleButtonClick = (action: string) => {
    onFormat(action);
    setShowMore(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${className}`}
        >
          {/* More options panel */}
          <AnimatePresence>
            {showMore && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="mx-3 mb-2 p-2 rounded-xl bg-card/95 backdrop-blur-lg border border-border/50 shadow-lg"
              >
                <div className="grid grid-cols-6 gap-1">
                  {secondaryButtons.map((btn) => (
                    <button
                      key={btn.action}
                      onClick={() => handleButtonClick(btn.action)}
                      className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation"
                      aria-label={btn.label}
                    >
                      {btn.icon}
                      <span className="text-[9px] mt-1 text-muted-foreground truncate w-full text-center">
                        {btn.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main toolbar */}
          <div className="bg-card/95 backdrop-blur-lg border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-bottom">
            <div className="flex items-center justify-around px-2 py-1.5">
              {primaryButtons.map((btn) => (
                <button
                  key={btn.action}
                  onClick={() => handleButtonClick(btn.action)}
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted active:bg-muted/80 active:scale-95 transition-all touch-manipulation text-foreground/80 hover:text-foreground"
                  aria-label={btn.label}
                >
                  {btn.icon}
                </button>
              ))}
              <button
                onClick={() => setShowMore(!showMore)}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all touch-manipulation ${
                  showMore
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-muted active:bg-muted/80 text-foreground/80 hover:text-foreground'
                }`}
                aria-label="More options"
                aria-expanded={showMore}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FormattingToolbar;
