---
phase: 1
title: "Foundation"
status: pending
priority: P1
effort: "~1d"
dependencies: []
---

# Phase 1: Foundation

## Overview
Scaffold the monorepo, wire up Express + Socket.IO server, define shared TypeScript types, implement the full game engine (state + transitions), and build the React shell with role routing and SocketContext. End state: server runs, client connects, state broadcasts on events — no game UI yet.

## Requirements
- Functional: Server starts on PORT=3000; client connects via Socket.IO; `GET /api/state` returns current game state; host reset works; all socket events defined
- Non-functional: TypeScript strict mode throughout; shared types imported by both server and client; `npm run dev` from root starts both concurrently

## Architecture

### Monorepo layout
```
mln_game/
├── package.json           ← root: workspaces + concurrently
├── server/
│   ├── src/
│   │   ├── index.ts       ← Express + Socket.IO + static serving
│   │   ├── sockets.ts     ← all socket event handlers
│   │   ├── routes.ts      ← GET /api/state, GET /api/data, POST /api/reset
│   │   └── game/
│   │       ├── game-state.ts   ← GameState interface + initialState()
│   │       ├── game-engine.ts  ← pure state transition functions
│   │       ├── buzz-lock.ts    ← first-wins mutex
│   │       ├── scorer.ts       ← score computation
│   │       └── game-data.ts    ← migrated content from CSVs
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx             ← role routing via ?role=host
│   │   ├── context/
│   │   │   └── socket-context.tsx
│   │   ├── hooks/
│   │   │   └── use-socket.ts
│   │   └── types/
│   │       └── shared.ts       ← GameState + event maps (imported by server too)
│   ├── public/
│   │   ├── images/
│   │   │   ├── round1-dien-bien-phu.jpg   (copy from assets/images/)
│   │   │   └── round2-cuu-tro-lu.jpg
│   │   └── sounds/              (placeholder mp3s for now)
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── package.json
│   └── tsconfig.json
```

### GameState type (canonical — defined in `client/src/types/shared.ts`)
```typescript
export const TEAMS = ["Nhóm 1", "Nhóm 2", "Nhóm 3", "Nhóm 4", "Nhóm 6"] as const;
export type Team = typeof TEAMS[number];

export interface GameState {
  mode: "game1" | "game2";

  // Game 1 — Crossword
  g1_opened: number[];           // revealed row indices
  g1_current_q: number | null;   // active question index
  g1_buzz_active: boolean;
  g1_buzz_winner: Team | null;
  g1_buzz_type: "row" | "keyword" | null;
  g1_keyword_solved: boolean;

  // Game 2 — Image Reveal
  g2_round: number;              // 0 or 1
  g2_question: number;           // 0–4 within round
  g2_revealed_slices: number[];  // slice indices revealed
  g2_done: boolean;              // round complete flag
  g2_cho_phep_vote: boolean;     // voting gate open
  g2_da_cham_diem: boolean;      // scored for current question

  // Shared
  scores: Record<Team, number>;
  votes: Record<Team, string | null>;
}

// Socket event type maps
export interface ServerToClientEvents {
  "state:update": (state: GameState) => void;
}

export interface ClientToServerEvents {
  "host:switch_mode": (payload: { mode: "game1" | "game2" }) => void;
  "host:reset": () => void;
  "host:select_q": (payload: { idx: number }) => void;
  "host:open_buzz": () => void;
  "host:close_buzz": () => void;
  "host:correct": () => void;
  "host:wrong": () => void;
  "host:open_vote": () => void;
  "host:close_vote": () => void;
  "host:score": () => void;
  "host:next_q": () => void;
  "host:next_round": () => void;
  "host:early_reveal": () => void;
  "player:join": (payload: { team: Team }) => void;
  "player:buzz": (payload: { team: Team; type: "row" | "keyword" }) => void;
  "player:vote": (payload: { team: Team; answer: string }) => void;
  "client:request_state": () => void;
}
```

### Game engine (pure functions, no side effects)
```typescript
// game-engine.ts — each function takes state + payload, returns new state
export function selectQuestion(state: GameState, idx: number): GameState
export function openBuzz(state: GameState): GameState
export function closeBuzz(state: GameState): GameState
export function buzzIn(state: GameState, team: Team, type: "row"|"keyword"): GameState  // first-wins check here
export function markCorrect(state: GameState): GameState
export function markWrong(state: GameState): GameState
export function openVote(state: GameState): GameState
export function closeVote(state: GameState): GameState
export function recordVote(state: GameState, team: Team, answer: string): GameState
export function scoreVotes(state: GameState): GameState
export function advanceQuestion(state: GameState): GameState
export function advanceRound(state: GameState): GameState
export function earlyReveal(state: GameState): GameState
export function switchMode(state: GameState, mode: "game1"|"game2"): GameState
export function resetGame(): GameState  // returns fresh initialState()
```

### Tailwind + design tokens config
```typescript
// tailwind.config.ts
export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { vietnamese: ["Be Vietnam Pro", "sans-serif"] },
      colors: {
        surface: "#1a1a1a",
        border: "#2a2a2a",
        muted: "#888888",
        blue: "#3b82f6",
        green: "#22c55e",
        red: "#ef4444",
        keyword: "#dc2626",
        gold: "#f59e0b",
      },
      fontSize: {
        // Projector-compensated scale (+15-20%)
        "game-xl": ["4.5rem", { lineHeight: "1.1" }],  // 72px heading
        "game-lg": ["2.7rem", { lineHeight: "1.2" }],  // 43px question
        "game-md": ["2.2rem", { lineHeight: "1.3" }],  // 35px score
        "game-sm": ["1.8rem", { lineHeight: "1.4" }],  // 29px button
      },
    },
  },
};
```

