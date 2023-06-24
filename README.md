# Work in Progress

- A dead simple open source standup bot
- Based on the [Getting Started ⚡️ Bolt](https://github.com/slackapi/bolt-js-getting-started-app) and [github copilot chat](https://github.com/github-copilot/chat_waitlist_signup/join) output
- Rushed in a week
- neon.tech as db and drizzle as orm
- next.js for the app using mostly https://ui.shadcn.com/ for components
- Running on digitalocean instance monitoring via pm2 https://app.pm2.io/bucket/6495c91365be89c1f189e947/backend/overview/servers
- https via cloudflare

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

### Deployment

Locally:

```
./build.sh
```

- Don’t forget to log in `docker login`
- And change `HOST="standupbotcom"` and `IMG_NAME="ssb"` to your own repository

On the server:

```
./start.sh
```

- Don’t forget to log in `docker login`
- And change `HOST="standupbotcom"` and `IMG_NAME="ssb"` to your own repository
