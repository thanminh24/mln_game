---
title: "Click Row Question Modal"
status: completed
priority: P1
branch: "main"
tags: [ui, crossword, host]
created: "2026-06-05"
---

# Click Row Question Modal

## Overview

Make the main screen show only the crossword board and host controls. Clicking any unopened horizontal row opens the current question in a modal. Remove visible score, header keyword chip, and summary-page entry points because summary is owned elsewhere.

## Requirements

- Click a horizontal crossword row to select it and open the question modal.
- Modal keeps current large question/answer layout.
- If a row has `promptImage`, show image on the right; if not, omit the image column/block entirely.
- Remove score block and `Hàng dọc` block from the header.
- Remove summary-page navigation from this host screen and route table.
- Keep existing Socket.IO events and state shape.
- Preserve build correctness.

## Touchpoints

- Modify `client/src/components/crossword-grid.tsx`
- Modify `client/src/components/crossword-game-panel.tsx`
- Modify `client/src/App.tsx`

## Success Criteria

- [x] Initial page shows main crossword without question panel.
- [x] Clicking an unopened row opens modal for that row.
- [x] Rows with images show image at right in modal.
- [x] Rows without images show no placeholder/image block.
- [x] Header no longer shows score or `Hàng dọc` chip.
- [x] Host screen has no summary navigation.
- [x] `npm run build` passes.
- [x] Browser smoke verifies click-to-modal and no horizontal overflow.

## Unresolved Questions

- None.
