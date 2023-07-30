FROM        node:20.3.1-alpine3.17

RUN         npm install -g pnpm

ENV         BOT_PORT=3001
ENV         PORT=3000

WORKDIR     /var/www
COPY        . .
COPY        .env.production ./.env
RUN         pnpm install --frozen-lockfile
RUN         pnpm build

ENV         NODE_ENV=production

EXPOSE      3000
EXPOSE      3001

ENTRYPOINT  ["pnpm", "start"]
