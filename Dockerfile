# Multi-stage build: install/build stages contribute nothing to the final
# image, only their outputs are copied forward, so devDependencies, source
# .ts files, and the full node_modules tree never end up in the runtime image.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# BACKEND_URL must be a build-time ARG, not just a runtime `docker run -e`/
# compose `environment:` value like the comment here used to claim: next
# build's output: 'standalone' mode calls rewrites() once during the build
# and freezes the resolved destination into .next/routes-manifest.json -
# it is NOT re-evaluated when the standalone server boots. Verified by
# inspecting routes-manifest.json in a built image: the destination stayed
# "http://localhost:8080/api/:path*" (next.config.js's own hardcoded
# fallback) regardless of what BACKEND_URL was set to at `docker run`/
# `docker compose up` time.
ARG BACKEND_URL=http://host.docker.internal:8080
ENV BACKEND_URL=$BACKEND_URL
RUN npm run build

# output: 'standalone' (next.config.js) traces the minimal set of files and
# node_modules actually needed to run `node server.js`, so this final stage
# never needs npm install at all.
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
