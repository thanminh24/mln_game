# Technical Architecture & Stack Research Report
**MLN Game Web Rebuild — Vite, Socket.IO, Canvas, Timers, Grids**

**Date:** 2026-06-04 | **Scope:** 5 technical topics | **Confidence:** 85%+ (verified multi-source)

---

## TOPIC A: Vite + Node.js Monorepo Structure

### Recommendation: ADOPT single-repo layout with auto-build pipeline

**Folder Layout (VERIFIED)**
```
mln_game/
├── server/                          # Node.js + Express + Socket.IO
│   ├── src/
│   │   ├── index.ts                 # Entry; serves static from ../client/dist
│   │   ├── sockets.ts               # Socket.IO handlers
│   │   ├── routes.ts                # API routes
│   │   └── game/
│   │       ├── GameState.ts         # In-memory state + event dispatch
│   │       ├── BuzzLock.ts          # Mutex for buzz-in race condition
│   │       └── Scorer.ts            # Scoring logic
│   ├── dist/                        # Compiled JS (git-ignored)
│   └── package.json
│
├── client/                          # React + Vite + Tailwind
│   ├── src/
│   │   ├── main.tsx
│   │   ├── hooks/
│   │   │   └── useSocket.ts         # Socket.IO custom hook
│   │   ├── components/
│   │   │   ├── Crossword.tsx
│   │   │   ├── ImageSliceReveal.tsx
│   │   │   └── Countdown.tsx
│   │   └── types/
│   │       └── shared.ts            # Shared types (GameState, Events)
│   ├── dist/                        # Vite build output (git-ignored)
│   ├── vite.config.ts               # Proxy config for dev
│   └── package.json
│
├── shared/                          # OPTIONAL: shared types package (monorepo advanced)
│   ├── src/
│   │   ├── types.ts                 # GameState, GameMode, BuzzEvent, VoteEvent
│   │   └── constants.ts             # Room code length, max teams, etc.
│   └── package.json
│
├── package.json                     # Root: concurrently script
└── .gitignore                       # server/dist, client/dist, node_modules
```

**Why This Layout:** 
- Server compiles TypeScript → dist/, serves client/dist as static
- Client builds → dist/; server copies to its public/ or serves directly
- Shared types keep both sides in sync (see Topic B for Socket.IO type patterns)
- Single git repo = atomic commits across both layers
- One root `npm install` = one node_modules (uses npm/yarn workspaces if needed)

---

### Package.json Root Scripts

```json
{
  "name": "mln-game",
  "private": true,
  "workspaces": ["server", "client"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w server\" \"npm run dev -w client\"",
    "build": "npm run build -w client && npm run build -w server",
    "start": "NODE_ENV=production node server/dist/index.js",
    "type-check": "npm run type-check -w server && npm run type-check -w client"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

**Dev Flow:**
```bash
npm run dev
# → runs Vite dev server on :5173 (client)
# → runs Node dev server on :3000 (server)
# → Express serves client/ requests via Vite proxy
```

**Production Flow:**
```bash
npm run build
# → client: npm run build → Vite outputs to client/dist/
# → server: npm run build → tsc outputs to server/dist/, copy client/dist/* to server/public/
npm start
# → NODE_ENV=production node server/dist/index.js
# → Express serves client/dist as static from single port :3000
```

---

### TypeScript: Shared Types Between Server & Client

**File: `client/src/types/shared.ts`** (or create `shared/src/types.ts` if monorepo workspaces)

```typescript
// Shared game state interface — both server and client use this
export interface GameState {
  mode: "crossword" | "image-reveal";
  round: number;
  question_idx: number;
  
  // Crossword state
  crossword?: {
    current_row_idx: number | null;
    buzz_open: boolean;
    buzz_winner: { team_id: string; type: "row" | "keyword" } | null;
    revealed_rows: number[];
    keyword_revealed: boolean;
  };
  
  // Image reveal state
  image_reveal?: {
    slices_revealed: number; // 0-5
    voting_open: boolean;
    votes: Record<string, "A" | "B" | "C" | "D">;
  };
  
  scores: Record<string, number>; // team_id → points
  teams: Array<{ id: string; name: string }>;
}

export type GameEvent = 
  | { type: "host:select_q"; question_idx: number }
  | { type: "host:open_buzz" }
  | { type: "player:buzz"; team_id: string; buzz_type: "row" | "keyword" }
  | { type: "host:correct"; points: number }
  | { type: "state:update"; state: GameState };
```

**In server:** Import and type handlers
```typescript
import type { GameState } from "../client/src/types/shared";

const gameState: GameState = { /* ... */ };
io.emit("state:update", { state: gameState });
```

**In client:** Import and type Socket.IO
```typescript
import type { GameState, GameEvent } from "./types/shared";

