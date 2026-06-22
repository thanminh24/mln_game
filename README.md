# MLN — Tồn tại xã hội và Ý thức xã hội

Scroll-driven Vietnamese learning page about the dialectical relationship between social existence and social consciousness.

Live site: <https://thanminh24.github.io/mln111/>

## Landing page

The public site lives in `MLN_landing_page/01-apple-fluid/`. It is a static React/Vite app designed for GitHub Pages, including repository-subpath-safe assets.

```bash
cd MLN_landing_page/01-apple-fluid
pnpm install --frozen-lockfile
pnpm dev
```

Production build:

```bash
pnpm build
pnpm preview
```

Pushes to `main` that affect the landing page automatically deploy through `.github/workflows/deploy-pages.yml`.

## Archived game

`MLN_Game/` is retained as an archive. It is intentionally excluded from the GitHub Pages build and deployment; no game server or Socket.IO backend is hosted.

See [the deployment guide](docs/deployment-guide.md) for publishing and rollback details.
