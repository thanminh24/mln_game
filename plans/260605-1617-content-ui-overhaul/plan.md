---
title: "Content + UI Full Overhaul"
description: "Replace 7-row/YÊU NƯỚC game with 11-row/LÒNG YÊU NƯỚC content, copy 5 prompt images, and completely redesign the UI with black/white/yellow projector theme."
status: completed
priority: P1
branch: "main"
tags: [content, ui, redesign]
blockedBy: []
blocks: []
created: "2026-06-05T09:25:02.962Z"
createdBy: "ck:plan"
source: skill
---

# Content + UI Full Overhaul

## Overview

Full replacement of game content (11 new rows, keyword LÒNG YÊU NƯỚC, 5 prompt images)
and complete UI overhaul (true-black bg, white text, bright yellow accent, projector-optimised layout).
No new routes, no new server logic — data and presentation only.

## Phases

| Phase | Name | Status | Effort |
|-------|------|--------|--------|
| 1 | [Content Data Replacement](./phase-01-content-data-replacement.md) | Completed | 1h |
| 2 | [Grid Engine Update](./phase-02-grid-engine-update.md) | Completed | 30m |
| 3 | [UI Complete Redesign](./phase-03-ui-complete-redesign.md) | Completed | 3h |
| 4 | [Summary Page Redesign](./phase-04-summary-page-redesign.md) | Completed | 1h |

## Key Decisions

- Visible keyword is `LÒNG YÊU NƯỚC`; grid math uses ASCII `LONGYEUNUOC`
- KEYWORD_COL stays at 12; TOTAL_COLS reduced from 35 → 30 (max used col is 26)
- Images renamed descriptively and served from `client/public/images/`
- Tailwind token overhaul: gold → bright yellow #FFD700, surface → #111111
- Phase docs are source of truth. `ui-preview.html` is visual reference only, not authoritative layout spec.
- Layout: 2-column split (grid left 55% / MCQ right fixed/flexible panel) on ≥1280px; stacked on smaller
- Image prompt displayed in MCQ panel above question text when `promptImage` is set

## Dependencies

None — self-contained to this repo.

## Finalization

- Done: updated `docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/development-roadmap.md`, and `docs/project-changelog.md`.
- Done: verified with `npm run build` and a mechanical grid invariant check.
- Done: ran browser QA on the game screen and summary screen at desktop and smaller responsive widths.
