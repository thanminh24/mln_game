---
name: project-mln-game-rebuild
description: "Core context for the MLN111 philosophy classroom game web rebuild — what it is, what we're building, agreed tech stack, and all docs produced"
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

**Goal:** Rebuild as a proper web app — no Streamlit, no Ngrok, deployable to Railway or Fly.io.

**Agreed stack:**
- Backend: Node.js 20 + TypeScript + Express + Socket.IO 4
- Frontend: React 18 + TypeScript + Tailwind CSS + Vite
- State: in-memory on server (no DB needed for v1)
- Image slicing: Canvas API in browser (replaces Pillow)
- Single monorepo: server/ + client/
- Font: Be Vietnam Pro (Google Fonts, designed for Vietnamese)

**GitHub repo:** https://github.com/thanminh24/mln_game.git (branch: main)

**Platform research result (2026-06-03):** Kahoot, Quizizz, Gimkit, Blooket, Mentimeter, Slido, Wordwall, Nearpod, Factile, Classtools, Genially all checked — none support both game mechanics + Vietnamese. Custom build confirmed necessary.

**All docs produced (2026-06-03):**
- docs/codebase-summary.md — file-by-file analysis, state schema, all game mechanics
- docs/project-overview-pdr.md — functional + non-functional requirements
- docs/system-architecture.md — component tree, Socket.IO event reference, target dir structure
- plans/reports/deep-codebase-analysis-mln-game-web-rebuild-260603-2328.md — master analysis: state machines, content inventory, scoring math, 4 phases, bugs
- plans/reports/platform-feasibility-kahoot-quizizz-alternatives-260603-2336-report.md — platform survey results
- plans/reports/ui-mechanics-impl-research-260603-2341-full-design-report.md — ALL UI pages wireframed, ALL mechanics with code, question editing guide, 5 open questions

**Open questions before building:**
1. Crossword: ASCII letters or Unicode Vietnamese diacritics in cells?
2. Sound effects (buzz ding, correct/wrong)?
3. Subtle red border hint on unrevealed column 12 cells?
4. Confirm scores persist when switching Game 1 ↔ Game 2?
5. "Early reveal" — skip remaining questions or just show image?

**Why:** Socket.IO push eliminates 1s polling flicker; Canvas eliminates server-side Pillow; single server simplifies classroom deployment; Node.js single-thread queuing is natural buzz-in mutex.

**How to apply:** Read docs/ before any implementation. Game data in data.py → migrate to server/game-data.ts. UI research report has all wireframes + full engine code ready to copy.
