# Work in Progress

## TODO

- Beautiful UI
- Bot needs to restart workflows on server reboot
- A way to prevent overriding the bot while running (or only give a warning when bot is actually running)
- Questions Array (multiple inputs fields instead of one string)

## Info

- A dead simple open source standup bot
- Based on the [Getting Started ⚡️ Bolt](https://github.com/slackapi/bolt-js-getting-started-app) and [github copilot chat](https://github.com/github-copilot/chat_waitlist_signup/join) output
- Rushed in a week
- neon.tech as db and drizzle as orm
- Icons using https://icones.js.org/collection/lucide via unplugin icons
- next.js for the app using mostly https://ui.shadcn.com/ for components
- Running on digitalocean instance
- https via cloudflare
- Using https://github.com/statelyai/xstate as state-machine for the bot

## Testing Slack integration on dev

- Run a local-tunnel on `:3000`
- Add to `SLACK_REDIRECT_URI` in `.env` file
- Add redirect url in [the bots Redirect URLs list under oauth](https://api.slack.com/apps/A05D19MGCTC/oauth?)

## Building locally

- Run `./build.sh`

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
}

ln -s /etc/nginx/sites-available/standup-bot.com /etc/nginx/sites-enabled/

nano /etc/nginx/nginx.conf

http {
    ...
    server_names_hash_bucket_size 64;
    ...
}

systemctl restart nginx
nginx -s reload
```

### Continuous Deployment

Happens automatically and continuously via github workflows. Basically:

- Create .env file with github envs
- Build docker image & push to private repository (important that is is private because it holds the secrets in env file)
- SSH into machine
- Stop old container, run new container (@TODO: update to have zero downtime)
  It uses the `build.sh` and `start.sh` scripts
