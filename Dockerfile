# ============================================
# Dockerfile — Multi-stage build for web app
# ============================================
# Supports: Node.js, Python, Static HTML, etc.
# Docs: https://docs.docker.com/engine/reference/builder/

# --------------------------------------------
# Stage 1: Build (for Node.js / Python / etc.)
# --------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build (if needed)
# RUN npm run build

# --------------------------------------------
# Stage 2: Runtime (lightweight)
# --------------------------------------------
FROM nginx:alpine

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html 2>/dev/null || true
COPY --from=builder /app /usr/share/nginx/html 2>/dev/null || true

# Copy nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
