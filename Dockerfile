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
# BACKEND_URL only matters for the rewrites() function, which next.config.js
# reads at request time in the running server, not at build time - no
# build-time ARG needed here.
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