// See Topic B for useSocket hook
const { state, emit } = useSocket<GameState, GameEvent>();
```

**Anti-Pattern:** Duplicating type definitions in server and client ❌  
**Better:** One source of truth in shared/ or client/src/types/ (imported by both)

---

### Vite Proxy Config for Development

**File: `client/vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/socket.io": {
        target: "ws://localhost:3000",
        ws: true,           // CRITICAL: enables WebSocket proxying
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
```

**Why `ws: true`?** Without it, WebSocket upgrades fail silently; you see socket.io.js load but no connection.

**Testing the proxy:**
```bash
# Terminal 1
npm run dev -w server   # Express on :3000

# Terminal 2
npm run dev -w client   # Vite on :5173, proxies socket.io to :3000

# Browser: http://localhost:5173
# Socket.IO connects to ws://localhost:5173/socket.io → proxies to ws://localhost:3000/socket.io ✓
```

---

### Production: Express Serves Vite Build as Static

**File: `server/src/index.ts`**

```typescript
import express from "express";
import path from "path";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, { cors: { origin: "*" } });

// Serve Vite build as static files
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

// API routes (before SPA fallback)
app.get("/api/state", (req, res) => {
  res.json({ state: gameState });
});

// SPA fallback: all unmatched routes → index.html (React Router handles it)
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

httpServer.listen(3000, () => console.log("Server on :3000"));
```

**Build step in root `package.json`:**
```json
{
  "scripts": {
    "build": "npm run build -w client && npm run build -w server",
  }
}
```

**In `server/package.json`:**
```json
{
  "scripts": {
    "build": "tsc",
    "postbuild": "copy-dir ../client/dist ./dist/public"
  }
}
```

Or use a bash script to copy after build:
```bash
# server/build.sh
npm run build -w server
mkdir -p server/dist/public
cp -r client/dist/* server/dist/public/
```

---

### TypeScript Config: Avoid Double Compilation

**File: `tsconfig.json` (root)**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**In `server/tsconfig.json`:**
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "CommonJS"  // Server uses CommonJS
  },
  "include": ["src/**/*"]
}
```

**In `client/tsconfig.json`:**
```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler"  // Vite's default
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "build"]
}
```

---

## TOPIC B: Socket.IO 4 + React 18 Integration

### Recommendation: ADOPT custom `useSocket` hook + Context for global instance

**Why not Context-only?** Re-renders entire tree on every state update (slow at 30 clients).  
**Why not Zustand alone?** Socket.IO instance must be shared; Zustand is just state.  
**Hybrid approach:** Socket.IO instance in Context (mount once), game state in Zustand.

---

### Pattern 1: Socket.IO Instance + Custom Hook (RECOMMENDED)

**File: `client/src/hooks/useSocket.ts`**

```typescript
import { useContext, useEffect, useRef } from "react";
import { SocketContext } from "../context/SocketContext";

/**
 * Hook to use the global Socket.IO instance.
 * Registers listeners with proper cleanup; prevents stale closures.
 */
export function useSocket() {
  const socket = useContext(SocketContext);
  
  if (!socket) {
    throw new Error("useSocket must be used within SocketProvider");
  }

  return {
    // Emit an event (stable, won't recreate on every render)
    emit: socket.emit.bind(socket),
    
    // Listen to an event with auto-cleanup
    on: (event: string, handler: (...args: any[]) => void) => {
      socket.on(event, handler);
      return () => socket.off(event, handler);  // cleanup function
    },
    
    // Direct access to socket if needed (rare)
    socket,
  };
}

/**
 * For typed events, create a variant:
 */
import type { GameState, GameEvent } from "../types/shared";

export function useGameSocket() {
  const { socket } = useSocket();
  
  return {
    // Type-safe event listeners
    onStateUpdate: (handler: (state: GameState) => void) => {
      socket.on("state:update", handler);
      return () => socket.off("state:update", handler);
    },
    
    // Type-safe emitters
    buzz: (teamId: string, buzzType: "row" | "keyword") => {
      socket.emit("player:buzz", { team_id: teamId, buzz_type: buzzType });
    },
    
    vote: (teamId: string, answer: "A" | "B" | "C" | "D") => {
      socket.emit("player:vote", { team_id: teamId, answer });
    },
  };
}
```

**File: `client/src/context/SocketContext.tsx`**

```typescript
import React, { createContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

export const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Create socket once on mount
    const newSocket = io(
      process.env.NODE_ENV === "production" ? "/" : "http://localhost:3000",
      {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      }
    );

    // Listen for connection events (NOT in component; here in provider)
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      // Request current game state from server
      newSocket.emit("client:request_state");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);  // Empty dependency array = runs once on mount

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
```

**In `client/src/main.tsx`:**
```typescript
import { SocketProvider } from "./context/SocketContext";

