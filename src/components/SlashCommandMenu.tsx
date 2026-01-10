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
  LayoutTemplate,
  Info,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  FileText,
  CheckCircle,
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
  {
    id: 'infographic-timeline',
    command: '/timeline',
    label: 'Timeline',
    description: 'Infographic timeline/langkah',
    icon: <LayoutTemplate className="h-4 w-4" />,
    template: '```infographic\ninfographic timeline\ndata\n  title Judul Timeline\n  items\n    - label Langkah Pertama\n      desc Deskripsi langkah pertama\n    - label Langkah Kedua\n      desc Deskripsi langkah kedua\n    - label Langkah Ketiga\n      desc Deskripsi langkah ketiga\n```',
  },
  {
    id: 'infographic-process',
    command: '/process',
    label: 'Process',
    description: 'Infographic proses/alur',
    icon: <LayoutTemplate className="h-4 w-4" />,
    template: '```infographic\ninfographic process\ndata\n  title Alur Proses\n  items\n    - label Mulai\n      desc Langkah awal\n    - label Proses\n      desc Langkah tengah\n    - label Selesai\n      desc Langkah akhir\n```',
  },
  {
    id: 'infographic-comparison',
    command: '/compare',
    label: 'Comparison',
    description: 'Infographic perbandingan',
    icon: <LayoutTemplate className="h-4 w-4" />,
    template: '```infographic\ninfographic comparison\ndata\n  title Perbandingan\n  items\n    - label Opsi A\n      desc Kelebihan dan kekurangan opsi A\n    - label Opsi B\n      desc Kelebihan dan kekurangan opsi B\n```',
  },
  {
    id: 'infographic-stats',
    command: '/stats',
    label: 'Statistics',
    description: 'Infographic angka/statistik',
    icon: <LayoutTemplate className="h-4 w-4" />,
    template: '```infographic\ninfographic stats\ndata\n  title Statistik\n  items\n    - label Users\n      value 10K+\n      desc Pengguna aktif\n    - label Downloads\n      value 50K+\n      desc Total unduhan\n    - label Rating\n      value 4.9\n      desc Rata-rata rating\n```',
  },
  {
    id: 'infographic-cards',
    command: '/cards',
    label: 'Cards',
    description: 'Infographic kartu/grid',
    icon: <LayoutTemplate className="h-4 w-4" />,
    template: '```infographic\ninfographic cards\ndata\n  title Fitur Utama\n  items\n    - label Fitur 1\n      desc Deskripsi fitur pertama\n      icon 🚀\n    - label Fitur 2\n      desc Deskripsi fitur kedua\n      icon ⚡\n    - label Fitur 3\n      desc Deskripsi fitur ketiga\n      icon 🎯\n```',
  },
  {
    id: 'infographic-pyramid',
    command: '/pyramid',
    label: 'Pyramid',
    description: 'Infographic piramida',
    icon: <LayoutTemplate className="h-4 w-4" />,
    template: '```infographic\ninfographic pyramid\ndata\n  title Piramida Kebutuhan\n  items\n    - label Aktualisasi Diri\n      desc Mencapai potensi penuh\n    - label Penghargaan\n      desc Rasa hormat dan pengakuan\n    - label Sosial\n      desc Hubungan dan komunitas\n    - label Keamanan\n      desc Stabilitas dan perlindungan\n    - label Fisiologis\n      desc Kebutuhan dasar\n```',
  },
  {
    id: 'infographic-funnel',
    command: '/funnel',
    label: 'Funnel',
    description: 'Infographic corong/funnel',
    icon: <LayoutTemplate className="h-4 w-4" />,
    template: '```infographic\ninfographic funnel\ndata\n  title Sales Funnel\n  items\n    - label Awareness\n      value 1000\n      desc Pengunjung website\n    - label Interest\n      value 500\n      desc Leads tertarik\n    - label Decision\n      value 200\n      desc Pertimbangan\n    - label Action\n      value 50\n      desc Pembelian\n```',
  },
  {
    id: 'infographic-checklist',
    command: '/checklist',
    label: 'Checklist',
    description: 'Infographic checklist visual',
    icon: <LayoutTemplate className="h-4 w-4" />,
    template: '```infographic\ninfographic checklist\ndata\n  title Checklist Proyek\n  items\n    - label Riset dan Analisis\n      desc Mengumpulkan data dan informasi\n    - label Perencanaan\n      desc Membuat roadmap dan timeline\n    - label Implementasi\n      desc Eksekusi rencana\n    - label Testing\n      desc Pengujian dan validasi\n```',
  },
  {
    id: 'infographic-features',
    command: '/features',
    label: 'Feature List',
    description: 'Infographic daftar fitur',
    icon: <LayoutTemplate className="h-4 w-4" />,
    template: '```infographic\ninfographic features\ndata\n  title Fitur Produk\n  items\n    - label Kecepatan Tinggi\n      desc Performa optimal dengan teknologi terbaru\n      icon ⚡\n    - label Keamanan\n      desc Perlindungan data dengan enkripsi\n      icon 🔒\n    - label Mudah Digunakan\n      desc Antarmuka yang intuitif\n      icon 👆\n```',
  },
  {
    id: 'callout-info',
    command: '/info',
    label: 'Info Box',
    description: 'Kotak informasi',
    icon: <Info className="h-4 w-4" />,
    template: ':::info\nIsi informasi penting di sini.\n:::',
  },
  {
    id: 'callout-tip',
    command: '/tip',
    label: 'Tip Box',
    description: 'Kotak tips',
    icon: <Lightbulb className="h-4 w-4" />,
    template: ':::tip\nIsi tips berguna di sini.\n:::',
  },
  {
    id: 'callout-warning',
    command: '/warning',
    label: 'Warning Box',
    description: 'Kotak peringatan',
    icon: <AlertTriangle className="h-4 w-4" />,
    template: ':::warning\nIsi peringatan di sini.\n:::',
  },
  {
    id: 'callout-danger',
    command: '/danger',
    label: 'Danger Box',
    description: 'Kotak bahaya',
    icon: <AlertCircle className="h-4 w-4" />,
    template: ':::danger\nIsi peringatan bahaya di sini.\n:::',
  },
  {
    id: 'callout-note',
    command: '/note',
    label: 'Note Box',
    description: 'Kotak catatan',
    icon: <FileText className="h-4 w-4" />,
    template: ':::note[Catatan Penting]\nIsi catatan di sini.\n:::',
  },
  {
    id: 'callout-success',
    command: '/success',
    label: 'Success Box',
    description: 'Kotak sukses',
    icon: <CheckCircle className="h-4 w-4" />,
    template: ':::success\nOperasi berhasil dilakukan!\n:::',
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
