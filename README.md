# Strava Callback Service

A minimal Next.js service that completes the Strava OAuth flow for the Strava Telegram Bot. It validates
Strava's redirect `state`, exchanges authorization codes for tokens, and notifies the bot (and optionally
the user) once everything is linked.

## Project Layout

```
strava-callback/
|-- app/
|   |-- api/strava/callback/route.ts  # API route handling the OAuth redirect
|   |-- globals.css                   # Minimal global styles
|   |-- layout.tsx                    # Root layout metadata
|   `-- page.tsx                      # Informational landing page
|-- public/
|-- package.json
|-- tsconfig.json
`-- .env.example
```

## Requirements

- Node.js 18+
- npm / pnpm / yarn
- Strava developer application (client ID & secret)
- Telegram bot token
- Secret used to sign/verify OAuth `state`
- Optional: bot endpoint that can accept the exchanged tokens

## Environment Variables

Copy `.env.example` to `.env` and populate the values:

| Variable | Required | Description |
|----------|----------|-------------|
| `STATE_SECRET` | ✅ | HMAC secret used to sign/validate `state` payloads |
| `STRAVA_CLIENT_ID` | ✅ | Strava OAuth client ID |
| `STRAVA_CLIENT_SECRET` | ✅ | Strava OAuth client secret |
| `TELEGRAM_TOKEN` | ⚠ | Needed if the callback should DM the user in Telegram |
| `BOT_OAUTH_ENABLED` | ⚠ | `true` to notify the bot automatically, `false` to show the manual code page |
| `BOT_OAUTH_URL` | ⚠ | URL that the callback should POST to so your bot persists tokens |
| `BOT_OAUTH_SHARED_SECRET` | ⚠ | Optional bearer token shared with the bot's bridge endpoint |
| `SUCCESS_REDIRECT_URL` | ⚠ | Where to redirect the browser after success (e.g. `https://t.me/your_bot`) |
| `MANUAL_REDIRECT_PATH` | ⚠ | Alternative path (default `/manual`) to serve when manual mode is enabled |

(⚠ optional) Set `BOT_OAUTH_ENABLED=false` when you want users to copy the authorization code manually and
send it to the Telegram bot. In that mode the service redirects to `/manual?code=...` so no Render env
variables need to be removed.

## Local Development

```bash
cd strava-callback
cp .env.example .env   # fill in secrets
npm install
npm run dev            # http://localhost:3000
```

To test the redirect locally, point Strava's redirect URI at an HTTPS tunnel of your dev server (e.g. `ngrok http 3000`).

## Deploying to Render

1. Push this folder to GitHub.
2. In Render → New → **Web Service**.
3. Set Root Directory to `strava-callback` and choose the Free plan.
4. Build command: `npm install && npm run build`
5. Start command: `npm run start`
6. Add environment variables (same as `.env`).
7. Deploy; note the public URL, e.g. `https://strava-callback.onrender.com`.
8. Update Strava's redirect URI to `https://strava-callback.onrender.com/api/strava/callback`.
9. Update your bot's `.env` (`STRAVA_REDIRECT_URI`) with the same URL and redeploy the bot.

## OAuth Flow Summary

1. Bot issues `/login`: generates `state` (HMAC signed with `STATE_SECRET`) containing `telegramId`.
2. User authorizes Strava → redirected to this service with `code` + `state`.
3. Callback verifies `state`, exchanges `code` for tokens, notifies bot/user.
4. Bot persists tokens and confirms inside Telegram.

## Security Notes

- Always validate `state` to prevent cross-account abuse.
- Keep secrets in Render's environment configuration, not in code.
- Protect `BOT_OAUTH_URL` behind auth headers or IP allowlists to avoid malicious spam.

## License

MIT (inherits from the main repository).
