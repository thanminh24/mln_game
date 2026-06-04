---
phase: 3
title: "Game 2 — Image Reveal Quiz (Lật Tranh)"
status: pending
priority: P1
effort: "~1d"
dependencies: [1, 2]
---

# Phase 3: Game 2 — Image Reveal Quiz (Lật Tranh)

## Overview
Build the full host control panel for Game 2: Canvas-based image slice reveal, MCQ question display, vote gate controls, per-team vote status grid, scoring, and round advancement. End state: host can run both rounds of Game 2, with image slices revealing on correct answers and the philosophy lesson overlay appearing on round completion.

## Requirements
- Functional: Host opens vote gate → teams (manually tracked) answer → host closes gate → host triggers scoring → correct teams +20pts each → corresponding image slice slides in; after all 5 questions: full image + lesson text; host advances to round 2; early-reveal button available at any time
- Non-functional: Canvas handles DPR scaling (no blur on retina); slice slide-in animation 400ms per slice via requestAnimationFrame; smooth crossfade from Canvas to `<img>` after full reveal

## Architecture

### Component tree
```
Game2HostPanel
├── RoundHeader              ← round name + question counter (N/5)
├── QuestionDisplay          ← question text + A/B/C/D options
├── VoteGateControls         ← open/close vote gate buttons
├── VoteStatusGrid           ← 5-team submission status (⏳ / ✅ Đã chốt / ✅C / ❌W after scoring)
├── ScoreActions             ← [💥 TÍNH ĐIỂM & LẬT MẢNH] + [➡️ CÂU HỎI TIẾP THEO]
├── ImageSliceReveal         ← Canvas animation component
│   └── EarlyRevealButton    ← "🚨 GIẢI MÃ SỚM TRANH NÀY!"
└── PhilosophyLesson         ← shown after round complete (full image + giai_thich text)
```

### ImageSliceReveal — Canvas mechanics
```
Image: 640×360 logical (scaled by DPR for sharpness)
Slices: 5 vertical strips, each width = image.width / 5
Dark bg: #1a1a1a fills entire canvas between revealed slices

On new slice reveal:
  requestAnimationFrame loop over 400ms
  progress = elapsed / 400  (0 → 1, clamped)
  Slide-in: slice draws at y-offset = canvas.height * (1 - progress)
            height = canvas.height * progress
  progress === 1 → commit slice to revealedSlices, start next if queued

After all 5 slices: isFullyRevealed = true
  Canvas hidden; <img> crossfades in (opacity 0→1 over 300ms CSS transition)
```

### DPR-safe canvas setup (run on mount + resize)
```typescript
function setupCanvas(canvas: HTMLCanvasElement, container: HTMLDivElement) {
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = container.getBoundingClientRect();
  canvas.style.width  = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width  = width  * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  return ctx;
}
```

### Vote status display states (per team)
```
g2_cho_phep_vote=false, votes[team]=null  → ⏳ gray  "Chờ"
g2_cho_phep_vote=true,  votes[team]=null  → ⏳ yellow "Chưa chốt"
g2_cho_phep_vote=true,  votes[team]!==null→ ✅ blue   "Đã chốt"   (answer hidden until scored)
g2_da_cham_diem=true,   votes[team]=correct → ✅ green "[answer] ✓"
g2_da_cham_diem=true,   votes[team]=wrong   → ❌ red   "[answer] ✗"
```

Note: In v1 host-only mode, votes are set manually by the host clicking team answer buttons on their own panel (no phone input). The server still tracks `votes` in GameState — host uses the VoteStatusGrid to click and set each team's answer before scoring.

### Manual vote input (v1 host-only adaptation)
Since no phone players in v1, add a ManualVotePanel below VoteGateControls:
```
When g2_cho_phep_vote === true:
  Show 5 team rows, each with A/B/C/D buttons
  Host clicks team's answer → emit("host:set_vote", { team, answer })
  Server: records vote in state.votes[team] → broadcast state:update
```
Add `host:set_vote` to ClientToServerEvents in shared.ts.
This panel is hidden once vote gate closes — it's purely for data entry.

## Related Code Files
- Create: `client/src/components/game2-host-panel.tsx`
- Create: `client/src/components/image-slice-reveal.tsx`
- Create: `client/src/components/vote-status-grid.tsx`
- Create: `client/src/components/manual-vote-panel.tsx`
- Modify: `server/src/game/game-engine.ts` — add `setVote()` function
- Modify: `client/src/types/shared.ts` — add `host:set_vote` event
- Modify: `server/src/sockets.ts` — wire `host:set_vote` handler

## Implementation Steps

1. **Game2HostPanel scaffold** (`game2-host-panel.tsx`)
   - Two-column layout: left = question + controls (60%), right = image (40%)
   - Read `state.g2_round`, `state.g2_question`, `state.g2_done` from socket context
   - When `state.g2_round >= G2_DATA.length`: show `<GameEndScreen />` (full scoreboard)

2. **RoundHeader**
   - Large gold text: `G2_DATA[g2_round].ten_vong`
   - Subtitle: `Câu {g2_question + 1} / {G2_DATA[g2_round].cau_hoi.length}`

