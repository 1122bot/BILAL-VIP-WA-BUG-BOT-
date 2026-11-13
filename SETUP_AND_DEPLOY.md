# 🔐 BILAL VIP BOT — Permanent Vercel Domain + Switchable Panel

Ye guide aap ke **existing script** (web pairing + admin panel + free mode) ke upar naya
"permanent domain" layer install karti hai.

**Faida:** Vercel ka domain kabhi change nahi hoga. Panel ya port badalne par sirf
`config.json` update karein — Vercel par kuch nahi karna.

```
Browser
   │  https://bilal-vip-bot.vercel.app   (permanent)
   ▼
Vercel  ──►  GitHub raw config.json  (har request par fresh, no-cache)
   │              │
   │              └─ panel_backend_url + api_secret
   ▼
Active Panel (Pterodactyl / VPS)
   ├─ /api/pair        → 8-character pairing code
   ├─ /api/auth/*      → guest / access key / admin login
   ├─ /api/admin/*     → free mode, keys, sessions, logs
   └─ MongoDB          → session backup (restart-proof)
```

---

## 📁 Naye / Updated Files

| File | Kya karta hai |
|---|---|
| `config.json` | **Sirf ye** update karein panel badalne par |
| `api/pair.js` | Pairing proxy: config → panel `/api/pair` → code |
| `api/[...path].js` | Baaki saare `/api/*` calls ko panel par forward karta hai |
| `vercel.json` | Frontend build + routing + no-cache headers |
| `backend/mongo-session.js` | Sessions ka MongoDB backup / restore |
| `backend/index.js` | Boot par restore + auto backup hook |
| `frontend/*` | Aap ka existing UI (BILAL VIP BOT neon branding) |

---

# STEP 1 — MongoDB (sessions ko restart-proof banane ke liye)

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) par free **M0** cluster banayein.
2. **Database Access** → user banayein (username + strong password).
3. **Network Access** → `0.0.0.0/0` allow karein (Pterodactyl node ka IP badalta hai).
4. **Connect → Drivers** se connection string copy karein:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/bilalvip?retryWrites=true&w=majority
```

> `MONGODB_URI` na dein to bot phir bhi chalega, lekin restart par sessions sirf
> panel ke local disk se restore honge (panel migrate karne par users disconnect ho sakte hain).

---

# STEP 2 — Panel Deploy (Pterodactyl / VPS)

### 2.1 Files

Pterodactyl File Manager mein poora repo upload karein (ya `git clone`), phir:

```bash
npm install
```

### 2.2 Environment Variables (Startup tab)

| Variable | Value |
|---|---|
| `PORT` | allocated port (e.g. `3000`) |
| `MONGODB_URI` | `mongodb+srv://...` |
| `MONGODB_DB` | `bilalvip` *(optional)* |
| `API_SECRET` | lamba random secret — **config.json se same** |
| `ADMIN_PASSWORD` | 32+ characters ka strong password |
| `MAX_SESSIONS` | `10` (ya jitne chahiye) |
| `CORS_ORIGIN` | `https://your-app.vercel.app` *(optional)* |
| `SESSION_BACKUP_INTERVAL_MS` | `45000` *(optional)* |

> ⚠️ `ADMIN_PASSWORD` kam az kam **32 characters** hona chahiye, warna admin login
> `503` dega (ye aap ke script ka built-in safety check hai).

### 2.3 Start

```
node index.js
```

Console mein ye dikhna chahiye:

```
[mongo] Connected — session backup enabled.
[mongo] 0 session(s) restored from MongoDB
🚀 web server listening ...
[mongo] Auto session backup every 45s.
```

### 2.4 Panel URL

```
https://panel-1.yourhost.com
```

Browser mein kholein — pairing page ya JSON response aana chahiye.
Admin: `https://panel-1.yourhost.com/admin`

---

# STEP 3 — GitHub `config.json`

Repo → `config.json` → Edit:

```json
{
  "panel_backend_url": "https://panel-1.yourhost.com",
  "api_secret": "same_as_panel_API_SECRET",
  "brand_name": "BILAL VIP BOT"
}
```

Commit. **Bas itna hi.** Vercel har request par ye file fresh fetch karta hai.

---

# STEP 4 — Vercel Deploy

