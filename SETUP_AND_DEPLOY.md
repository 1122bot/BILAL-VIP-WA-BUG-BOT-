# Setup and GitHub-to-Vercel Deployment

This guide covers local setup, preparing the project for GitHub, running the backend, and deploying the static frontend to Vercel.

## 1. Requirements

- Node.js 18 or later and npm
- A GitHub account and Git installed locally
- A Vercel account connected to GitHub
- An always-on Node.js server for the WhatsApp bot backend

Vercel is used for the static frontend only. Keep the bot backend on a separate Node.js host that provides persistent disk storage. Do not deploy the WhatsApp backend as a Vercel Function: WhatsApp connections and session files need a long-running process and persistent storage.

## 2. Install and run locally

From the project root, install both sets of dependencies:

```sh
npm install
npm --prefix frontend install
```

Create a root-level `.env` from the example file.

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS, Linux, or Git Bash:

```sh
cp .env.example .env
```

Set `ADMIN_PASSWORD` in `.env` to a unique random value of at least 32 characters. Generate one with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The template also includes `HOST`, `PORT`, `MAX_SESSIONS`, `OPEN_BROWSER`, `CORS_ORIGIN`, and optional community-link variables. For local use, the defaults are generally suitable. Start the backend from the project root:

```sh
npm start
```

The `prestart` script builds the frontend before starting the backend. Open `http://localhost:3000`, or use the port configured by `PORT`. The admin console is available at `http://localhost:3000/admin`.

## 3. Prepare and push the project to GitHub

Create a new GitHub repository. Keep it private if you do not intend to publish the source. From the project root, initialize Git if the project is not already a repository, then stage and push the source:

```sh
git init
git add .
git status
git commit -m "Prepare project for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

If Git is already initialized, skip `git init`. If a remote already exists, do not add it again; check it with `git remote -v`.

Before committing, inspect `git status` and verify that no `.env`, WhatsApp session credentials, access data, or other private files are staged. The repository `.gitignore` excludes `.env`, session directories, `backend/user-data/`, website data, dependencies, and generated build output. Never force-add ignored secrets or runtime data. If private credentials have already been pushed, remove them from the repository and rotate or relink the affected credentials; deleting a file in a later commit does not erase it from Git history.

## 4. Deploy the backend to a Node.js host

The backend runs from the repository root, not from `frontend/`. On your Node.js hosting provider:

1. Connect the GitHub repository or upload the project source.
2. Set the project/root directory to the repository root.
3. Install dependencies in both directories before starting the service:

   ```sh
   npm install
   npm --prefix frontend install
   ```

   Set `npm start` as the start command. It runs the frontend build before starting the backend.
4. Configure the environment variables from `.env.example` in the provider's environment-variable settings. At minimum, set:
   - `HOST=0.0.0.0`
   - `PORT` to the port required by the provider
   - `ADMIN_PASSWORD` to a unique random secret of at least 32 characters
   - `CORS_ORIGIN` to the exact frontend origin after the Vercel deployment is created
5. Enable persistent storage and keep the backend's runtime data between restarts and deployments. In particular, preserve `backend/sessions/`, `backend/user-data/`, and the backend data files such as `backend/website-data.json` and `backend/site-settings.json`.
6. Configure a public HTTPS URL for the backend and confirm that the service stays running.

The backend uses `PORT` for its HTTP server. If the provider assigns the port automatically, use the provider's required environment variable mapping. Never expose `.env` or `ADMIN_PASSWORD` through a public URL or frontend setting.

For local development, `CORS_ORIGIN` can be empty when using the dashboard served by the backend itself. For a separately hosted frontend, list each exact frontend origin separated by commas, for example:

```text
CORS_ORIGIN=https://your-project.vercel.app,https://www.example.com
```

Do not include a path or trailing slash in an origin.

### Pterodactyl setup

When running the backend in a Pterodactyl panel:

1. Create or select a server that uses a compatible Node.js egg and Node.js 18 or later.
2. In the server's **Network** page, note the primary allocation's port. If no allocation is available, ask the panel administrator to assign one.
3. In the server's **Startup** settings or environment variables, set:

   ```text
   HOST=0.0.0.0
   PORT=<the primary allocation port from Network>
   ADMIN_PASSWORD=<a unique random secret of at least 32 characters>
   CORS_ORIGIN=<the exact Vercel frontend origin>
   ```

   Replace the placeholders with actual values; do not include angle brackets. The `PORT` value must match the server's allocated port. `HOST` must remain `0.0.0.0` so the application listens on the container interface; do not put the panel domain or node IP in `HOST`.
4. Upload or deploy the project to the server's root directory. Install the root dependencies and frontend dependencies (`npm install` and `npm --prefix frontend install`) if they are not installed as part of deployment.
5. Set the Pterodactyl startup command to `npm start`. The root `prestart` script builds the frontend before starting the backend.
6. To identify the public server address, use the allocation details shown by the panel (and, if needed, the node IP shown in the panel's node/server information). The panel's own domain is the management interface; it is not automatically the backend API domain. If using a custom API domain, point its DNS to the appropriate public server IP and configure routing/proxying to the allocated port.
7. Check that the server is online and the backend is reachable at its public address. Set Vercel's `BACKEND_API_URL` to that public backend URL. Prefer an HTTPS domain/reverse proxy, for example `https://api.example.com`. A direct `http://IP:PORT` endpoint may be blocked by browsers when the frontend is served over HTTPS.

