# QuickMute
A simple quick mute bot written in node.js

## Getting Started
1. Install node.js version 8 or higher, I prefer the LTS release.
2. Clone this repo (`git clone https://github.com/TobiTenno/QuickMute.git`)
3. Navigate to the new directory (`cd QuickMute`)
4. Install dependencies (`npm i`)
5. Use pm2 or your choice of process managers to set environment variables.

Example:
```json
{
  "apps": [
    {
      "name": "quickmute",
      "script": "index.js",
      "exec_interpreter" : "node",
      "watch"            : ["pm2.json"],
      "log_date_format"  : "YYYY-MM-DD HH:mm Z",
      "env": {
      	"TOKEN": "<discord bot token>",
        "PREFIX": "!",
        "OP_ROLE": "<discord moderator role id>",
        "LOG_CHANNEL": "<log channel id, bot must have access>",
        "GUILD_ID": "<discord server/guild id>"
      }
    }
  ]
}
```
6. (Optional) Start bot with pm2 (`pm2 start pm2.json`).
7. (Optional) Fork and deploy to heroku (Procfile included)

## Contributing
If you find bugs, let me know, make an issue, and if you know the fix, submit a PR. All for the betterment of all of us!

## Future Features
Probably not many. I built this to be pretty simple and straightforward.
I might make the image ones dynamic and pull from Environment vars so you don't have to modify any source to use this.
