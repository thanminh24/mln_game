# Deep Codebase Analysis — MLN Game Web Rebuild
**Date:** 2026-06-03 | **Scope:** Full codebase reverse-engineering + web rebuild plan

---

## 1. What This Project Is

A Vietnamese university classroom game for the MLN111 (Marxist-Leninist Philosophy) course. Built as a Streamlit app running locally, tunneled via Ngrok so students can join on phones. The game teaches the dialectical relationship between "Tồn tại xã hội" (Social Being) and "Ý thức xã hội" (Social Consciousness) through two interactive activities.

**Theme:** Lòng yêu nước (Patriotism) — historical examples: Điện Biên Phủ battle, flood relief solidarity.

---

## 2. File-by-File Analysis

### `mln.py` — Entry point + Router + Player UI
- Reads `?role=` query param to route host vs player view
- Player UI handles: team selection, buzz-in (Game 1), voting (Game 2)
- Uses `st.session_state.my_team` for player identity (browser-local only)
- Auto-refresh: 1s interval when waiting for events
- **Critical flaw:** player team names ("Đội 1–5") don't match state keys ("Nhóm 1–4, 6") → scoring is broken for players

### `core.py` — State + Image utilities
- `init_state()`: creates `game_state.json` if missing
- `read_state()` / `write_state()`: full JSON read/write on every action
- `tao_anh_manh_ghep()`: Pillow-based image slicer — takes image path + list of revealed indices → composites visible slices onto dark background
- **No locking** on file I/O — concurrent writes during buzz race are possible

### `data.py` — All content
- `TUKHOA_DOC = "YÊU NƯỚC"` — the vertical keyword
- `G1_DATA`: 7 rows, each with: romanized word (`tu`), column offset (`offset`), question text (`q`), full answer display (`ans_full`)
- `G2_DATA`: 2 rounds, each with: round name, image path, philosophy explanation, 5 multiple-choice questions (each with `q`, `opts` dict, `ans`)

### `host_game1.py` — Host view for crossword game
- Renders 35-column HTML table as crossword grid
- Revealed rows show letters; hidden rows show underscores
- Column 12 = red (keyword intersection)
- Control panel: row selector, buzz open/close, winner adjudication
- Score display: `st.bar_chart(state["diem_so"])`

### `host_game2.py` — Host view for image-reveal quiz
- Two-column layout: image on right, question + controls on left
- Calls `tao_anh_manh_ghep()` to composite partial image
- Vote status shows per-team: ⏳ waiting, ✅ submitted (with answer revealed after scoring)
- Scoring: loops all teams, checks vote vs correct answer, adds 20pts each if correct

---

## 3. State Machine Analysis

### Game 1 States

```
IDLE (no question selected)
  → host selects row → QUESTION_SELECTED (buzz closed)
    → host opens buzz → BUZZ_OPEN (players can buzz)
      → player buzzes → BUZZ_WON (winner locked in)
        → host marks correct → REVEAL + back to IDLE
        → host marks wrong → back to BUZZ_OPEN
    → player buzzes keyword anytime → KEYWORD_BUZZ
      → host marks correct → KEYWORD_SOLVED (game ends, all rows revealed)
      → host marks wrong → back to previous state
```

### Game 2 States (per question)

```
QUESTION_DISPLAYED (vote gate closed)
  → host opens gate → VOTING_OPEN
    → players vote → votes recorded (can change until closed)
  → host closes gate → GATE_CLOSED
    → host triggers score → SCORED (slices revealed, scores applied)
      → host advances → next question or next round
```

---

## 4. Content Inventory

### Game 1 Questions (7 rows)