1. [vercel.com/new](https://vercel.com/new) → repo import karein.
2. Settings (agar auto-detect na ho):
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Install Command:** `cd frontend && npm install`
   - **Build Command:** `cd frontend && npm run build`
   - **Output Directory:** `frontend/dist`
3. **Environment Variables** (optional, defaults already sahi hain):

| Name | Value |
|---|---|
| `GITHUB_OWNER` | `1122bot` |
| `GITHUB_REPO` | `BILAL-VIP-WA-BUG-BOT-` |
| `GITHUB_BRANCH` | `main` |
| `CONFIG_PATH` | `config.json` |

4. **Deploy**.

Permanent URL:

```
https://bilal-vip-bot.vercel.app
```

### Test

```
https://bilal-vip-bot.vercel.app/api/health
```

```json
{ "status": true, "service": "BILAL VIP BOT Pairing Proxy", ... }
```

Phir site kholein → number daalein → **Create pairing code** → 8-character code.

---

# STEP 5 — Panel Change Karna

1. GitHub → `config.json` → Edit
2. `panel_backend_url` = naya panel URL
3. Commit

Vercel domain **same**. Changes ~30–60 second mein live (har request par fresh fetch).

> Agar naye panel ka `API_SECRET` different hai to `config.json` mein wo bhi update karein.

---

# STEP 6 — Admin Panel & Free Mode

URL: `https://<panel-host>/admin` (ya Vercel domain + `/admin`)

- **Free Mode ON** → koi bhi guest pairing kar sakta hai
- **Free Mode OFF** → sirf access-key / premium users pair kar sakte hain
- **Access Keys** → admin panel se keys generate / revoke karein
- **Sessions** → connected numbers, logs, remove session

Free mode toggle panel ke `backend/site-settings.json` mein save hota hai
(`{ "freeMode": true }`).

---

# STEP 7 — Session Persistence (Restart Test)

`backend/mongo-session.js` har 45 second mein `backend/sessions/<number>/` ka content
MongoDB collection **`sessionbackups`** mein save karta hai.

Panel restart par:

1. `mongoSessions.init()` connect
2. `restoreAll()` missing session folders wapas likhta hai
3. `boot()` phir har session ko connect karta hai

Console:

```
[mongo] 1 session(s) restored from MongoDB
```

User ko **dobara pair nahi karna padta**.

---

# 🔧 Troubleshooting

| Problem | Hal |
|---|---|
| `CONFIG_FETCH_FAILED` | Repo/branch/path ya `config.json` ka JSON check karein |
| `PANEL_UNREACHABLE` | `panel_backend_url` ghalat / panel band / port block |
| `PANEL_TIMEOUT` | Panel slow — Vercel function timeout (Hobby 10s, Pro 30s) |
| `FREE_MODE_OFF` | Admin panel se Free Mode ON karein ya access key dein |
| `Start a guest session...` | Free mode off hai — access key se login karein |
| Admin login `503` | `ADMIN_PASSWORD` 32 characters se chhota hai |
| `This number is already connected` | Session pehle se active — admin se remove karein |
| `Too many requests` | Built-in rate limit (5/min IP) — thoda wait karein |
| Sessions restart par gayab | `MONGODB_URI` set nahi / Atlas IP allow nahi |
| Frontend "Backend connection required" | `config.json` URL ya Vercel proxy check karein |

---

# 🔐 Security Checklist

- [ ] `API_SECRET` 32+ random characters, panel aur `config.json` dono mein same
- [ ] `ADMIN_PASSWORD` 32+ characters, default **kabhi** na rakhein
- [ ] `.env` kabhi commit na karein (`.gitignore` already block karta hai)
- [ ] MongoDB password strong + Atlas access controlled
- [ ] `/admin` ka URL public na share karein
- [ ] Panel HTTPS par chalaayein (Cloudflare / reverse proxy)

> **Note:** Jo `.env` aap ne share kiya tha us mein real `ADMIN_PASSWORD` hash aur
> channel links thay. Us password ko **rotate** kar dein aur `.env` ko repo se bahar rakhein.

---

# 📌 Limits & Notes

1. **Vercel Hobby** par function timeout 10s hai. Pairing usually 2–5s leta hai; slow panel
   par Pro plan (30s) behtar hai.
2. `api/pair.js` har request par ek guest session banata hai (free mode ON hone par).
   Panel expired guest tokens khud prune karta hai.
3. Ek WhatsApp number ek waqt mein ek hi jagah connected reh sakta hai.
4. Baileys unofficial library hai — WhatsApp ToS ki paband rahein, spam na karein.
