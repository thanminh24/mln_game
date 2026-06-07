# MLN Game — Deployment & Two-Repo Setup Guide

How to ship this repo to the Hostinger server via GitHub Actions + GHCR, as its
own standalone GitHub repository (separate from SkinSunny but reusing the same
server + secrets pattern).

---

## 1. What ships

A **single Docker container** (`ghcr.io/thanminh24/mln-game`) that:
- builds the game client (Vite) and the game backend (Express + Socket.IO)
- runs the backend, which also serves the built client on the same origin
- listens on **port 6942** (exposed for Cloudflare / domain)

Off-limit for now (not built into the container yet):
- `MLN_test-layout/` (landing page variants)
- `MLN(chua_fix_fluidbg)/` (landing page)

These get added later once the final layout is confirmed (see §6).

---

## 2. Create the new GitHub repo

This project becomes its **own repo**, separate from SkinSunny.

```bash
cd /home/than-minh/project/mln_game_full

# Init (if not already a fresh repo for this project)
git init                      # skip if .git already belongs to this project
git add .
git commit -m "feat: group game into MLN_Game, add docker + ci/cd"

# Create the remote repo and push (uses gh CLI)
gh repo create mln-game --private --source=. --remote=origin --push
```

> The large `MLN_test-layout.zip`, `node_modules`, build `dist/`, and `*.docx`
> source files are already git-ignored, so they won't be committed.

---

## 3. GitHub repository secrets

This deploy reuses the **exact same secrets** as the SkinSunny project. Add them
to the new repo: **Settings → Secrets and variables → Actions → New repository secret**.

| Secret | Meaning | Same value as SkinSunny? |
|--------|---------|--------------------------|
| `HOSTINGER_HOST` | Server IP / hostname | ✅ yes |
| `HOSTINGER_USER` | SSH user (e.g. `root`) | ✅ yes |
| `HOSTINGER_SSH_KEY` | Private SSH key (full PEM) | ✅ yes |
| `GHCR_OWNER` | GHCR username (`thanminh24`) | ✅ yes |
| `GHCR_TOKEN` | GitHub PAT with `read:packages` | ✅ yes (can reuse) |

> `GITHUB_TOKEN` is provided automatically by Actions — no need to add it.

Fast way to copy secrets via CLI (set values yourself):

```bash
gh secret set HOSTINGER_HOST   --body "<ip>"
gh secret set HOSTINGER_USER   --body "<user>"
gh secret set HOSTINGER_SSH_KEY --body "$(cat ~/.ssh/hostinger_key)"
gh secret set GHCR_OWNER       --body "thanminh24"
gh secret set GHCR_TOKEN       --body "<pat-with-read:packages>"
```

---

## 4. One-time server prep (Hostinger)

SSH into the server once to create the deploy directory. Docker + Docker Compose
are already installed (SkinSunny uses them).

```bash
ssh <user>@<host>
mkdir -p /opt/mln-game
exit
```

The workflow copies `docker-compose.prod.yml` here automatically on each deploy.
Nothing else to place manually — no `.env` needed (config is inlined in compose).

---

## 5. Deploy

Deployment is automatic on push to `main`:

```
push to main  →  CI builds image  →  push to GHCR  →  SSH to Hostinger  →
                 docker compose pull + up -d  →  live on :6942
```

- **`ci.yml`** runs on pull requests → `npm ci` + `npm run build` (sanity check).
- **`deploy.yml`** runs on push to `main` (or manual via Actions tab → "Run workflow").

Verify after deploy:

```bash
ssh <user>@<host> "cd /opt/mln-game && docker compose -f docker-compose.prod.yml ps"
curl http://<host>:6942/        # should return the game HTML
```

---

## 6. Connect Cloudflare + domain

The container exposes host port **6942**. Two common options:

**A) Cloudflare Tunnel (recommended, no open ports)**
```bash
# on the server
cloudflared tunnel create mln-game
# route a hostname to the local service
cloudflared tunnel route dns mln-game game.yourdomain.com
# in the tunnel config, point the hostname at http://localhost:6942
```

**B) DNS A-record + reverse proxy**
- Point `game.yourdomain.com` → server IP (A record, proxied/orange cloud).
- Reverse-proxy 443 → `localhost:6942` (Nginx/Caddy), or open 6942 in firewall.
- **Important:** Socket.IO needs WebSocket upgrades — ensure the proxy forwards
  `Upgrade`/`Connection` headers (Cloudflare proxy supports WS by default).

---

## 7. Password gate

The game is protected by a client-side password prompt before the UI loads.

- Password: **`12345678`**
- Stored in `sessionStorage` (re-prompts on a fresh browser session).
- To change it: edit `CORRECT_PASSWORD` in
  [MLN_Game/client/src/components/password-gate.tsx](../MLN_Game/client/src/components/password-gate.tsx).

> Client-side only — appropriate for a classroom game, not real auth.

---

## 8. Adding the landing page later (when layout is confirmed)

Once the final landing layout is chosen, fold it into the same single container:

1. Add a build stage in [Dockerfile](../Dockerfile) that builds the landing dist.
2. Copy its `dist` into the runtime image (e.g. `/app/landing/dist`).
3. In [MLN_Game/server/src/index.ts](../MLN_Game/server/src/index.ts), serve the
   landing at `/` and mount the game under a sub-path (e.g. `/game`), or vice
   versa — set `APP_BASE_PATH` accordingly so the game's asset paths resolve.
4. Both keep sharing port 6942 — no compose change needed.

No new container, no new port — the design intentionally keeps everything in one
image so Cloudflare only ever points at 6942.

---

## Local development

```bash
npm install
npm run dev      # client on :3001 (proxies /api + /socket.io to server :6942)
```

Production-style local run:

```bash
npm run build
NODE_ENV=production npm start      # serves everything on :6942
```

Docker local test:

```bash
docker build -t mln-game .
docker run --rm -p 6942:6942 mln-game
# open http://localhost:6942
```