| # | Vietnamese Term | English Translation | Points |
|---|----------------|--------------------|----|
| 1 | Ý Thức Xã Hội | Social Consciousness | 10 |
| 2 | Điều Kiện Tự Nhiên | Natural Conditions | 10 |
| 3 | Phương Thức Sản Xuất Vật Chất | Mode of Material Production | 10 |
| 4 | Tồn Tại Xã Hội | Social Being | 10 |
| 5 | Ý Thức Xã Hội Thông Thường | Ordinary Social Consciousness | 10 |
| 6 | Ý Thức Xã Hội Vượt Trước Tồn Tại Xã Hội | Social Consciousness Preceding Social Being | 10 |
| 7 | Ý Thức Đạo Đức | Moral Consciousness | 10 |
| Keyword | YÊU NƯỚC | Patriotism / Love of Country | 30 |

### Game 2 Rounds

**Round 1 — THỰC TIỄN 1: BẢN LĨNH LỊCH SỬ**
- Image: Battle of Điện Biên Phủ flag-raising (ảnh_1_game_2.jpg — confirmed present)
- 5 questions about the 1954 battle and its philosophical significance
- Topics: campaign name, philosophical category, logistics (bicycle transport), dialectical proof, General De Castries

**Round 2 — THỰC TIỄN 2: SỨC MẠNH THỜI BÌNH**
- Image: Flood relief distribution (ảnh_2_game_2.jpg — confirmed present, but referenced as `anh_hien_tai.jpg` in data.py — **filename bug**)
- 5 questions about natural conditions, social consciousness formation, solidarity
- Topics: geographic factors, materialism principle, cultural inheritance, consciousness acting on being

---

## 5. Identified Bugs (Priority Order)

| Priority | Bug | Location | Fix |
|----------|-----|----------|-----|
| P1 | Team name mismatch — player "Đội X" vs state "Nhóm X" | `mln.py` selectbox vs `core.py` init | Align names in both places |
| P1 | Round 2 image path wrong — `anh_hien_tai.jpg` vs actual `ảnh_2_game_2.jpg` | `data.py` line 35 | Update `img_path` in G2_DATA[1] |
| P2 | No true mutex on buzz — concurrent writes to JSON possible | `core.py` + `mln.py` | WebSocket server-side atomic lock |
| P2 | "Đội 5" in player UI maps to no state key | `mln.py` line 53 | Add "Nhóm 5" to state or remove option |
| P3 | Player can see score updates for wrong team (no identity verification) | `mln.py` | Acceptable in classroom trust model |
| P3 | infographic.html referenced but not present | `quy trình.md` | Build it as a React route |

---

## 6. Architecture Gaps (Current → Web Rebuild)

| Current (Streamlit) | Target (Web App) |
|--------------------|-----------------|
| Polling every 1s via `streamlit-autorefresh` | Socket.IO push — no polling |
| JSON file as shared state | In-memory state on Node.js server |
| Pillow image slicing on server | Canvas API in browser |
| Ngrok for public URL | Proper deployment on Railway/Fly.io |
| Streamlit HTML table for crossword | Custom React component with CSS Grid |
| `st.bar_chart()` for scores | Recharts or CSS bar chart |
| No authentication | Room code (sufficient for classroom) |
| Single process, no concurrency safety | Socket.IO event queue = natural serialization |

---

## 7. Crossword Grid Deep Dive

The crossword is a 35-column × 7-row table. Each word is placed at a specific column offset:

```
Col:  0         10        20        30
      |         |         |         |
Row 0:          [YTHUCXAHOI      ] ← offset 12 maps to 'Y' at col 12
Row 1:        [DIEUKIENTUNHIEN   ] ← offset 10 maps to 'I' at col 12
Row 2:        [PHUONGTHUCSANXUAT...] ← offset 10 maps to 'U' at col 12
Row 3:        [TONTAIXAHOI      ] ← offset 10 maps to 'O' at col 12
Row 4:       [YTHUCXAHOITHONG..] ← offset 9 maps to 'N' at col 12
Row 5: [YTHUCXAHOIVUOTTRUOC...  ] ← offset 0 maps to 'U' at col 12
Row 6:        [YTHUCDAODUC      ] ← offset 8 maps to 'O' at col 12

Vertical column 12: Y-I-U-O-N-U-O = YÊU NƯỚC (with diacritics stripped)
```

