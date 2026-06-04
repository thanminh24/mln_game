---
phase: 5
title: "Summary / Infographic Page"
status: pending
priority: P2
effort: "~0.5d"
dependencies: [1]
---

# Phase 5: Summary / Infographic Page (/summary)

## Overview
Build the `/summary` route as a standalone infographic-styled landing page that the teacher opens after the game to summarise the philosophy lesson. It is a static React route — no Socket.IO, reads game data from `GET /api/data`. This is also the "creative product" — it should look polished enough to leave on screen after class or screenshot for sharing.

## Requirements
- Functional: `/summary` route shows: lesson theme header, Round 1 full image + philosophy explanation, Round 2 full image + philosophy explanation, final scoreboard (from game state via `GET /api/state`), lesson conclusion block
- Non-functional: Visually distinct from the game control panel — infographic feel with full-width sections, large imagery, readable typography; works standalone (no game running required); print-friendly layout option

## Architecture

### Route structure
Uses **React Router v6** (`react-router-dom`) for clean pathname routing:
```
/ or /?role=host  → HostView   (via useSearchParams for ?role=)
/?role=player     → PlayerView (v1 stub)
/summary          → SummaryPage (no socket needed)
```

```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/" element={<GameView />} />  {/* GameView reads ?role= */}
      </Routes>
    </BrowserRouter>
  );
}
```

Add `react-router-dom` to `client/package.json` deps in Phase 1 or Phase 5.

### SummaryPage layout (scroll-based sections)
```
┌──────────────────────────────────────────────────────┐
│  HERO SECTION                                        │
│  [large title] MỐI QUAN HỆ BIỆN CHỨNG               │
│  Tồn tại Xã hội ↔ Ý thức Xã hội                     │
│  [subtitle] Lòng yêu nước Việt Nam                   │
│  [course tag] MLN111 — Triết học Mác - Lênin         │
├──────────────────────────────────────────────────────┤
│  DIALECTIC DIAGRAM (visual)                          │
│  TTXH → (quyết định) → YTXH → (tác động trở lại) →  │
│  Simple SVG arrow diagram, gold accents on dark bg   │
├──────────────────────────────────────────────────────┤
│  ROUND 1 SECTION — THỰC TIỄN 1: BẢN LĨNH LỊCH SỬ  │
│  [full-width image: round1-dien-bien-phu.jpg]        │
│  [giai_thich text from G2_DATA[0]]                  │
│  [bullet: key philosophical point highlighted]       │
├──────────────────────────────────────────────────────┤
│  ROUND 2 SECTION — THỰC TIỄN 2: SỨC MẠNH THỜI BÌNH │
│  [full-width image: round2-cuu-tro-lu.jpg]           │
│  [giai_thich text from G2_DATA[1]]                  │
│  [bullet: key philosophical point highlighted]       │
├──────────────────────────────────────────────────────┤
│  FINAL SCOREBOARD                                    │
│  Rank 1 / 2 / 3 display (podium style)              │
│  Full score table below                              │
├──────────────────────────────────────────────────────┤
│  CONCLUSION BLOCK                                    │
│  Quote: "Lòng yêu nước không chỉ là lý thuyết..."   │
│  [course footer: MLN111, university branding]        │
└──────────────────────────────────────────────────────┘
```

### Design language — infographic adaptations
The game uses purely functional colors. The summary page adds layout expressiveness:
- **Section backgrounds**: alternate `#0f0f0f` and `#111827` (very dark blue-tint) for visual rhythm
- **Image treatment**: full-width images with `object-cover`, slight overlay gradient at bottom for text legibility
- **Accent bars**: 4px gold left-border on `giai_thich` blockquotes
- **Dialectic diagram**: simple inline SVG, no external library — two labeled boxes connected by curved arrows
- **Typography**: same Be Vietnam Pro; hero heading `text-game-xl font-black`; section headings `text-game-lg font-bold text-gold`; body `text-game-sm leading-relaxed`
- **Podium scoreboard**: top 3 teams in gold/silver/bronze boxes; remaining 2 in a flat table below

### Data fetching
```typescript
// SummaryPage fetches on mount — no socket
useEffect(() => {
  Promise.all([
    fetch("/api/data").then(r => r.json()),
    fetch("/api/state").then(r => r.json()),
  ]).then(([gameData, gameState]) => {
    setData(gameData);
    setScores(gameState.scores);
  });
}, []);
```

If `/api/state` fails (game server not running), show `scores = null` and skip scoreboard section gracefully.

### Dialectic diagram SVG (inline, no library)
```
TTXH ──→ quyết định ──→ YTXH
 ↑                         │
 └──── tác động trở lại ───┘

Rendered as two rounded rects + two labeled curved arrows.
Colors: TTXH box = blue, YTXH box = gold, arrows = white/muted.
Fits in a 600×200px SVG element, centered in section.
```

