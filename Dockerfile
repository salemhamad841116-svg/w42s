# ─── Production Dockerfile for Google Cloud Run ───
FROM node:22-slim

WORKDIR /app

# Install build dependencies for better-sqlite3 native bindings
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package descriptors
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Vite frontend assets (dist/)
RUN npm run build

# Configure environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start Express backend (serving API + dist/ frontend)
CMD ["npm", "start"]
