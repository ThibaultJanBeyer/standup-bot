# Standup Bot

All you need to know on:
[https://www.standup-bot.com](https://www.standup-bot.com)

## Info

- A dead simple open source standup bot
- Based on the [Getting Started ⚡️ Bolt](https://github.com/slackapi/bolt-js-getting-started-app) and [github copilot chat](https://github.com/github-copilot/chat_waitlist_signup/join) output
- Rushed in a week, stabilized in 3 month
- neon.tech as db and drizzle as orm
- Icons using https://icones.js.org/collection/lucide via unplugin icons
- next.js for the app using mostly https://ui.shadcn.com/ for components
- Running on digitalocean instance
- https via cloudflare
- Using https://github.com/statelyai/xstate as state-machine for the bot
- UI created by [Emilia Matthews](https://www.behance.net/gallery/174621639/Stand-Up-Slack-Bot-Landing-Page)

## Testing Slack integration on dev

- Create local-tunnels
- Add them respectively to `.env` and to your bots settings

## Building locally

(make sure `.env` and `.env.production` are ready)

- Run `./build.sh`
- Run `./start.sh`

## Server resources

```
apt update
apt install zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
wget -qO- https://get.docker.com/ | sh
apt install nginx

ufw allow ssh &&
ufw allow 3000 &&
ufw allow 80 &&
ufw allow from 172.0.0.1 &&
ufw enable &&
ufw allow 'Nginx Full' &&
ufw status

mkdir -p /var/www/standup-bot.com/html
chown -R $USER:$USER /var/www/standup-bot.com/html
chmod -R 755 /var/www/standup-bot.com

nano /etc/nginx/sites-available/standup-bot.com
```

```
server {
  listen 80;
  listen [::]:80;
  server_name standup-bot.com www.standup-bot.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    add_header X-Robots-Tag "noindex, nofollow, nosnippet, noarchive";
  }
  location /_bot {
    rewrite ^/_bot(.*) /$1 break;
    proxy_pass http://127.0.0.1:3001;
  }
}
```

Note that `location /_bot {` is optional in case you want to run the bot on the same domain under a sub-path `/_bot`, if you prefer a sub-domain `bot.` then you’ll need to add a new site instead:

```
nano /etc/nginx/sites-available/bot.standup-bot.com
```

```
server {
  listen 80;
  listen [::]:80;
  server_name bot.standup-bot.com;
  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    add_header X-Robots-Tag "noindex, nofollow, nosnippet, noarchive";
  }
}
```

```
ln -s /etc/nginx/sites-available/standup-bot.com /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/bot.standup-bot.com /etc/nginx/sites-enabled/

nano /etc/nginx/nginx.conf
```

```
http {
    ...
    server_names_hash_bucket_size 64;
    ...
}
```

```
systemctl restart nginx
nginx -s reload
systemctl restart nginx
```

### Cloudflare configs

I used cloudflare to get https. I added following DNS records:

```
A     bot             SERVER.IP.ADDRESS Proxied   Auto
A     standup-bot.com SERVER.IP.ADDRESS Proxied   Auto
CNAME www             standup-bot.com   Proxied   Auto
```

### Continuous Deployment

Happens automatically and continuously via github workflows. Basically:

- Create .env file with github envs
- Build docker image & push to private repository (important that is is private because it holds the secrets in env file)
- SSH into machine
- Stop old container, run new container (@TODO: update to have zero downtime)
  It uses the `build.sh` and `start.sh` scripts

## Bot Settings

Set the URI of your app under `Settings > Event Subscriptions > Request URL` & under `Settings >  Interactivity & Shortcuts > Interactivity` to:

- `https://bot.standup-bot.com/slack/events`.

Add the redirect URLs under `Settings > OAuth & Permissions > Redirect URLs`, adding:

- `https://www.standup-bot.com`
- `https://standup-bot.com`
- `https://bot.standup-bot.com`

Add the scopes under `Settings > OAuth & Permissions > Scopes` to the same scopes as in the [app.ts](https://github.com/ThibaultJanBeyer/standup-bot/blob/main/apps/bot/src/app.ts#L71)

## Wallaby.js

[![Wallaby.js](https://img.shields.io/badge/wallaby.js-powered-blue.svg?style=for-the-badge&logo=github)](https://wallabyjs.com/oss/)

This repository contributors are welcome to use
[Wallaby.js OSS License](https://wallabyjs.com/oss/) to get
test results immediately as you type, and see the results in
your editor right next to your code.
