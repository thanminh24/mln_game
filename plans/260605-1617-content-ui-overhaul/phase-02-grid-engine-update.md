---
phase: 2
title: "Grid Engine Update"
status: completed
priority: P1
effort: "30m"
dependencies: [1]
---

# Phase 2: Grid Engine Update

## Overview

Update `crossword-grid.tsx` constants and cell logic to support 11 rows and the new
LÒNG YÊU NƯỚC keyword. Reduce TOTAL_COLS from 35 → 30. No layout or visual changes here
(those are Phase 3); this phase is purely correctness.

## Changes

| Constant | Old | New | Reason |
|---|---|---|---|
| `TOTAL_COLS` | 35 | 30 | Max used column is 26 (row 7 ends at col 26); 30 keeps headroom |
| `KEYWORD_COL` | 12 | 12 | Unchanged — all 11 rows verified against col 12 |

## Related Code Files

- Modify: `client/src/components/crossword-grid.tsx` — update TOTAL_COLS constant only

## Implementation Steps

1. In `crossword-grid.tsx` change `const TOTAL_COLS = 35` → `const TOTAL_COLS = 30`
2. No other logic changes needed — the grid loop is already parameterized
3. Run dev server, verify all 11 rows render within bounds

## Success Criteria

- [x] `TOTAL_COLS = 30` in crossword-grid.tsx
- [x] All 11 rows visible with no cells clipped
- [x] Keyword column (col 12) highlights correctly for all rows
- [x] Row 8 (colOffset=5, widest left margin) renders fully

## Risk Assessment

Trivial — single constant change. KEYWORD_COL=12 already verified against all 11 rows in Phase 1 grid math table.
