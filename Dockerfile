# syntax=docker/dockerfile:1.7

# ────────────────────────────────────────────────────────────────────────────────
# Dockerfile — Getsmart Frontend (Next.js 16 + React 19 + pnpm)
# Multi-stage build dengan output "standalone" agar image akhir tetap ramping.
#
# POLA ENV: SEMUA env var diset SEKALI di tab "Environment" Dokploy.
# Dokploy akan otomatis:
#   1. Forward env var ke `docker build --build-arg` (untuk NEXT_PUBLIC_*).
#   2. Inject env var ke container saat runtime (untuk semua var).
# Dockerfile ini cukup mendeklarasikan ARG untuk setiap NEXT_PUBLIC_* yang
# perlu di-inline ke bundle JS saat build.
# ────────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=20.18.0
ARG PNPM_VERSION=9.12.3

# ────────────────────────────────────────────────────────────────────────────────
# Stage 1: base — Node Alpine + pnpm via corepack
# ────────────────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS base

# libc6-compat dibutuhkan beberapa native module Next.js di Alpine
RUN apk add --no-cache libc6-compat

ARG PNPM_VERSION
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

# ────────────────────────────────────────────────────────────────────────────────
# Stage 2: deps — install dependencies (cached layer)
# ────────────────────────────────────────────────────────────────────────────────
FROM base AS deps

COPY package.json pnpm-lock.yaml ./

# Mount pnpm store cache agar install cepat di subsequent builds
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ────────────────────────────────────────────────────────────────────────────────
# Stage 3: builder — build Next.js (standalone)
# ────────────────────────────────────────────────────────────────────────────────
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ── Build-time env vars ──────────────────────────────────────────────────────
# NEXT_PUBLIC_* dibaca dari Client Components → di-INLINE ke bundle JS saat
# `next build`. Karena itu nilainya harus ada di build time, bukan runtime.
#
# Dokploy meneruskan env var dari tab "Environment" ke build args secara
# otomatis (selama nama ARG-nya cocok). Cukup deklarasikan di sini.
#
# Server-side vars (GETSMART_API_URL, INTERNAL_API_KEY) SENGAJA TIDAK
# dideklarasikan sebagai ARG — biar tidak ikut ter-bake ke layer image.
# Var tsb hanya tersedia saat runtime container, langsung dari env Dokploy.
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_GETSMART_API_URL

ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID} \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_PUBLIC_GETSMART_API_URL=${NEXT_PUBLIC_GETSMART_API_URL} \
    NODE_ENV=production

RUN pnpm build

# ────────────────────────────────────────────────────────────────────────────────
# Stage 4: runner — image runtime minimal (standalone output)
# ────────────────────────────────────────────────────────────────────────────────
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

# Buat non-root user untuk keamanan
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy assets publik & build artifacts ke layout standalone Next.js
COPY --from=builder /app/public ./public

# .next/standalone berisi server.js + minimal node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# .next/static harus diserve dari /_next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Healthcheck — Dokploy memanfaatkan ini untuk readiness probe.
# Server secrets (GETSMART_API_URL, INTERNAL_API_KEY) di-inject Dokploy
# saat container start, langsung tersedia di process.env.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
