# UI & Mechanics Implementation Research — MLN Game Web Rebuild
**Date:** 2026-06-03 | **Scope:** All pages, all mechanics, question editing, minimal UI

---

## Design Principles

- **Minimal, no fuss.** Dark background, white/accent text, large tap targets. No animations beyond what serves the game. No decorative elements.
- **Two audiences, two screen sizes.** Host on 16:9 projector laptop. Players on phones (portrait, thumb-reachable).
- **Color language is functional.** Colors signal game state, not decoration.
- **Vietnamese first.** UI copy is Vietnamese. Font must handle diacritics: use `Be Vietnam Pro` (Google Fonts, free, designed for Vietnamese).

### Color Palette (Minimal)
```
Background:   #0f0f0f  (near-black)
Surface:      #1a1a1a  (cards, panels)
Border:       #2a2a2a
Text primary: #ffffff
Text muted:   #888888
Accent gold:  #f5a623  (scores, highlights)
Blue (open):  #3b82f6  (buzz open, vote open)
Green (ok):   #22c55e  (correct, won)
Red (alert):  #ef4444  (buzz winner alert, wrong)
Red keyword:  #dc2626  (crossword column 12)
```

---

## Page Inventory

```
/                → redirect based on ?role=
/?role=host      → HostApp  (all host views)
/?role=player    → PlayerApp (all player views)
/summary         → Post-game infographic summary (static)
```

No router needed beyond this. Host and Player are separate React trees sharing one Socket.IO connection.

---

## Page 1: Player — Team Select Screen

**When shown:** First load, `my_team` not set in localStorage.

### Layout (phone portrait)
```
┌─────────────────────────┐
│                         │
│   🎓 TRIẾT HỌC MLN111  │  ← title, large, centered
│   Tồn tại & Ý thức     │  ← subtitle, muted
│                         │
│  ┌───────────────────┐  │
│  │   Chọn nhóm bạn   │  ← label
│  │ ┌─────────────┐   │  │
│  │ │  Nhóm 1   ▾ │   │  │  ← native <select> or tap list
│  │ └─────────────┘   │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │    VÀO GAME  →    │  │  ← full-width, blue bg, 56px tall
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

### Mechanics
- Options: Nhóm 1, Nhóm 2, Nhóm 3, Nhóm 4, Nhóm 6 (matches state keys exactly)
- On submit: `socket.emit("player:join", { team })` → save to `localStorage("my_team")`
- On reconnect: read `localStorage` → auto-join without re-selecting
- No server validation needed (classroom trust model)

### Component
```tsx
// PlayerTeamSelect.tsx
const TEAMS = ["Nhóm 1", "Nhóm 2", "Nhóm 3", "Nhóm 4", "Nhóm 6"];

// Use a visible button list (not <select>) — easier to tap on phone
TEAMS.map(t => (
  <button
    key={t}
    onClick={() => setSelected(t)}
    className={selected === t ? "btn-selected" : "btn-default"}
  >
    {t}
  </button>
))
```

---

## Page 2: Player — Game 1 View (Buzz-In)

**When shown:** `state.mode === "game1"` and team is joined.

### State-driven rendering — 4 sub-states

#### Sub-state A: Waiting (no question active, buzz closed)
```
┌─────────────────────────┐
│  📱 Nhóm 1              │
│  Phần 1 – Ô Chữ        │
│                         │
│  ⏳ Chờ câu hỏi...     │  ← muted, centered
│                         │
│  ──────────────────     │
│                         │
│  🔥 TỪ KHÓA DỌC (30đ)  │
│  ┌───────────────────┐  │
│  │  🚀 BẤM CHUÔNG    │  │  ← always-on, gold border
│  │   GIẢI TỪ KHÓA    │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

