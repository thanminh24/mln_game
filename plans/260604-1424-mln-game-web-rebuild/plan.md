---
title: "MLN111 Game Web Rebuild — Full Stack"
description: "Rebuild MLN111 Vietnamese philosophy classroom game from Streamlit to full-stack web app: React 18 + TypeScript + Tailwind + Vite frontend, Node.js 20 + Express + Socket.IO 4 backend, single monorepo, host-only projector control panel with architecture extensible to phone players."
status: pending
priority: P1
branch: "main"
tags: ["react", "typescript", "socket.io", "game", "classroom", "vietnamese"]
blockedBy: []
blocks: []
created: "2026-06-04T07:37:18.276Z"
createdBy: "ck:plan"
source: skill
---

# MLN111 Game Web Rebuild — Full Stack

## Overview

Replace the Streamlit + Ngrok local app with a proper full-stack web app deployable on a VPS.
The game teaches Marxist-Leninist philosophy (MLN111) through two interactive modes:
- **Game 1 — Ô Chữ**: Crossword buzzer, 7 rows, vertical keyword "YÊU NƯỚC" at column 12
- **Game 2 — Lật Tranh**: Image-reveal MCQ, 2 rounds × 5 questions, Canvas slice animation

Primary user: **Host (teacher on projector laptop)**. Player phone views are architecturally wired but deprioritised for v1 — students engage verbally/physically in class.

## Research Reports

| Report | Path |
|--------|------|
| Dark UI + Audio + Keyboard | `plans/reports/researcher-260604-1432-dark-ui-audio-keyboard-tech-report.md` |
| Architecture + Stack | `plans/reports/researcher-260604-1433-architecture-tech-stack-report.md` |
| Codebase deep-dive | `plans/reports/deep-codebase-analysis-mln-game-web-rebuild-260603-2328.md` |
| UI wireframes | `plans/reports/ui-mechanics-impl-research-260603-2341-full-design-report.md` |

## Design Language (canonical)

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#0f0f0f` | App background |
| `bg-surface` | `#1a1a1a` | Cards, panels |
| `bg-border` | `#2a2a2a` | Borders, dividers |
| `text-primary` | `#ffffff` | Body text |
| `text-muted` | `#888888` | Secondary labels |
| `accent-blue` | `#3b82f6` | Open/active state (buzz open, vote open) |
| `accent-green` | `#22c55e` | Correct, success |
| `accent-red` | `#ef4444` | Wrong, alert, buzz winner flash |
| `accent-keyword` | `#dc2626` | Crossword column 12 cells |
| `accent-gold` | `#f59e0b` | Scores, highlights |

### Typography
- **Font**: `Be Vietnam Pro` (Google Fonts, Vietnamese diacritics native)
- Heading: `60px / weight 900` — game title, round name
- Question: `36px / weight 700` — question text on projector
- Score/Team: `30px / weight 600` — scoreboard
- Button: `24px / weight 600` — all action buttons
- Caption: `16px / weight 400` — instructions, labels
- Grid cell: `24px / Courier New monospace / weight 700` — crossword letters

### Layout
- Dark `class` mode applied to `<html>` statically (no toggle)
- Host view: 16:9 two-column layout (content left, controls right)
- No decorative elements — every color/size serves game state communication

## Target Directory Structure

```
mln_game/
├── server/
│   ├── src/
│   │   ├── index.ts              # Express + Socket.IO setup, static serving
│   │   ├── sockets.ts            # All socket event handlers
│   │   ├── routes.ts             # REST: GET /api/state, GET /api/data
│   │   └── game/
│   │       ├── game-state.ts     # GameState type + initialState() factory
│   │       ├── game-engine.ts    # All state transitions (pure functions)
│   │       ├── buzz-lock.ts      # First-wins mutex for buzz-in
│   │       ├── scorer.ts         # Score computation
│   │       └── game-data.ts      # Migrated content from CSVs
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx               # Role routing (?role=host → HostView)
│   │   ├── context/
│   │   │   └── socket-context.tsx
│   │   ├── hooks/
│   │   │   ├── use-socket.ts
│   │   │   ├── use-interval.ts
│   │   │   ├── use-host-keyboard.ts
│   │   │   └── use-sound-effects.ts
│   │   ├── views/
│   │   │   ├── host-view.tsx
│   │   │   └── player-view.tsx   # Wired but minimal for v1
│   │   ├── components/
│   │   │   ├── crossword-grid.tsx
│   │   │   ├── image-slice-reveal.tsx
│   │   │   ├── countdown-timer.tsx
│   │   │   ├── score-bar.tsx
│   │   │   ├── host-sidebar.tsx
│   │   │   ├── game1-host-panel.tsx
│   │   │   └── game2-host-panel.tsx
│   │   └── types/
│   │       └── shared.ts         # GameState + socket event types (imported by server too)
│   ├── public/
│   │   └── images/
│   │       ├── round1-dien-bien-phu.jpg
│   │       └── round2-cuu-tro-lu.jpg
│   │   # sounds/ deferred to v2
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   └── tsconfig.json
├── assets/                       # Source data (CSVs, original images)
├── old_ver/                      # Archived Python/Streamlit code
├── docs/
├── plans/
└── package.json                  # Root workspace + concurrently scripts
```

## Teams (fixed)
`["Nhóm 1", "Nhóm 2", "Nhóm 3", "Nhóm 4", "Nhóm 6"]` — note skip of Nhóm 5

