---
phase: 2
title: "Game 1 — Crossword Buzzer (Ô Chữ)"
status: pending
priority: P1
effort: "~1d"
dependencies: [1]
---

# Phase 2: Game 1 — Crossword Buzzer (Ô Chữ)

## Overview
Build the full host control panel for Game 1: 35×7 CSS Grid crossword board, question selector, buzz open/close controls, winner adjudication panel, and scoreboard. End state: host can run a complete Game 1 session from the projector laptop.

## Requirements
- Functional: Host selects row → opens buzzer → sees buzz winner alert → marks correct/wrong → row reveals with animation; keyword buzz always available; all rows revealed ends game 1
- Non-functional: Crossword grid fits 1280px projector width; cell reveal animates left-to-right with 50ms CSS stagger; column 12 cells render in `accent-keyword` (#dc2626) when revealed

## Architecture

### Component tree
```
HostView
├── HostSidebar              ← mode switch, reset button, mini scoreboard
└── Game1HostPanel
    ├── CrosswordGrid        ← 35 × 7 CSS Grid
    ├── Game1ControlPanel    ← right column
    │   ├── QuestionSelector ← dropdown of unrevealed rows
    │   ├── BuzzControls     ← open/close/status
    │   ├── BuzzWinnerAlert  ← red flash panel when winner exists
    │   └── JudgePanel       ← ✅ ĐÚNG / ❌ SAI buttons
    └── Scoreboard           ← CSS bar chart, 5 teams
```

### CrosswordGrid layout logic
```
35 columns × 7 rows. Each row word placed at col_offset:
Row 0: YTHUCXAHOI       offset=12  → cols 12–21
Row 1: DIEUKIENTUNHIEN  offset=10  → cols 10–24
Row 2: PHUONGTHUCSANXUATVATCHAT offset=10 → cols 10–33
Row 3: TONTAIXAHOI      offset=10  → cols 10–20
Row 4: YTHUCXAHOITHONGTHUONG offset=9 → cols 9–29
Row 5: YTHUCXAHOIVUOTTRUOCTONTAIXAHOI offset=0 → cols 0–29
Row 6: YTHUCDAODUC      offset=8   → cols 8–18

Column 12 = vertical keyword intersection (Y-I-U-O-N-U-O = YÊU NƯỚC stripped)
```

Cell state matrix (per row, per col):
- Outside word bounds → transparent, no border, no letter
- Inside bounds, row NOT revealed → dark surface `#1a1a1a`, light border, empty
- Inside bounds, row revealed, not col 12 → `accent-blue` bg, white letter, slide-down animation
- Inside bounds, row revealed, col 12 → `accent-keyword` bg, white letter, slide-down animation

### CSS Grid cell reveal animation
```css
/* CrosswordGrid.module.css */
.cell-revealed {
  animation: revealCell 0.4s ease-out forwards;
  animation-delay: var(--stagger-delay);
}
@keyframes revealCell {
  0%   { opacity: 0; transform: translateY(-16px); }
  100% { opacity: 1; transform: translateY(0); }
}
/* Inline style on cell: style={{ "--stagger-delay": `${colIndex * 50}ms` }} */
```

### BuzzWinnerAlert — state-driven render
```
g1_buzz_winner !== null:
  → g1_buzz_type === "keyword":
      Red full-width banner: "🚨 [TEAM] BẤM CHUÔNG GIẢI TỪ KHÓA DỌC!"
      Buttons: [✅ CHÍNH XÁC — Cộng 30đ & WIN] [❌ SAI]
  → g1_buzz_type === "row":
      Red full-width banner: "🎯 [TEAM] giành quyền trả lời HÀNG NGANG SỐ [N]!"
      Note: answer NOT shown on screen (MC reads from printed script)
      Buttons: [✅ ĐÚNG — Cộng 10đ & Mở ô] [❌ SAI — Mở lại chuông]
```

## Related Code Files
- Create: `client/src/views/host-view.tsx`
- Create: `client/src/components/host-sidebar.tsx`
- Create: `client/src/components/game1-host-panel.tsx`
- Create: `client/src/components/crossword-grid.tsx`
- Create: `client/src/components/crossword-grid.module.css`
- Create: `client/src/components/scoreboard.tsx`

## Implementation Steps

1. **HostView scaffold** (`host-view.tsx`)
   - Two-column layout: `flex h-screen`; sidebar fixed-width left, main content flex-grow right
   - Read `state.mode` from socket context; render `<Game1HostPanel />` or `<Game2HostPanel />`

2. **HostSidebar** (`host-sidebar.tsx`)
   - Mode switch: two buttons "Phần 1: Ô Chữ" / "Phần 2: Lật Tranh"; active = blue bg; emit `host:switch_mode`
   - Reset button: outlined red, click → confirm dialog → emit `host:reset`
   - Mini scoreboard: list of teams + scores, gold text for score value
   - Keyboard shortcut hint display (F1/F2/F3 labels next to buttons)

3. **CrosswordGrid** (`crossword-grid.tsx`)
   - Props: `{ state: GameState }`
   - Build cell matrix: for each row 0–6, for each col 0–34, compute: `inBounds`, `letter` (word[col - offset] if revealed else null), `isKeywordCol` (col === 12), `revealed` (rowIdx in state.g1_opened)
   - CSS Grid: `display: grid; grid-template-columns: repeat(35, 1fr); gap: 2px`
   - Cell sizing: `aspect-ratio: 1; max-width: 26px` — at 35 cols × 26px = 910px + gaps ≈ 978px fits 1280px
   - Apply `.cell-revealed` class + `--stagger-delay` inline style when row is in `g1_opened`
   - Keyword-solved state: flash all cells, then show "🎉 TỪ KHÓA: YÊU NƯỚC" banner overlay

4. **QuestionSelector** (inside `game1-host-panel.tsx`)
   - Compute `available = G1_DATA.filter((_, i) => !state.g1_opened.includes(i))`
   - `<select>` dropdown: options show "Hàng [N] — [word_length] chữ"
   - "Chọn câu hỏi này" button → emit `host:select_q { idx }`
   - When `state.g1_current_q !== null`: show question text (`G1_DATA[g1_current_q].q`) in a surface panel

5. **BuzzControls** (inside `game1-host-panel.tsx`)
   - When no buzz winner and question selected:
     - If `!g1_buzz_active`: green button "🟢 MỞ CHUÔNG GIÀNH QUYỀN HÀNG NGANG" → emit `host:open_buzz`
     - If `g1_buzz_active`: yellow warning "⏳ Đang chờ...", red button "🔴 KHÓA CHUÔNG" → emit `host:close_buzz`

6. **BuzzWinnerAlert** (inside `game1-host-panel.tsx`)
   - Conditionally rendered when `state.g1_buzz_winner !== null`
   - Red bg panel, large bold text with team name and buzz type
   - JudgePanel: two large buttons side by side
     - Correct: `emit("host:correct")` → server: +pts, reveal row/set keyword_solved, clear winner
     - Wrong: `emit("host:wrong")` → server: clear winner, reopen buzz if row type

7. **Scoreboard** (`scoreboard.tsx`)
   - Props: `{ scores: Record<Team, number> }`
   - Max score = `Math.max(...Object.values(scores), 1)` for bar width percentage
   - Each team: row with team name (left), gold score number (right), filled bar below
   - Bar: `<div style={{ width: \`${(score/max)*100}%\` }} className="h-3 bg-gold rounded transition-all duration-700" />`

8. **Keyword-solved end state**
   - When `state.g1_keyword_solved === true`:
     - Set `g1_opened` to all rows in UI (handled by game engine)
     - Show full-width success banner: "🎉 TỪ KHÓA ĐÃ ĐƯỢC GIẢI MÃ: YÊU NƯỚC"
     - Show prompt: "Hãy chuyển sang Phần 2 để tiếp tục!"
     - Disable all buzzer controls

9. **Wire up keyboard shortcuts** (preliminary — full implementation in Phase 4)
   - Stub `useHostKeyboard` hook in `host-view.tsx` (empty for now, wired in Phase 4)

## Success Criteria
- [ ] Crossword grid renders all 7 rows correctly positioned across 35 columns
- [ ] Column 12 cells show `#dc2626` (keyword red) when row is revealed
- [ ] Cells outside word boundaries are transparent with no border
- [ ] Row reveal triggers staggered left-to-right fade+slide animation
- [ ] Host can select a question, open buzzer, see buzz winner alert, mark correct → row reveals
- [ ] Marking wrong clears winner and reopens buzzer
- [ ] Keyword buzz win sets `g1_keyword_solved`, reveals all rows, shows end banner
- [ ] Scoreboard bars animate width when scores update
- [ ] All 7 rows can be revealed across a full Game 1 session without state bugs

## Risk Assessment
- **Grid overflow at 35 cols**: At 26px × 35 = 910px, fits 1280px comfortably. Use `overflow-x: auto` on grid container as safety valve.
- **Answer leaking on screen**: JudgePanel must NOT display `G1_DATA[idx].ans_full` — MC reads from printed script. Verify this in code review.
- **Stagger delay on re-render**: CSS animation replays if component remounts. Use `animation-fill-mode: forwards` and only apply `.cell-revealed` class once row is in `g1_opened` (don't remove/re-add class).
