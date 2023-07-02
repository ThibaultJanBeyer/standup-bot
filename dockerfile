FROM        node:20.3.1-alpine3.17

RUN         npm install -g pnpm
RUN         npm install -g pm2

WORKDIR     /var/www
COPY        . .
COPY        .env.production ./.env
RUN         pnpm install --frozen-lockfile
RUN         pnpm build

EXPOSE      3000

ENTRYPOINT  ["pnpm", "start"]