# ============================
# Dependencies
# ============================
FROM node:20-alpine AS deps
WORKDIR /app

COPY quintus/package*.json ./
RUN npm ci

# ============================
# Build
# ============================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY quintus/ ./
RUN npm run build

# ============================
# Runtime
# ============================
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Only copy what is required to run
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

EXPOSE 3000
CMD ["npm", "start"]