The IP address is for determining/routing the public backend address, not for `HOST`. The assigned Pterodactyl allocation port is the value for `PORT`. If a reverse proxy terminates HTTPS on a domain, use that HTTPS domain as `BACKEND_API_URL`; the proxy must forward requests to the Pterodactyl server and allocated port.

## 5. Deploy the frontend from GitHub to Vercel

1. In Vercel, choose **Add New → Project** and import the GitHub repository.
2. In the project configuration, set **Root Directory** to `frontend`. Confirm that Vercel uses the `frontend/` directory, where `vercel.json` and `package.json` are located.
3. The included `frontend/vercel.json` specifies:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Under **Environment Variables**, add:
   - Name: `BACKEND_API_URL`
   - Value: your public backend URL, such as `https://api.example.com`

   Use the backend's HTTPS URL, with a port in the URL only if that port is publicly reachable and required. This value is embedded in the frontend at build time, so add or change it in Vercel and redeploy after changes.
5. Deploy the project. After deployment, copy the exact Vercel origin (for example, `https://your-project.vercel.app`) into the backend's `CORS_ORIGIN` environment variable. Include any custom frontend domain as an additional origin.
6. Restart or redeploy the backend after changing its environment variables. Redeploy the frontend after changing `BACKEND_API_URL`.
7. Open the Vercel URL and test the connection. If the dashboard asks for a backend URL, verify `BACKEND_API_URL`, ensure the backend is publicly reachable over HTTPS, and check the backend's `CORS_ORIGIN`.

Vercel keeps the project linked to GitHub. Later pushes to the configured production branch trigger a new production deployment; pull requests and other branches can receive preview deployments according to the Vercel project's Git settings.

Do not add `ADMIN_PASSWORD` or WhatsApp credentials to Vercel. Only the public backend URL belongs in the frontend's build configuration.

## 6. Configure the admin console

Open `https://your-project.vercel.app/admin` and sign in with the backend's `ADMIN_PASSWORD`. The admin console can configure Free Mode and manage user access keys and WhatsApp sessions.

- Free Mode is controlled in the admin console and saved by the backend. On a fresh installation with no saved setting, Free Mode starts enabled.
- With Free Mode disabled, users need an access key created by an admin.
- Keep backend runtime data persistent: access keys, ownership records, and audit logs are stored in `backend/website-data.json`; Free Mode settings are stored in `backend/site-settings.json`.
- Back up private runtime data securely. Do not commit it to GitHub or include it in frontend assets.

## Troubleshooting

- **Vercel build fails:** Confirm the Vercel Root Directory is `frontend` and the build output is `dist`.
- **Frontend cannot connect to the backend:** Confirm `BACKEND_API_URL` is a public HTTPS URL, redeploy the frontend, and verify that the backend is running.
- **Browser reports a CORS error:** Set backend `CORS_ORIGIN` to the exact frontend origin, including the scheme (`https://`) and hostname, then restart the backend.
- **Pairing or admin state disappears after a host restart:** Configure persistent storage for backend session and website data files.
- **The backend cannot start:** Check the provider's logs, its Node.js version, required environment variables, and assigned port.
