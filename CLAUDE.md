# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern Markdown editor web application with real-time preview, auto-save, and URL sharing capabilities. Built with React, TypeScript, Vite, and Tailwind CSS, it features a clean interface for writing and previewing markdown with support for syntax highlighting, tables, checklists, and image lightboxes.

## Development Commands

```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development (preserves debug info)
npm run build:dev

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Architecture

### Storage System (Triple-Layer Persistence)

The app uses a three-tier storage strategy for document persistence, managed primarily by `src/lib/storage.ts` and `src/lib/compression.ts`:

1. **URL Hash** (highest priority): Content is compressed using pako (deflate) and encoded as base64 URL-safe string in the hash fragment
2. **localStorage**: Raw markdown content stored with key 'textarea-content'
3. **IndexedDB**: Backup storage in 'catatan-db' database with timestamps

When loading, priority is: URL hash > localStorage > IndexedDB. All three are synced on every content change with 500ms debounce.

### State Management

The app uses two primary hooks for state:

- `useDocument` (src/hooks/useDocument.ts): Legacy hook for single document management
- `useDocuments` (src/hooks/useDocuments.ts): Multi-document management with IndexedDB storage
- `useTheme` (src/hooks/useTheme.ts): Dark/light/system theme management

Current implementation in `src/pages/Index.tsx` uses `useDocuments` for the main document system with auto-save (1.5s delay), manual save, and export/import functionality.

### Markdown Parser

Custom markdown parser in `src/lib/markdown.ts` with these key features:

- Preserves raw HTML blocks and inline HTML during parsing
- Syntax highlighting via highlight.js with language detection
- Interactive checklists: `- [x]` and `- [ ]` rendered as disabled checkboxes
- Images include `data-lightbox="true"` attribute for lightbox integration
- Tables parsed with alignment support (left/center/right)
- Auto-linking of URLs

The parser processes in specific order: HTML preservation → code blocks → checklists → images → inline code → headers → tables → text formatting → links.

### Component Structure

- **Pages**: `src/pages/Index.tsx` is the main editor page
- **Core Components**:
  - `Editor.tsx` / `LiveEditor.tsx`: Textarea-based markdown editor
  - `MarkdownPreview.tsx`: Renders parsed markdown with lightbox support
  - `ImageLightbox.tsx`: Full-screen image viewer with zoom/rotate
  - `FloatingMenu.tsx`: Main action menu (new, save, export, theme)
  - `DocumentsSidebar.tsx`: Multi-document management sidebar
  - `StatusBar.tsx`: Shows word/char count and save status
  - `QRModal.tsx`: QR code generation for URL sharing
- **UI Components**: Extensive shadcn/ui component library in `src/components/ui/`

### Compression & URL Sharing

The `src/lib/compression.ts` module handles:
- Text compression using pako deflate algorithm
- Base64 URL-safe encoding (replacing +/= with -/_)
- Hash encoding/decoding for shareable URLs
- Title extraction from first H1 heading
- Word/character counting utilities

## Key Implementation Details

### Auto-Save Mechanism

Auto-save runs on a 1.5-second debounce timer. When content changes:
1. URL hash is updated immediately with compressed content
2. Auto-save timer is scheduled
3. On timer completion, content is saved to IndexedDB
4. Save also triggers on page unload if unsaved changes exist

### Image Lightbox Integration

Images in markdown preview have `data-lightbox="true"` attribute. The `ImageLightbox` component:
- Listens for clicks on images with this attribute
- Shows full-screen overlay with zoom (1x to 3x)
- Supports rotation (90° increments)
- Keyboard controls: +/- for zoom, R for rotate, Esc to close

### Document Management

Documents are stored in IndexedDB with structure:
```typescript
{
  id: string;           // UUID
  content: string;      // Markdown content
  createdAt: number;    // Timestamp
  updatedAt: number;    // Timestamp
}
```

The `useDocuments` hook provides CRUD operations and maintains current document state.

## Path Aliases

- `@/` maps to `src/` directory (configured in vite.config.ts and tsconfig.json)

## Tech Stack Notes

- **Build Tool**: Vite with React SWC plugin for fast compilation
- **Styling**: Tailwind CSS with custom theme configuration, @tailwindcss/typography plugin
- **UI Framework**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React
- **Code Highlighting**: highlight.js with language auto-detection
- **QR Codes**: qrcode.react for sharing
- **Toasts**: Sonner for notifications

## Important Patterns

### When Adding New Features

1. Use existing storage utilities rather than creating new storage mechanisms
2. Maintain the compression/decompression flow for URL sharing
3. Follow the established auto-save pattern with debounce
4. Use Sonner toasts for user feedback
5. Leverage shadcn/ui components for consistent UI

### Markdown Parser Modifications

When modifying `parseMarkdown()`:
- Preserve the HTML block/inline HTML preservation logic
- Maintain processing order to avoid conflicts
- Test with complex nested markdown structures
- Remember that parser uses regex-based approach, not AST

### Storage Changes

When modifying storage logic:
- Update all three storage layers (hash, localStorage, IndexedDB)
- Maintain backward compatibility with existing stored data
- Test the priority fallback chain (hash > localStorage > IndexedDB)
