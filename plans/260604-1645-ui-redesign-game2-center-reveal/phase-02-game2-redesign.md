---
phase: 2
title: "Game 2 Layout Redesign + Center-Out Reveal"
status: pending
effort: "~1.5h"
dependencies: [1]
---

# Phase 2: Game 2 Layout Redesign + Center-Out Reveal

## Overview

Two coupled changes to `game2-host-panel.tsx` and `image-slice-reveal.tsx`:

1. **Layout**: Flip proportions — image is now the dominant element (left, ~55% width). Question + MCQ + controls go right (~45%). Both are always visible simultaneously on the projector.
2. **Reveal order**: Remap question index → visual column so the image reveals from center outward, not left-to-right.

## New Layout Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│ HostSidebar (200px)  │  Game2HostPanel (flex-1)                      │
│                      │                                                │
│                      │  ┌─────────────────────┬──────────────────┐  │
│                      │  │   IMAGE CANVAS       │  Round: ...      │  │
│                      │  │   (55% width)        │  Q 1/5           │  │
│                      │  │                      │                  │  │
│                      │  │  [ dark bg with       │  [Question text  │  │
│                      │  │    slices appearing   │   large, bold]   │  │
│                      │  │    center → out ]     │                  │  │
│                      │  │                      │  A. option text  │  │
│                      │  │  [🚨 Early Reveal]   │  B. option text  │  │
│                      │  │                      │  C. option text  │  │
│                      │  │                      │  D. option text  │  │
│                      │  │                      │                  │  │
│                      │  │                      │  [Vote controls] │  │
│                      │  │                      │  [Score/Next]    │  │
│                      │  │                      │  [Team scores]   │  │
│                      │  └─────────────────────┴──────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

## Center-Out Reveal Mapping

5 vertical slices (cols 0–4 left-to-right). Reveal order: **center first, alternating outward**.

```
REVEAL_ORDER = [2, 1, 3, 0, 4]

Question answered → visual column revealed:
  Q0 → col 2  (center)
  Q1 → col 1  (left-of-center)
  Q2 → col 3  (right-of-center)
  Q3 → col 0  (far left)
  Q4 → col 4  (far right)
```

This is a **client-only** change inside `image-slice-reveal.tsx`. Server state `g2_revealed_slices` still contains question indices `[0,1,2...]`. The component maps `revealedSlices[n] → REVEAL_ORDER[n]` to get the visual column.

### Updated `drawCanvas` logic

```typescript
const REVEAL_ORDER = [2, 1, 3, 0, 4] as const;

// When drawing committed slice s (question index):
const visualCol = REVEAL_ORDER[s]; // ← map question → visual column
const sx = (visualCol / TOTAL_SLICES) * img.naturalWidth;
ctx.drawImage(img, sx, 0, sw, img.naturalHeight, visualCol * sliceW, 0, sliceW, height);

// When animating a slice during slide-in:
const visualCol = REVEAL_ORDER[sliceIdx];
// ... same mapping
```

## MCQ Options — Display Spec

Options are now displayed as large, clearly readable rows on the projector. Each option row:

```tsx
<div className={[
  "flex items-center gap-3 px-4 py-3 rounded-lg border text-left",
  isCorrect && g2_da_cham_diem
    ? "border-green-500 bg-green-900/40 text-green-100"
    : "border-[#2a2a2a] bg-[#111] text-white"
].join(" ")}>
  <span className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center
                   font-black text-gold shrink-0">{opt}</span>
  <span className="text-game-sm font-semibold leading-snug">{text}</span>
</div>
```

## Philosophy Lesson (round done)

When `g2_done === true`, replace question+MCQ with philosophy lesson. Image stays visible (fully revealed). Layout same — lesson text in right column.

## Related Code Files

### Modify: `client/src/components/image-slice-reveal.tsx`
- Add `REVEAL_ORDER = [2, 1, 3, 0, 4]` constant
- Update `drawCanvas()`: map `s → REVEAL_ORDER[s]` for `sx` and destination x
- Update `animateSlice()`: map `sliceIdx → REVEAL_ORDER[sliceIdx]` for destination x

### Modify: `client/src/components/game2-host-panel.tsx`
- New layout: `flex flex-row` with image taking 55% (`basis-[55%] shrink-0`), right panel `flex-1`
- Right panel: RoundHeader + QuestionText (large) + MCQ options (large) + VoteGateControls + ManualVotePanel + VoteStatusGrid + ScoreActions + Scoreboard (compact)
- Remove `<Scoreboard>` from below image (move to right panel compact)
- ImageSliceReveal gets `h-full` to fill the full left column height

## Implementation Steps

1. **`image-slice-reveal.tsx`** — Add `REVEAL_ORDER` constant; update `drawCanvas` and `animateSlice` to use `REVEAL_ORDER[s]` for visual column calculation
2. **`game2-host-panel.tsx`** — Redesign layout to `flex flex-row`, image left `basis-[55%]`, controls right `flex-1 overflow-y-auto`
3. **MCQ options** — Upgrade from small `<div>` rows to large letter-badge option rows
4. **Compact scoreboard** — Use `<Scoreboard compact />` in right panel
5. **Philosophy lesson** — Show in right column when `g2_done`, image stays in left
6. `npx tsc --noEmit` — verify zero errors

## Success Criteria
- [ ] Image occupies ~55% of Game 2 screen width at all times
- [ ] MCQ options display at `text-game-sm` size, clearly readable on projector
- [ ] Center slice (col 2) reveals first when Q0 is scored
- [ ] Slices 1 and 3 reveal next (Q1, Q2), then 0 and 4 (Q3, Q4)
- [ ] Early reveal still fills all 5 columns correctly
- [ ] Philosophy lesson shows in right column after round done
- [ ] Scoreboard visible in compact form during game
- [ ] No TypeScript errors

## Risk Assessment
- **Reveal mapping off-by-one**: The mapping is `REVEAL_ORDER[questionIndex]` — not `REVEAL_ORDER[sliceIndex]`. Since `g2_revealed_slices` stores question indices (0–4), the mapping `REVEAL_ORDER[s]` is correct where `s` is an element of `g2_revealed_slices`. Verify this in review.
- **Canvas aspect ratio**: Changing container width changes canvas dimensions — `setupCanvas()` + `ResizeObserver` handles this automatically.
- **All-5 early reveal**: `earlyReveal` sets `g2_revealed_slices = [0,1,2,3,4]`. The render loop maps each to its visual column via REVEAL_ORDER — all 5 columns drawn. Correct.
