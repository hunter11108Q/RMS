# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json tsconfig*.json ./
COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/

RUN npm ci

# Run compile targets
RUN npm run build:all

# --- Production Runner Stage ---
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

COPY package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/packages/ ./packages/
COPY --from=builder /usr/src/app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /usr/src/app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /usr/src/app/apps/backend/prisma ./apps/backend/prisma

EXPOSE 4000

ENV NODE_ENV=production
CMD ["node", "apps/backend/dist/app/server.js"]
