# Red Team + Code Review — Phase 1 Foundation

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH     | 3 |
| MEDIUM   | 3 |
| LOW      | 3 |
| INFO     | 4 |

---

## Findings

### [CRITICAL] buzz-lock releases immediately after acquire — first-wins guarantee is broken

- **File:** `server/src/game/game-engine.ts:60–61`
- **Issue:** `buzzIn` calls `tryAcquire()` then immediately calls `release()` on the very next line with the comment "hand off to judge — lock re-acquired by next open". This means the lock is always `false` after any `buzzIn` call completes. If two `player:buzz` socket events are queued in the same Node.js event-loop microtask batch (e.g., two packets arriving in one TCP read), the event loop drains the queue synchronously. The first call acquires, releases; the second call then acquires successfully because `locked = false` again. Both teams are set as winner in their respective state transitions — but since `setState` is called sequentially, only the last one sticks, so the second team wins, not the first. The "first-wins" semantics is silently violated.

  The intended design (lock stays closed until `openBuzz` or `selectQuestion`) requires that `release()` is NOT called inside `buzzIn`. The lock should remain `true` until the host explicitly reopens the buzz window.

- **Impact:** In a real classroom, multiple teams pressing simultaneously will have the *last* socket message processed win rather than the first. This is the core mechanic of the game and will be visibly wrong.

- **Fix:** Remove the `release()` call from `buzzIn`. Let the lock remain acquired until `openBuzz`, `selectQuestion`, or `markWrong` (for row type) call `resetLock()`. The current callers of `resetLock()` already cover all correct reset points.

```typescript
// Current (wrong):
export function buzzIn(state: GameState, team: Team, type: "row"|"keyword"): GameState {
  if (!state.g1_buzz_active) return state;
  if (!tryAcquire()) return state;
  release(); // <-- BUG: releases lock immediately, second buzzer can sneak in
  return { ...state, g1_buzz_active: false, g1_buzz_winner: team, ... };
}

// Fixed:
export function buzzIn(state: GameState, team: Team, type: "row"|"keyword"): GameState {
  if (!state.g1_buzz_active) return state;
  if (!tryAcquire()) return state;
  // Lock stays acquired — released only when host opens next buzz window
  return { ...state, g1_buzz_active: false, g1_buzz_winner: team, ... };
}
```

---

### [HIGH] No input validation on any socket payload — arbitrary state injection

- **File:** `server/src/sockets.ts:35–105`
- **Issue:** Every socket event handler unpacks client-supplied payloads and passes them directly to engine functions without validation:
  - `host:select_q` — `idx` can be `-1`, `999`, `NaN`, or a float. `selectQuestion` stores it in `g1_current_q` and later `markCorrect` uses it as an array index. If `idx = -1`, `scored.g1_opened.includes(-1)` returns false so `-1` gets appended to `g1_opened`, which is never matched and creates permanent garbage state.
  - `player:buzz` — `team` can be any string not in `TEAMS` (e.g., `"admin"`). `buzzIn` assigns it to `g1_buzz_winner: team as Team`. `scoreCorrectBuzz` then does `state.scores[state.g1_buzz_winner] + pts` which is `undefined + 10 = NaN`, permanently corrupting scores.
  - `player:vote` — `answer` can be any string. When scored, `votes[team] === correctAnswer` silently mismatches; no data corruption but game flow is unaffected.
  - `host:set_vote` — same: team and answer unvalidated.
  - `host:switch_mode` — `mode` can be any string, forcing `GameState.mode` to an invalid value not in `"game1" | "game2"`.
- **Impact:** A student on the same WiFi network who knows the socket event names (inspectable from the Vite bundle) can corrupt scores or break game flow. Even unintentional malformed packets from buggy phone browsers can crash scores to NaN silently.
- **Fix:** Add a thin validation layer in `sockets.ts`. For this classroom-only use case, simple guard checks are sufficient — no need for a full schema library:

```typescript
// Minimal guards at top of sockets.ts
const VALID_TEAMS = new Set(TEAMS as readonly string[]);
const VALID_MODES = new Set(["game1", "game2"]);
const VALID_ANSWERS = new Set(["A", "B", "C", "D"]);

socket.on("host:select_q", ({ idx }) => {
  if (!Number.isInteger(idx) || idx < 0 || idx >= 7) return;
  setState(engine.selectQuestion(getState(), idx));
  broadcast();
});

socket.on("player:buzz", ({ team, type }) => {
  if (!VALID_TEAMS.has(team) || (type !== "row" && type !== "keyword")) return;
  setState(engine.buzzIn(getState(), team as Team, type));
  broadcast();
});
```