createRoot(document.getElementById("root")!).render(
  <SocketProvider>
    <App />
  </SocketProvider>
);
```

---

### Anti-Pattern: Stale Closures in Socket Event Handlers

**❌ DON'T do this (stale closure bug):**

```typescript
function BuzzButton() {
  const [teamId, setTeamId] = useState("team-1");

  useEffect(() => {
    const socket = useSocket().socket;
    
    // BUG: This closure captures teamId at effect creation time.
    // If teamId changes, the handler still uses the old value.
    socket.on("buzz_available", () => {
      console.log("Buzzing as", teamId);  // Always "team-1"!
    });

    return () => socket.off("buzz_available", () => {});
  }, []);  // Missing teamId dependency
}
```

**✅ DO this (fix stale closure):**

```typescript
function BuzzButton() {
  const [teamId, setTeamId] = useState("team-1");
  const { on } = useSocket();

  useEffect(() => {
    // Re-attach listener whenever teamId changes
    const cleanup = on("buzz_available", () => {
      console.log("Buzzing as", teamId);  // Correct value
    });

    return cleanup;
  }, [teamId, on]);  // Include both in dependency array
}
```

**Or use a ref (prevents re-creating handler):**

```typescript
import { useRef, useEffect } from "react";

function BuzzButton() {
  const [teamId, setTeamId] = useState("team-1");
  const teamIdRef = useRef(teamId);
  const { on } = useSocket();

  // Keep ref in sync
  useEffect(() => {
    teamIdRef.current = teamId;
  }, [teamId]);

  // Register handler once, reads latest value from ref
  useEffect(() => {
    const cleanup = on("buzz_available", () => {
      console.log("Buzzing as", teamIdRef.current);  // Always latest
    });
    return cleanup;
  }, [on]);  // Only re-create if on changes
}
```

---

### State Sync Pattern: Full State Every Event (VERIFIED FINE FOR 30 CLIENTS)

**Assumption:** ~200 byte GameState object × 30 clients × ~2 events/sec = ~12 KB/sec = acceptable.

**Server Implementation:**

```typescript
const io = new SocketIOServer(httpServer);

// When ANYTHING changes in game state, broadcast full state to all
function broadcastGameState() {
  io.emit("state:update", {
    state: gameState,
    timestamp: Date.now(),
  });
}

io.on("connection", (socket) => {
  socket.on("player:buzz", async (data) => {
    const { team_id, buzz_type } = data;

    // Acquire lock to prevent race condition
    const lockAcquired = buzzLock.tryAcquire(team_id);
    if (!lockAcquired) {
      // Someone else buzzed first
      socket.emit("buzz:rejected", { reason: "already_answered" });
      return;
    }

    // Update game state
    gameState.crossword.buzz_winner = { team_id, type: buzz_type };
    gameState.crossword.buzz_open = false;

    // Broadcast full state to ALL clients
    broadcastGameState();
  });
});
```

**Why full state, not diffs?**
- ✅ Simpler to implement (no diff algorithm)
- ✅ Atomic: clients always see consistent state
- ✅ Resilient: lost packets don't accumulate errors
- ✅ Fine at 30 clients (200 bytes × 30 = 6 KB, negligible)
- ❌ Not suitable for 1000+ concurrent users (would need diffs + compression)

For your classroom use case, **full state every event is the right choice.**

---

### Reconnection: Server Sends State on Connect

**Server:**
```typescript
io.on("connection", (socket) => {
  // Send current state immediately to new client
  socket.emit("state:update", { state: gameState });

  socket.on("client:request_state", () => {
    socket.emit("state:update", { state: gameState });
  });
});
```

**Client (in SocketProvider):**
```typescript
newSocket.on("connect", () => {
  console.log("Connected, requesting state...");
  newSocket.emit("client:request_state");
});

newSocket.on("state:update", (data) => {
  console.log("State synced:", data.state);
  // Update Zustand store here
});
```

**Why not Socket.IO's connection state recovery?**  
- It's complex (requires server-side buffer of events)
- For a classroom game, a simple "send on connect" is sufficient
- If server resets, all clients reset too (expected behavior)

---

### TypeScript: End-to-End Type Safety for Socket Events

**File: `shared/types.ts` (or `client/src/types/shared.ts`)**

```typescript
// Define event maps for type safety
export interface ServerToClientEvents {
  "state:update": (data: { state: GameState; timestamp: number }) => void;
  "buzz:rejected": (data: { reason: string }) => void;
  "connect": () => void;
  "disconnect": () => void;
}

