# syntax=docker/dockerfile:1

# ---------- Etapa 1: compilar el frontend ----------
FROM node:20-bookworm-slim AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
# vite.config.ts escribe el build en ../server/public  ->  /app/server/public
RUN npm run build

# ---------- Etapa 2: runtime del backend ----------
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    DB_FILE=/data/lab.sqlite
WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/ ./
COPY --from=client-build /app/server/public ./public

RUN mkdir -p /data && chown -R node:node /app /data
VOLUME ["/data"]
EXPOSE 3000

# Ejecuta como usuario sin privilegios (node ya existe en la imagen oficial).
USER node

CMD ["node", "src/server.js"]