## Related Code Files
- Create: `client/src/views/summary-page.tsx`
- Create: `client/src/components/dialectic-diagram.tsx`
- Create: `client/src/components/podium-scoreboard.tsx`
- Modify: `client/src/App.tsx` — add React Router v6 with `/summary` route (add `react-router-dom` dep)
- Modify: `client/package.json` — add `react-router-dom` dependency
- Modify: `server/src/routes.ts` — verify `GET /api/data` returns full G1_DATA + G2_DATA

## Implementation Steps

1. **Add React Router v6 routing** in `App.tsx`
   - `npm install react-router-dom` in `client/`
   - Wrap app in `<BrowserRouter>`, add `<Routes>` with `/summary` → `<SummaryPage />` and `/` → `<GameView />`
   - `GameView`: reads `useSearchParams()` for `?role=` to decide HostView vs PlayerView
   - Ensure Express SPA fallback (`app.get("*", ...)`) already in Phase 1 handles `/summary` on reload

2. **SummaryPage shell** (`summary-page.tsx`)
   - `useEffect` fetch from `/api/data` + `/api/state`
   - Loading state: simple dark screen with "Đang tải..." centered
   - Error state: fallback with hardcoded `giai_thich` strings (they don't change, can be inlined)

3. **HeroSection**
   - Full-viewport-height section, vertically centered content
   - Background: `#0f0f0f` with subtle radial gradient toward center (CSS only)
   - Main title: "MỐI QUAN HỆ BIỆN CHỨNG" `text-game-xl font-black text-center`
   - Subtitle: "Tồn tại Xã hội ↔ Ý thức Xã hội" gold text
   - Course tag: "MLN111 — Triết học Mác - Lênin" muted small text

4. **DialecticDiagram** (`dialectic-diagram.tsx`)
   - Inline SVG 600×180 viewBox
   - Two `<rect rx="12">` boxes for TTXH and YTXH
   - Two `<path>` curved arrows with `<textPath>` labels
   - No interaction, purely visual

5. **Round sections** (map over `G2_DATA`)
   ```tsx
   {gameData.rounds.map((round, i) => (
     <RoundSection key={i} round={round} index={i} />
   ))}
   ```
   - RoundSection: dark-tinted full-width section
   - `<img src={`/images/${round.image_file}`} className="w-full h-64 object-cover" />`
   - Gradient overlay: `absolute bottom-0 bg-gradient-to-t from-black/80 to-transparent`
   - `giai_thich` text in a `<blockquote>` with 4px gold left border, `pl-4 border-l-4 border-gold`

6. **PodiumScoreboard** (`podium-scoreboard.tsx`)
   - Sort teams by score descending
   - Top 3: render as podium columns (rank 2 shorter, rank 1 tallest, rank 3 shorter)
     - Height via inline style: `{ height: rank === 1 ? "120px" : rank === 2 ? "90px" : "70px" }`
     - Colors: gold / `#C0C0C0` silver / `#CD7F32` bronze
   - Ranks 4–5: flat two-column table below podium
   - If scores not available: show "Điểm số chưa có" placeholder

7. **ConclusionBlock**
   - Gold-bordered surface panel
   - Pull quote from lesson theme (hardcoded — doesn't change)
   - Course + date footer

8. **Verify Express SPA fallback** handles `/summary`
   - `app.get("*", (req, res) => res.sendFile(path.join(clientBuildPath, "index.html")))` already covers it
   - Vite dev: no extra config needed (React handles pathname in browser)

## Success Criteria
- [ ] `/summary` loads without errors when game server is running
- [ ] `/summary` loads gracefully (skips scoreboard) when game server is NOT running
- [ ] Both round images display full-width with correct file names
- [ ] `giai_thich` text from `G2_DATA` renders with gold left-border blockquote styling
- [ ] Dialectic diagram SVG renders TTXH ↔ YTXH with arrows and labels
- [ ] Podium scoreboard shows top 3 teams in correct rank order
- [ ] Page is readable on a projector (fonts large enough, contrast sufficient)
- [ ] Page scrolls smoothly through all sections without layout breaks

## Risk Assessment
- **API not running**: SummaryPage must not crash if server is down. Mitigation: try/catch in fetch, fallback to null state, render without scoreboard.
- **Image path mismatch**: `round.image_file` from API data must match filename in `client/public/images/`. Mitigation: verify filenames in game-data.ts match exactly what was copied to public/images/.
- **Podium at equal scores**: Sort is stable in modern JS — teams with equal scores keep their original order. Acceptable for classroom context.
- **Print layout**: If teacher wants to print the summary, `@media print` may invert colors badly. Out of scope for v1 — note in README.
