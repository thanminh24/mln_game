---
name: deployment-port-constraints
description: "Port allocation on the shared production machine — SkinSunny takes 5173, MLN game should use 3000"
metadata: 
  node_type: memory
  type: project
  originSessionId: 78c02ccb-aee2-4666-8c81-6ed4c86f4124
---

The MLN game will be hosted on the same machine as SkinSunny.

**SkinSunny port map (from docker-compose.prod.yml):**
- Port 5173 → SkinSunny frontend (only host-exposed port)
- 8000, 8001, 5432 are internal Docker network only (expose, not ports)

**MLN game assigned port: 3000**
- Safe, not used by SkinSunny
- Set via `PORT=3000` env var on the Node.js server

**Deployment approach:** Nginx or Caddy reverse proxy in front of both.
- SkinSunny frontend: port 5173 (or proxied domain)
- MLN game: port 3000 (or proxied subdomain/path)
- Neither port exposed directly to internet in production

**How to apply:** When writing Dockerfile or deploy config for MLN game, use PORT=3000. When writing Nginx config, proxy mln-game domain → localhost:3000.
