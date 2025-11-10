# ============================
# Build stage
# ============================
FROM node:20 AS build
WORKDIR /app

# Copy package files first
COPY quintus/package*.json ./
RUN npm install

# Copy rest of the app
COPY quintus/ ./

# Build the Next.js app
RUN npm run build

# ============================
# Runtime stage
# ============================
FROM node:20-alpine
WORKDIR /app

# Copy built files
COPY --from=build /app ./

# Expose Next.js default port
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "run", "start"]
