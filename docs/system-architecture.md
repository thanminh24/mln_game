# System Architecture — MLN Game Web Rebuild

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                                                             │
│  ┌─────────────────┐          ┌──────────────────────────┐  │
│  │   Host Browser  │          │   Player Browser (Phone) │  │
│  │  (Projector PC) │          │   up to 30 concurrent    │  │
│  │                 │          │                          │  │
│  │  React + TS     │          │  React + TS              │  │
│  │  Host Panel     │          │  Player Panel            │  │
│  │  Crossword Grid │          │  Buzz Button             │  │
│  │  Image Viewer   │          │  A/B/C/D Choices         │  │
│  │  Scoreboard     │          │  Status Feedback         │  │
│  └────────┬────────┘          └──────────┬───────────────┘  │
│           │ Socket.IO WS                  │ Socket.IO WS     │
└───────────┼───────────────────────────────┼─────────────────┘
            │                               │
┌───────────┼───────────────────────────────┼─────────────────┐
│           │         SERVER LAYER          │                  │
│           └──────────────┬────────────────┘                  │
│                          │                                   │
│              ┌───────────▼────────────┐                      │
│              │   Node.js + Express    │                      │
│              │   + Socket.IO server   │                      │
│              │                        │                      │
│              │  Routes:               │                      │
│              │   GET /               │ → serve React SPA    │
│              │   GET /api/state      │ → current game state │
│              │   POST /api/reset     │ → reset game         │
│              │                        │                      │
│              │  Socket events:        │                      │
│              │   host:select_q       │ host picks question  │
│              │   host:open_buzz      │ host opens buzzer    │
│              │   host:close_buzz     │                      │
│              │   host:correct        │ mark answer correct  │
│              │   host:wrong          │ mark answer wrong    │
│              │   host:open_vote      │ open voting gate     │
│              │   host:close_vote     │ close voting gate    │
│              │   host:score          │ trigger scoring      │
│              │   host:next_q         │ advance question     │
│              │   host:next_round     │ advance round        │
│              │   host:switch_mode    │ game1 ↔ game2        │
│              │   player:join         │ team registration    │
│              │   player:buzz         │ buzz-in              │
│              │   player:vote         │ submit answer        │
│              │   → state:update      │ broadcast to all     │
│              │                        │                      │
│              │  Game Engine:          │                      │
│              │   GameState (in-mem)  │                      │
│              │   BuzzLock (mutex)    │                      │
│              │   Scorer              │                      │
│              └───────────────────────┘                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Buzz-In (Game 1)

```
Player taps buzz button
  → emit("player:buzz", { team, type: "row" | "keyword" })
  → Server: acquire BuzzLock
    → if lock free: record winner, release lock, broadcast state:update
    → if locked: discard (race condition protection)
  → All clients receive state:update
    → Winner's phone: "You got it! Answer out loud."
    → Others' phones: "Team X is answering..."
    → Host screen: red alert + winner name + confirm/reject buttons
Host taps ✅ Correct
  → emit("host:correct")
  → Server: +10pts (or +30 for keyword), reveal row/keyword flag
  → broadcast state:update
Host taps ❌ Wrong
  → emit("host:wrong")
  → Server: clear buzz winner, reopen buzzer
  → broadcast state:update
```

---

## Data Flow: Voting (Game 2)

```
Host opens vote gate
  → emit("host:open_vote")
  → Server: cho_phep_vote = true, broadcast state:update
  → All phones show A/B/C/D buttons

Player selects answer
  → emit("player:vote", { team, answer: "A" | "B" | "C" | "D" })
  → Server: record vote, broadcast state:update
  → Host sees live vote status per team

Host closes gate + scores
  → emit("host:score")
  → Server: check each vote vs correct answer
    → correct teams: +20pts each
    → if any correct: reveal image slice (append index to g2_manh_mo)
    → da_cham_diem = true
  → broadcast state:update
  → Host sees slice appear on image, correct/wrong per team
```

---

## Frontend Component Tree

```
App
├── HostView (role=host)
│   ├── Sidebar
│   │   ├── ModeSwitch (Game 1 / Game 2)
│   │   ├── ResetButton
│   │   └── RefreshButton
│   ├── Game1HostPanel
│   │   ├── CrosswordGrid          ← HTML table, 35 cols × 7 rows
│   │   ├── QuestionSelector       ← Dropdown of unopened rows
│   │   ├── BuzzControl            ← Open/close/lock buzzer
│   │   ├── BuzzAlert              ← Red flash when team buzzes
│   │   ├── JudgePanel             ← ✅/❌ buttons
│   │   └── Scoreboard             ← Bar chart
│   └── Game2HostPanel
│       ├── ImageReveal            ← Canvas-based slice compositor
│       ├── QuestionDisplay        ← Question + A/B/C/D options
│       ├── VoteGate               ← Open/close voting
│       ├── VoteStatus             ← Per-team submission status
│       ├── ScoreButton            ← Trigger scoring
│       └── Scoreboard
│
└── PlayerView (role=player)
    ├── TeamSelect                 ← First load only
    ├── Game1PlayerPanel
    │   ├── KeywordBuzzButton      ← Always visible
    │   ├── RowBuzzButton          ← Only when buzz_active
    │   ├── BuzzWonScreen          ← "You got it!"
    │   └── BuzzLostScreen         ← "Team X is answering"
    └── Game2PlayerPanel
        ├── WaitingScreen          ← Voting gate closed
        ├── VoteButtons            ← A / B / C / D
        └── AnswerConfirmed        ← "You chose X" + change option
```

