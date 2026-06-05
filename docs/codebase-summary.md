# MLN Game Full — Codebase Summary

## Current State

The project is a host-only React + Node web app for a single MLN111 crossword game.
Legacy Streamlit, image-reveal, and player surfaces have been pruned from the active app.
Current content uses 11 horizontal rows, visible keyword `LÒNG YÊU NƯỚC`, ASCII grid key `LONGYEUNUOC`, and five prompt images served from `client/public/images/`.

## Main Files

```
client/src/App.tsx                         # Routes / and /summary
client/src/views/host-view.tsx             # Projector host shell
client/src/views/summary-page.tsx          # Final case-study summary
client/src/components/crossword-game-panel.tsx # Main game screen, MCQ, progress, reset
client/src/components/crossword-grid.tsx   # Grid renderer
client/src/components/dialectic-diagram.tsx # Final summary SVG diagram
client/src/data/game-data.ts               # Client question/options content
client/src/types/shared.ts                 # Socket/state contract
server/src/index.ts                        # Express + Socket.IO server
server/src/sockets.ts                      # Socket event handlers
server/src/routes.ts                       # REST state/data routes
server/src/game/game-engine.ts             # State transitions
server/src/game/game-state.ts              # Initial in-memory state
server/src/game/game-data.ts               # Server question/options content
server/src/types/shared.ts                 # Server socket/state contract
```

## State Shape

```ts
interface GameState {
  openedRows: number[];
  activeRow: number | null;
  wrongOptionIds: string[];
  answerRevealed: boolean;
  keywordSolved: boolean;
  score: number;
}
```

## Socket Events

| Event | Purpose |
|-------|---------|
| `game:request_state` | Client asks for current state |
| `game:reset` | Reset full game |
| `game:select_row` | Select horizontal row |
| `game:choose_option` | Choose answer option for current row |
| `game:solve_keyword` | Reveal vertical keyword and finish game |
| `game:state` | Server broadcasts full state |

## Scoring

- Correct horizontal answer: +10.
- Solving vertical keyword: +30.
- Wrong answers do not subtract points.
- Third wrong answer reveals correct answer and opens the row.

## Current UI

- Projector-oriented black background with white text and yellow accent.
- Desktop game screen splits crossword grid left and MCQ panel right.
- Smaller screens stack the grid and MCQ panel without horizontal scrolling.
- Prompt images appear in the MCQ panel for rows 1, 2, 5, 7, and 10.

## Removed Surfaces

- Player route and player view.
- Team scoreboard.
- Sidebar and shortcut-helper components.
- Buzz lock and buzz events.
- Game 2 image reveal UI and state.
- Vote gate/manual vote mechanics.

## Unresolved Questions

- None.
