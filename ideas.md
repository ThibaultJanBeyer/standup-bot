## Feature Plan

- When Stable
- - Publish on Slack as official app

- For release:
- - Needs to be installed on 10 workspaces
- - Needs to send a welcoming message

```
- Your app is using the App Home "Messages" tab, but not the required `chat:write` bot scope and the `app_home_opened` event, which allow the app to send messages to users. Our guidelines require listed apps to respond to direct messages and send welcome messages the first time any user opens the Messages tab. If you don’t wish to send messages to users, disable the App Home “Messages” tab.
- It looks like this app may be installed on less than 10 active workspaces. We require that apps be installed on at least 10 workspaces before submission to ensure that customers are able to provide feedback on improving their user experience.
```

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
