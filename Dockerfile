FROM node:22-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm config set registry https://registry.npmjs.org/ && \
    npm install

FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    gcc \
    build-base

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Rebuild native modules
RUN npm rebuild

# Build the app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["node", "server.js"]