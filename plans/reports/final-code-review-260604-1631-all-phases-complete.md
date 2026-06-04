# Final Code Review — MLN111 Game All Phases
Date: 2026-06-04 | Reviewer: code-reviewer

## Scope
- Server: `game-engine.ts`, `scorer.ts`, `buzz-lock.ts`, `sockets.ts`, `index.ts`
- Client: `crossword-grid.tsx`, `game1-host-panel.tsx`, `game2-host-panel.tsx`, `image-slice-reveal.tsx`, `countdown-timer.tsx`, `scoreboard.tsx`, `vote-status-grid.tsx`, `use-host-keyboard.ts`, `socket-context.tsx`
- Prior critical fixes verified present: buzz-lock release, keyword_col, stale socket ref, input validation, advanceRound cap, CORS env-config, scoreboard pulse.

---

## CRITICAL — None

No critical (trust-boundary, data-loss, breaking-change) issues found.

---

## HIGH

### H1 — CountdownTimer: `onComplete` fires on every render while `secondsLeft === 0`

**File:** `client/src/components/countdown-timer.tsx:20-24`

The `onComplete` effect has `[secondsLeft, running, onComplete]` deps. After the timer reaches 0 and the host emits `host:close_buzz` / `host:close_vote`, the server state update causes a re-render. On that render `secondsLeft` is still 0 and `running` is still `true` (the state update hasn't propagated to the prop yet — there is a tick gap). The effect fires again and emits a second event.

**Sequence:**
1. Timer hits 0 → `onComplete()` → `emit("host:close_buzz")` → server sets `g1_buzz_active = false` → broadcasts state
2. Client receives `state:update` → parent re-renders → `CountdownTimer` re-renders with `running={false}` prop
3. Between step 1 and 2 there can be another React render cycle (e.g., from a parent state update or strict-mode double-invoke) where `secondsLeft === 0 && running === true` is still true → `onComplete()` fires again → duplicate socket emit

**Impact:** Duplicate `close_buzz` or `close_vote` events. The server guards are tolerant (idempotent close), but a race with a concurrent `open_vote` could cause a close arriving after the new open, resetting the vote gate unexpectedly.

**Fix:** Add a `firedRef` to track one-shot dispatch:
```ts
const firedRef = useRef(false);
useEffect(() => {
  if (!running) { firedRef.current = false; return; } // reset when restarted
  if (secondsLeft === 0 && !firedRef.current) {
    firedRef.current = true;
    onComplete();
  }
}, [secondsLeft, running, onComplete]);
```

---

### H2 — `host:score` guard in sockets.ts inverted logic allows double-score race

**File:** `server/src/sockets.ts:91-93`

```ts
if (s.g2_da_cham_diem || s.g2_cho_phep_vote) return;
```

The intent: block if already scored OR if vote gate is still open. But `g2_cho_phep_vote` is set `false` by `closeVote`. If the host presses "Score" before explicitly closing the vote gate (vote gate is still `true`), the guard blocks correctly. However, if the CountdownTimer fires `host:close_vote` AND the host manually clicks "Score" within the same event-loop tick (extremely tight race in a single-threaded server, but Socket.IO queues events), the second event (`host:score`) sees `g2_cho_phep_vote = false` (from close_vote mutation) and `g2_da_cham_diem = false` (not yet scored) → passes the guard and scores. This is the intended path.

**Real issue:** The UI in `game2-host-panel.tsx:146` shows the Score button only when `!g2_cho_phep_vote && !g2_da_cham_diem`. If a user tabs away and back during the vote window, the timer may fire `onComplete` (see H1) with a duplicate emit, then the UI renders the Score button, and the host clicks it — scoring is fine. But if H1 produces two `close_vote` events in rapid succession, no harm occurs because `closeVote` is idempotent.

**Verdict:** No standalone bug, but H1 is a prerequisite to fully closing this race path. Document as dependency.

---

## MEDIUM

### M1 — `image-slice-reveal`: canvas dims become stale after `imgSrc` change (round advance)

**File:** `client/src/components/image-slice-reveal.tsx:99-123`

The init `useEffect` runs on `[imgSrc, setupCanvas, drawCanvas]`. When `g2_round` advances, `imgSrc` changes, triggering the effect. The effect calls `setupCanvas()` which sizes the canvas and creates a new `Image`. However `committedRef`, `queueRef`, and `animatingRef` are **not reset**. If the previous round had slices in `committedRef`, they carry over to the new image and `drawCanvas` will attempt to draw the old committed slices using the new image — rendering wrong content for ~400ms until the new slices are queued.

**Fix:** In the init effect cleanup or at the top of the effect body after `imgSrc` changes, reset refs:
```ts
committedRef.current = new Set();
queueRef.current = [];
animatingRef.current = false;
cancelAnimationFrame(animFrameRef.current);
```

---

### M2 — `image-slice-reveal`: `setupCanvas()` in the reveal effect is called without cancelling in-flight animation

**File:** `client/src/components/image-slice-reveal.tsx:126-136`

The reveal effect calls `setupCanvas()` which rescales the canvas (resets `canvas.width/height`, rescales ctx). If an animation frame is already in flight from the previous `animateSlice`, that frame holds a stale `ctx` reference and stale `width/height` from the earlier call. The frame will draw to the now-rescaled canvas with wrong dimensions.

This is a timing issue on fast state updates (e.g., `earlyReveal` triggered while an animation is mid-flight): the canvas gets re-initialized and the orphaned frame corrupts it.

**Fix:** Cancel in-flight frame before calling `setupCanvas()` inside the reveal effect:
```ts
useEffect(() => {
  cancelAnimationFrame(animFrameRef.current); // cancel before resize
  const setup = setupCanvas();               // then resize
  // ... queue logic
}, [revealedSlices, animateSlice, setupCanvas]);
```

---

### M3 — `crossword-grid.tsx:85`: keyword text hardcoded

**File:** `client/src/components/crossword-grid.tsx:85`

```tsx
<p className="text-game-lg font-black text-gold tracking-widest">
  🎉 TỪ KHÓA: YÊU NƯỚC
```

The keyword "YÊU NƯỚC" is hardcoded in the UI. If game data ever changes, this text becomes wrong silently. The keyword value should come from game data or at minimum a constant, not an inline string literal.

**Fix (minimal):** Extract to a constant at the top of the file or derive from `G1_DATA`. This is low-risk for a v1 single-run game but a maintenance trap.

---

### M4 — `game1-host-panel.tsx:58-59`: `G1_DATA.indexOf(row)` is O(n²)

**File:** `client/src/components/game1-host-panel.tsx:58-59`

```ts
const available = G1_DATA.filter((_, i) => !g1_opened.includes(i));
// ...
{available.map((row, _) => {
  const idx = G1_DATA.indexOf(row);
```

`available` is a filtered array of row objects. `G1_DATA.indexOf(row)` performs a reference equality scan of the full array for each item. Since `G1_DATA` is a module-level constant, object references are stable, so this is correct. With N=7 rows this is inconsequential. Flagged as a code smell — the original index is available during `filter` and can be carried through directly:

```ts
const available = G1_DATA.map((row, i) => ({ row, i })).filter(({ i }) => !g1_opened.includes(i));
// then: available.map(({ row, i }) => <option key={i} value={i}>...)
```

---

## LOW

### L1 — `use-host-keyboard.ts`: F2/F3 operate in game2 mode without mode guard

**File:** `client/src/hooks/use-host-keyboard.ts:34-47`

F2 (`host:correct`) and F3 (`host:wrong` / `host:close_buzz`) check `state.g1_buzz_winner` / `state.g1_buzz_active` but do not guard `state.mode === "game1"`. In game2 mode with no active buzz, pressing F2 or F3 emits nothing (guards are effectively `false`), so no functional bug. But if a future refactor adds game2 buzz mechanics, these keys would silently act across modes.

Low risk for v1. Consider adding `if (state.mode !== "game1") return;` guards for clarity.

---

### L2 — `sockets.ts`: `player:join` declared in `ClientToServerEvents` but never handled

**File:** `server/src/sockets.ts` + `server/src/types/shared.ts:53`

`player:join` is part of the contract type but has no `socket.on("player:join", ...)` handler. Socket.IO silently ignores unhandled events, so no crash. For v1 projector-only mode this is fine, but the dead type declaration is misleading.

---

### L3 — `index.ts:34`: catch-all `app.get("*")` route in production

**File:** `server/src/index.ts:34`

```ts
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});
```

The wildcard is registered after REST routes and static middleware, so it only catches unmatched GETs — correct SPA fallback behavior. However it also catches `/api/*` GETs not matched by the router, silently serving `index.html` instead of a 404. Minor: verify REST router registers no GET endpoints that could be shadowed.

---

### L4 — `scoreboard.tsx`: score bar width at 0% when all scores are 0

**File:** `client/src/components/scoreboard.tsx:30, 49`

```ts
const maxScore = Math.max(...Object.values(scores), 1);
const pct = (score / maxScore) * 100;
```

`Math.max(...values, 1)` correctly prevents division-by-zero and clamps to 0% when all scores are 0. Visually all bars show 0% width at game start — correct. No bug; noted as verified.

---

## INFO / Verified Correct

- **buzz-lock.ts**: Node.js single-thread atomicity comment is accurate. `tryAcquire` / `reset` pattern is correct. No mutex needed.
- **advanceRound**: `g2_round >= MAX_G2_ROUNDS - 1` guard correctly caps at last round index (0-based, MAX=2, last=1). Returns unchanged state on last round — idempotent.
- **advanceQuestion**: `nextQ >= TOTAL_SLICES` check (5 questions) correct. Returns `g2_done = true` with `g2_question` frozen at last value — does not overflow array.
- **scoreVotes**: `G2_DATA[g2_round]?.cau_hoi[g2_question]` null-guarded. Idempotent via `g2_da_cham_diem` check.
- **CORS**: `corsOrigin = false` in production (disables CORS header for same-origin deployment). Correct pattern.
- **useInterval**: Abramov ref pattern. `delayMs === null` stops interval. Effect re-runs on delay change only — correct.
- **socket-context.tsx**: `useState` for socket (not `useRef`) — verified fixed. Reconnect loop with `Infinity` attempts is appropriate for classroom use.
- **keyword_col (KEYWORD_COL = 12)**: Verified against G1_DATA. Row 0 (`col_offset=12`), Row 3 (`col_offset=10, length=11` → col 10-20, keyword at 12 ✓), Row 6 (`col_offset=8, length=11` → col 8-18, keyword at 12 ✓). All 7 rows span column 12. Correct.
- **earlyReveal**: Sets `g2_revealed_slices = [0,1,2,3,4]` and `g2_done = true`. Canvas `isFullyRevealed` becomes true → canvas hidden, full img fades in. Correct path.
- **VoteStatusGrid**: Shows answer value only post-scoring (`g2_da_cham_diem`); shows "Đã chốt" (not the answer) during vote window. Correct — answer not leaked pre-score.
- **G1_DATA.length = 7** matches `TOTAL_ROWS = 7` in game-engine. `G2_DATA[x].cau_hoi.length = 5` matches `TOTAL_SLICES = 5`. Constants consistent.
- **markCorrect keyword path**: Reveals all 7 rows, sets `g1_keyword_solved = true`, clears `g1_current_q`. Correct.
- **markWrong row path**: Re-opens buzz with fresh `BUZZ_TIMER_SECONDS`. Calls `resetLock()`. Correct.

---

## Recommended Actions (Priority Order)

1. **[H1] Fix CountdownTimer double-fire** — add `firedRef` one-shot guard. Low effort, eliminates socket event duplication on timer expiry.
2. **[M1] Reset image-slice refs on imgSrc change** — prevents stale slice bleed-through on round advance.
3. **[M2] Cancel in-flight animFrame before setupCanvas in reveal effect** — prevents canvas corruption on rapid state updates.
4. **[M3] Derive keyword text from data** — minimal effort, removes hardcoded string.
5. **[L2] Remove or implement `player:join`** — clean up dead type declaration.

---

## Unresolved Questions

- Does the classroom projector setup ever trigger `earlyReveal` mid-animation? If yes, M2 is effectively HIGH.
- Is there a planned player-device mode (teams use phones)? If yes, `player:join` (L2) needs implementation.