#### Sub-state B: Buzz Open (row buzzer active)
```
┌─────────────────────────┐
│  📱 Nhóm 1              │
│                         │
│  🔔 CHUÔNG ĐANG MỞ!    │  ← blue pulsing border on button
│                         │
│  ┌───────────────────┐  │
│  │  ✋ GIÀNH QUYỀN   │  │  ← LARGE, 96px tall, blue bg
│  │   HÀNG NGANG      │  │  ← this is the primary action
│  └───────────────────┘  │
│                         │
│  ──────────────────     │
│                         │
│  🔥 TỪ KHÓA DỌC (30đ)  │
│  ┌───────────────────┐  │
│  │  🚀 BẤM CHUÔNG    │  │
│  │   GIẢI TỪ KHÓA    │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```
**Critical:** Row buzz button has a pulsing border animation (`animate-pulse`) so players notice immediately.

#### Sub-state C: This team won the buzz
```
┌─────────────────────────┐
│  📱 Nhóm 1              │
│                         │
│  ┌───────────────────┐  │
│  │  🎤 BẠN ĐÃ        │  │
│  │  GIÀNH QUYỀN!     │  │  ← green bg, full width
│  │                   │  │
│  │  Đứng lên và      │  │
│  │  trả lời qua mic  │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

#### Sub-state D: Another team won the buzz
```
┌─────────────────────────┐
│  📱 Nhóm 1              │
│                         │
│  ┌───────────────────┐  │
│  │  🚨 TẠM DỪNG      │  │
│  │                   │  │  ← red bg
│  │  Nhóm 3 đang      │  │
│  │  trả lời...       │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

#### Sub-state E: Game 1 complete (keyword solved)
```
┌─────────────────────────┐
│                         │
│  🎉 TỪ KHÓA ĐÃ GIẢI!  │
│                         │
│  YÊU NƯỚC               │  ← large gold text
│                         │
│  Chờ host chuyển game   │
│                         │
└─────────────────────────┘
```

### Mechanic: Buzz Race Condition (critical)
```
Player taps buzz:
  1. Button immediately disabled (prevent double-tap)
  2. socket.emit("player:buzz", { team, type })
  3. Server receives: if (state.g1_buzz_winner !== null) → discard
                      else → state.g1_buzz_winner = team → broadcast
  4. state:update arrives at all clients → render correct sub-state

Node.js is single-threaded: Socket.IO events are processed one at a time.
Two simultaneous emits are queued → first one wins atomically.
No mutex needed beyond the single-thread guarantee.
```

---

## Page 3: Player — Game 2 View (Voting)

**When shown:** `state.mode === "game2"` and team is joined.

### Sub-state A: Gate closed
```
┌─────────────────────────┐
│  📱 Nhóm 1              │
│  Phần 2 – Lật Tranh     │
│                         │
│  🔒 Đang chờ host       │
│     mở cổng bình chọn  │  ← muted, centered
│                         │
│  (Lắng nghe câu hỏi)   │
│                         │
└─────────────────────────┘
```

### Sub-state B: Gate open, not yet voted
```
┌─────────────────────────┐
│  📱 Nhóm 1              │
│  Chọn đáp án:           │
│                         │
│  ┌───────────────────┐  │
│  │        A          │  │  ← 72px tall each
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │        B          │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │        C          │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │        D          │  │
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```
**Note:** No question text shown on player phone — MC reads it aloud. Phone is just the voting device.

### Sub-state C: Voted, can change
```
┌─────────────────────────┐
│  📱 Nhóm 1              │
│                         │
│  ✅ Đã chốt: C          │  ← green bg
│                         │
│  ┌───────────────────┐  │
│  │   Đổi đáp án      │  │  ← smaller, outlined
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
```

### Sub-state D: Scored (gate closed, results shown)
- Server closes gate after scoring → players see gate-closed screen again
- No need to show result to player — projector shows it

---

## Page 4: Host — Game 1 Control Panel

This is the projector view + control panel combined (same screen for now, two-column layout).

