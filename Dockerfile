FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package.json  ./
ARG NEXUS_USER_New
ARG NEXUS_PASS_New
USER root



RUN apk update

RUN npm install --legacy-peer-deps --loglevel verbose
RUN apk add --no-cache \
    build-base \
    libc6-compat \
    cairo-dev \
    libjpeg-turbo-dev \
    pango-dev \
    giflib-dev \
    libpng-dev


FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

FROM base AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static


USER nextjs

EXPOSE 80

ENV PORT 80

# set hostname to localhost

ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]