## Phases

| Phase | Name | Status | Effort |
|-------|------|--------|--------|
| 1 | [Foundation](./phase-01-foundation.md) | Pending | ~1d |
| 2 | [Game 1 — Crossword](./phase-02-game1-crossword.md) | Pending | ~1d |
| 3 | [Game 2 — Image Reveal](./phase-03-game2-imagereveal.md) | Pending | ~1d |
| 4 | [Polish Features](./phase-04-polish-features.md) | Pending | ~0.5d |
| 5 | [Summary / Infographic Page](./phase-05-summary-page.md) | Pending | ~0.5d |

## Key Decisions (locked)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State sync | Full GameState broadcast on every event | Simpler; fine for 30 clients (200 bytes × 30 = negligible) |
| Timer storage | Server GameState fields (g1_timer_seconds, g2_timer_seconds) | Future-proofs phone player countdown display |
| Timer authority | Client timer for UI; server enforces gate closure | UX responsiveness + cheat prevention |
| Crossword cells | CSS Grid, not HTML table | Cleaner stagger animation, 2D layout semantics |
| Canvas | requestAnimationFrame slide-in, 400ms per slice | Game-show feel on projector |
| Audio | **Deferred to v2** | Removes pre-class mp3 sourcing friction for teacher |
| Keyboard | useEffect + keydown + isComposing guard | F1/F2/F3/Escape — safe with Vietnamese IME |
| Score bars | CSS transitions only, no animation library | 60fps, zero JS overhead |
| Typography | +15-20% over standard scale, be-vietnam-pro | Projector contrast loss compensation |
| Tailwind | v3 (darkMode: "class", tailwind.config.ts) | Stable, well-documented for complex dark themes |
| Routing | React Router v6 (react-router-dom) | Clean pathname routing for /summary; handles history API |
| Vote input v1 | ManualVotePanel — host clicks team answers | Keeps vote tracking architecture; host enters on behalf of students |

## Dependencies

None — greenfield build.

## Validation Log

### Session 1 — 2026-06-04
**Trigger:** Pre-implementation validation interview
**Questions asked:** 6

#### Questions & Answers

1. **[Architecture]** Tailwind v3 or v4? (plan config vs research plugin mismatch)
   - Options: v3 (tailwind.config.ts) | v4 (CSS-first)
   - **Answer:** Tailwind v3
   - **Rationale:** v4 requires complete config rewrite; v3 is stable and matches plan as written.

2. **[Architecture]** Timer seconds in server GameState or client-local only?
   - Options: Client-local React state | Server GameState fields
   - **Answer:** Server GameState fields
   - **Rationale:** Future-proofs phone player countdown display when player views are added.

3. **[Scope]** ManualVotePanel needed for v1 or skip vote tracking?
   - Options: Keep ManualVotePanel | Skip vote tracking
   - **Answer:** Keep ManualVotePanel
   - **Rationale:** Preserves vote-tracking architecture; host enters votes on behalf of students who raise hands.

4. **[Scope]** Sound effects in v1 or defer?
   - Options: v1 deliverable | Defer to v2
   - **Answer:** Defer to v2
   - **Rationale:** Eliminates pre-class mp3 sourcing dependency; code architecture documented for v2 implementation.

5. **[Scope]** Summary page — keep last or move to Phase 2?
   - Options: Keep last | Move to Phase 2
   - **Answer:** Keep last (after full game works)
   - **Rationale:** Validate game in real classroom first; avoid throwaway work on summary page.

6. **[Architecture]** /summary routing — simple pathname check or React Router v6?
   - Options: Simple pathname check | React Router v6
   - **Answer:** React Router v6
   - **Rationale:** Cleaner URL routing; handles browser history API; `useSearchParams` replaces manual `?role=` parsing.

#### Confirmed Decisions
- Tailwind v3 locked — `tailwind.config.ts` syntax valid as written
- Timer in server GameState — adds `g1_timer_seconds`, `g2_timer_seconds` fields
- ManualVotePanel kept — `host:set_vote` event + component in Phase 3
- Sound effects deferred — Phase 4 has 3 features (not 4); v2 note added to risk section
- Phase order unchanged — summary stays Phase 5
- React Router v6 — `react-router-dom` added to Phase 5 deps; App.tsx routing updated

#### Action Items
- [x] Phase 4: remove sound effects (useSoundEffects hook, related steps, success criteria)
- [x] Phase 5: replace pathname check with React Router v6 routing
- [x] plan.md: update Key Decisions table, remove sounds/ from directory structure

#### Impact on Phases
- Phase 4: sound effects removed; 3 features remain (timer, keyboard, score bars)
- Phase 5: React Router v6 added; `react-router-dom` dep; App.tsx uses `<BrowserRouter>` + `<Routes>`
- Phase 1: note that `react-router-dom` install happens here or in Phase 5 (Phase 5 owns it)

### Verification Results
- **Tier:** Full (5 phases)
- **Claims checked:** 12
- **Verified:** 12 | **Failed:** 0 | **Unverified:** 0
- Assets, CSVs, docs all confirmed present and correctly named

### Whole-Plan Consistency Sweep
- Files reread: plan.md, phase-01 through phase-05
- Decision deltas checked: 6
- Reconciled stale references: sounds/ directory removed from plan.md; Phase 4 overview/requirements/files/steps/criteria updated; Phase 5 routing updated throughout
- Unresolved contradictions: 0