### Layout (16:9 landscape)
```
┌──────────────────────────────────────────────────────────────┐
│  PHẦN 1: GIẢI MÃ Ô CHỮ LÝ THUYẾT    [Score: N1:10 N2:0...] │
├───────────────────────────────┬──────────────────────────────┤
│                               │                              │
│   BẢNG Ô CHỮ (35 × 7 grid)  │    ❓ ĐIỀU KHIỂN             │
│                               │                              │
│   [crossword grid component] │  Chọn hàng: [dropdown]       │
│                               │  [Chọn câu hỏi này]         │
│                               │                              │
│                               │  Câu hỏi đang hỏi:          │
│                               │  "[question text]"          │
│                               │                              │
│                               │  [🟢 MỞ CHUÔNG]            │
│                               │    or                        │
│                               │  ⏳ Chờ bấm chuông...      │
│                               │  [🔴 KHÓA CHUÔNG]           │
│                               │                              │
│                               │  📊 Bảng điểm               │
│                               │  [bar chart]                 │
└───────────────────────────────┴──────────────────────────────┘
```

**When buzz winner exists** — right panel transforms to:
```
┌─────────────────────────────────┐
│  🚨 NHÓM 3 BẤM CHUÔNG!         │  ← red bg, large
│  (Loại: Hàng ngang / Từ khóa)  │
│                                 │
│  [✅ ĐÚNG (Cộng Xđ)]           │  ← green, prominent
│  [❌ SAI]                       │  ← outlined/muted
└─────────────────────────────────┘
```

### CrosswordGrid Component — Deep Design

```tsx
// CrosswordGrid.tsx
// 35 columns × 7 rows HTML table
// Each cell: 24px × 24px

interface CellProps {
  char: string | null;   // null = outside word boundaries
  revealed: boolean;
  isKeywordCol: boolean; // col === 12
}

// Cell rendering logic:
// - Outside word boundary (char === null): transparent, no border
// - Inside word boundary, not revealed: dark bg (#1a1a1a), light border, no letter
// - Inside word boundary, revealed, not keyword col: blue bg (#3b82f6), white letter
// - Inside word boundary, revealed, IS keyword col: red bg (#dc2626), white letter
// - Keyword col not yet revealed: dark red border hint (optional, to hint at vertical word)

function buildRow(wordRow: G1Row, revealedIndices: number[], rowIdx: number) {
  const cells: CellProps[] = Array(35).fill({ char: null, revealed: false, isKeywordCol: false });
  const word = wordRow.tu; // e.g. "YTHUCXAHOI"
  const offset = wordRow.offset;

  for (let i = 0; i < word.length; i++) {
    const colIdx = offset + i;
    cells[colIdx] = {
      char: word[i],
      revealed: revealedIndices.includes(rowIdx),
      isKeywordCol: colIdx === 12,
    };
  }
  return cells;
}
```

**Font choice for grid:** Monospace (`font-mono`), bold. Each cell fixed 24×24px. At 35 cols: 35 × 26px = 910px wide. This fits a 1280px projector with margins.

**Revealed animation:** When a row becomes revealed, cells fade in one by one (left to right, 50ms delay each). Use CSS `@keyframes fadeIn` triggered by a `revealed` class being added.

---

## Page 5: Host — Game 2 Control Panel

### Layout (16:9 landscape)
```
┌──────────────────────────────────────────────────────────────┐
│  PHẦN 2: LẬT TRANH THỰC TIỄN            [Score: N1:30 ...] │
├──────────────────────────────┬───────────────────────────────┤
│                              │                               │
│  🌍 THỰC TIỄN 1: BẢN LĨNH  │    🖼️  BỨC TRANH MẢNH GHÉP  │
│                              │                               │
│  [question text]            │   [Canvas — image reveal]     │
│                              │                               │
│  A. [option text]           │   [🚨 GIẢI MÃ SỚM TRANH]    │
│  B. [option text]           │                               │
│  C. [option text]           │                               │
│  D. [option text]           │                               │
│                              │                               │
│  ────────────────────        │                               │
│                              │                               │
│  [🟢 MỞ CỔNG BÌNH CHỌN]   │                               │
│    or [🔴 KHÓA CỔNG]       │                               │
│                              │                               │
│  [💥 TÍNH ĐIỂM & LẬT MẢNH] │                               │
│  [➡️  CÂU HỎI TIẾP THEO]   │                               │
│                              │                               │
│  📡 Trạng thái nộp bài:     │                               │
│  N1:⏳  N2:✅  N3:✅  ...   │                               │
└──────────────────────────────┴───────────────────────────────┘
```

