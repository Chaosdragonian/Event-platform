FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json nest-cli.json tsconfig.json tsconfig.build.json ./
RUN npm ci

ARG ENV_FILE=.env.docker
COPY ${ENV_FILE} .env

COPY . .
RUN npm run build:auth

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

ARG ENV_FILE=.env.docker
COPY ${ENV_FILE} .env

ENV PORT=3001
EXPOSE ${PORT}

COPY --from=builder /app/dist/apps/auth ./dist

COPY package.json package-lock.json ./
RUN npm ci --only=production

CMD ["node", "dist/main.js"]