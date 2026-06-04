---
phase: 4
title: "Polish Features"
status: pending
priority: P2
effort: "~0.5d"
dependencies: [2, 3]
---

# Phase 4: Polish Features

## Overview
Layer three classroom-experience enhancements onto the working game: countdown timer for buzz/vote gates, host keyboard shortcuts (F-key safe for Vietnamese IME), and animated score bar transitions. **Sound effects deferred to v2** (host would need to source mp3 files separately — removed to reduce pre-class setup friction). None of these block gameplay — they are additive.

## Requirements
- Functional: Timer counts down from configurable seconds and auto-closes gate at 0; F1–F4 shortcuts mirror the primary host actions; score bars animate width+pulse on score change
- Non-functional: All features degrade gracefully (timer skippable, keyboard shortcuts ignore IME input via `isComposing`)

## Architecture

### Countdown timer — hybrid client/server
```
Client owns the visual countdown (fast feedback).
Server is authoritative — it enforces gate state.

Flow:
  Host clicks "Open Buzzer / Open Vote" → emit event
  Server sets buzz_active/cho_phep_vote = true, also sets timer_seconds in state
  Client receives state:update → starts local countdown from timer_seconds
  Client countdown hits 0 → emit "host:close_buzz" or "host:close_vote"
  Server closes gate, broadcasts state — all clients see gate closed

If client lags/disconnects: server state is source of truth, timer mismatch is cosmetic only.
```

GameState addition:
```typescript
// Add to GameState in shared.ts:
g1_timer_seconds: number | null;  // null = no timer running
g2_timer_seconds: number | null;
```

Timer display: large bold number, red when ≤ 3s (`text-red-500 animate-pulse`), centered above the relevant control.

### Keyboard shortcuts — safe for Vietnamese IME
```
useHostKeyboard hook, attached in HostView.
Guards: event.isComposing check + skip if target is input/textarea.

Shortcut map:
  F1  → open buzz (Game 1) or open vote (Game 2)    context-aware
  F2  → mark correct (when buzz winner exists)
  F3  → mark wrong / close gate
  F4  → trigger scoring (Game 2, when gate closed + not yet scored)
  Esc → focus reset confirm button (not auto-confirm — safety)

Implementation:
  switch (event.code) {
    case "F1": contextualPrimaryAction(); break;
    case "F2": if (state.g1_buzz_winner) emit("host:correct"); break;
    case "F3": contextualSecondaryAction(); break;
    case "F4": if (!state.g2_cho_phep_vote && !state.g2_da_cham_diem) emit("host:score"); break;
    case "Escape": focusResetButton(); break;
  }
```

Small legend overlay in bottom-right corner of HostView showing active shortcuts.

### Animated score bars
```
ScoreBar component (extend from Phase 2 Scoreboard):
  - Bar width: CSS transition-all duration-700 ease-out on width style
  - Score number: instant update (React state), gold text
  - On score change: briefly apply pulse class for 800ms then remove
    (useEffect watching score prop: setTimeout clear after 800ms)

No animation library needed. Pure CSS transitions + one setTimeout.
```

## Related Code Files
- Create: `client/src/hooks/use-host-keyboard.ts`
- Create: `client/src/hooks/use-interval.ts`
- Create: `client/src/components/countdown-timer.tsx`
- Create: `client/src/components/shortcut-legend.tsx`
- Modify: `client/src/components/scoreboard.tsx` — add CSS transition to score bars
- Modify: `client/src/components/game1-host-panel.tsx` — integrate timer + keyboard
- Modify: `client/src/components/game2-host-panel.tsx` — integrate timer + keyboard
- Modify: `client/src/views/host-view.tsx` — attach useHostKeyboard
- Modify: `client/src/types/shared.ts` — add timer fields to GameState
- Modify: `server/src/game/game-state.ts` — add timer fields to initialState
- Modify: `server/src/game/game-engine.ts` — openBuzz/openVote accept optional timer_seconds param

## Implementation Steps