3. **QuestionDisplay**
   - Surface panel with question text `text-game-lg font-bold`
   - Four option rows: `A. [text]`, `B. [text]`, `C. [text]`, `D. [text]` — `text-game-sm`
   - No answer highlight until `g2_da_cham_diem === true`, then highlight correct option green

4. **VoteGateControls**
   - `g2_cho_phep_vote === false`:
     - Green button "🟢 MỞ CỔNG BÌNH CHỌN" → `emit("host:open_vote")`
   - `g2_cho_phep_vote === true`:
     - Red button "🔴 KHÓA CỔNG BÌNH CHỌN" → `emit("host:close_vote")`

5. **ManualVotePanel** (`manual-vote-panel.tsx`)
   - Rendered when `g2_cho_phep_vote === true && !g2_da_cham_diem`
   - Grid: 5 rows (one per team), 4 columns (A/B/C/D buttons)
   - Selected answer = highlighted blue bg; unselected = surface bg
   - Click → `emit("host:set_vote", { team, answer })`
   - Add `setVote(state, team, answer): GameState` to game-engine.ts
   - Add `"host:set_vote": (payload: { team: Team; answer: string }) => void` to ClientToServerEvents

6. **VoteStatusGrid** (`vote-status-grid.tsx`)
   - 5 cells, one per team
   - Status logic per Architecture section above
   - After scoring (`g2_da_cham_diem === true`): reveal correct/wrong with icon + answer letter

7. **ScoreActions**
   - `!g2_cho_phep_vote && !g2_da_cham_diem`: show "💥 TÍNH ĐIỂM & LẬT MẢNH" button → `emit("host:score")`
   - `g2_da_cham_diem === true`: show "➡️ CÂU HỎI TIẾP THEO" → `emit("host:next_q")`
   - When `g2_done === true` or `g2_question >= 5`: show "➡️ SANG TRANH TIẾP THEO" → `emit("host:next_round")`

8. **ImageSliceReveal** (`image-slice-reveal.tsx`)
   - Props: `{ imgSrc: string; revealedSlices: number[]; totalSlices: number; isFullyRevealed: boolean }`
   - On mount: load image, setupCanvas (DPR-safe), draw dark bg
   - Watch `revealedSlices.length`: when length increases, start slide-in animation for new slice index
   - Animation loop: `requestAnimationFrame` → compute progress → draw all committed slices + animate current → on complete, move to next queued slice
   - Cleanup: `cancelAnimationFrame` on unmount
   - When `isFullyRevealed`: hide canvas, show `<img>` with `opacity: 0 → 1` CSS transition
   - EarlyRevealButton: "🚨 GIẢI MÃ SỚM TRANH NÀY!" button below canvas → `emit("host:early_reveal")`

9. **PhilosophyLesson overlay** (inside `game2-host-panel.tsx`)
   - Rendered when `g2_done === true`
   - Full image (via `<img>`) + green surface box below with `G2_DATA[g2_round].giai_thich` text
   - Text: `text-game-sm leading-relaxed` — readable on projector
   - "➡️ SANG TRANH TIẾP THEO" button → `emit("host:next_round")`

10. **GameEndScreen** (inside `game2-host-panel.tsx` or separate component)
    - Full-width: "🏆 KẾT THÚC TOÀN BỘ CHƯƠNG TRÌNH!"
    - Final Scoreboard with all 5 teams + scores (larger version of Scoreboard component from Phase 2)
    - Link to `/summary` page

11. **Server: wire new events** (`sockets.ts`)
    - `host:set_vote` → `setVote(state, team, answer)` → broadcast
    - `host:next_round` → `advanceRound(state)` → broadcast (resets g2_question, g2_revealed_slices, g2_done, votes, g2_cho_phep_vote, g2_da_cham_diem; increments g2_round)

## Success Criteria
- [ ] Canvas renders dark background with no image initially
- [ ] After `host:score` on a question with at least one correct vote: corresponding slice slides in over 400ms
- [ ] Canvas is sharp (no blur) on standard and high-DPI displays
- [ ] After all 5 slices revealed: canvas hides, `<img>` fades in, philosophy lesson text appears
- [ ] ManualVotePanel allows host to set A/B/C/D for each team; state updates in real-time
- [ ] VoteStatusGrid shows correct/wrong icons after scoring
- [ ] "TÍNH ĐIỂM" button disabled/hidden while vote gate is open
- [ ] Round 2 loads correctly after Round 1 completes (scores preserved, new image loaded)
- [ ] Early reveal works — sets `g2_done=true`, shows full image immediately

## Risk Assessment
- **Canvas animation queue**: If host triggers score twice quickly, two slices could animate simultaneously. Mitigation: disable "TÍNH ĐIỂM" button once `g2_da_cham_diem === true`; server guard in `scoreVotes()` checks `da_cham_diem` before applying.
- **Image load timing**: Canvas may draw before image loads. Mitigation: draw initial dark bg immediately; only begin slice reveal after `img.onload` fires.
- **DPR on resize**: Canvas context scale must be re-applied on window resize. Mitigation: `ResizeObserver` on container ref triggers `setupCanvas` re-run + redraw.
