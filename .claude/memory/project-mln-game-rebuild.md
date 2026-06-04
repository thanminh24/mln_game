---
name: project-mln-game-rebuild
description: "Core context for the MLN111 philosophy classroom game web rebuild — current state, validated tech stack, plan location, all artifacts produced"
metadata: 
  node_type: memory
  type: project
  originSessionId: 78c02ccb-aee2-4666-8c81-6ed4c86f4124
---

Original app is a Streamlit + Ngrok classroom game for Vietnamese university course MLN111 (Marxist-Leninist Philosophy). Theme: "Tồn tại xã hội & Ý thức xã hội — Lòng yêu nước Việt Nam."

**Two game modes:**
- Game 1 (Ô Chữ): 7-row crossword buzzer. Teams buzz in to answer philosophy vocab questions. Correct answers reveal letters. Vertical keyword at column 12 spells "YÊU NƯỚC" — worth 30 pts, ends game.
- Game 2 (Lật Tranh): 2 rounds × 5 MCQ. Each correct answer reveals one vertical slice of a mystery image (Điện Biên Phủ, flood relief). All correct teams +20 pts per question.

**Teams:** Nhóm 1, Nhóm 2, Nhóm 3, Nhóm 4, Nhóm 6 (5 teams, skip Nhóm 5).

---

## Current Status (2026-06-04)

**Old Python/Streamlit code archived to `old_ver/`.** Root is clean. Build has not started yet.

**Plan fully written and validated:** `plans/260604-1424-mln-game-web-rebuild/`
- plan.md + 5 phase files, all detailed with architecture, steps, success criteria
- Validation session 1 completed — 6 questions answered, 0 contradictions

**Next action:** `/ck:cook d:/Project/mln_game/plans/260604-1424-mln-game-web-rebuild/plan.md`

---

## Agreed Stack (validated 2026-06-04)

- **Backend:** Node.js 20 + TypeScript + Express + Socket.IO 4
- **Frontend:** React 18 + TypeScript + **Tailwind CSS v3** + Vite
- **Router:** React Router v6 (`react-router-dom`) — `/` game view, `/summary` infographic
- **State:** In-memory on server (no DB for v1); full GameState broadcast on every event
- **Image reveal:** Canvas API in browser (requestAnimationFrame, 400ms slide-in per slice)
- **Monorepo:** `server/` + `client/` with npm workspaces + concurrently
- **Font:** Be Vietnam Pro (Google Fonts, Vietnamese diacritics native)
- **Port:** 3000

**v1 scope: Host-only projector control panel.** Player phone views (buzz-in, vote via phone) are architecturally wired but not the focus — students engage verbally/physically in class. Architecture supports adding phone players later without structural changes.

---

## Validated Key Decisions

| Decision | Choice |
|----------|--------|
| Tailwind version | v3 — `tailwind.config.ts` syntax |
| Timer storage | Server GameState fields (g1/g2_timer_seconds) — future-proofs phone player countdown |
| Timer authority | Client timer for UI; server enforces gate closure |
| Vote input v1 | ManualVotePanel — host clicks A/B/C/D per team on projector |
| Sound effects | **Deferred to v2** — removes pre-class mp3 sourcing friction |
| Routing | React Router v6 — clean pathname routing |
| Crossword cells | CSS Grid 35×7, CSS stagger animation 50ms, Courier New monospace |
| Canvas | requestAnimationFrame slide-in, DPR-safe, switch to `<img>` after full reveal |
| Keyboard shortcuts | F1/F2/F3/F4/Escape — safe with Vietnamese IME via `event.isComposing` guard |
| Score bars | CSS transitions only (no library) |
| Scoring | Row correct +10, keyword +30 (ends Game 1); MCQ correct +20 per team |

---

## Extracted Assets

- `assets/game1-questions.csv` — 7 crossword rows (word_ascii, col_offset, question, answer_display)
- `assets/game2-questions.csv` — 10 MCQ questions (2 rounds × 5, all options, correct answer, explanation)
- `assets/images/round1-dien-bien-phu.jpg` — Battle of Điện Biên Phủ (round 1 reveal image)
- `assets/images/round2-cuu-tro-lu.jpg` — Flood relief solidarity (round 2 reveal image)

---

## All Artifacts Produced

**Session 2026-06-03:**
- `docs/codebase-summary.md` — file-by-file analysis, state schema, all game mechanics
- `docs/project-overview-pdr.md` — functional + non-functional requirements
- `docs/system-architecture.md` — component tree, Socket.IO event reference, target dir structure
- `plans/reports/deep-codebase-analysis-mln-game-web-rebuild-260603-2328.md`
- `plans/reports/platform-feasibility-kahoot-quizizz-alternatives-260603-2336-report.md`
- `plans/reports/ui-mechanics-impl-research-260603-2341-full-design-report.md` — ALL pages wireframed

**Session 2026-06-04:**
- `plans/reports/researcher-260604-1432-dark-ui-audio-keyboard-tech-report.md` — design language, audio, keyboard
- `plans/reports/researcher-260604-1433-architecture-tech-stack-report.md` — monorepo, Socket.IO, Canvas, timer, grid
- `plans/260604-1424-mln-game-web-rebuild/plan.md` — overview, design language spec, dir structure, decisions
- `plans/260604-1424-mln-game-web-rebuild/phase-01-foundation.md` — monorepo setup, server, game engine, React shell
- `plans/260604-1424-mln-game-web-rebuild/phase-02-game1-crossword.md` — CrosswordGrid, buzz system, judge panel
- `plans/260604-1424-mln-game-web-rebuild/phase-03-game2-imagereveal.md` — Canvas reveal, ManualVotePanel, rounds
- `plans/260604-1424-mln-game-web-rebuild/phase-04-polish-features.md` — countdown timer, F-key shortcuts, score bars
- `plans/260604-1424-mln-game-web-rebuild/phase-05-summary-page.md` — /summary infographic landing page

---

## Open Questions Resolved

1. ~~Crossword: ASCII or Vietnamese diacritics?~~ → ASCII (data.py already uses ASCII words; display as-is)
2. ~~Sound effects?~~ → Deferred to v2
3. ~~Subtle red border hint on col 12?~~ → Implement as option (noted in crossword grid design)
4. ~~Scores persist Game 1 ↔ Game 2?~~ → Yes — scores are in shared GameState, mode switch preserves them
5. ~~"Early reveal" — skip questions or just show image?~~ → Just show image (sets g2_done=true, skips scoring remaining questions)

## GitHub repo
https://github.com/thanminh24/mln_game.git (branch: main)

**Why:** Socket.IO push eliminates 1s polling flicker; Canvas eliminates server-side Pillow; single server simplifies classroom deployment; Node.js single-thread = natural buzz-in mutex.