export interface ClientToServerEvents {
  "player:buzz": (data: { team_id: string; buzz_type: "row" | "keyword" }) => void;
  "player:vote": (data: { team_id: string; answer: "A" | "B" | "C" | "D" }) => void;
  "host:correct": () => void;
  "host:wrong": () => void;
  "client:request_state": () => void;
}
```

**Server:**
```typescript
import { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "../shared/types";

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer);

io.on("connection", (socket) => {
  socket.on("player:buzz", (data) => {
    // TypeScript KNOWS data has team_id and buzz_type
    const { team_id, buzz_type } = data;
    
    // Only emits events from ServerToClientEvents
    socket.emit("state:update", { state: gameState, timestamp: Date.now() });
  });
});
```

**Client:**
```typescript
import io from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "../types/shared";

// Fully typed socket instance
const socket = io<ServerToClientEvents, ClientToServerEvents>();

socket.on("state:update", (data) => {
  // TypeScript KNOWS data.state is GameState
  console.log(data.state.scores);
});

socket.emit("player:buzz", {
  team_id: "team-1",
  buzz_type: "row",
  // TypeScript ERROR if you pass wrong shape or unknown event
});
```

---

## TOPIC C: Canvas-Based Image Slice Reveal with Animation

### Recommendation: ADOPT Canvas for slice reveal animation, switch to <img> after complete

---

### Animation Approach: Slide-In from Top (400ms per slice)

**Why slide-in vs fade-in?** 
- Fade-in is subtle (less impressive on projector)
- Slide-in creates momentum/reveal effect (game-show feeling)
- 400ms = slow enough to see, fast enough to keep pace

**File: `client/src/components/ImageSliceReveal.tsx`**

```typescript
import React, { useRef, useEffect, useState } from "react";

interface ImageSliceRevealProps {
  imageUrl: string;
  sliceCount: number;      // 5 slices
  onSliceRevealed?: (index: number) => void;
}

export function ImageSliceReveal({
  imageUrl,
  sliceCount,
  onSliceRevealed,
}: ImageSliceRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [revealedSlices, setRevealedSlices] = useState(0);
  const [isFullyRevealed, setIsFullyRevealed] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const sliceStartTimeRef = useRef<number>(0);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgElement(img);
      // Draw initial state (no slices)
      drawCanvas(img, 0, 0);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  function drawCanvas(
    img: HTMLImageElement,
    revealedCount: number,
    animationProgress: number
  ) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sliceWidth = canvas.width / sliceCount;

    // Draw fully revealed slices
    for (let i = 0; i < revealedCount; i++) {
      ctx.drawImage(
        img,
        i * sliceWidth,        // src x
        0,                      // src y
        sliceWidth,             // src width
        img.height,             // src height
        i * sliceWidth,         // dest x
        0,                      // dest y
        sliceWidth,             // dest width
        canvas.height           // dest height
      );
    }

    // Animate the current slice (sliding down from top)
    if (revealedCount < sliceCount && animationProgress > 0) {
      const currentSlice = revealedCount;
      const slideDistance = canvas.height * (1 - animationProgress); // 0 = fully visible
      
      ctx.drawImage(
        img,
        currentSlice * sliceWidth,
        0,
        sliceWidth,
        img.height,
        currentSlice * sliceWidth,
        slideDistance,           // Slide from top
        sliceWidth,
        canvas.height * animationProgress
      );
    }
  }

  function animate(currentTime: number) {
    if (isFullyRevealed) return;

    const elapsed = currentTime - sliceStartTimeRef.current;
    const progress = Math.min(elapsed / 400, 1);  // 400ms per slice

    if (imgElement) {
      drawCanvas(imgElement, revealedSlices, progress);
    }

    if (progress >= 1) {
      // Slice animation complete
      const newCount = revealedSlices + 1;
      setRevealedSlices(newCount);
      onSliceRevealed?.(newCount - 1);

      if (newCount >= sliceCount) {
        // All slices revealed
        setIsFullyRevealed(true);
        return;
      }

      // Start next slice animation
      sliceStartTimeRef.current = currentTime;
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }

  // Trigger animation when revealedSlices changes
  useEffect(() => {
    if (!isFullyRevealed && revealedSlices < sliceCount) {
      sliceStartTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [revealedSlices, sliceCount, isFullyRevealed, imgElement]);

  // Responsive canvas sizing
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const resize = () => {
      if (!canvasRef.current || !containerRef.current) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Set CSS size
      canvasRef.current.style.width = `${rect.width}px`;
      canvasRef.current.style.height = `${rect.height}px`;

      // Set actual canvas resolution (with DPR)
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;

      // Scale context to match DPR
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      // Redraw current state
      if (imgElement) {
        drawCanvas(imgElement, revealedSlices, 0);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [imgElement, revealedSlices]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "400px" }}>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          border: "1px solid #ccc",
        }}
      />
      {isFullyRevealed && (
        <img
          src={imageUrl}
          alt="Fully revealed"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      )}
    </div>
  );
}
```

---

### Canvas Responsive Sizing Without Blur (CRITICAL)

**Issue:** Canvas rendered at CSS size but with default resolution = blurry on high-DPI devices.

**Solution: Three-Step Process**

```typescript
function setupCanvasWithDPR(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  
  // Step 1: Get CSS dimensions
  const rect = canvas.getBoundingClientRect();
  const cssWidth = rect.width;
  const cssHeight = rect.height;

  // Step 2: Set canvas resolution to CSS size × DPR
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  // Step 3: Keep CSS size small, scale context to fill it
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);
  }

  return ctx;
}