## Related Code Files
- Create: `package.json` (root)
- Create: `server/package.json`, `server/tsconfig.json`
- Create: `server/src/index.ts`, `server/src/sockets.ts`, `server/src/routes.ts`
- Create: `server/src/game/game-state.ts`, `game-engine.ts`, `buzz-lock.ts`, `scorer.ts`, `game-data.ts`
- Create: `client/package.json`, `client/tsconfig.json`, `client/vite.config.ts`, `client/tailwind.config.ts`
- Create: `client/src/main.tsx`, `client/src/App.tsx`
- Create: `client/src/context/socket-context.tsx`
- Create: `client/src/hooks/use-socket.ts`
- Create: `client/src/types/shared.ts`
- Copy: `assets/images/*.jpg` → `client/public/images/`

## Implementation Steps

1. **Init root workspace**
   - Create root `package.json` with `"workspaces": ["server", "client"]`
   - Add `concurrently` as root devDependency
   - Scripts: `"dev": "concurrently \"npm run dev -w server\" \"npm run dev -w client\""`, `"build": "npm run build -w client && npm run build -w server"`, `"start": "node server/dist/index.js"`

2. **Init server package**
   - `cd server && npm init` — deps: `express`, `socket.io`, `cors`; devDeps: `typescript`, `ts-node-dev`, `@types/express`, `@types/node`
   - `tsconfig.json`: target ES2020, module CommonJS, outDir `./dist`, rootDir `./src`, strict true
   - Script: `"dev": "ts-node-dev --respawn src/index.ts"`, `"build": "tsc"`

3. **Init client package**
   - `cd client && npm create vite@latest . -- --template react-ts`
   - Add deps: `socket.io-client`; devDeps: `tailwindcss`, `postcss`, `autoprefixer`, `@tailwindcss/vite`
   - Configure `tailwind.config.ts` with design tokens above
   - Add `@import url(...)` for Be Vietnam Pro in `src/index.css`
   - Add `dark` class to `<html>` in `index.html`
   - Add `bg-[#0f0f0f] text-white font-vietnamese min-h-screen` to root div

4. **Vite proxy config** (`client/vite.config.ts`)
   ```typescript
   server: {
     proxy: {
       "/socket.io": { target: "ws://localhost:3000", ws: true, changeOrigin: true },
       "/api": { target: "http://localhost:3000", changeOrigin: true },
     }
   }
   ```

5. **Define shared types** (`client/src/types/shared.ts`)
   - Paste GameState interface and event maps from Architecture section above
   - Export TEAMS constant

6. **Implement game-data.ts** — migrate all content from `assets/game1-questions.csv` and `assets/game2-questions.csv` into typed TS arrays (G1_DATA, G2_DATA)

7. **Implement game-state.ts** — `initialState(): GameState` factory, all fields zeroed/nulled, scores all 0

8. **Implement buzz-lock.ts** — simple boolean flag `let locked = false; tryAcquire(team): boolean` — Node.js single-thread guarantees atomicity

9. **Implement game-engine.ts** — pure functions as listed above; `buzzIn` checks `state.g1_buzz_winner === null` before setting winner

10. **Implement scorer.ts** — `scoreCorrectBuzz(state): GameState` (+10 or +30); `scoreVotes(state): GameState` (each correct team +20)

11. **Implement server/src/index.ts**
    - Express app + http.createServer + Socket.IO Server
    - Dev: serve nothing from Express (Vite handles client)
    - Prod: `app.use(express.static(path.join(__dirname, "../../client/dist")))` + SPA fallback
    - `httpServer.listen(process.env.PORT || 3000)`

12. **Implement sockets.ts** — one handler per ClientToServerEvents event, each calls game-engine function then `io.emit("state:update", state)`; send state on connect

13. **Implement routes.ts** — `GET /api/state` returns current state; `GET /api/data` returns G1_DATA + G2_DATA

14. **Implement SocketContext** (`client/src/context/socket-context.tsx`)
    - Create socket once on mount, reconnect config, send `client:request_state` on connect
    - Context value: `{ socket, state }` where state is updated on every `state:update` event

15. **Implement use-socket.ts** — typed wrapper exposing `emit`, `state`, socket ref

16. **Implement App.tsx** — read `?role` query param; render `<HostView />` or `<PlayerView />` (PlayerView = placeholder div for now)

17. **Copy images** from `assets/images/` to `client/public/images/`

18. **Smoke test**: `npm run dev` → open `localhost:5173/?role=host` → browser console shows "Socket connected" + initial state logged

## Success Criteria
- [ ] `npm run dev` from root starts both server (:3000) and client (:5173) with one command
- [ ] Browser at `localhost:5173/?role=host` shows blank dark page, no console errors
- [ ] Socket.IO connects: server logs "client connected", client logs "state:update" with initial state
- [ ] `GET /api/state` returns valid JSON GameState
- [ ] TypeScript strict compiles both server and client with zero errors
- [ ] All game engine functions have unit-testable pure signatures (no I/O)

## Risk Assessment
- **Vite proxy WS not set**: Socket.IO silently fails to connect. Mitigation: add `ws: true` to proxy config (Step 4).
- **Shared types import path**: Server importing from `../client/src/types/shared` may be fragile. Mitigation: use npm workspaces or a simple relative import; verify in tsconfig paths.
- **Port 3000 conflict**: SkinSunny may use 3000. Mitigation: `.env` with `PORT=3000`; check `netstat` on deployment machine first.