**When round done (all 5 questions answered):**
- Right panel: full image shown + `giai_thich` text overlay (green box at bottom)
- Left panel: "➡️ Sang tranh tiếp theo" button

**When all rounds done:**
- Full-screen: 🏆 KẾT THÚC + final scoreboard bar chart

### ImageReveal Component — Deep Design

```tsx
// ImageReveal.tsx
// Uses HTML Canvas to composite partial image

interface ImageRevealProps {
  imgSrc: string;          // e.g. "/images/anh_1_game_2.jpg"
  revealedSlices: number[]; // e.g. [0, 2, 3]
  totalSlices: number;     // 5 (one per question)
  isFullyRevealed: boolean; // show full <img> when done
}

function ImageReveal({ imgSrc, revealedSlices, totalSlices, isFullyRevealed }: ImageRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(new Image());

  useEffect(() => {
    const img = imgRef.current;
    img.src = imgSrc;
    img.onload = () => redraw();
  }, [imgSrc]);

  useEffect(() => {
    redraw();
  }, [revealedSlices]);

  function redraw() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img.complete) return;
    const ctx = canvas.getContext("2d")!;
    const sliceW = img.naturalWidth / totalSlices;

    // Dark background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw revealed slices
    const scaleX = canvas.width / img.naturalWidth;
    const scaleH = canvas.height / img.naturalHeight;

    for (const i of revealedSlices) {
      ctx.drawImage(
        img,
        i * sliceW, 0, sliceW, img.naturalHeight,           // source
        i * sliceW * scaleX, 0, sliceW * scaleX, canvas.height // dest
      );
    }

    // Draw slice separators (unrevealed = dark divider lines)
    ctx.strokeStyle = "#0f0f0f";
    ctx.lineWidth = 2;
    for (let i = 1; i < totalSlices; i++) {
      const x = (i / totalSlices) * canvas.width;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }

  if (isFullyRevealed) {
    return <img src={imgSrc} className="w-full h-full object-cover" />;
  }
  return <canvas ref={canvasRef} width={640} height={360} className="w-full" />;
}
```

**Reveal animation:** When `revealedSlices` gains a new entry, play a slide-in from top animation on that slice. Implemented by drawing slice off-screen and animating `y` offset over 400ms using `requestAnimationFrame`.

---

## Page 6: Sidebar / Global Controls (Host only)

Persistent left sidebar (collapsible on smaller screens):

```
┌─────────────────────┐
│  🎮 ĐIỀU KHIỂN      │
│                     │
│  Phần chơi:         │
│  ○ Phần 1: Ô Chữ   │
│  ● Phần 2: Lật Tranh│
│                     │
│  ─────────────────  │
│                     │
│  [⚠️ RESET GAME]   │  ← outlined red, requires confirm
│                     │
│  ─────────────────  │
│  📊 Điểm số         │
│  N1: 30đ  ████      │
│  N2: 20đ  ███       │
│  N3: 10đ  ██        │
│  N4:  0đ            │
│  N6: 50đ  ████████  │
└─────────────────────┘
```

**Reset flow:**
```
Host clicks Reset
  → confirmation dialog: "Xác nhận xóa toàn bộ dữ liệu game?"
  → [Hủy] [✅ Xác nhận Reset]
  → on confirm: socket.emit("host:reset")
  → server: state = initialState() → broadcast state:update
```

**Mode switch:**
```
Host clicks mode radio
  → socket.emit("host:switch_mode", { mode: "game1" | "game2" })
  → server resets buzz/vote state, keeps scores
  → broadcast state:update → all clients re-render
```

---

## Page 7: Post-Game Summary (/summary)

Static route, not Socket.IO. Shows the philosophy lesson.