1. **useInterval hook** (`use-interval.ts`)
   - Dan Abramov pattern: `useRef` for callback, `useEffect` for interval
   - Signature: `useInterval(callback: () => void, delayMs: number | null)`
   - Pass `null` as delay to stop interval (used to auto-stop when timer hits 0)

2. **CountdownTimer component** (`countdown-timer.tsx`)
   - Props: `{ initialSeconds: number; onComplete: () => void; running: boolean }`
   - Local state: `secondsLeft`, initialised from `initialSeconds`
   - Uses `useInterval(tick, running && secondsLeft > 0 ? 1000 : null)`
   - Tick: `setSecondsLeft(prev => Math.max(prev - 1, 0))`
   - `secondsLeft === 0` in effect: call `onComplete()`
   - Display: `<span className={secondsLeft <= 3 ? "text-red-500 animate-pulse" : "text-white"}>{secondsLeft}</span>`
   - Reset: `key={initialSeconds}` on component — changing key remounts with fresh state

3. **Integrate timer into Game 1 panel**
   - When host clicks "MỞ CHUÔNG": also pass optional `timer_seconds` (default 15)
   - Show `<CountdownTimer>` above buzz controls while `g1_buzz_active === true`
   - `onComplete`: `emit("host:close_buzz")`

4. **Integrate timer into Game 2 panel**
   - When host clicks "MỞ CỔNG BÌNH CHỌN": pass `timer_seconds` (default 10)
   - Show `<CountdownTimer>` above vote controls while `g2_cho_phep_vote === true`
   - `onComplete`: `emit("host:close_vote")`

5. **useHostKeyboard hook** (`use-host-keyboard.ts`)
   - `useEffect` attaches `keydown` listener to `window` on mount, cleans up on unmount
   - `event.isComposing || event.keyCode === 229` guard at top of handler
   - Skip if `event.target instanceof HTMLInputElement || HTMLTextAreaElement`
   - Accept `state: GameState` + `emit` function as params to make actions context-aware
   - Implement shortcut map from Architecture section

6. **ShortcutLegend component** (`shortcut-legend.tsx`)
   - Fixed bottom-right: small semi-transparent surface panel
   - Lists: `F1 Mở chuông/cổng`, `F2 Đúng`, `F3 Sai/Đóng`, `F4 Tính điểm`, `Esc Reset`
   - Gray out shortcuts not currently applicable (based on game state)
   - Toggle visibility with a small `?` button — hidden by default to keep projector clean

7. **Animated score bars** — update `scoreboard.tsx`
   - Track `prevScores` with `useRef` to detect which teams just scored
   - Apply `animate-pulse` Tailwind class for 800ms on changed score rows
   - Bar `<div>` already has `transition-all duration-700` — width change animates automatically

## Success Criteria
- [ ] CountdownTimer counts from 15s to 0, then auto-closes buzz gate via socket emit
- [ ] CountdownTimer turns red and pulses at ≤3s remaining
- [ ] F1 opens buzz in Game 1 context; F1 opens vote in Game 2 context
- [ ] F2/F3 correctly map to correct/wrong only when buzz winner exists
- [ ] Pressing F1 while typing Vietnamese in a text input does NOT fire the shortcut
- [ ] Score bar width animates over 700ms when score increases
- [ ] Score bar row pulses briefly on score change

## Risk Assessment
- **isComposing not fired on all browsers**: Fallback `keyCode === 229` covers older Chrome. Test with actual Vietnamese IME before class use.
- **Timer drift**: `setInterval` is not perfectly accurate. For 10-15s countdown, accumulated drift is < 500ms — acceptable. Not using `Date.now()` diff for simplicity.
- **Timer re-mount on state update**: If `CountdownTimer` remounts on every state broadcast, countdown resets. Mitigation: pass stable `key` based on question index or gate-open timestamp, not `state` object reference.
- **Sound effects (v2 note)**: Deferred by validation decision. When added: use `HTMLAudioElement`, preload hook, host places `buzz.mp3` / `correct.mp3` / `wrong.mp3` in `client/public/sounds/`.
