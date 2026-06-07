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

Build for embedding under a landing page route:

```bash
VITE_APP_BASE_PATH=/game npm run build
APP_BASE_PATH=/game NODE_ENV=production npm start
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
- `.github/workflows/ci.yml` — build check for pull requests and pushes to `main`.

## Landing Page Integration

- Default standalone route: `/`
- Landing-page route mode: set `VITE_APP_BASE_PATH=/game` at build time and `APP_BASE_PATH=/game` at runtime.
- Socket backend override: set `VITE_SOCKET_URL=https://your-game-api-domain` only if the game server is not served from the same origin.
- Hostinger managed Node.js app: use build command `npm ci && npm run build`, start command `npm start`.