### Layout
```
┌────────────────────────────────────────────────┐
│  TỔNG KẾT BÀI HỌC TRIẾT HỌC                  │
│                                                │
│  Chủ đề: MỐI QUAN HỆ BIỆN CHỨNG              │
│  Tồn tại XH ↔ Ý thức XH                      │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │ THỰC TIỄN 1: Điện Biên Phủ               │  │
│  │ [full image]                              │  │
│  │ [giai_thich text from G2_DATA[0]]        │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │ THỰC TIỄN 2: Sức mạnh thời bình          │  │
│  │ [full image]                              │  │
│  │ [giai_thich text from G2_DATA[1]]        │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  [Final scoreboard]                           │
└────────────────────────────────────────────────┘
```

This replaces the missing `infographic.html`. All text is read from `GAME_DATA` on the server (served as JSON at `GET /api/data`).

---

## Socket.IO Architecture — Complete Event Map

### Connection lifecycle
```
Client connects → socket.emit("player:join", { team }) [player only]
Server sends current state immediately on connect: socket.emit("state:update", state)
On disconnect: no cleanup needed (state persists, player rejoins by reading localStorage)
```

### Server-side state mutation (all in game-engine.ts)

```typescript
// Every handler follows this pattern:
socket.on("host:open_buzz", () => {
  if (state.g1_buzz_winner) return; // guard: can't open while someone buzzed
  state.g1_buzz_active = true;
  io.emit("state:update", state); // broadcast to ALL clients
});

socket.on("player:buzz", ({ team, type }) => {
  if (state.g1_buzz_winner) return; // first-wins: discard if already taken
  if (type === "row" && !state.g1_buzz_active) return; // row buzz requires gate open
  state.g1_buzz_winner = team;
  state.g1_buzz_type = type;
  state.g1_buzz_active = false; // close gate
  io.emit("state:update", state);
});

socket.on("host:correct", () => {
  if (!state.g1_buzz_winner) return;
  if (state.g1_buzz_type === "keyword") {
    state.diem_so[state.g1_buzz_winner] += 30;
    state.g1_keyword_solved = true;
    state.g1_opened = G1_DATA.map((_, i) => i); // reveal all
  } else {
    state.diem_so[state.g1_buzz_winner] += 10;
    if (state.g1_current_q !== null) state.g1_opened.push(state.g1_current_q);
    state.g1_current_q = null;
  }
  state.g1_buzz_winner = null;
  state.g1_buzz_type = null;
  io.emit("state:update", state);
});
```

### Full event list

**Host → Server:**
```
host:switch_mode   { mode: "game1"|"game2" }
host:reset         {}
host:select_q      { idx: number }
host:open_buzz     {}
host:close_buzz    {}
host:correct       {}
host:wrong         {}
host:open_vote     {}
host:close_vote    {}
host:score         {}
host:next_q        {}
host:next_round    {}
host:early_reveal  {}
```

**Player → Server:**
```
player:join        { team: string }
player:buzz        { team: string, type: "row"|"keyword" }
player:vote        { team: string, answer: "A"|"B"|"C"|"D" }
player:change_vote { team: string, answer: string }  // same as vote, overwrites
```

**Server → All Clients:**
```
state:update       { ...GameState }   // full state, every time
```

**Why send full state every time:** State is small (~500 bytes JSON). Sending diffs adds complexity with no real benefit at classroom scale. Keep it simple.

---

## Question / Content Editing

### Approach: Edit `game-data.ts` directly (v1)

No admin UI needed for v1. Teachers edit the TypeScript file. Structure is clean and readable:

