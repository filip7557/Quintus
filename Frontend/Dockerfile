# ============================
# Dependencies
# ============================
FROM node:24-slim AS deps
WORKDIR /app

COPY quintus/package*.json ./
RUN npm ci

# ============================
# Build
# ============================
FROM node:24-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY quintus/ ./
RUN npm run build

# ============================
# Runtime
# ============================
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Standalone output already bundles only the node_modules the server needs, no node_modules copy required
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]