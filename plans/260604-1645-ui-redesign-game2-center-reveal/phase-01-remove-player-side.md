---
phase: 1
title: "Remove Player Side"
status: pending
effort: "~15 min"
dependencies: []
---

# Phase 1: Remove Player Side

## Overview

Delete `player-view.tsx` and remove all player-routing from `App.tsx`. The player view was always a stub (v1 is host-only projector mode). This removes dead code and eliminates the confusing `?role=player` URL branch.

## What Changes

### Delete
- `client/src/views/player-view.tsx` — stub file, no logic

### Modify: `client/src/App.tsx`

**Before:**
```tsx
import { PlayerView } from "./views/player-view";

function GameView() {
  const [params] = useSearchParams();
  const role = params.get("role");
  return role === "player" ? <PlayerView /> : <HostView />;
}
```

**After:**
```tsx
// Remove PlayerView import + useSearchParams + GameView wrapper entirely
// App just renders HostView directly at /

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/summary" element={<SummaryPage />} />
        <Route
          path="/"
          element={
            <SocketProvider>
              <HostView />
            </SocketProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### Optional: `client/src/types/shared.ts`

Player events (`player:join`, `player:buzz`, `player:vote`) can stay in the type map — they're guarded server-side and not actively harmful. Remove only if desired for cleanliness. **Not required for this phase.**

## Implementation Steps

1. Delete `client/src/views/player-view.tsx`
2. Edit `client/src/App.tsx` — remove `PlayerView` import, `useSearchParams` import, `GameView` function; render `<HostView />` directly at `/`
3. `npx tsc --noEmit` in `client/` — verify no orphaned imports

## Success Criteria
- [ ] `player-view.tsx` deleted
- [ ] `App.tsx` no longer imports `PlayerView` or `useSearchParams`
- [ ] `localhost:3001/` renders HostView directly
- [ ] `localhost:3001/summary` still works
- [ ] TypeScript: zero errors