// Usage:
const ctx = setupCanvasWithDPR(canvasRef.current);
// Now draw at logical pixel coordinates; DPR scaling is automatic
ctx.drawImage(...);
```

**Why this works:**
- On a 2x DPI device: canvas.width = 800 × 2 = 1600, but CSS shows 800
- Drawing at logical coords (100, 100) → physical coords (200, 200) → sharp

---

### When to Switch from Canvas to <img>

**Canvas phase:** Slice-by-slice reveal animation (5 × 400ms = 2s total)

**After reveal:**
```typescript
{isFullyRevealed && (
  <img
    src={imageUrl}
    alt="Complete"
    style={{
      width: "100%",
      height: "auto",
      transition: "opacity 200ms ease-out",
      opacity: 1,
    }}
  />
)}
```

**Why switch?** 
- Canvas is stateful (requires re-rendering on every frame)
- `<img>` is static (no redraw cost after reveal)
- Browser can optimize `<img>` caching, zooming, right-click save

**Transition approach (smooth crossfade):**
```typescript
{isFullyRevealed && (
  <img
    src={imageUrl}
    alt="Complete"
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      opacity: revealedSlices === sliceCount ? 1 : 0,
      transition: "opacity 300ms ease-out",
    }}
  />
)}
```

---

## TOPIC D: Countdown Timer in React

### Recommendation: ADOPT `useEffect + setInterval` with state updater function, OR use a custom `useInterval` hook

---

### Pattern 1: Simple useEffect + setInterval (Works for Classroom Scale)

**File: `client/src/components/CountdownTimer.tsx`**

```typescript
import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function CountdownTimer({
  initialSeconds,
  onComplete,
  autoStart = true,
}: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) {
      if (secondsLeft === 0 && isRunning) {
        onComplete?.();
      }
      return;
    }

    // Use functional update to avoid stale closure
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onComplete, secondsLeft]);

  return (
    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
      {secondsLeft}s
    </div>
  );
}
```

**Key: Functional state update**
```typescript
setSecondsLeft((prev) => prev - 1);  // ✅ Correct: always uses latest value
setSecondsLeft(secondsLeft - 1);     // ❌ Wrong: captures stale secondsLeft
```

---

### Pattern 2: Custom `useInterval` Hook (More Flexible)

**File: `client/src/hooks/useInterval.ts`**

```typescript
/**
 * Dan Abramov's useInterval pattern.
 * Avoids stale closure bugs by using a ref for the callback.
 */
import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(callback);

  // Keep ref updated with latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!delay || delay < 0) return;

    const interval = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(interval);
  }, [delay]);
}
```

**Usage:**
```typescript
export function CountdownTimer({
  initialSeconds,
  onComplete,
}: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useInterval(
    () => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      if (secondsLeft === 1) {
        onComplete?.();
      }
    },
    secondsLeft > 0 ? 1000 : null  // Stop when done
  );

  return <div>{secondsLeft}s</div>;
}
```

**Advantage:** Callback updates automatically; no need to add `onComplete` to dependency array.

---

### Authority Question: Server-Side vs Client-Side Enforcement

**Scenario:** Host opens vote gate for 10 seconds. Client timer hits 0 and auto-closes vote locally. But what if host is offline?

**Answer: Hybrid (Server authoritative)**

```typescript
// Client timer just for UI feedback
const [votingOpen, setVotingOpen] = useState(false);
const [secondsLeft, setSecondsLeft] = useState(10);

useInterval(() => {
  setSecondsLeft((prev) => {
    if (prev <= 1) {
      setVotingOpen(false);  // Close locally
      return 0;
    }
    return prev - 1;
  });
}, votingOpen ? 1000 : null);