---

## Server State Model

```typescript
interface GameState {
  mode: "game1" | "game2";

  // Game 1
  g1_opened: number[];
  g1_current_q: number | null;
  g1_buzz_active: boolean;
  g1_buzz_winner: string | null;
  g1_buzz_type: "row" | "keyword" | null;
  g1_keyword_solved: boolean;

  // Game 2
  g2_vong: number;
  g2_cau: number;
  g2_manh_mo: number[];
  g2_done: boolean;

  // Shared
  diem_so: Record<string, number>;
  trang_thai_vote: Record<string, string | null>;
  cho_phep_vote: boolean;
  da_cham_diem: boolean;
}
```

---

## Real-Time: Socket.IO Event Reference

### Client → Server (Host)
| Event | Payload | Effect |
|-------|---------|--------|
| `host:switch_mode` | `{ mode }` | switch game1/game2 |
| `host:reset` | — | full state reset |
| `host:select_q` | `{ idx }` | set g1_current_q |
| `host:open_buzz` | — | g1_buzz_active = true |
| `host:close_buzz` | — | g1_buzz_active = false |
| `host:correct` | — | score + reveal based on buzz type |
| `host:wrong` | — | clear winner, reopen if row |
| `host:open_vote` | — | cho_phep_vote = true |
| `host:close_vote` | — | cho_phep_vote = false |
| `host:score` | — | score votes, reveal slice |
| `host:next_q` | — | g2_cau++ |
| `host:next_round` | — | g2_vong++, reset cau/manh_mo/done |
| `host:early_reveal` | — | g2_done = true |

### Client → Server (Player)
| Event | Payload | Effect |
|-------|---------|--------|
| `player:join` | `{ team }` | register team (idempotent) |
| `player:buzz` | `{ team, type }` | first-wins buzz lock |
| `player:vote` | `{ team, answer }` | record vote if gate open |

### Server → All Clients
| Event | Payload |
|-------|---------|
| `state:update` | full `GameState` object |

---

## Image Slice Rendering (Frontend)

Replace Pillow server-side compositing with **Canvas API** in browser:

```typescript
// Load full image, draw only revealed slices
function drawRevealedImage(canvas, imgSrc, revealedIndices, totalSlices) {
  const img = new Image();
  img.onload = () => {
    const ctx = canvas.getContext("2d");
    const sliceW = img.width / totalSlices;
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const i of revealedIndices) {
      ctx.drawImage(img, i * sliceW, 0, sliceW, img.height,
                        i * sliceW, 0, sliceW, img.height);
    }
  };
  img.src = imgSrc;
}
```

This eliminates server-side image processing entirely.

---

## Deployment

```
Single server (Node.js):
  - Serves React build as static files (Express static middleware)
  - Handles Socket.IO on same port (no CORS complexity)
  - PORT env var for flexibility

Recommended platforms:
  - Railway (free tier adequate for classroom scale)
  - Fly.io
  - Any VPS with Node.js

No database required for v1 — in-memory state sufficient.
```

---

## Directory Structure (Target)

```
mln-game/
├── server/
│   ├── index.ts          # Express + Socket.IO setup
│   ├── game-state.ts     # GameState type + initial state factory
│   ├── game-engine.ts    # All game logic (buzz, score, advance)
│   └── game-data.ts      # Migrated content from data.py
├── client/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── views/
│   │   │   ├── HostView.tsx
│   │   │   └── PlayerView.tsx
│   │   ├── components/
│   │   │   ├── CrosswordGrid.tsx
│   │   │   ├── ImageReveal.tsx
│   │   │   ├── Scoreboard.tsx
│   │   │   ├── BuzzButton.tsx
│   │   │   └── VoteButtons.tsx
│   │   ├── hooks/
│   │   │   └── useGameSocket.ts   # Socket.IO connection + state sync
│   │   └── types/
│   │       └── game.ts            # Shared TypeScript types
│   └── public/
│       └── images/                # Game images (static)
├── package.json
└── tsconfig.json
```
