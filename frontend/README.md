# BILAL WA BOT WEB — Frontend

This folder can be deployed independently to Vercel. Set the Vercel **Root Directory** to `frontend`. For local use, install its dependencies once with `npm --prefix frontend install`, then start the bot from the project root and open `http://localhost:PORT`. `npm start` builds the frontend bundle automatically. The dashboard connects to the local backend; select a country, enter a phone number, and request a pairing code.

To build the static site locally, run `npm install` and then `npm run build` from this folder. The generated website is written to `dist/`.

## Connecting the frontend to the backend

For Vercel deployments, set `BACKEND_API_URL` to the public backend URL at build time and redeploy. If the frontend cannot reach the backend, the pairing panel displays a connection setup form where you can enter and save the backend URL for that browser. Configure the backend's `CORS_ORIGIN` to allow the frontend's exact origin.

The backend URL must be reachable from the browser. HTTPS is required when the frontend is served over HTTPS. For local use, open the website served by the backend itself (normally `http://localhost:3000`) to avoid cross-origin configuration. The public configuration and pairing flow in Free Mode use a separate guest identity for each browser. When Free Mode is off, users sign in with an access key. Each user can only see sessions associated with their account; administrators can view all sessions.

## Backend configuration

The frontend is a static website. Run the WhatsApp bot backend separately on a Node.js server or hosting panel with `npm start`. Set `HOST=0.0.0.0` and `PORT` in the root `.env` file, then point the public backend domain to that address. Configure:

- `CORS_ORIGIN`: the Vercel frontend origin, such as `https://your-project.vercel.app`. Add any custom domain as well.
- `ADMIN_PASSWORD`: the admin sign-in password, at least 32 characters. Free Mode is controlled in the admin page, not through an environment variable.
- `TELEGRAM_CHANNEL_URL` and `TELEGRAM_USERNAME`: configure the Telegram links displayed in the dashboard.
- `OWNER_CONTACT_URL`: optionally override the default WhatsApp owner contact link.

Free Mode changes made in `/admin` are saved in `backend/site-settings.json` and remain active after a restart. On a new installation with no saved setting, Free Mode starts enabled.

The backend does not require a separate `DASHBOARD_API_KEY`. Admin access uses `ADMIN_PASSWORD`; user access uses keys created in the admin page.

The admin console is available at `/admin`. Administrators can create, rename, search, filter, and revoke access keys; search, filter, disconnect, and remove individual WhatsApp sessions; view recent message history for each number; change Free Mode; monitor guest sessions; refresh the dashboard; and export audit logs as CSV. Message history is kept in memory (up to 200 messages per number and 10,000 total), is not written to disk or the terminal, and is cleared when the backend restarts or a number is removed. Media payloads are not included.

The backend, WhatsApp sessions, and access database should not be uploaded to Vercel. See `../readme.md` for backend setup details.
