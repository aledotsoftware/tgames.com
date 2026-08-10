FROM node:20-slim AS builder

WORKDIR /src

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-slim AS runner

WORKDIR /src

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /src/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]