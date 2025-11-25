# ==============================
# Builder stage
# ==============================
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./

# Install dependencies using Yarn 4
RUN yarn install


# Copy source code
COPY . .

# Build Next.js (with standalone output)
RUN yarn build:

# ==============================
# Runner stage
# ==============================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone .

# Copy public files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 80
ENV PORT=80
ENV HOSTNAME=0.0.0.0

# Start server
CMD ["node", "server.js"]
