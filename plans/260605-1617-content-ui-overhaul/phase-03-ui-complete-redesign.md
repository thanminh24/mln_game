---
phase: 3
title: "UI Complete Redesign"
status: completed
priority: P1
effort: "3h"
dependencies: [1, 2]
---

# Phase 3: UI Complete Redesign

## Overview

Tear out the existing visual layer and rebuild it. Target: projector-grade game-show UI.
Black background, white text, yellow accent. 2-column layout (grid left / MCQ right).
Prompt images shown inline in the MCQ panel. All changes are in client-side files only.

## Design System

### Color Tokens (tailwind.config.ts)

```ts
colors: {
  // Base
  black:   "#000000",   // page background
  surface: "#111111",   // card / panel background
  border:  "#222222",   // subtle borders
  // Text
  white:   "#FFFFFF",   // primary text
  muted:   "#777777",   // secondary text, labels
  // Accent
  yellow:  "#FFD700",   // primary accent — answers, highlights, CTA
  "yellow-dim": "#B8960C",  // borders, inactive states
  // State
  correct: "#22C55E",   // correct answer bg
  "correct-dim": "#14532D", // correct answer border
  wrong:   "#DC2626",   // wrong answer text
  "wrong-dim": "#7F1D1D",   // wrong answer bg
}
```

### Typography (tailwind.config.ts)

Keep `Be Vietnam Pro`. Projector-scaled sizes (unchanged from current):
```ts
fontSize: {
  "game-xl": ["4.5rem", { lineHeight: "1.1" }],
  "game-lg": ["2.7rem", { lineHeight: "1.2" }],
  "game-md": ["2.2rem", { lineHeight: "1.3" }],
  "game-sm": ["1.8rem", { lineHeight: "1.4" }],
}
```

### Grid Cell Visual Rules

| State | Background | Border | Text color |
|---|---|---|---|
| Out-of-bounds | transparent | none | — |
| Unrevealed, not keyword col | `#111111` | `#333333` 1px | — |
| Unrevealed, keyword col | `#111111` | `#FFD700` 1px (pulse anim) | — |
| Revealed, normal | `#FFD700` | `#B8960C` 1px | `#000000` bold |
| Revealed, keyword col | `#FFFFFF` | `#FFD700` 2px | `#000000` bold |
| Keyword solved flash | `#FFD700` keyframe pulse | — | `#000000` |

### MCQ Option Button States

| State | Border | Background | Text |
|---|---|---|---|
| Default | `#333333` | `#111111` | `#FFFFFF` |
| Hover | `#FFD700` | `#1A1600` | `#FFFFFF` |
| Correct | `#22C55E` | `#052E16` | `#FFFFFF` |
| Wrong | `#7F1D1D` | `#1C0606` | `#DC2626` strikethrough |
| Disabled | `#222222` | `#0A0A0A` | `#444444` |

---

## Layout Architecture

### `host-view.tsx` — no changes needed (just renders CrosswordGamePanel)

