---
title: "MLN111 UI Redesign — Player Removal + Game 2 Center-Out Reveal"
status: pending
priority: P1
branch: "main"
created: "2026-06-04T16:45:00.000Z"
---

# MLN111 UI Redesign

## Scope

Three focused changes, no server-side work:

1. **Remove player side** — delete `player-view.tsx`, simplify routing, optionally clean player events from type maps
2. **Game 2 layout redesign** — image dominant (55% width), MCQ options prominent and large, controls compact right column
3. **Center-out reveal** — remap question → visual slice column so image reveals from center outward

## Context

- Projector-only host mode (v1). No player phones. Player side is dead code.
- Current Game 2 layout: image crammed into `w-96` right column; question/controls take majority of width — **backwards** for a projector game.
- Current reveal order: slices reveal left-to-right (col 0→1→2→3→4). Center-out is more dramatic for projector use.

## Phases

| Phase | Name | Status | Effort |
|-------|------|--------|--------|
| 1 | [Remove Player Side](./phase-01-remove-player-side.md) | Pending | ~15 min |
| 2 | [Game 2 Layout + Center-Out Reveal](./phase-02-game2-redesign.md) | Pending | ~1.5h |

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Player event types | Keep in `shared.ts` (comment out) | Server still handles `player:buzz` for future; removing types breaks TS inference |
| Reveal mapping | Client-side `REVEAL_ORDER = [2,1,3,0,4]` constant | No server change needed; pure UI concern |
| Game 2 layout | Image left 55%, controls right 45% | Image is the game — it should command the screen |
| MCQ display | Full-size option rows with letter badge, `text-game-sm` | Projector needs large, readable text |
| Slide-in direction | Keep existing slide-down animation | Center-out is about column ORDER, not slide direction |

## Files Changed

**Delete:**
- `client/src/views/player-view.tsx`

**Modify:**
- `client/src/App.tsx` — remove player route/import
- `client/src/components/image-slice-reveal.tsx` — center-out REVEAL_ORDER
- `client/src/components/game2-host-panel.tsx` — full layout redesign
