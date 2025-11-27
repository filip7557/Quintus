# ============================
# Build stage
# ============================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first
COPY quintus/package*.json ./
RUN npm ci --omit=dev

# Copy rest of the app
COPY quintus/ ./

# Build the Next.js app
RUN npm run build

# ============================
# Runtime stage
# ============================
FROM node:20-alpine AS runner
WORKDIR /app

# Copy built files
COPY --from=builder /app ./

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose Next.js default port
EXPOSE 3000

# Start Next.js server
CMD ["npm", "run", "start"]
