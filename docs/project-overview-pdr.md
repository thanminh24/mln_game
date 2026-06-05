# Project Overview & PDR — MLN111 Host-Only Crossword

## Purpose

Build a single-screen MLN111 classroom game for a host/projector setup.
The game is now **host-only**: no student phone player side, no team buzz, no image-reveal mode.

The experience centers on one crossword:
- Horizontal rows recap the dialectical relationship between social being and social consciousness.
- The vertical keyword reveals `LÒNG YÊU NƯỚC`.
- The final summary connects the keyword to a case study about patriotism.

## User Role

| Role | Device | Responsibility |
|------|--------|----------------|
| Host / individual player | Laptop/projector | Select rows, choose answers, reveal keyword, open summary |

## Game Mechanics

1. Host selects an unopened horizontal row.
2. App displays the full question and four answer options.
3. Host chooses an option.
4. Wrong options are marked and disabled.
5. After 3 wrong attempts, the app reveals the correct answer and opens the row.
6. Correct answer opens the row and awards 10 points.
7. After at least 2 rows, host can solve the vertical keyword.
8. Solving the keyword opens all rows and awards 30 points.
9. Summary page explains the patriotism case study.

## Functional Requirements

- Render an 11-row crossword grid with aligned vertical keyword column.
- Support full text question + options for each row.
- Support prompt images on selected rows via `promptImage`.
- Track wrong answers for the current row.
- Reveal correct answer automatically after 3 wrong attempts.
- Track solo score.
- Provide reset confirmation.
- Provide summary route `/summary`.

## Out Of Scope

- Player phone view.
- Team scoreboard.
- Buzz-in mechanics.
- Image reveal game.
- Multi-room sessions.
- Question editing UI.

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS.
- Backend: Node.js, Express, Socket.IO.
- State: in-memory server state.
- Deployment: single Node server serving React build in production.

## Unresolved Questions

- None.