```typescript
// server/game-data.ts

export const TUKHOA_DOC = "YÊU NƯỚC";

export const G1_DATA: G1Row[] = [
  {
    tu: "YTHUCXAHOI",           // word without diacritics (for grid rendering)
    ans_full: "Ý THỨC XÃ HỘI", // display version with diacritics
    offset: 12,                  // column where word starts (0-indexed)
    q: "Theo triết học Mác - Lênin, mặt tinh thần...",
  },
  // ... 6 more rows
];

export const G2_DATA: G2Round[] = [
  {
    ten_vong: "THỰC TIỄN 1: BẢN LĨNH LỊCH SỬ",
    img_path: "anh_1_game_2.jpg",   // filename in /public/images/
    giai_thich: "Bức ảnh mô tả...", // philosophy lesson shown after full reveal
    cau_hoi: [
      {
        q: "Trong lịch sử kháng chiến...",
        opts: { A: "Chiến dịch Biên giới", B: "...", C: "Chiến dịch Điện Biên Phủ", D: "..." },
        ans: "C",
      },
      // ... 4 more
    ],
  },
  {
    ten_vong: "THỰC TIỄN 2: SỨC MẠNH THỜI BÌNH",
    img_path: "anh_2_game_2.jpg",   // FIXED from original "anh_hien_tai.jpg"
    giai_thich: "...",
    cau_hoi: [ /* 5 questions */ ],
  },
];
```

### Rules for editing content
1. **G1_DATA:** The letter at position `(offset + (12 - offset))` in each word must align to column 12 to form the vertical keyword. Verify: `word[12 - offset]` must equal the corresponding letter of `TUKHOA_DOC`.
2. **G1 word length:** Words can be any length, as long as `offset + word.length ≤ 35`.
3. **G2 images:** Drop new JPG into `client/public/images/`. Update `img_path` to match filename exactly.
4. **G2 question count:** Any number of questions per round (not locked to 5). Image slices = question count.
5. **Team names:** Defined once in `game-data.ts` as `export const TEAMS = ["Nhóm 1", "Nhóm 2", ...]`. Changing here updates everything.

### Future: simple JSON config (v2 option)
Move `G1_DATA` and `G2_DATA` to `game-data.json`. Server loads at startup. Teacher edits JSON, restarts server. No TypeScript knowledge needed. Keep this as a future option, not v1 scope.

---

## React State Management

**No Redux, no Zustand.** Single custom hook is sufficient.

```typescript
// hooks/useGameSocket.ts

export function useGameSocket() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(); // connects to same origin
    socketRef.current = socket;

    socket.on("state:update", (state: GameState) => {
      setGameState(state);
    });

    // Auto-rejoin on reconnect
    const savedTeam = localStorage.getItem("my_team");
    if (savedTeam) socket.emit("player:join", { team: savedTeam });

    return () => { socket.disconnect(); };
  }, []);

  const emit = useCallback((event: string, data?: object) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { gameState, emit };
}
```

Used in both HostApp and PlayerApp:
```tsx
const { gameState, emit } = useGameSocket();
if (!gameState) return <LoadingSpinner />;
```

---

## Mobile UX Details (Player)

### Tap target sizes
- Primary action buttons: **min 80px tall**, full width
- Secondary actions: **min 56px tall**
- No hover states (touch devices)

### Prevent double-tap issues
```tsx
// Disable button immediately after tap, re-enable only when state update confirms reset
const [tapped, setTapped] = useState(false);

<button
  disabled={tapped}
  onClick={() => {
    setTapped(true);  // instant local disable
    emit("player:buzz", { team, type: "row" });
    // button re-enables when state:update arrives with buzz_winner set
    // (useEffect watching gameState.g1_buzz_winner)
  }}
>
  ✋ GIÀNH QUYỀN
</button>
```

### Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
```
`maximum-scale=1` prevents accidental zoom on double-tap.

### Reconnect UX
- Show `Đang kết nối lại...` banner on disconnect
- Socket.IO auto-reconnect handles the rest
- On reconnect: state:update immediately received → UI snaps back to correct state

---

## Server Structure — Complete

```typescript
// server/index.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createInitialState } from "./game-state";
import { handleHostEvent, handlePlayerEvent } from "./game-engine";
import { G1_DATA, G2_DATA, TEAMS } from "./game-data";
import path from "path";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Serve React build
app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("*", (_, res) => res.sendFile(path.join(__dirname, "../client/dist/index.html")));

