# ============================================
# Dockerfile — Production Node.js API
# ============================================
# Multi-stage build for optimized image size
# Docs: https://docs.docker.com/engine/reference/builder/

# --------------------------------------------
# Stage 1: Dependencies
# --------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# --------------------------------------------
# Stage 2: Production
# --------------------------------------------
FROM node:20-alpine

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY server.js .
COPY package.json .
COPY app/ ./app/
COPY tests/ ./tests/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health',r=>process.exit(r.statusCode===200?0:1))"

# Start server
CMD ["node", "server.js"]