---

### [HIGH] `keyword_col` data wrong for 5 of 7 rows — crossword keyword column will highlight wrong letter

- **File:** `server/src/game/game-data.ts:37–101` (mirrors `assets/game1-questions.csv`)
- **Issue:** `keyword_col` is documented as "letter at column 12". For each row, the actual letter at column 12 is `word_ascii[12 - col_offset]`. Computing this for all 7 rows:

  | Row | word_ascii | col_offset | char at col 12 | keyword_col stored | Match? |
  |-----|-----------|------------|----------------|-------------------|--------|
  | 0 | YTHUCXAHOI | 12 | `word[0]` = Y | Y | ✓ |
  | 1 | DIEUKIENTUNHIEN | 10 | `word[2]` = E | I | **WRONG** |
  | 2 | PHUONGTHUCSANXUATVATCHAT | 10 | `word[2]` = U | U | ✓ |
  | 3 | TONTAIXAHOI | 10 | `word[2]` = N | O | **WRONG** |
  | 4 | YTHUCXAHOITHONGTHUONG | 9 | `word[3]` = U | N | **WRONG** |
  | 5 | YTHUCXAHOIVUOTTRUOCTONTAIXAHOI | 0 | `word[12]` = O | U | **WRONG** |
  | 6 | YTHUCDAODUC | 8 | `word[4]` = C | O | **WRONG** |

  The actual vertical keyword read from col 12 is Y-E-U-N-U-O-C = "YÊU NƯỚC". The stored `keyword_col` values are Y-I-U-O-N-U-O — a different sequence that doesn't form any meaningful word.

  The bug originates in `assets/game1-questions.csv` (pre-existing, not introduced in migration). `game-data.ts` faithfully copies the wrong values from the CSV. The migration itself is correct — the source data is wrong.

- **Impact:** Phase 2 crossword UI will use `keyword_col` to highlight (in red) which cell in each row is the keyword column. 5 of 7 rows will highlight the wrong cell, making the keyword unreadable. The keyword column is the visual centerpiece of Game 1.

- **Fix:** Correct `keyword_col` in both `assets/game1-questions.csv` and `server/src/game/game-data.ts`:

  ```
  Row 1: "I" → "E"
  Row 3: "O" → "N"
  Row 4: "N" → "U"
  Row 5: "U" → "O"
  Row 6: "O" → "C"
  ```

  Alternatively, remove `keyword_col` from the data entirely and compute it at render time: `word_ascii[12 - col_offset]`. This eliminates the redundancy and prevents drift.

---

### [HIGH] Socket context provides stale `null` socket reference — emit silently drops before first reconnect

- **File:** `client/src/context/socket-context.tsx:83`
- **Issue:** The `SocketProvider` renders its context value as:
  ```tsx
  <SocketContext.Provider value={{ socket: socketRef.current, state, connected }}>
  ```
  `socketRef.current` is `null` at the first render (before `useEffect` fires). The context value object `{ socket: null, ... }` is created at render time. The `Provider` only re-renders when `state` or `connected` change (the only `useState` values). `socket.on("connect", ...)` calls `setConnected(true)`, which triggers a re-render, at which point `socketRef.current` is set — so the context then correctly exposes the non-null socket.

  However: if a child component captures `socket` from context and holds it in a `useCallback` with `[socket]` as a dependency, during the tiny window between mount and the first `connect` event, `socket` is `null`. The `useSocket` hook's `emit` function already guards `if (socket)`, so no crash. But the fragility is real: any future consumer that doesn't guard will silently drop emits during this window. More critically, if the component unmounts and remounts (e.g., React StrictMode double-invoke in dev), the ref is cleared, the new socket is set but the context may not have re-rendered yet.

- **Impact:** Silent dropped emits during connection window (low probability in prod); developer confusion; React StrictMode double-invoke exposes the stale-ref pattern in dev.

- **Fix:** Lift socket to `useState` instead of `useRef`:
  ```tsx
  const [socket, setSocket] = useState<AppSocket | null>(null);
  // in useEffect: setSocket(newSocket); return () => { newSocket.disconnect(); setSocket(null); };
  ```
  This makes the context re-render whenever the socket changes, eliminating the stale-ref window.

