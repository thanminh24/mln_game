# syntax=docker/dockerfile:1

# ----------------------------------------------------------------------------
# MLN Game — single container: builds client (Vite) + server (Express/Socket.IO)
# and runs the server which also serves the built client statically.
#
# NOTE: Landing page (MLN_test-layout / MLN(chua_fix_fluidbg)) is intentionally
# NOT built here yet. Once the final layout is confirmed, add a build stage for
# it and copy its dist into the runtime stage (see two-repo guide).
# ----------------------------------------------------------------------------

# ---- Build stage: install all deps and compile client + server ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy manifests first for better layer caching
COPY package.json package-lock.json ./
COPY MLN_Game/client/package.json ./MLN_Game/client/package.json
COPY MLN_Game/server/package.json ./MLN_Game/server/package.json

RUN npm ci

# Copy source and build (client -> client/dist, server -> server/dist)
COPY MLN_Game ./MLN_Game
RUN npm run build

# ---- Runtime stage: production deps + compiled output only ----
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=6942

# Install production dependencies only
COPY package.json package-lock.json ./
COPY MLN_Game/client/package.json ./MLN_Game/client/package.json
COPY MLN_Game/server/package.json ./MLN_Game/server/package.json
RUN npm ci --omit=dev && npm cache clean --force

# Compiled server + built client (kept as siblings: server reads ../../client/dist)
COPY --from=builder /app/MLN_Game/server/dist ./MLN_Game/server/dist
COPY --from=builder /app/MLN_Game/client/dist ./MLN_Game/client/dist

EXPOSE 6942

CMD ["node", "MLN_Game/server/dist/index.js"]
