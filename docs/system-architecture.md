# System Architecture — Host-Only MLN111 Crossword

## Overview

```
Host browser / projector
        │
        │ Socket.IO
        ▼
Node.js + Express + in-memory GameState
        │
        ├─ GET /api/state
        ├─ GET /api/data
        └─ Socket events for row selection, answer choice, reset, keyword solve
```

The app intentionally has one role and one game. The host acts as the player by selecting questions and answer options on the projector screen.

## Frontend

```
App
├── /                  → SocketProvider + HostView
├── /summary           → SummaryPage
└── HostView
    └── CrosswordGamePanel
        ├── header      → title, score, keyword, reset
        ├── CrosswordGrid → left board on desktop, top board on smaller screens
        └── MCQ panel    → prompt image, question, 2×2 answers, row picker, keyword action
```

## Backend

```
server/src/index.ts
├── createRouter(getState)
├── registerSocketHandlers(io, getState, setState)
└── in-memory GameState

server/src/game/game-engine.ts
├── selectQuestion(state, idx)
├── chooseAnswer(state, optionId)
├── solveKeyword(state)
└── resetGame()
```

## Answer Flow

```
Host selects row
  → game:select_row { idx }
  → server stores current row and clears attempts
  → game:state

Host chooses option
  → game:choose_option { optionId }
  → server checks against row.correctOptionId
    → correct: open row, reveal answer, +10
    → wrong #1/#2: mark option as wrong
    → wrong #3: mark wrong, reveal correct answer, open row
  → game:state
```

## Keyword Flow

```
Host clicks "Tôi đã đoán ra từ khóa"
  → game:solve_keyword
  → server opens all rows, marks keyword solved, +30
  → game:state
  → host can open /summary
```

## Data Model

Each row includes:

```ts
{
  answerAscii: string;
  wordLength: number;
  colOffset: number;
  questionText: string;
  answerText: string;
  correctOptionId: string;
  options: { id: string; text: string }[];
  promptImage?: string;
  explanation: string;
}
```

The visible keyword is `LÒNG YÊU NƯỚC`. Grid alignment uses `KEYWORD_ASCII = "LONGYEUNUOC"` so each row can be verified with `answerAscii[KEYWORD_COL - colOffset]`.

## Deployment

In production, Express serves the built React client and hosts Socket.IO on the same origin.

## Unresolved Questions

- None for architecture.
