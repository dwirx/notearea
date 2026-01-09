import { useMemo } from 'react';

export interface Heading {
  id: string;
  text: string;
  level: number;
  position: number; // Character position in the content
}

/**
 * Hook to parse headings from markdown content
 * Returns an array of heading objects with id, text, level, and position
 */
export const useHeadings = (content: string): Heading[] => {
  return useMemo(() => {
    if (!content) return [];

    const headings: Heading[] = [];
    const lines = content.split('\n');
    let position = 0;

    lines.forEach((line) => {
      // Match ATX-style headings (# Heading)
      const match = line.match(/^(#{1,6})\s+(.+)$/);

      if (match) {
        const level = match[1].length;
        const text = match[2].trim();

        // Create a unique ID from the heading text
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .substring(0, 50); // Limit length

        headings.push({
          id: `heading-${position}-${id}`,
          text,
          level,
          position,
        });
      }

      position += line.length + 1; // +1 for newline
    });

    return headings;
  }, [content]);
};

/**
 * Get the hierarchy structure of headings
 * Groups headings under their parent headings
 */
export interface HeadingNode extends Heading {
  children: HeadingNode[];
}

export const useHeadingTree = (content: string): HeadingNode[] => {
  const headings = useHeadings(content);

  return useMemo(() => {
    if (headings.length === 0) return [];

    const root: HeadingNode[] = [];
    const stack: HeadingNode[] = [];

    headings.forEach((heading) => {
      const node: HeadingNode = { ...heading, children: [] };

      // Pop from stack until we find a parent with lower level
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      if (stack.length === 0) {
        // This is a top-level heading
        root.push(node);
      } else {
        // Add as child of the last item in stack
        stack[stack.length - 1].children.push(node);
      }

      stack.push(node);
    });

    return root;
  }, [headings]);
};

/**
 * Find the currently active heading based on scroll position
 */
export const findActiveHeading = (
  headings: Heading[],
  scrollPosition: number,
  lineHeight: number = 28
): Heading | null => {
  if (headings.length === 0) return null;

  // Estimate line number from character position
  // This is approximate and works best for simple documents
  let activeHeading: Heading | null = null;

  for (const heading of headings) {
    // Convert character position to approximate scroll position
    // Assuming average line length and line height
    const estimatedScrollPos = (heading.position / 80) * lineHeight;

    if (estimatedScrollPos <= scrollPosition + 100) {
      activeHeading = heading;
    } else {
      break;
    }
  }

  return activeHeading;
};
