# MLN111 Host-Only Crossword

Single-player/host-only MLN111 classroom crossword game.

## Run

```bash
npm ci
npm run dev
```

Open the client URL from Vite, usually `http://localhost:3001`.

## Build

```bash
npm run build
```

## Current Game

- One crossword game.
- 11 horizontal rows recap the dialectical relationship between social being and social consciousness.
- Vertical keyword: `LÒNG YÊU NƯỚC` (`LONGYEUNUOC` in the ASCII grid).
- Five selected rows include prompt images.
- Host chooses answer options directly.
- After 3 wrong attempts, the correct answer is revealed.
- Summary page connects the keyword to a patriotism case study.

## Repository Shape

- `client/` — React host UI.
- `server/` — Express + Socket.IO state server.
- `docs/` — current project documentation.