---

### [MEDIUM] `advanceRound` does not guard against going past round index 1

- **File:** `server/src/game/game-engine.ts:164–177`
- **Issue:** `advanceRound` increments `g2_round` unconditionally: `g2_round: state.g2_round + 1`. `G2_DATA` has 2 rounds (indices 0 and 1). If the host clicks "next round" after round 1, `g2_round` becomes 2. `G2_DATA[2]` is `undefined`. In `scoreVotes`, `if (!round) return state` guards this, preventing score corruption. But the client will try to render `G2_DATA[2]` (round title, image URL, questions) and get `undefined`, likely crashing the Phase 3 UI with a JS TypeError.

- **Impact:** Game doesn't crash at the server level but will almost certainly throw a client-side render error after the second round completes.

- **Fix:** Cap the round in `advanceRound`:
  ```typescript
  const MAX_ROUNDS = G2_DATA.length; // import G2_DATA
  export function advanceRound(state: GameState): GameState {
    const nextRound = Math.min(state.g2_round + 1, MAX_ROUNDS - 1);
    return { ...state, g2_round: nextRound, g2_question: 0, ... };
  }
  ```

---

### [MEDIUM] `host:score` can be emitted when no vote gate is open and `g2_da_cham_diem` is already true — double-scoring window between open/close vote

- **File:** `server/src/sockets.ts:76–79`, `server/src/game/scorer.ts:19`
- **Issue:** `scoreVotes` is protected by `if (state.g2_da_cham_diem) return state`. However, if the host emits `host:close_vote` then `host:score` quickly (or sends `host:score` without opening a vote at all), `g2_da_cham_diem` is `false` because `openVote` sets it to `false`. So scoring can proceed even with no votes collected (all null votes). All teams with `null` vote fail `null === correctAnswer` so no scores change — no corruption, but it consumes the scoring window (sets `g2_da_cham_diem: true`) permanently, preventing the host from scoring again if they meant to re-open voting.

  Additionally, `host:score` has no guard for whether voting was ever opened (`g2_cho_phep_vote` is not checked before scoring). It's possible to score at game start (g2_question=0, g2_da_cham_diem=false) without any interaction, which would mark question 0 as scored and reveal slice 0 before the vote happens.

- **Impact:** Host UI error (accidentally click score before opening vote) locks out the question permanently. Recoverable only via reset.

- **Fix:** Add a guard in `scoreVotes` (or sockets handler) requiring that `g2_cho_phep_vote` was at some point opened, or that at least one vote was cast. Simplest: track a `g2_vote_was_opened` boolean, or just check that `g2_da_cham_diem === false` AND `!g2_cho_phep_vote` (voting was closed after being opened) before allowing score.

---

### [MEDIUM] CORS hardcoded to localhost — production deployment breaks silently

- **File:** `server/src/index.ts:21,38`
- **Issue:** Both Express CORS and Socket.IO CORS are hardcoded to `"http://localhost:5173"`. In production, the server serves the built client statically (same origin), so Socket.IO connections come from the same host. However: if the classroom runs on a LAN IP (e.g., `http://192.168.1.x:3000`), student phones opening the URL from the server's own IP will have `origin: "http://192.168.1.x:3000"` — which matches the static-serve same-origin path, but Express CORS will reject `GET /api/state` from that origin if called cross-origin.

  More importantly: if the Node server runs on port 3000 and students access it directly (not through Vite), the origin mismatch during development will cause all socket handshakes from non-Vite clients to fail silently.

- **Impact:** Deployment confusion — works in dev, breaks on classroom LAN if deployed incorrectly.

- **Fix:**
  ```typescript
  const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  app.use(cors({ origin: process.env.NODE_ENV === "production" ? false : CLIENT_ORIGIN }));
  // In prod, same-origin requests don't need CORS headers.
  ```
  Or use `origin: true` in prod to reflect the request origin (acceptable for a single-classroom game with no auth).

---

### [LOW] `closeBuzz` explicitly re-assigns `g1_buzz_winner` after `clearBuzz` clears it

