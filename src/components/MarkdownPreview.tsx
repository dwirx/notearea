import { motion } from 'framer-motion';
import { parseMarkdown } from '@/lib/markdown';

interface MarkdownPreviewProps {
  content: string;
}

const MarkdownPreview = ({ content }: MarkdownPreviewProps) => {
  const html = parseMarkdown(content);

  if (!content) {
    return (
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-12 md:py-16 text-muted-foreground italic font-serif text-base sm:text-lg">
        Tidak ada konten untuk ditampilkan...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="markdown-preview px-4 py-8 sm:px-6 sm:py-12 md:px-12 md:py-16 lg:px-20 lg:py-20 text-base sm:text-lg pb-32"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownPreview;