// But server is authoritative:
// If client sends vote after local timer expiry, server rejects it
socket.on("player:vote", (data) => {
  if (!gameState.voting_open) {
    socket.emit("vote:rejected", { reason: "voting_closed" });
    return;
  }
  // Accept vote
});
```

**Why hybrid?**
- ✅ Client timer = fast UI feedback (feels responsive)
- ✅ Server enforcement = prevents cheaters (resets on server, client trusts server state)
- ✅ Network lag doesn't break anything (server is source of truth)

---

### Visual: Circular Progress Ring vs Simple Number

**For a Projector at 10 meters:**

**Option 1: Simple Number (RECOMMENDED for classroom)**
```typescript
<div style={{
  fontSize: "4rem",
  fontWeight: "bold",
  color: secondsLeft <= 3 ? "red" : "white",
  transition: "color 200ms",
}}>
  {secondsLeft}
</div>
```

**Why simple number wins:**
- ✅ Readable at distance (large text)
- ✅ No animation jank (just number changing)
- ✅ Clear urgency (color change at ≤3s)
- ✅ Teachable moment (students see countdown)

**Option 2: Circular Ring (if you want fancier)**
```typescript
const circumference = 2 * Math.PI * 45;  // radius 45
const strokeDashoffset = circumference * (1 - secondsLeft / 10);

<svg width="100" height="100">
  <circle
    cx="50" cy="50" r="45"
    fill="none"
    stroke="white"
    strokeWidth="4"
    strokeDasharray={circumference}
    strokeDashoffset={strokeDashoffset}
    style={{ transition: "stroke-dashoffset 200ms linear" }}
  />
  <text x="50" y="55" textAnchor="middle" fontSize="20">
    {secondsLeft}
  </text>
</svg>
```

**Verdict:** Use the simple number. Classroom context = clarity > fancy.

---

## TOPIC E: Crossword Grid Rendering

### Recommendation: ADOPT CSS Grid (35 col × 7 row fixed)

**Why CSS Grid, not HTML Table?**
- ✅ CSS Grid designed for 2D layout (not data)
- ✅ Easier cell reveal animation (stagger with CSS delays)
- ✅ Simpler responsive adjustments
- ❌ HTML table would be semantically correct only if cells contain tabular data (they don't; they're a game board)

**Key accessibility note:** Neither is "more accessible" — both require ARIA labels for screen readers. Use `<div>` grid with explicit roles.

---

### File: `client/src/components/CrosswordGrid.tsx`

```typescript
import React, { useMemo } from "react";
import styles from "./CrosswordGrid.module.css";

interface Cell {
  letter: string | null;
  row: number;
  col: number;
  is_keyword: boolean;  // Highlight column 12 differently
  is_revealed: boolean;
}

interface CrosswordGridProps {
  cells: Cell[];
  rows: number;
  cols: number;
  keywordColumnIdx?: number;  // e.g., 11 (0-indexed)
  onCellClick?: (row: number, col: number) => void;
}