**Note:** The data stores words without Vietnamese diacritics (`YTHUCXAHOI` not `ÝTHỨCXÃHỘI`). The `ans_full` field has the properly accented display version. The crossword grid renders the ASCII version.

In the web rebuild, we should decide: render ASCII (simpler) or full Unicode Vietnamese (prettier). Either works for the game mechanic.

---

## 8. Scoring Summary

| Action | Points |
|--------|--------|
| Buzz in and answer row correctly | +10 |
| Buzz in and answer row wrong | 0 (buzz reopens) |
| Buzz in and answer keyword correctly | +30 (ends game 1) |
| Answer multiple choice correctly (Game 2) | +20 per team per question |

Max possible score:
- Game 1: 7×10 + 30 = 100 pts (if one team answers everything)
- Game 2: 5×20 + 5×20 = 200 pts per team (if all correct)
- Total per team maximum: 300 pts

---

## 9. Web Rebuild Recommended Stack

```
Backend:   Node.js 20 + TypeScript + Express + Socket.IO 4
Frontend:  React 18 + TypeScript + Tailwind CSS + Vite
Images:    Served as Express static assets
Deploy:    Railway (simplest) or Fly.io
```

**Why Socket.IO over raw WebSocket:**
- Automatic reconnection (students closing/reopening phone browser)
- Room/namespace support
- Fallback to long-polling if WS blocked
- Event-based API matches game event model perfectly

**Why single server (not separate frontend + API):**
- Classroom scale doesn't need CDN
- Eliminates CORS complexity
- Single deploy unit = simpler for teacher to host
- Express serves React build as static files

---

## 10. Implementation Phases (Proposed)

### Phase 1 — Foundation
- [ ] Monorepo setup (server/ + client/)
- [ ] TypeScript + Vite config
- [ ] Socket.IO server with GameState type
- [ ] Game engine: all state transitions as pure functions
- [ ] Basic role routing (host/player) in React

### Phase 2 — Game 1 (Crossword)
- [ ] CrosswordGrid component (CSS Grid, 35×7)
- [ ] BuzzButton component with haptic feedback
- [ ] Host control panel: question selector, buzz open/close, judge buttons
- [ ] Buzz-win animation (red flash, team name)
- [ ] Score sidebar / bar chart

### Phase 3 — Game 2 (Image Reveal)
- [ ] Canvas-based ImageReveal component
- [ ] VoteButtons A/B/C/D with confirmation
- [ ] VoteStatus grid (per-team status)
- [ ] Image slice reveal animation
- [ ] Philosophy lesson overlay after full reveal

### Phase 4 — Polish
- [ ] Game-show visual theme (dark bg, gold accents, Vietnamese typography)
- [ ] Sound effects (buzz-in ding, correct/wrong, score)
- [ ] QR code display on host screen (for player join)
- [ ] Infographic summary route
- [ ] Reset confirmation dialog
- [ ] Mobile responsiveness (large tap targets for phones)

---

## 11. Open Questions

1. **Should the crossword show Vietnamese diacritics?** Data stores ASCII; display could either show ASCII or mapped Unicode. ASCII is safe but less educational.
2. **Single room or multi-room?** Current app is single-room. Multi-room would allow reuse across different classes but adds complexity. Recommend single room for v1.
3. **Should questions be editable via UI?** Teachers may want to change questions without editing code. Out of scope for v1 per PDR, but worth noting.
4. **What is the infographic HTML supposed to contain?** Referenced in operator manual but file not present in repo. Need teacher to provide or we recreate from `giai_thich` fields in G2_DATA.
5. **Fixed 5 teams or configurable?** Current code hardcodes 5 teams (Nhóm 1–4, 6). Web rebuild could allow host to set team count. Recommend keeping 5 as default with easy config.
6. **Buzz sound effects?** Classroom game-show feel would benefit from audio. Browser autoplay restrictions require user gesture — player's buzz tap counts as gesture, so audio can play on their device.
