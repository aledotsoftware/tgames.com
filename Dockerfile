# Stage 1: Build Nuxt Production Bundle
FROM node:20-slim AS builder

WORKDIR /src

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production Server Runner
FROM node:20-slim AS runner

WORKDIR /src

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /src/.output ./.output
COPY --from=builder /src/scripts ./scripts

EXPOSE 3000

CMD ["sh", "-c", "node scripts/seed-mongo.js && node .output/server/index.mjs"]