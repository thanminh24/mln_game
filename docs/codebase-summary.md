# MLN Game Full — Codebase Summary

## Project Identity

**Name:** MLN111 Philosophy Interactive Game
**Theme:** "Tồn tại xã hội & Ý thức xã hội — Lòng yêu nước Việt Nam"
(Social Being & Social Consciousness — Vietnamese Patriotism)
**Course:** MLN111 — Marxist-Leninist Philosophy, Vietnamese university classroom
**Current Stack:** Python · Streamlit · Pillow · streamlit-autorefresh · Ngrok
**Multiplayer model:** Shared JSON file as state store; Ngrok tunnels local Streamlit port to public URL

---

## File Map

```
mln_game_full/
├── mln.py              # Entry point — router + player UI
├── core.py             # State I/O (JSON file) + image slicer utility
├── data.py             # All question content (Game 1 + Game 2)
├── host_game1.py       # Host view: crossword buzzer game
├── host_game2.py       # Host view: image-reveal quiz game
├── game_state.json     # Live shared state (flat JSON, written on every action)
├── requirements.txt    # streamlit, pillow, streamlit-autorefresh
├── ảnh_1_game_2.jpg    # Round 1 image: Battle of Điện Biên Phủ (flag raising)
├── ảnh_2_game_2.jpg    # Round 2 image: Flood relief aid distribution
└── quy trình.md        # Host operator manual (Vietnamese)
```

---

## Architecture Overview

```
Browser (Host — projector)         Browser (Players — phones)
       │                                    │
       └──────── Ngrok HTTPS tunnel ────────┘
                         │
              Streamlit app (mln.py)
             role=host  |  role=player (via ?role= query param)
                         │
              game_state.json  (shared state)
                         │
              host_game1.py / host_game2.py (host rendering)
              core.py (read/write/image)
              data.py  (question data)
```

**Role routing:** `?role=host` → host views. No param (default) → player view.
**State sync:** All clients poll via `streamlit-autorefresh` every 1 second.
**Persistence:** Single flat JSON file (`game_state.json`). No database. Race condition protection exists on buzz-in (re-read state before write).

---

## State Schema (`game_state.json`)

```json
{
  "mode": "game1" | "game2",

  // --- GAME 1: Crossword Buzzer ---
  "g1_opened": [0, 2],          // indices of revealed rows
  "g1_current_q": 0,            // index of currently active question (or null)
  "g1_buzz_active": false,      // is the row buzzer currently open?
  "g1_buzz_winner": null,       // team name that buzzed in first
  "g1_buzz_type": null,         // "row" | "keyword"
  "g1_keyword_solved": false,   // vertical keyword solved = game 1 ends

  // --- GAME 2: Image Reveal Quiz ---
  "g2_vong": 0,                 // current round index (0-based)
  "g2_cau": 0,                  // current question index within round
  "g2_manh_mo": [],             // list of revealed image slices (by question index)
  "g2_done": false,             // round complete (all questions answered)

  // --- Shared ---
  "diem_so": { "Nhóm 1": 0, "Nhóm 2": 0, "Nhóm 3": 0, "Nhóm 4": 0, "Nhóm 6": 0 },
  "trang_thai_vote": { "Nhóm 1": null, ... },   // each team's current answer choice
  "cho_phep_vote": false,       // host gate: is voting open?
  "da_cham_diem": false         // has scoring been applied for current question?
}
```

**Teams:** Nhóm 1, 2, 3, 4, 6 (5 teams — note skip of Nhóm 5)
**Player UI teams:** "Đội 1" through "Đội 5" (mismatch with state keys — bug in current code)

---

## Game 1: Crossword Buzzer (Ô Chữ Lý Thuyết)

### Concept
7 horizontal word rows arranged so that column index 12 spells the vertical keyword **"YÊU NƯỚC"** (Patriotism). Each row is a philosophy vocabulary word from MLN111 syllabus.

### Questions (G1_DATA)
| Row | Word (romanized) | Length | Keyword col offset | Topic |
|-----|-----------------|--------|--------------------|-------|
| 0 | YTHUCXAHOI | 10 | 12 | Social Consciousness |
| 1 | DIEUKIENTUNHIEN | 15 | 10 | Natural Conditions |
| 2 | PHUONGTHUCSANXUATVATCHAT | 24 | 10 | Mode of Material Production |
| 3 | TONTAIXAHOI | 11 | 10 | Social Being |
| 4 | YTHUCXAHOITHONGTHUONG | 21 | 9 | Ordinary Social Consciousness |
| 5 | YTHUCXAHOIVUOTTRUOCTONTAIXAHOI | 30 | 0 | Social Consciousness Ahead of Social Being |
| 6 | YTHUCDAODUC | 11 | 8 | Moral Consciousness |

### Scoring
- Correct row answer: **+10 points**
- Correct vertical keyword guess: **+30 points** (ends Game 1)

