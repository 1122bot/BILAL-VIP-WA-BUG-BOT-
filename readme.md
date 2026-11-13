# BILAL WA BOT WEB

A multi-number WhatsApp bot with a web dashboard, pairing flow, and admin console. The project has two parts:

- **Backend:** A Node.js service that runs the WhatsApp bot, pairing API, and admin API. It must run on an always-on server with persistent storage.
- **Frontend:** A static website that can be hosted separately, including on Vercel.

> **Important:** Vercel hosts the frontend only. It does not run this project's WhatsApp bot backend or provide the persistent storage needed for WhatsApp sessions.

## Features

- Pair and manage multiple WhatsApp numbers from a web dashboard.
- Keep each number's session and bot data separate.
- Use Free Mode for guest access or require admin-created access keys.
- Manage access keys, sessions, and Free Mode in the admin console at `/admin`.
- Review recent message logs in the admin console. Logs are held in memory and are not retained after a backend restart.
- Configure the Telegram and WhatsApp community links shown on the website.

## Project layout

```text
.
├── backend/       # WhatsApp bot, API, configuration, and runtime data
├── frontend/      # Static dashboard and Vercel configuration
├── .env.example   # Backend environment variable template
├── package.json   # Backend start command
└── readme.md
```

For detailed local setup, GitHub preparation, and Vercel deployment instructions, see [SETUP_AND_DEPLOY.md](./SETUP_AND_DEPLOY.md).

## Quick start

Requirements: Node.js 18 or later and npm.

1. Install the root and frontend dependencies:

   ```sh
   npm install
   npm --prefix frontend install
   ```

2. Copy `.env.example` to `.env` in the project root and set a unique `ADMIN_PASSWORD` of at least 32 characters. Keep `.env` private.
3. Start the backend:

   ```sh
   npm start
   ```

4. Open `http://localhost:3000` (or the configured `PORT`). The backend serves the locally built dashboard as well as the API.

To generate a random admin password with Node.js:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment overview

1. Run the backend on an always-on Node.js host (including Pterodactyl) with persistent storage for `backend/sessions/`, `backend/user-data/`, and the backend's website data files.
2. Deploy the `frontend/` directory to Vercel. Set `BACKEND_API_URL` to the backend's public URL and redeploy.
3. Set the backend's `CORS_ORIGIN` to the exact Vercel site origin (and any custom frontend domain).

See [SETUP_AND_DEPLOY.md](./SETUP_AND_DEPLOY.md) for step-by-step instructions.

## Important data and security notes

- Never commit or share `.env`, WhatsApp session credentials, API keys, access databases, or backups containing private data.
- The repository `.gitignore` excludes `.env`, dependencies, session folders, per-number user data, and generated frontend output. Review `git status` before pushing, especially if you have moved or renamed runtime data.
- Back up the backend's session and user data securely. Losing WhatsApp session files may require pairing the number again.
- Keep `ADMIN_PASSWORD` on the backend host only. Do not put it in Vercel environment variables or frontend code.
- Use an HTTPS public backend URL when the frontend is served over HTTPS.
- Free Mode is controlled from `/admin` and stored by the backend; it is not configured through an environment variable.