### `crossword-game-panel.tsx` — full rewrite

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER BAR (h-14, border-b border-[#222])                       │
│  [●] MLN111 · Ô chữ biện chứng          [Score: 40]  [Reset]   │
├──────────────────────────┬───────────────────────────────────────┤
│                          │                                       │
│   GRID PANEL             │   MCQ PANEL                          │
│   (flex-1, ~55% width)   │   (w-[420px] fixed, ~45%)            │
│                          │                                       │
│   ┌──────────────────┐   │   [Image block — if promptImage]     │
│   │  Crossword Grid  │   │   aspect-video, object-cover         │
│   │  11 rows         │   │   ─────────────────────────────────  │
│   │  KEYWORD_COL     │   │   Hàng 3 · 5 chữ                    │
│   │  highlighted     │   │   Question text (text-xl font-bold)  │
│   └──────────────────┘   │                                       │
│                          │   ┌──────┐ ┌──────┐                  │
│   [Progress bar]         │   │  A   │ │  B   │                  │
│   [7 / 11 hàng · 64%]   │   └──────┘ └──────┘                  │
│                          │   ┌──────┐ ┌──────┐                  │
│                          │   │  C   │ │  D   │                  │
│                          │   └──────┘ └──────┘                  │
│                          │                                       │
│                          │   [Answer feedback block]            │
│                          │   ─────────────────────────────────  │
│                          │   ROW SELECTOR                       │
│                          │   [dropdown]  [Bắt đầu →]            │
│                          │   [Tôi đã đoán ra / Mở tổng kết]    │
└──────────────────────────┴───────────────────────────────────────┘
```

Key structural changes vs current:
- Header is a slim bar (not inline with grid)
- Grid and MCQ sit side-by-side in a `flex` row on `xl` screens; stack on smaller screens
- MCQ panel is `xl:w-[420px]` with responsive full-width behavior below `xl`
- Image block (16:9) sits above question text when `promptImage` present
- Progress bar moved below grid, not in grid header
- Row selector and keyword button consolidated at the bottom of MCQ panel

### `crossword-grid.tsx` — visual rewrite only (logic from Phase 2 stays)

Key visual changes:
- Cell size uses stable 24-28px responsive square cells with `gap-[3px]` so 30 columns fit projector and laptop widths
- Revealed row gets `cell-reveal` stagger animation (keep from current CSS module)
- Keyword column: yellow border pulse animation (unrevealed), white fill (revealed)
- Row number labels: left of each row, `text-[10px] text-[#444] w-6 text-right`
- Keyword solved banner: replace text-only with yellow-bordered card with white text

---

## Related Code Files

- Modify: `client/tailwind.config.ts` — replace color tokens
- Modify: `client/src/index.css` — update body bg, keep font import
- Modify: `client/src/components/crossword-game-panel.tsx` — full rewrite
- Modify: `client/src/components/crossword-grid.tsx` — visual rewrite
- Modify: `client/src/components/crossword-grid.module.css` — update animations

## Implementation Steps

1. **tailwind.config.ts** — replace `colors` block with new tokens (keep fontSize, fontFamily)
2. **index.css** — update `body { @apply bg-black }`, keep font import
3. **crossword-grid.module.css** — update `cell-revealed` keyframe; add `cell-keyword-pulse` keyframe
4. **crossword-grid.tsx**:
   - Update cell size class to `max-w-[28px]` and gap to `gap-[3px]`
   - Update `cellBg` logic to use new tokens
   - Add row number labels (absolute positioned left column)
   - Update keyword solved overlay to match new design
5. **crossword-game-panel.tsx**:
   - New slim header bar
   - Flex-row layout for grid + MCQ panels
   - Image block in MCQ panel (conditional on `currentRow?.promptImage`)
   - Redesigned option buttons (label A/B/C/D instead of 1/2/3/4 visually)
   - Answer feedback with yellow accent
   - Row selector + keyword button at bottom of MCQ panel
6. `npm run build` — verify 0 errors

## CSS Animations (crossword-grid.module.css)

```css
/* Cell reveal: scale in + fade */
.cell-revealed {
  animation: cellReveal 0.25s ease-out var(--stagger-delay, 0ms) both;
}
@keyframes cellReveal {
  from { transform: scaleY(0); opacity: 0; }
  to   { transform: scaleY(1); opacity: 1; }
}

/* Keyword column pulse (unrevealed) */
.cell-keyword-pulse {
  animation: keywordPulse 2s ease-in-out infinite;
}
@keyframes keywordPulse {
  0%, 100% { border-color: #FFD700; box-shadow: 0 0 0 0 rgba(255,215,0,0); }
  50%       { border-color: #FFD700; box-shadow: 0 0 6px 2px rgba(255,215,0,0.3); }
}

/* Keyword solved flash */
.cell-keyword-flash {
  animation: keywordFlash 0.6s ease-in-out 3;
}
@keyframes keywordFlash {
  0%, 100% { background: #FFFFFF; }
  50%       { background: #FFD700; }
}
```

## Success Criteria

- [x] Page background is pure black (#000000)
- [x] Header bar slim (h-14 or less), title left, score right
- [x] Grid and MCQ render side-by-side on ≥1280px
- [x] Grid and MCQ stack without horizontal scroll below 1280px
- [x] Images display in MCQ panel for rows 1, 2, 5, 7, 10
- [x] All 4 option states render correctly (default/hover/correct/wrong)
- [x] Keyword column pulses before solve, flashes after solve
- [x] Answer feedback block shows yellow accent on correct, explanation text visible
- [x] Progress bar visible below grid
- [x] Reset button present and functional
- [x] Interactive controls keep visible focus states and at least 44px touch/click height
- [x] No TypeScript errors, no Tailwind purge warnings

## Risk Assessment

Medium. Full component rewrite — highest chance of regression.
Mitigation: keep all socket event wiring identical; only change JSX/className.
Run dev server and manually test each state transition after rewrite.
