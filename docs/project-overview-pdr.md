# Project Overview & PDR — MLN Game Web Rebuild

## Project Purpose

Rebuild the MLN111 Philosophy classroom game from a local Streamlit app into a **proper web application** with a real backend and frontend. The goal is a deployable, shareable game platform that:

- Works on any device without Ngrok tunneling
- Supports real-time multiplayer without polling hacks
- Has a polished, game-show-quality visual design
- Is easy to host and reset by non-technical teachers

---

## Core User Roles

| Role | Device | Responsibilities |
|------|--------|-----------------|
| **Host (MC/Teacher)** | Laptop → projector | Controls game flow; scores answers; advances questions |
| **Player (Student)** | Smartphone | Buzzes in; selects answers; sees live feedback |
| **Audience** | Optional big screen | Sees same view as Host |

---

## Game Modes to Replicate

### Game 1 — Crossword Buzzer (Ô Chữ)
- 7 horizontal question rows
- Column 12 intersection spells vertical keyword "YÊU NƯỚC"
- Buzz-in system: first team to buzz gets the right to answer
- Keyword buzz available at any time for 30 pts
- Row correct = +10 pts, row revealed
- Keyword correct = +30 pts, all rows revealed, game ends

### Game 2 — Image Reveal Quiz (Lật Tranh)
- 2 rounds, 5 questions each
- Image split into 5 vertical slices; each correct answer reveals one slice
- All teams vote simultaneously (A/B/C/D)
- All correct teams score +20 pts per question
- After all slices revealed: full image + philosophy lesson shown

---

## Technology Targets

**Backend:** Node.js + Express (or Fastify) + Socket.IO for real-time
**Frontend:** React + TypeScript + Tailwind CSS
**State:** In-memory on server (+ optional Redis for persistence)
**Deployment:** Single VPS or Railway/Fly.io; no Ngrok required

---

## Functional Requirements

### FR-01: Session management
- Host creates a game session; gets a room code
- Players join via room code or QR scan
- Host can reset the full game state

### FR-02: Role-based views
- `?role=host` → Host control panel (not visible to players)
- Default → Player join + action screen

### FR-03: Real-time state sync
- All clients receive state updates via WebSocket (Socket.IO)
- No polling; sub-100ms latency target

### FR-04: Game 1 — Crossword
- Host picks a question row
- Host opens buzzer
- First player tap wins; all others locked out
- Host confirms correct/wrong → score + reveal or reopen
- Keyword buzz always available

### FR-05: Game 1 — Grid rendering
- Crossword rendered as styled grid
- Revealed cells show letter, highlighted blue
- Column 12 intersection highlighted red
- Hidden cells show blank bordered boxes

### FR-06: Game 2 — Image Reveal
- Host advances questions
- Host opens/closes voting gate
- Players select A/B/C/D
- Host triggers scoring → image slice revealed
- Host can early-reveal full image

### FR-07: Scoring
- Live scoreboard visible on host screen
- Per-team scores tracked across both games

### FR-08: Reset
- Host can reset entire game to initial state
- Confirmation required to prevent accidental reset

---

## Non-Functional Requirements

| NFR | Target |
|-----|--------|
| Latency (buzz-in) | < 100ms from tap to server acknowledgment |
| Concurrent players | 10–30 (classroom scale) |
| Browser support | Chrome/Safari on iOS/Android |
| No install | Pure web — no app download |
| Offline-tolerant | Players can reconnect and rejoin mid-game |

---

## Content to Replicate

All questions from `data.py` are to be migrated verbatim.
Images (`ảnh_1_game_2.jpg`, `ảnh_2_game_2.jpg`) served as static assets.
Infographic HTML to be rebuilt as a dedicated summary page/route.

---

## Out of Scope (v1)

- Admin panel for editing questions without code changes
- Multi-language support
- Game history / analytics
- User accounts / persistent profiles
- Multiple concurrent game rooms (single room is sufficient for classroom)
