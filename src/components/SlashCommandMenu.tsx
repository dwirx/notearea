import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Table,
  Minus,
  Image,
  Link,
  Terminal,
  GitBranch,
  Sigma,
} from 'lucide-react';

interface SlashCommand {
  id: string;
  command: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  template: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'h1',
    command: '/h1',
    label: 'Heading 1',
    description: 'Judul utama',
    icon: <Heading1 className="h-4 w-4" />,
    template: '# ',
  },
  {
    id: 'h2',
    command: '/h2',
    label: 'Heading 2',
    description: 'Sub judul',
    icon: <Heading2 className="h-4 w-4" />,
    template: '## ',
  },
  {
    id: 'h3',
    command: '/h3',
    label: 'Heading 3',
    description: 'Sub sub judul',
    icon: <Heading3 className="h-4 w-4" />,
    template: '### ',
  },
  {
    id: 'bullet',
    command: '/bullet',
    label: 'Bullet List',
    description: 'Daftar bullet',
    icon: <List className="h-4 w-4" />,
    template: '- ',
  },
  {
    id: 'number',
    command: '/number',
    label: 'Numbered List',
    description: 'Daftar bernomor',
    icon: <ListOrdered className="h-4 w-4" />,
    template: '1. ',
  },
  {
    id: 'task',
    command: '/task',
    label: 'Task List',
    description: 'Daftar tugas',
    icon: <CheckSquare className="h-4 w-4" />,
    template: '- [ ] ',
  },
  {
    id: 'code',
    command: '/code',
    label: 'Code Block',
    description: 'Blok kode',
    icon: <Code className="h-4 w-4" />,
    template: '```\ncode\n```',
  },
  {
    id: 'inline-code',
    command: '/inline',
    label: 'Inline Code',
    description: 'Kode inline',
    icon: <Terminal className="h-4 w-4" />,
    template: '`code`',
  },
  {
    id: 'quote',
    command: '/quote',
    label: 'Blockquote',
    description: 'Kutipan',
    icon: <Quote className="h-4 w-4" />,
    template: '> ',
  },
  {
    id: 'table',
    command: '/table',
    label: 'Table',
    description: 'Tabel 3x3',
    icon: <Table className="h-4 w-4" />,
    template: '| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |',
  },
  {
    id: 'hr',
    command: '/hr',
    label: 'Divider',
    description: 'Garis pemisah',
    icon: <Minus className="h-4 w-4" />,
    template: '\n---\n',
  },
  {
    id: 'image',
    command: '/image',
    label: 'Image',
    description: 'Placeholder gambar',
    icon: <Image className="h-4 w-4" />,
    template: '![Alt text](url)',
  },
  {
    id: 'link',
    command: '/link',
    label: 'Link',
    description: 'Tautan',
    icon: <Link className="h-4 w-4" />,
    template: '[text](url)',
  },
  {
    id: 'mermaid',
    command: '/mermaid',
    label: 'Mermaid Diagram',
    description: 'Diagram flowchart/sequence',
    icon: <GitBranch className="h-4 w-4" />,
    template: '```mermaid\nflowchart TD\n    A[Start] --> B[Process]\n    B --> C[End]\n```',
  },
  {
    id: 'math',
    command: '/math',
    label: 'Math/LaTeX',
    description: 'Rumus matematika',
    icon: <Sigma className="h-4 w-4" />,
    template: '$$\nE = mc^2\n$$',
  },
  {
    id: 'inline-math',
    command: '/imath',
    label: 'Inline Math',
    description: 'Rumus inline',
    icon: <Sigma className="h-4 w-4" />,
    template: '$x^2 + y^2 = z^2$',
  },
];

interface SlashCommandMenuProps {
  content: string;
  cursorPosition: number;
  onInsert: (template: string, deleteCount: number) => void;
  onClose: () => void;
}

const SlashCommandMenu = ({
  content,
  cursorPosition,
  onInsert,
  onClose,
}: SlashCommandMenuProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Extract the slash command being typed
  const slashText = useMemo(() => {
    // Find the start of the current line
    const lineStart = content.lastIndexOf('\n', cursorPosition - 1) + 1;
    const textBeforeCursor = content.slice(lineStart, cursorPosition);

    // Check if we're typing a slash command
    const slashMatch = textBeforeCursor.match(/\/(\w*)$/);
    if (slashMatch) {
      return slashMatch[1];
    }
    return null;
  }, [content, cursorPosition]);

  // Check if menu should be shown
  const isVisible = slashText !== null;

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!slashText) return SLASH_COMMANDS;

    const query = slashText.toLowerCase();
    return SLASH_COMMANDS.filter(
      (cmd) =>
        cmd.command.toLowerCase().includes(query) ||
        cmd.label.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query)
    );
  }, [slashText]);

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleSelect(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Tab':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleSelect(filteredCommands[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, filteredCommands, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (menuRef.current) {
      const selectedElement = menuRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelect = useCallback(
    (command: SlashCommand) => {
      // Calculate how many characters to delete (the "/" and any typed text)
      const deleteCount = (slashText?.length || 0) + 1;
      onInsert(command.template, deleteCount);
      onClose();
    },
    [slashText, onInsert, onClose]
  );

  if (!isVisible || filteredCommands.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 w-64 max-h-80 overflow-y-auto bg-card/95 backdrop-blur-lg border border-border/50 rounded-xl shadow-2xl"
        style={{
          // Position will be set by parent component
          top: 'var(--menu-top, 100px)',
          left: 'var(--menu-left, 100px)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-lg px-3 py-2 border-b border-border/50">
          <p className="text-xs text-muted-foreground">
            {slashText ? `Mencari "/${slashText}"` : 'Pilih untuk insert'}
          </p>
        </div>

        {/* Commands list */}
        <div className="p-1">
          {filteredCommands.map((command, index) => (
            <motion.button
              key={command.id}
              data-index={index}
              onClick={() => handleSelect(command)}
              whileHover={{ x: 2 }}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                ${index === selectedIndex
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted'
                }
              `}
            >
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-lg
                  ${index === selectedIndex ? 'bg-primary/20' : 'bg-muted'}
                `}
              >
                {command.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{command.label}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {command.description}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {command.command}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Footer with keyboard hints */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur-lg px-3 py-2 border-t border-border/50">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>↑↓ Navigate</span>
            <span>Enter/Tab Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to detect slash commands
export const useSlashCommand = (
  content: string,
  cursorPosition: number
): { isActive: boolean; query: string } => {
  return useMemo(() => {
    const lineStart = content.lastIndexOf('\n', cursorPosition - 1) + 1;
    const textBeforeCursor = content.slice(lineStart, cursorPosition);

    const slashMatch = textBeforeCursor.match(/\/(\w*)$/);
    if (slashMatch) {
      return { isActive: true, query: slashMatch[1] };
    }
    return { isActive: false, query: '' };
  }, [content, cursorPosition]);
};

export default SlashCommandMenu;
