## Feature Plan

- Release
- - Publish on Slack as official app
- - Needs to be installed on 10 workspaces

```
- It looks like this app may be installed on less than 10 active workspaces. We require that apps be installed on at least 10 workspaces before submission to ensure that customers are able to provide feedback on improving their user experience.
```

- Nice to have
- - Add Axiom for logs
- - Cloudflare worker that checks if Bot is up and reboots it if down
- - Zero downtime on updates
- - Would be great if Bot could pick up where it started if it crashes in between
- - dev branch environment previews (what could work is add another github workflow with credentials for dev, simply run the app under another port with nginx subdomain)
- - Better CronPicker
- - Try https://github.com/seratch/slack-edge
- - Don’t keep states in memory, store them in the DB
- - Use a real cache, don’t use the simple memory cache

- When Popular
- - Cheap pricing (1$/m or less) on hosted (SAAS) version to cover our server costs
