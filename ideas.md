## Feature Plan

- When Stable
- - Publish on Slack as official app

- Nice to have
- - Add Axiom for logs
- - Cloudflare worker that checks if Bot is up and reboots it if down
- - Zero downtime on updates
- - Add link to website in the bot on slack itself
- - Would be great if Bot could pick up where it started if it crashes in
    between
- - dev branch environment previews (what could work is add another github workflow with credentials for dev, simply run the app under another port with nginx subdomain)
- - Better CronPicker
- - Don’t keep states in memory, store them in the DB
- - Use a real cache, don’t use the simple memory cache

- When Popular
- - Cheap pricing (1$/m or less) on hosted (SAAS) version to cover our server costs
