# Multi-stage build for production Expo web
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the web application in production mode for clean output
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install a simple web server
RUN npm install -g serve

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Change ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "3000"]