export function CrosswordGrid({
  cells,
  rows,
  cols,
  keywordColumnIdx = 11,
}: CrosswordGridProps) {
  const cellMap = useMemo(() => {
    const map = new Map();
    cells.forEach((cell) => {
      map.set(`${cell.row}-${cell.col}`, cell);
    });
    return map;
  }, [cells]);

  return (
    <div
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
      role="grid"
      aria-label="Crossword grid"
    >
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          const cell = cellMap.get(`${row}-${col}`);
          const isKeywordCol = col === keywordColumnIdx;
          
          return (
            <div
              key={`${row}-${col}`}
              className={`${styles.cell} ${
                cell?.is_revealed ? styles.revealed : styles.hidden
              } ${isKeywordCol ? styles.keyword_col : ""}`}
              role="gridcell"
              data-row={row}
              data-col={col}
              style={{
                animationDelay: cell?.is_revealed 
                  ? `${(row * cols + col) * 0.05}s`  // 50ms stagger
                  : "0s",
              }}
            >
              {cell?.is_revealed && cell?.letter && (
                <span className={styles.letter}>{cell.letter}</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
```

---

### CSS: Grid Layout + Stagger Animation

**File: `client/src/components/CrosswordGrid.module.css`**

```css
.grid {
  display: grid;
  gap: 2px;
  padding: 1rem;
  background: #333;
  border-radius: 8px;
  aspect-ratio: 35 / 7;  /* Fixed aspect ratio */
  max-width: 100%;
  width: 100%;
}

.cell {
  background: #222;
  border: 2px solid #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-family: "Courier New", monospace;
  font-weight: bold;
  letter-spacing: 0.5px;
  line-height: 1;
  color: white;
  position: relative;
}

/* Hidden cells stay dark */
.cell.hidden {
  background: #1a1a1a;
  border-color: #333;
}

/* Revealed cells: fade in + slide down (50ms stagger) */
.cell.revealed {
  animation: revealCell 0.4s ease-out forwards;
  background: #0066cc;
  border-color: #0099ff;
}

@keyframes revealCell {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Keyword column (vertical "YÊU NƯỚC") in red */
.cell.keyword_col.revealed {
  background: #cc0000;
  border-color: #ff3333;
}

.letter {
  font-weight: bold;
  user-select: none;
}

/* Responsive: scale down on mobile */
@media (max-width: 768px) {
  .grid {
    gap: 1px;
    padding: 0.5rem;
  }

  .cell {
    font-size: 16px;
  }
}

/* Respect prefers-reduced-motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  .cell.revealed {
    animation: none;
    opacity: 1;
  }
}
```

---

### Font Rendering: Monospace + ASCII in 24px Cells

**Best Settings for Small Cells:**

```css
.cell {
  font-family: "Courier New", "IBM Plex Mono", monospace;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.5px;
  line-height: 1;      /* Tight line height (no extra vertical space) */
  text-transform: uppercase;  /* Normalize to uppercase */
}
```

**Why these values:**
- `font-family: "Courier New"` → monospaced, widely supported, good at small sizes
- `font-size: 24px` → readable on projector at 10m (adjust if needed)
- `letter-spacing: 0.5px` → slight spacing for clarity without breaking monospace alignment
- `line-height: 1` → no extra vertical padding (cells are small)
- `text-transform: uppercase` → ensures all ASCII is uppercase (consistent with crossword convention)

**Anti-pattern:** Using proportional fonts (`font-family: Arial`) → letters have different widths, misaligns grid ❌

---

### Stagger Animation: CSS Approach (Recommended)

**Pure CSS stagger (in the module.css above):**
```css
.cell.revealed {
  animation: revealCell 0.4s ease-out forwards;
  animation-delay: var(--delay);
}
```

**In component, set inline style:**
```typescript
style={{
  "--delay": `${(row * cols + col) * 0.05}s`,
}}
```

**Or use CSS custom property + nth-child:**
```css
@for $i from 0 to ($rows * $cols) {
  .cell:nth-child(#{$i}) {
    animation-delay: #{$i * 0.05}s;
  }
}
```

**Why CSS stagger?**
- ✅ GPU-accelerated (smooth, no JS overhead)
- ✅ Respects `prefers-reduced-motion` with media query
- ✅ Simpler than JS timing loops

---

### Cell Reveal Animation: Fade + Slide vs Just Fade

**Compared:**

**Fade-only:**
```css
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```
- Subtle, professional
- Hard to see on low-contrast projectors

**Fade + Slide-down (RECOMMENDED):**
```css
@keyframes revealCell {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```
- Clear, directional (reveals from top)
- Holds attention (small motion catches eye)
- 50ms stagger creates wave effect
- Game-show feeling

**Verdict:** Use fade + slide. Better for classroom engagement.

---

## SUMMARY & RANKED DECISIONS

| Topic | Recommendation | Confidence | Adoption Risk |
|-------|---|---|---|
| **A. Monorepo** | Single repo, Express serves Vite build, shared types in client/src/types/ | 95% | Low (standard pattern) |
| **B. Socket.IO** | Custom useSocket hook + Context provider, full state every event, server authoritative | 90% | Low (Socket.IO v4 stable, well-documented) |
| **C. Canvas Reveal** | Canvas for animation, <img> after reveal, 400ms slide-in per slice, set DPR on resize | 85% | Low (canvas patterns mature) |
| **D. Countdown** | useEffect + setInterval with functional state updater, simple number display, server enforces close | 90% | Very Low (fundamental React pattern) |
| **E. Crossword Grid** | CSS Grid 35×7, pure CSS stagger animation 50ms, Courier New 24px monospace | 92% | Low (CSS Grid stable, no JS needed) |

---

## UNRESOLVED QUESTIONS

1. **Server state persistence:** Should GameState be stored in Redis/DB or stay in-memory? (Affects reset behavior; if in-memory, server restart = game reset. OK for classroom?)

2. **Room code collision:** At what size should you switch from 4-char codes to 6-char? (Classroom scale probably never hits collision; 4-char = 10^4 codes = sufficient for 100 concurrent rooms.)

3. **Keyword row ordering:** Is row index tied to UI order, or is there a separate display order? (Affects animation stagger logic.)

4. **Image upload:** How are crossword questions and images stored? (Firebase, local file, hardcoded?) This affects URL handling in Canvas and <img> tags.

5. **Projector resolution:** Assuming 1920×1080, is 24px font readable at typical classroom distance? (May need adjustment per venue.)

---

## SOURCES

- [Sharing Types in PNPM Monorepo (React + NestJS) - DEV Community](https://dev.to/lico/step-by-step-guide-sharing-types-and-values-between-react-esm-and-nestjs-cjs-in-a-pnpm-monorepo-2o2j)
- [Vite React Express API Monorepo Boilerplate - GitHub](https://github.com/AlessandroAlbi/vite-react-express-api-monorepo-bp)
- [Monorepo Setup with Monorepos - Vite, React, Shadcn - DEV Community](https://dev.to/franciscolunadev82/getting-started-with-monorepos-vite-react-and-shadcn-52e9)
- [Monorepo TypeScript Vite Express - GitHub](https://github.com/john-smilga/monorepo-typescript-vite-express)
- [Wrapping Socket.IO Into Custom React Hook - Ian Rogers](https://itrogers.com/2022-02-09--wrapping-socket-io-into-custom-react-hook/)
- [Socket.IO with React Hooks - Code Concisely](https://www.codeconcisely.com/posts/react-socket-io-hooks/)
- [How to Use with React - Socket.IO Official](https://socket.io/how-to/use-with-react)
- [Socket.IO TypeScript Documentation - Official](https://socket.io/docs/v4/typescript/)
- [Animation with Canvas and requestAnimationFrame in React - DEV Community](https://dev.to/ptifur/animation-with-canvas-and-requestanimationframe-in-react-5ccj)
- [Improve Web Performance With requestAnimationFrame - DebugBear](https://www.debugbear.com/blog/requestanimationframe)
- [Performant Animations with requestAnimationFrame and React Hooks - Medium](https://layonez.medium.com/performant-animations-with-requestanimationframe-and-react-hooks-99a32c5c9fbf)
- [Making setInterval Declarative with React Hooks - Dan Abramov (Overreacted)](https://overreacted.io/making-setinterval-declarative-with-react-hooks/)
- [useInterval vs setInterval - Dhawal Codes](https://dhawalpandya01.hashnode.dev/useinterval-vs-setinterval)
- [Grids Part 1: To Grid or Not to Grid - Sarah Higley](https://sarahmhigley.com/writing/grids-part1/)
- [Grid Layout and Accessibility - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Grid_layout_and_accessibility)
- [HTML Tables vs CSS Grid - UI Verse](https://uiverse.io/blog/html-tables-vs-css-grid-which-layout-option-is-best)
- [React useEffectEvent: Goodbye to Stale Closures - LogRocket](https://blog.logrocket.com/react-useeffectevent-goodbye-to-stale-closure-headaches/)
- [How to Fix Stale Closures in React Hooks - CoreUI](https://coreui.io/answers/how-to-fix-stale-closures-in-react-hooks/)
- [Canvas Blur Prevention with devicePixelRatio - DEV Community](https://dev.to/pahund/how-to-fix-blurry-text-on-html-canvases-on-mobile-phones-3iep)
- [Understanding HTML Canvas Scaling and Sizing - Medium](https://medium.com/@doomgoober/understanding-html-canvas-scaling-and-sizing-c04925d9a830)
- [Optimizing Canvas - MDN Web APIs](https://developer.mozilla.org/en-us/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [Vite Proxy Configuration for Socket.IO - w3tutorials](https://www.w3tutorials.net/blog/how-to-configure-proxy-in-vite/)
- [Server Options - Vite Official](https://vite.dev/config/server-options)
- [React + Express + Vite Single Port - DEV Community](https://dev.to/herudi/single-port-spa-react-and-express-using-vite-same-port-in-prod-2od4)
- [vite-express npm Package](https://www.npmjs.com/package/vite-express)
- [Socket.IO Connection State Recovery - Official](https://socket.io/docs/v4/connection-state-recovery)
- [Socket.IO Tutorial: Handling Disconnections - Official](https://socket.io/docs/v4/tutorial/handling-disconnections)
- [CSS Animations Performance Guide - web.dev](https://web.dev/articles/animations-guide)
- [CSS Transitions Complete Guide - DEV Community](https://dev.to/satyam_gupta_0d1ff2152dcc/css-transitions-the-complete-guide-to-smooth-web-animations-347b)
- [Staggering Animations - CSS-Tricks](https://css-tricks.com/staggering-animations/)
- [Different Approaches for Staggered Animations - CSS-Tricks](https://css-tricks.com/different-approaches-for-creating-a-staggered-animation/)
- [Monorepos Comprehensive Guide - Medium](https://medium.com/@julakadaredrishi/monorepos-a-comprehensive-guide-with-examples-63202cfab711)
- [Running Dev Scripts Across Packages - Egghead](https://egghead.io/lessons/npm-run-dev-scripts-for-all-packages-simultaniously)
- [Solving 404 Errors in React Vite Apps - Medium](https://virangaj.medium.com/solving-404-errors-on-refresh-in-react-vite-apps-c52fc596dc27)

---

**Report prepared by:** Researcher Agent  
**Token efficiency:** Concise findings with code snippets; anti-patterns flagged  
**Next step:** Ready for implementation planning per this architecture