// Serve images
app.use("/images", express.static(path.join(__dirname, "../client/public/images")));

// API: game data (for summary page)
app.get("/api/data", (_, res) => res.json({ G1_DATA, G2_DATA }));

let state = createInitialState(TEAMS);

io.on("connection", (socket) => {
  // Send current state immediately on connect
  socket.emit("state:update", state);

  // Host events
  ["host:switch_mode", "host:reset", "host:select_q", "host:open_buzz",
   "host:close_buzz", "host:correct", "host:wrong", "host:open_vote",
   "host:close_vote", "host:score", "host:next_q", "host:next_round",
   "host:early_reveal"].forEach(event => {
    socket.on(event, (data) => {
      state = handleHostEvent(event, data, state, G1_DATA, G2_DATA, TEAMS);
      io.emit("state:update", state); // broadcast to all
    });
  });

  // Player events
  socket.on("player:join", (data) => {
    state = handlePlayerEvent("player:join", data, state);
    // No broadcast needed for join — state doesn't change
  });
  ["player:buzz", "player:vote", "player:change_vote"].forEach(event => {
    socket.on(event, (data) => {
      state = handlePlayerEvent(event, data, state);
      io.emit("state:update", state);
    });
  });
});

httpServer.listen(process.env.PORT || 3000);
```

```typescript
// server/game-engine.ts
// Pure function: (event, data, state, ...) => newState
// Makes state transitions testable without sockets

export function handleHostEvent(
  event: string, data: any, state: GameState,
  g1Data: G1Row[], g2Data: G2Round[], teams: string[]
): GameState {
  const s = structuredClone(state); // never mutate directly
  switch (event) {
    case "host:reset":
      return createInitialState(teams);
    case "host:switch_mode":
      return { ...createInitialState(teams), mode: data.mode, diem_so: s.diem_so };
      // Note: keeps scores when switching modes
    case "host:select_q":
      s.g1_current_q = data.idx;
      s.g1_buzz_active = false;
      s.g1_buzz_winner = null;
      return s;
    case "host:open_buzz":
      if (s.g1_buzz_winner) return s; // guard
      s.g1_buzz_active = true;
      return s;
    case "host:close_buzz":
      s.g1_buzz_active = false;
      return s;
    case "host:correct":
      if (!s.g1_buzz_winner) return s;
      if (s.g1_buzz_type === "keyword") {
        s.diem_so[s.g1_buzz_winner] += 30;
        s.g1_keyword_solved = true;
        s.g1_opened = g1Data.map((_, i) => i);
      } else {
        s.diem_so[s.g1_buzz_winner] += 10;
        if (s.g1_current_q !== null && !s.g1_opened.includes(s.g1_current_q))
          s.g1_opened.push(s.g1_current_q);
        s.g1_current_q = null;
      }
      s.g1_buzz_winner = null;
      s.g1_buzz_type = null;
      return s;
    case "host:wrong":
      if (s.g1_buzz_type === "row") s.g1_buzz_active = true; // reopen for row
      s.g1_buzz_winner = null;
      s.g1_buzz_type = null;
      return s;
    case "host:open_vote":
      s.cho_phep_vote = true;
      s.da_cham_diem = false;
      return s;
    case "host:close_vote":
      s.cho_phep_vote = false;
      return s;
    case "host:score": {
      const round = g2Data[s.g2_vong];
      const q = round.cau_hoi[s.g2_cau];
      let hasCorrect = false;
      for (const [team, ans] of Object.entries(s.trang_thai_vote)) {
        if (ans === q.ans) {
          s.diem_so[team] += 20;
          hasCorrect = true;
        }
      }
      if (hasCorrect && !s.g2_manh_mo.includes(s.g2_cau))
        s.g2_manh_mo.push(s.g2_cau);
      s.da_cham_diem = true;
      s.cho_phep_vote = false;
      return s;
    }
    case "host:next_q":
      s.g2_cau++;
      s.cho_phep_vote = false;
      s.da_cham_diem = false;
      s.trang_thai_vote = Object.fromEntries(teams.map(t => [t, null]));
      return s;
    case "host:next_round":
      s.g2_vong++;
      s.g2_cau = 0;
      s.g2_manh_mo = [];
      s.g2_done = false;
      s.cho_phep_vote = false;
      s.da_cham_diem = false;
      s.trang_thai_vote = Object.fromEntries(teams.map(t => [t, null]));
      return s;
    case "host:early_reveal":
      s.g2_done = true;
      return s;
    default:
      return s;
  }
}
```

---

## Minimal UI Implementation Guide

### Tailwind config additions needed
```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{tsx,ts}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Be Vietnam Pro", "sans-serif"] },
      colors: {
        surface: "#1a1a1a",
        border: "#2a2a2a",
        accent: "#f5a623",
      },
      animation: {
        "pulse-border": "pulse-border 1s ease-in-out infinite",
      },
    },
  },
};
```

### Reusable base components (keep these minimal, max 5)
```
<GameButton>   — full-width, variant: "primary"|"danger"|"ghost"
<StatusBadge>  — colored pill: "waiting"|"correct"|"wrong"|"locked"
<ScoreBar>     — simple horizontal bar per team
<AlertBanner>  — full-width colored alert with large text
<ConfirmDialog>— modal: "Are you sure?" with cancel/confirm
```

Nothing else. All other UI is inline Tailwind classes on native elements.

---

## Build & Run

```bash
# Root package.json scripts:
"dev:server"   → "tsx watch server/index.ts"
"dev:client"   → "vite --port 5173"
"dev"          → "concurrently \"npm:dev:server\" \"npm:dev:client\""
"build"        → "vite build && tsc -p server/tsconfig.json"
"start"        → "node dist/server/index.js"

