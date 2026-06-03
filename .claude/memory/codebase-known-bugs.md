---
name: codebase-known-bugs
description: Confirmed bugs and mismatches in the original Python Streamlit codebase — fix these when rebuilding
metadata: 
  node_type: memory
  type: project
  originSessionId: 78c02ccb-aee2-4666-8c81-6ed4c86f4124
---

Bugs verified by reading source files directly (2026-06-03):

**P1 — Team name mismatch (scoring broken):**
- `core.py` init_state uses "Nhóm 1", "Nhóm 2", "Nhóm 3", "Nhóm 4", "Nhóm 6" as state keys
- `mln.py` player selectbox shows "Đội 1" through "Đội 5"
- st.session_state.my_team = "Đội X" → never matches diem_so["Nhóm X"] → no team can score
- Fix: align to one consistent naming scheme in web rebuild

**P1 — Round 2 image filename wrong:**
- `data.py` G2_DATA[1]["img_path"] = "anh_hien_tai.jpg"
- Actual file on disk: "ảnh_2_game_2.jpg"
- Round 2 image would always fail to load
- Fix: set img_path = "ảnh_2_game_2.jpg" (or copy/rename file)

**P2 — No atomic mutex on buzz-in:**
- Current "fix" is read-state-before-write in mln.py player handler
- Still a race between read and write if two players tap within same millisecond
- Web rebuild fix: Socket.IO event queue on single Node.js thread = natural serialization, no extra mutex needed

**P2 — "Đội 5" maps to nothing:**
- Player can select "Đội 5" but state only tracks Nhóm 1–4 and 6 (skips 5)
- "Đội 5" votes/scores go nowhere
- Fix: decide on 5 or 6 teams, be consistent

**How to apply:** When implementing web rebuild game engine, start from the corrected names and file paths, not the buggy originals.
