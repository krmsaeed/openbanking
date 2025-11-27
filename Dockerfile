# ==============================
# Builder stage
# ==============================
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./

RUN corepack enable
RUN corepack prepare yarn@stable --activate

RUN yarn install

COPY . .

RUN yarn build

# ==============================
# Runner stage
# ==============================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=root:root /app/.next/standalone .

COPY --from=builder --chown=root:root /app/public ./public

COPY --from=builder --chown=root:root /app/.next/static ./.next/static

# USER nextjs

# Expose port
EXPOSE 80
ENV PORT=80
ENV HOSTNAME=0.0.0.0

# Start server
CMD ["node", "server.js"]
