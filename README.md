# BILAL VIP BOT — Permanent Domain (Vercel)

Ye repo **sirf Vercel wala hissa** hai:

- 🎨 Stylish **pairing page** (naya dark theme)
- 🔐 **Admin panel** (password protected) — Free Mode on/off, access keys, devices, activity log
- 🔁 **Zero-cache reverse proxy** — har request par GitHub se `config.json` parhta hai

> **Poora WhatsApp bot script is repo me nahi hai.** Wo aap apne Pterodactyl panel / VPS par deploy karte hain.
> Yahan sirf frontend + proxy hai, taake aapka **Vercel domain kabhi na badle**.

---

## Kaam kaise karta hai

```
User  →  https://your-app.vercel.app        (permanent domain)
              │
              ├─ /              → pairing page (static)
              ├─ /admin         → admin panel (static)
              │
              └─ /api/*         → serverless proxy
                        │
                        │  har request par:
                        │  1. GitHub raw config.json (no cache)
                        │  2. panel_backend_url nikaalo
                        │  3. request us panel par forward karo
                        ▼
                 Pterodactyl Panel / VPS  (badal sakta hai)
                        │
                        └─ Baileys → WhatsApp pairing code
```

**Panel badla?** Sirf `config.json` me URL badlo → push → live. Vercel domain same.

---

## Files

| File | Kaam |
|---|---|
| `config.json` | **Sirf yahan** panel URL + secret |
| `api/pair.js` | Pairing code endpoint (config fetch → guest token → `/api/pair`) |
| `api/[...path].js` | Baaki saare `/api/*` ka transparent proxy |
| `public/index.html` | Pairing page |
| `public/admin.html` | Admin panel |
| `public/style.css` | Naya dark design system |
| `public/app.js` | Pairing page logic |
| `public/admin.js` | Admin panel logic |
| `vercel.json` | Routing, headers, function config |
| `SETUP_AND_DEPLOY.md` | Step-by-step guide (Roman Urdu) |

---

## config.json

```json
{
  "panel_backend_url": "https://your-panel-url.com",
  "api_secret": "koi_lamba_random_secret",
  "brand_name": "BILAL VIP BOT"
}
```

- `panel_backend_url` — aapka **live** panel ka public URL (https, no trailing slash)
- `api_secret` — optional shared secret (panel ko ignore karta hai, future use ke liye)
- `brand_name` — display name

---

## Quick start

1. `config.json` me apna panel URL daalo
2. Vercel par repo import karo → Deploy
3. Domain ready — pairing page + `/admin` chal raha hoga

Poori tafseel: **[SETUP_AND_DEPLOY.md](./SETUP_AND_DEPLOY.md)**

---

## Admin login

- URL: `https://your-domain/admin`
- Password: **panel ke `ADMIN_PASSWORD` environment variable** wali value
- Kam se kam **32 characters** honi chahiye, warna login 503 dega

Sub-users ko password ki zaroorat nahi — wo sirf pairing page use karte hain.

---

## API endpoints (proxy ke through)

| Method | Path | Kaam |
|---|---|---|
| `POST` | `/api/pair` | `{ phoneNumber }` → `{ pairingCode }` |
| `GET` | `/api/public-config` | free mode + community links |
| `POST` | `/api/auth/guest` | guest token (free mode ON ho to) |
| `POST` | `/api/auth/admin-login` | `{ secret }` → admin token |
| `GET` | `/api/admin/overview` | stats + keys + devices + logs |
| `POST` | `/api/admin/free-mode` | `{ enabled }` |
| `POST` | `/api/admin/keys` | `{ label }` → naya key |
| `POST` | `/api/admin/keys/rename` | `{ keyId, label }` |
| `POST` | `/api/admin/keys/revoke` | `{ keyId }` |
| `POST` | `/api/admin/sessions/remove` | `{ number }` |
| `GET` | `/api/health` | proxy health check |

---

## Note

- Panel ke rate limits proxy IP par lagte hain (5 pair/min, 10 login/min). Bohat zyada traffic ho to panel script me limits barha dein.
- `config.json` public repo me hai — isme koi password na rakhein.