- **File:** `server/src/game/game-engine.ts:45–51`
- **Issue:** `clearBuzz` sets `g1_buzz_winner: null`. Then `closeBuzz` spreads `clearBuzz(state)` and overrides `g1_buzz_winner: state.g1_buzz_winner`. This is the correct intent (preserve winner if the host manually closes buzz). But the logic is confusing: `clearBuzz` is defined as "remove all buzz state" yet `closeBuzz` partially undoes it. If `clearBuzz` is ever used standalone or the comment "preserve winner" is missed, it creates subtle state.
- **Impact:** No current bug — works correctly. Confusing to future readers.
- **Fix:** Either rename `clearBuzz` to `clearBuzzSignals` (to indicate it doesn't touch the winner field), or implement `closeBuzz` without using `clearBuzz`:
  ```typescript
  export function closeBuzz(state: GameState): GameState {
    return { ...state, g1_buzz_active: false, g1_buzz_type: null, g1_timer_seconds: null };
    // g1_buzz_winner intentionally preserved
  }
  ```

---

### [LOW] `player:join` event defined in type maps but has no server handler

- **File:** `server/src/sockets.ts` (missing), `server/src/types/shared.ts:51`
- **Issue:** `ClientToServerEvents` declares `"player:join": (payload: { team: Team }) => void` but `sockets.ts` has no handler for it. The event is silently ignored if emitted.
- **Impact:** No crash. If Phase 2 or 3 uses `player:join` to register/track connected players, it will silently do nothing until a handler is added.
- **Fix:** Either add a stub handler `socket.on("player:join", () => {})` with a comment, or remove from the type map until it's needed (YAGNI).

---

### [LOW] `SummaryPage` is outside `SocketProvider` — cannot access game state

- **File:** `client/src/App.tsx:17–18`
- **Issue:** The `/summary` route renders `<SummaryPage />` outside the `<SocketProvider>` wrapper. If Phase 5 needs the final game state (scores), it cannot use `useSocket()` from within `SummaryPage`.
- **Impact:** Phase 5 will need to restructure routing or lift the provider. Not a current bug (summary is a stub) but a structural trap.
- **Fix:** Either move `SocketProvider` to wrap all routes, or pass scores via URL params / localStorage when navigating to `/summary`.

---

### [INFO] `closeBuzz` resets the buzz-lock unnecessarily

- **File:** `server/src/game/game-engine.ts:46–51`
- **Issue:** `closeBuzz` calls `resetLock()`. If `closeBuzz` is called while a buzz is pending but before any `buzzIn`, the lock is already `false` (was reset by `openBuzz`). If called after `buzzIn` (which — per the CRITICAL finding — incorrectly releases the lock), this is also a no-op. No functional harm but reveals the lock lifecycle is inconsistent.

---

### [INFO] `g1_timer_seconds` and `g2_timer_seconds` are stored in state but no server-side timer ticks

- **File:** `server/src/game/game-engine.ts:8–9`, `server/src/game/game-state.ts`
- **Issue:** Timer seconds are initialized to `15` and `10` respectively when buzz/vote open. The server never decrements them — there is no `setInterval` countdown. The client must implement countdown logic locally. This is a reasonable design choice (avoids server clock drift), but if the client disconnects and reconnects, it will see the timer value from when buzz opened (still `15`), not the time remaining.
- **Impact:** Rejoining clients see wrong countdown; timer is for display only and auto-close is not enforced server-side.

---

### [INFO] Duplicate `initialState` logic in `socket-context.tsx` and `game-state.ts`

- **File:** `client/src/context/socket-context.tsx:7–35`, `server/src/game/game-state.ts`
- **Issue:** `buildInitialState()` in the client duplicates the full `initialState()` structure from the server. If a new field is added to `GameState`, both files need updating. `buildInitialState` exists only to provide a non-null default before the first `state:update` arrives (which is within milliseconds of connect).
- **Impact:** No current bug. Risk of drift as the schema evolves.
- **Fix:** The initial client state could be a simple type-safe empty object or a partial, since it's replaced immediately on connect. At minimum, add a `// KEEP IN SYNC WITH server/src/game/game-state.ts` comment.

---

### [INFO] `host:set_vote` accepts any string as `answer` — no validation against A/B/C/D

- **File:** `server/src/sockets.ts:71–74`
- **Issue:** The `host:set_vote` handler passes `answer` directly to `recordVote`. In `scoreVotes`, the comparison is `state.votes[team] === correctAnswer` where `correctAnswer` is always `"A"`, `"B"`, `"C"`, or `"D"`. An invalid answer like `"E"` will never match and scores zero — no corruption, but no error feedback either.
- **Impact:** Silently wrong scoring if host accidentally emits an invalid answer. Low risk since this is a host-controlled event.

---

## Verified Correct

- **Buzz-in race (corrected understanding):** `tryAcquire()` is synchronous and Node.js event loop processes one callback at a time. Two simultaneous TCP packets are queued and processed sequentially. The CRITICAL bug is that `release()` is called immediately after `tryAcquire()` in `buzzIn`, not that the lock itself is non-atomic.

- **`markWrong` for keyword type:** Correctly sets `g1_buzz_active: false` and does NOT reopen the buzz. Only row-type wrong answers reopen. The `resetLock()` call on both branches is correct.

- **`markCorrect` for keyword type:** Correctly reveals all 7 rows (`Array.from({ length: 7 }, (_, i) => i)`), sets `g1_keyword_solved: true`, and clears current question. Verified via `TOTAL_ROWS = 7`.

- **`advanceQuestion` boundary:** `TOTAL_SLICES = 5`. When at question 4, `nextQ = 5`, `isDone = true`, `g2_question` stays at 4 (not incremented to 5), `g2_done = true`. Correct.

- **`scoreVotes` double-call guard:** `if (state.g2_da_cham_diem) return state` on line 19 of scorer.ts prevents any double-scoring. Correct.

- **`earlyReveal`:** Produces `g2_revealed_slices: [0,1,2,3,4]` (5 slices) and `g2_done: true`. `TOTAL_SLICES = 5`. Correct.

- **`advanceRound`:** Preserves `scores` (spread from `state`), resets all `g2_*` fields. Does not reset `g1_*` fields. Correct for round transitions within Game 2.

- **`resetGame`:** Calls `resetLock()` then returns `initialState()`. Buzz-lock is correctly cleared. Correct.

- **State immutability:** All engine functions use spread syntax (`{ ...state, field: newValue }`). No shared object references are mutated. Arrays are replaced with new arrays (`[...arr, item]`). No mutation bugs found.

- **`scoreVotes` TEAMS import:** Uses `TEAMS` from `../types/shared` consistently, iterates with `for (const team of TEAMS)`. Import path is correct. `team as Team` cast is safe because `TEAMS` is typed as `readonly ["Nhóm 1", ...]`. No inconsistency.

- **Game data migration fidelity:** All 7 G1 rows and both G2 rounds in `game-data.ts` match the original `assets/game1-questions.csv` and the old Python `data.py` exactly (word_ascii, col_offset, questions, answers, correct_answer values all verified). The `keyword_col` discrepancies originate in the CSV, not the migration.

- **Row 5 grid boundary:** `word_length: 30`, `col_offset: 0` → occupies cols 0–29. Keyword column 12 = `word[12]` = 'O' (within range). A 35-column grid (cols 0–34) fully contains the row. No overflow.

- **`useSocket` emit safety:** Correctly checks `if (socket)` before emitting. Stale-null socket during connection window results in silent drop (no crash).

- **`/api/data` exposure:** Exposes all game data including correct answers to any HTTP client. This is intentional for this single-classroom design (no auth required) and consistent with the stated design intent. Not a security concern in this context.

---

## Unresolved Questions

1. **Timer enforcement:** Is it intended that timers are display-only (client-side countdown, no server enforcement)? If a student's phone freezes the browser, the buzz/vote window stays open indefinitely. Phase 4 polish plans should clarify whether `host:close_buzz` / `host:close_vote` are auto-emitted by the host client after countdown, and what happens if the host's browser crashes.

2. **`keyword_col` usage in Phase 2:** Will the Phase 2 crossword renderer derive the keyword column letter from `word_ascii[12 - col_offset]` (correct) or trust `keyword_col` (wrong for 5 rows)? This should be resolved before Phase 2 implementation begins.

3. **`advanceRound` end-of-game:** After both G2 rounds complete, what is the intended UX? The plan doesn't specify whether the host manually navigates to `/summary` or an event triggers it. `advanceRound` at round 1 would push `g2_round` to 2 (out of bounds). The guard fix in finding [MEDIUM-1] should be coordinated with the navigation plan.

4. **`player:join` intent:** Is `player:join` meant for Phase 1 or a later phase? If it's intended to track which teams are online (for a lobby screen), it needs a handler and the GameState may need a `connected_teams: Team[]` field.
