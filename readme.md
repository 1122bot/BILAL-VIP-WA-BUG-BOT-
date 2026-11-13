# ⚡ BILAL VIP BOT — WhatsApp MD Pairing System

Permanent **Vercel domain** + switchable **Pterodactyl / VPS** backend.
Panel badlein — domain same rahega, sirf `config.json` update karein.

```
Browser ──► Vercel (permanent) ──► GitHub raw config.json ──► Active Panel (Baileys + MongoDB)
```

## ✨ Features

- 🔗 **Permanent domain** — panel change par Vercel redeploy nahi
- 🔄 **Zero-cache config** — har request par fresh `config.json` (no-store)
- 📱 **Web pairing** — 8-character WhatsApp pairing code
- 🛡️ **Admin panel** — Free Mode ON/OFF, access keys, sessions, logs
- 🗄️ **MongoDB session backup** — restart / migrate ke baad re-pair nahi
- ♻️ **Auto-reconnect** — Baileys built-in reconnect handling
- 🎨 **Dark neon UI** — BILAL VIP BOT branding, mobile friendly

## 📂 Structure

| Path | Kya hai |
|---|---|
| `config.json` | **Sirf ye** update karein panel badalne par |
| `api/pair.js` | Pairing proxy (config → panel `/api/pair`) |
| `api/[...path].js` | Baaki `/api/*` calls ka transparent proxy |
| `vercel.json` | Frontend build + routing + no-cache headers |
| `backend/index.js` | Bot + session boot / restore |
| `backend/web-server.js` | Pairing + admin + free mode API |
| `backend/mongo-session.js` | MongoDB session backup / restore |
| `frontend/` | Pairing page + admin console (build → `dist`) |
| `SETUP_AND_DEPLOY.md` | **Poora step-by-step guide (Roman Urdu)** |

## 🚀 Quick Start

1. **MongoDB Atlas** free cluster → connection string
2. **Panel**: repo upload → `npm install` → env vars → `node index.js`
3. **`config.json`**: `panel_backend_url` + `api_secret` (panel ke `API_SECRET` se same)
4. **Vercel**: repo import → build `cd frontend && npm run build` → output `frontend/dist`
5. Site kholein → number daalein → code copy karein
6. Admin: `https://<panel-host>/admin`

Detailed: **[SETUP_AND_DEPLOY.md](SETUP_AND_DEPLOY.md)**

## 🔑 Panel Env

```env
PORT=3000
MONGODB_URI=mongodb+srv://...
API_SECRET=same_as_config_json
ADMIN_PASSWORD=32_plus_characters
MAX_SESSIONS=10
SESSION_BACKUP_INTERVAL_MS=45000
```

## 🔌 API

| Endpoint | Description |
|---|---|
| `GET /api/health` | Proxy health |
| `POST /api/pair` `{phone}` | Pairing code (Vercel proxy) |
| `POST /api/pair` `{phoneNumber}` | Pairing code (panel, auth required) |
| `GET /api/public-config` | Free mode + community links |
| `POST /api/auth/guest` | Guest session (free mode ON) |
| `POST /api/auth/admin-login` | Admin login |
| `GET /api/admin/overview` | Admin dashboard data |
| `POST /api/admin/free-mode` `{enabled}` | Free Mode ON/OFF |

## ⚠️ Disclaimer

Baileys unofficial library hai. WhatsApp Terms of Service ki paband rahein.
Spam / bulk messaging se account ban ho sakta hai.

---

Base by TdX Division · Owner: t.me/bilal_babar_982
