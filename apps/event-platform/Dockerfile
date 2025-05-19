FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json nest-cli.json tsconfig.json tsconfig.build.json ./
RUN npm ci

ARG ENV_FILE=.env.docker
COPY ${ENV_FILE} .env

COPY . .
RUN npm run build:event

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

ARG ENV_FILE=.env.docker
COPY ${ENV_FILE} .env

ENV PORT=3002
EXPOSE ${PORT}

COPY --from=builder /app/dist/apps/event-platform ./dist

COPY package.json package-lock.json ./
RUN npm ci --only=production

CMD ["node", "dist/main.js"]