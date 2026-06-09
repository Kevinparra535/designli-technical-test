# syntax=docker/dockerfile:1
#
# Multi-stage build for the stocks-backend (Node + TypeScript → compiled dist/).
# The server runs DB migrations on boot (server.ts → migrate()), so no separate
# migration step is needed.

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
# tsc → dist/, then copies src/db/schema.sql → dist/db/schema.sql (see build script)
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
