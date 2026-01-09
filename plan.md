# 📋 Rencana Peningkatan NoteArea v2.0

## 🎯 Tujuan
Meningkatkan aplikasi markdown editor menjadi lebih profesional, fitur lengkap, dan pengalaman pengguna yang lebih baik.

---

## ✅ Fase 1 (SELESAI)
- [x] Mobile Formatting Toolbar
- [x] Focus/Zen Mode
- [x] Split View Mode
- [x] Auto-save Indicator yang Lebih Baik

---

## 🚀 Fase 2: Peningkatan Sekarang

### 2.1 Document Header Bar
**File: `src/components/DocumentHeader.tsx`**
- Tampilkan judul dokumen dari H1 pertama
- Indikator status save (saving, saved, error)
- Tombol quick actions (undo, redo, settings)
- Responsive untuk semua ukuran layar

### 2.2 Table of Contents (TOC) Sidebar
**File: `src/components/TableOfContents.tsx`**
- Parse semua heading (H1-H6) dari konten
- Sidebar collapsible di sebelah kiri
- Klik untuk navigate ke section
- Highlight heading yang sedang terlihat
- Indentasi berdasarkan level heading
- Toggle button di header

### 2.3 Search & Replace
**File: `src/components/SearchReplace.tsx`**
- Modal dengan shortcut Ctrl/Cmd + F
- Input untuk search dan replace
- Tombol: Find Next, Replace, Replace All
- Highlight semua hasil pencarian
- Case sensitive toggle
- Match count indicator

### 2.4 Word Count Goal
**File: `src/components/WordCountGoal.tsx`**
- Set target kata (misal 500, 1000, 2000)
- Progress bar visual di status bar
- Warna berubah saat mendekati target
- Celebratory animation saat tercapai
- Persist setting di localStorage

### 2.5 Slash Commands (Quick Insert)
**File: `src/components/SlashCommandMenu.tsx`**
- Ketik "/" di awal baris untuk trigger
- Menu dropdown dengan opsi:
  - /h1, /h2, /h3 - Headings
  - /bullet, /numbered, /task - Lists
  - /code, /quote - Blocks
  - /table - Insert table template
  - /divider - Horizontal rule
  - /image - Image placeholder
- Fuzzy search untuk filter
- Keyboard navigation (arrow, enter, escape)

### 2.6 Settings Panel
**File: `src/components/SettingsPanel.tsx`**
- Font size slider (14px - 24px)
- Font family selection (Sans, Serif, Mono)
- Line height adjustment
- Word count goal setting
- Auto-save toggle dan interval
- Theme selection (Light, Dark, System)
- Export/import settings

---

## 🏗️ Struktur File Baru

```
src/
├── components/
│   ├── DocumentHeader.tsx      ← BARU
│   ├── TableOfContents.tsx     ← BARU
│   ├── SearchReplace.tsx       ← BARU
│   ├── WordCountGoal.tsx       ← BARU
│   ├── SlashCommandMenu.tsx    ← BARU
│   ├── SettingsPanel.tsx       ← BARU
│   ├── FloatingMenu.tsx        ← UPDATE
│   ├── StatusBar.tsx           ← UPDATE
│   └── ...
├── hooks/
│   ├── useHeadings.ts          ← BARU (parse headings)
│   ├── useSearch.ts            ← BARU (search logic)
│   ├── useSettings.ts          ← BARU (settings state)
│   └── ...
└── pages/
    └── Index.tsx               ← UPDATE
```

---

## 🎨 Design Specifications

### Document Header
```
┌─────────────────────────────────────────────────────────────┐
│  ≡  │  📄 Judul Dokumen                  │ ↩ ↪ │ ⚙ │ ● Saved │
└─────────────────────────────────────────────────────────────┘
 TOC   Title                              Undo Redo Settings Status
```

### Table of Contents Sidebar
```
┌──────────────────┬─────────────────────────────────────────┐
│                  │                                         │
│ 📑 Daftar Isi    │                                         │
│                  │                                         │
│ • Heading 1      │            EDITOR AREA                  │
│   ├ Heading 2    │                                         │
│   ├ Heading 2    │                                         │
│   │ └ Heading 3  │                                         │
│   └ Heading 2    │                                         │
│ • Heading 1      │                                         │
│                  │                                         │
└──────────────────┴─────────────────────────────────────────┘
     240px                      Flexible
```

### Search & Replace Modal
```
┌─────────────────────────────────────────────────────────────┐
│                      🔍 Cari & Ganti                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Cari:    [________________________] 🔍  3 dari 10         │
│                                                             │
│  Ganti:   [________________________]                        │
│                                                             │
│  ☐ Case Sensitive   ☐ Whole Word                           │
│                                                             │
│        [◀ Prev] [Next ▶] [Replace] [Replace All]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Slash Command Menu
```
Ketik "/" → muncul dropdown:
┌──────────────────────────┐
│ /h1    Heading 1         │
│ /h2    Heading 2         │
│ /h3    Heading 3         │
│ ───────────────────────  │
│ /bullet  Bullet List     │
│ /number  Numbered List   │
│ /task    Task List       │
│ ───────────────────────  │
│ /code    Code Block      │
│ /quote   Blockquote      │
│ /table   Insert Table    │
│ /hr      Divider         │
└──────────────────────────┘
```

### Word Count Goal (di StatusBar)
```
┌─────────────────────────────────────────────────────────────┐
│ 523 kata │ 2,847 karakter │ 3 menit │ ████████░░ 52% │ ✓   │
└─────────────────────────────────────────────────────────────┘
                                       Progress bar ke target
```

---

## ⚡ Urutan Implementasi

1. **DocumentHeader.tsx** - Header dengan judul dan actions
2. **useHeadings.ts** - Hook untuk parse headings
3. **TableOfContents.tsx** - TOC sidebar
4. **useSearch.ts** - Hook untuk search logic
5. **SearchReplace.tsx** - Search & replace modal
6. **WordCountGoal.tsx** - Progress ke target
7. **SlashCommandMenu.tsx** - Quick insert menu
8. **useSettings.ts** - Settings state management
9. **SettingsPanel.tsx** - Settings UI
10. **Update Index.tsx** - Integrasi semua
11. **Update CSS** - Styling baru
12. **Testing & Polish**

---

## 📝 Notes Implementasi
- Gunakan Framer Motion untuk animasi
- Pastikan accessible (ARIA labels, keyboard nav)
- Touch-friendly (min 44px touch targets)
- Responsive di semua ukuran layar
- Persist settings di localStorage
- Debounce untuk search dan parsing headings