# Vite proxy (dev only — avoids CORS):
# vite.config.ts: proxy "/socket.io" and "/api" → localhost:3000
```

---

## Implementation Sequence (Recommended)

1. **Scaffold:** monorepo, Vite, Express, Socket.IO, Tailwind, tsconfigs, `concurrently` dev script
2. **Server core:** `game-data.ts`, `game-state.ts` (types + initialState), `game-engine.ts` (all transitions), `index.ts` (socket wiring)
3. **Shared types:** `types/game.ts` (GameState, G1Row, G2Round interfaces)
4. **Socket hook:** `useGameSocket.ts`
5. **Player app:** TeamSelect → Game1Player → Game2Player
6. **Host app:** Sidebar + mode switch + Game1Host (grid + controls) + Game2Host (image + controls)
7. **CrosswordGrid component:** cell builder, CSS, reveal animation
8. **ImageReveal component:** Canvas compositor, slice animation
9. **Summary page:** `/summary` route with data from `/api/data`
10. **Polish:** fonts, colors, mobile tap sizes, reconnect banner, reset confirm dialog
11. **Deploy:** Railway — `npm run build && npm start`, set `PORT` env var

---

## Open Questions

1. **Crossword diacritics:** Display ASCII (`YTHUCXAHOI`) or mapped Unicode (`ÝTHỨCXÃHỘI`) in cells? Unicode is more readable but requires a diacritic mapping table. Recommend ASCII for v1.
2. **Sound effects?** Browser allows audio after user gesture (buzz tap counts). Worth adding a single `ding.mp3` for buzz-in and `correct.mp3`/`wrong.mp3`. Simple fetch + `AudioContext`. Optional for v1.
3. **Keyword hint:** Should unrevealed column 12 cells have a subtle red border hint to indicate the vertical keyword runs there? Adds intrigue. Default to yes.
4. **Score keep on mode switch:** Current design keeps scores when switching Game 1 ↔ Game 2. Confirm this is the intended behavior.
5. **Early reveal image in Game 2:** When host clicks "GIẢI MÃ SỚM TRANH", does it also skip remaining questions or just show the full image while questions continue? Current Streamlit code just sets `g2_done = true` which stops question display. Recommend: show full image AND skip remaining questions (mark round complete).
