FROM node:24-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

USER node
CMD ["node_modules/.bin/tsx", "src/server.ts"]