### Mechanics Flow
```
Host selects a row question
  → Host opens buzzer ("🟢 MỞ CHUÔNG")
    → Players see "Buzz" button appear
      → First team to tap wins; others see lock screen
        → Host sees winner alert (NO answer shown — MC reads from paper)
          → ✅ Correct: +10pts, row revealed
          → ❌ Wrong: buzzer reopens for other teams
Host can also accept "keyword" buzz at any time
  → +30pts if correct → all rows revealed → Game 1 ends
```

### Crossword Grid Rendering
- 35-column HTML table (covers longest word's reach)
- Revealed cells: colored blue (#3498db)
- Column 12 (vertical keyword intersection): red (#e74c3c)
- Hidden cells: transparent with border placeholder

---

## Game 2: Image Reveal Quiz (Lật Tranh Thực Tiễn)

### Concept
Two rounds, each with 5 multiple-choice questions (A/B/C/D). Each correct answer from any team reveals one slice of a mystery image. When all 5 slices are revealed, the full image appears with a philosophy lesson overlay.

### Rounds (G2_DATA)
| Round | Title | Image | Subject |
|-------|-------|-------|---------|
| 0 | THỰC TIỄN 1: BẢN LĨNH LỊCH SỬ | ảnh_1_game_2.jpg | Battle of Điện Biên Phủ |
| 1 | THỰC TIỄN 2: SỨC MẠNH THỜI BÌNH | ảnh_2_game_2.jpg | Flood relief |

### Image Slicing (core.py: `tao_anh_manh_ghep`)
- Image split into N vertical strips (N = number of questions in round)
- Revealed strips composited onto dark background (30,30,30 RGB)
- Each correct answer reveals the corresponding strip by index

### Scoring
- Each team that answers correctly: **+20 points per question**
- All teams can score on the same question simultaneously

### Mechanics Flow
```
Host opens vote gate ("🟢 MỞ CỔNG BÌNH CHỌN")
  → All player phones show A / B / C / D buttons
    → Teams tap their answer (can change before gate closes)
      → Host closes gate ("🔴 KHÓA CỔNG")
        → Host triggers scoring ("💥 TÍNH ĐIỂM & LẬT MẢNH")
          → Correct teams get +20pts, image slice revealed
            → Next question
After all 5 questions: full image shown + philosophy lesson text
Host can "early reveal" image at any time
```

---

## Player UI Mechanics

- Team selection screen on first load (stored in `st.session_state`)
- Auto-refresh every 1 second while waiting
- **Game 1 states shown:**
  - Keyword buzz button (always visible)
  - Row buzz button (only when `g1_buzz_active == true`)
  - "You won the buzz" confirmation
  - "Team X is answering — wait" lockout
  - "Keyword solved" end screen
- **Game 2 states shown:**
  - "Voting locked" waiting screen
  - A/B/C/D answer buttons
  - "Answer confirmed" with change option

---

## Operator Manual Summary (quy trình.md)

1. Run `streamlit run mln.py`
2. Run `ngrok http 127.0.0.1:8501`
3. Host URL: `<ngrok-url>?role=host` → project on screen, F11 fullscreen
4. Player URL: `<ngrok-url>` → generate QR code → teams scan on phones
5. Reset button wipes `game_state.json` and reinitializes
6. After game: open `infographic.html` for lesson summary (file not present in repo)

---

## Known Issues / Gaps

| # | Issue | Impact |
|---|-------|--------|
| 1 | Team name mismatch: state uses "Nhóm X", player UI uses "Đội X" | Scoring never maps to real team names |
| 2 | Race condition on buzz: read-before-write is partial mitigation only | Two near-simultaneous taps could both succeed |
| 3 | `game_state.json` is a single file — no multi-game sessions | Classroom-only, one game at a time |
| 4 | No authentication — anyone with URL can be any team | Classroom trust model only |
| 5 | Streamlit polling (1s interval) causes visible flicker on projector | UX issue flagged in operator manual |
| 6 | `infographic.html` referenced but not present in repo | Post-game summary unavailable |
| 7 | `anh_hien_tai.jpg` referenced in data.py but file named `ảnh_2_game_2.jpg` | Round 2 image would 404 in production |
| 8 | Player UI shows "Đội 5" but state only tracks Nhóm 1–4, 6 | Team 5 cannot score |

---

## Content Domain

All questions are from Vietnamese university MLN111 (Marxist-Leninist Philosophy):
- **Topic:** Mối quan hệ biện chứng giữa Tồn tại xã hội và Ý thức xã hội
  (Dialectical relationship between Social Being and Social Consciousness)
- **Lesson theme:** Lòng yêu nước (Patriotism) as manifestation of social consciousness acting on social being
- **Historical examples:** Battle of Điện Biên Phủ 1954, flood relief solidarity
