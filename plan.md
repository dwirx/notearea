# 📋 Rencana Peningkatan Notearea Markdown Editor

## 🎯 Tujuan
Meningkatkan pengalaman pengguna (UX) untuk semua device: Desktop, Tablet, dan Mobile dengan fitur-fitur baru yang berguna.

---

## 📊 Prioritas Implementasi

### ✅ Fase 1: Quick Wins (Implementasi Sekarang)

#### 1.1 Mobile Formatting Toolbar
- [ ] Buat komponen `FormattingToolbar.tsx`
- [ ] Tampilkan toolbar di atas keyboard pada mobile
- [ ] Tombol: Bold, Italic, Heading, List, Link, Code
- [ ] Animasi slide-up saat focus pada editor
- [ ] Sembunyikan pada desktop (gunakan keyboard shortcuts)

#### 1.2 Focus/Zen Mode
- [ ] Tambahkan state `isZenMode` di Index.tsx
- [ ] Sembunyikan StatusBar dan FloatingMenu saat aktif
- [ ] Tampilkan UI saat hover di area bawah
- [ ] Keyboard shortcut: Ctrl/Cmd + Shift + F
- [ ] Tombol di FloatingMenu untuk toggle

#### 1.3 Split View Mode (Tablet/Desktop)
- [ ] Tambahkan state `viewMode`: 'editor' | 'preview' | 'split'
- [ ] Layout grid 2 kolom untuk split view
- [ ] Toggle button di FloatingMenu
- [ ] Auto-split pada tablet landscape
- [ ] Sync scroll antara editor dan preview

#### 1.4 Auto-save Indicator yang Lebih Baik
- [ ] Perbaiki StatusBar dengan animasi pulse
- [ ] Warna berbeda untuk setiap status
- [ ] Tooltip dengan detail waktu tersimpan

---

### 📅 Fase 2: Medium Priority (Setelah Fase 1)

#### 2.1 Table of Contents (ToC)
- [ ] Parse heading dari konten
- [ ] Sidebar collapsible untuk ToC
- [ ] Jump to section saat klik
- [ ] Highlight section aktif

#### 2.2 Quick Insert Menu (Slash Commands)
- [ ] Deteksi "/" di awal baris
- [ ] Popup menu dengan opsi insert
- [ ] Insert template untuk table, code, dll
- [ ] Keyboard navigation

#### 2.3 Word Count Goal & Statistics
- [ ] Modal statistik dokumen
- [ ] Set target kata
- [ ] Progress bar visual
- [ ] Estimasi waktu baca

---

### 📅 Fase 3: Advanced Features (Future)

- [ ] Template System
- [ ] Search & Replace
- [ ] PWA Enhancement (Offline Support)
- [ ] Custom Themes
- [ ] Export to PDF
- [ ] Math Support (KaTeX)
- [ ] Diagram Support (Mermaid)

---

## 🏗️ Struktur File Baru

```
src/
├── components/
│   ├── FormattingToolbar.tsx    ← BARU
│   ├── SplitView.tsx            ← BARU
│   ├── TableOfContents.tsx      ← BARU (Fase 2)
│   ├── QuickInsertMenu.tsx      ← BARU (Fase 2)
│   ├── FloatingMenu.tsx         ← UPDATE
│   ├── StatusBar.tsx            ← UPDATE
│   ├── LiveEditor.tsx           ← UPDATE
│   └── ...
├── hooks/
│   ├── useEditorCommands.ts     ← BARU (refactor dari LiveEditor)
│   ├── useViewMode.ts           ← BARU
│   └── ...
└── pages/
    └── Index.tsx                ← UPDATE
```

---

## 🎨 Design Specifications

### Mobile Formatting Toolbar
```
┌─────────────────────────────────────────────────┐
│  B  │  I  │  H  │  ─  │  •  │  ☑  │  </>│  ⋯  │
└─────────────────────────────────────────────────┘
 Bold Italic Head  HR  List Task Code  More

- Height: 48px
- Background: semi-transparent with blur
- Position: fixed bottom, above keyboard
- Animation: slide up on focus
```

### Split View Layout
```
Desktop/Tablet Landscape:
┌──────────────────────┬──────────────────────┐
│                      │                      │
│       EDITOR         │       PREVIEW        │
│                      │                      │
│   (50% width)        │    (50% width)       │
│                      │                      │
└──────────────────────┴──────────────────────┘

Mobile/Portrait: Single view dengan toggle
```

### Zen Mode
```
- Semua UI tersembunyi
- Editor full-screen
- Hover di bottom 100px → reveal controls
- Press Escape → exit zen mode
- Subtle vignette effect (optional)
```

---

## ⚡ Implementasi Sekarang

### Step 1: FormattingToolbar.tsx
Komponen toolbar formatting untuk mobile dengan tombol-tombol markdown.

### Step 2: Update Index.tsx
- Tambahkan state untuk viewMode dan zenMode
- Integrasi FormattingToolbar
- Integrasi Split View

### Step 3: Update FloatingMenu.tsx
- Tambahkan opsi Zen Mode
- Tambahkan opsi Split View (tablet/desktop)

### Step 4: Update StatusBar.tsx
- Animasi yang lebih baik
- Indicator status yang lebih jelas

### Step 5: CSS Updates
- Styling untuk toolbar
- Styling untuk split view
- Animasi dan transisi

---

## 📝 Notes
- Gunakan Framer Motion untuk animasi
- Pastikan touch-friendly (min 44px touch targets)
- Test di berbagai ukuran layar
- Maintain backward compatibility
