# SETUP & DEPLOY — BILAL VIP BOT (Permanent Domain)

Ye guide Roman Urdu me hai. 4 hisse hain:

1. Panel par bot script deploy karna
2. `config.json` set karna
3. Vercel par ye repo deploy karna
4. Admin login + panel change karna

---

## 1) Panel par bot script deploy karna

Ye repo **bot script nahi** hai. Bot script aap apne **Pterodactyl panel** ya **VPS** par chalate hain.

**Zaroori:** panel ka web server public URL par accessible hona chahiye (HTTPS best hai), kyunki Vercel wahin se request bhejta hai.

### Pterodactyl steps

1. Server banao → **Egg: Node.js** (ya Generic Node)
2. Files upload karo (bot script ka poora folder)
3. Console me:
   ```bash
   npm install
   ```
4. **Startup** tab me environment variables daalo:

   | Variable | Value | Zaroori |
   |---|---|---|
   | `HOST` | `0.0.0.0` | ✅ |
   | `PORT` | `3000` (ya jo panel de) | ✅ |
   | `ADMIN_PASSWORD` | **32+ characters** ka password | ✅ |
   | `MAX_SESSIONS` | `10` | optional |
   | `CORS_ORIGIN` | `https://your-app.vercel.app` | optional |

   > ⚠️ `ADMIN_PASSWORD` **32 characters se kam** hua to admin login `503` dega.

5. Start command: `npm start` (ya `node backend/index.js`)
6. Panel URL note karo, e.g. `https://panel-abc.host.com`

### Test karo

Browser me kholo:
```
https://panel-abc.host.com/api/public-config
```
JSON aana chahiye: `{"freeMode":true,"community":{...}}`

Agar ye nahi khul raha to Vercel bhi kaam nahi karega — pehle panel theek karo.

---

## 2) `config.json` set karna

Repo me `config.json` kholo:

```json
{
  "panel_backend_url": "https://panel-abc.host.com",
  "api_secret": "change_me_to_a_long_random_string",
  "brand_name": "BILAL VIP BOT"
}
```

- `panel_backend_url` → **https://** ke saath, **aakhir me `/` nahi**
- `api_secret` → koi lamba random string (optional, but recommended)
- `brand_name` → jo naam dikhana hai

Commit + push kar do. Bas.

---

## 3) Vercel par deploy karna

1. [vercel.com/new](https://vercel.com/new) kholo
2. GitHub repo import karo: `1122bot/BILAL-VIP-WA-BUG-BOT-`
3. Settings me:

   | Setting | Value |
   |---|---|
   | Framework Preset | **Other** |
   | Root Directory | `./` |
   | Build Command | *(khaali chhoro — `vercel.json` me hai)* |
   | Output Directory | *(khaali chhoro — `vercel.json` me hai)* |

4. **Deploy** dabao

Deploy ke baad aapko domain milega:
```
https://bilal-vip-bot.vercel.app
```

### Test karo

| URL | Kya aana chahiye |
|---|---|
| `/` | Pairing page (naya dark design) |
| `/admin` | Admin login screen |
| `/api/health` | `{"status":true,...}` |
| `/api/public-config` | panel ka JSON |

Agar `/api/health` theek hai lekin `/api/public-config` fail ho raha hai → `panel_backend_url` ghalat hai ya panel down hai.

---

## 4) Admin login

### Password kahan se aata hai?

Admin ka password **koi fixed default nahi**. Wo seedha panel ke `ADMIN_PASSWORD` env variable se aata hai.

Agar panel par set hai:
```
ADMIN_PASSWORD=mera_bohat_lamba_password_123456789
```

To `/admin` par **yahi value** daalo.

### Login steps

1. `https://your-domain/admin` kholo
2. Password field me `ADMIN_PASSWORD` ki value paste karo
3. **Sign in** → dashboard khul jayega

### Dashboard me kya hai

- **Free Mode switch** — ON/OFF (public pairing open/close)
- **Access Keys** — naya key banao, rename, revoke
- **Connected Devices** — status dekho, disconnect karo
- **Activity Log** — kisne kya kiya

### Sub-users

Sub-users ko password **nahi** chahiye. Wo sirf `/` par jaate hain, number daalte hain, code lete hain.

---

## 5) Panel change karna (sabse important)

Jab bhi naya panel deploy karo:

1. GitHub par `config.json` kholo
2. `panel_backend_url` ko naye panel URL se badlo
3. Commit karo

**Bas itna hi.** Vercel domain wahi rahega, koi redeploy nahi chahiye.
Proxy har request par fresh config parhta hai (`no-store`), is liye change **turant** apply hota hai.

> Agar 1-2 minute tak purana URL dikhe to browser cache clear karo — server side par cache nahi hai.

---

## 6) Troubleshooting

| Problem | Wajah | Hal |
|---|---|---|
| `CONFIG_FETCH_FAILED` | GitHub se config nahi mila | Repo name / branch / `config.json` path check karo |
| `PANEL_UNREACHABLE` | Panel offline ya URL ghalat | `panel_backend_url` check karo, panel start karo |
| `PANEL_TIMEOUT` | Panel slow / band | Panel resources check karo |
| `FREE_MODE_OFF` | Free mode off hai | Admin panel se ON karo, ya access key do |
| `INVALID_PHONE` | Number chhota/lamba | Country code ke saath 8–15 digits |
| Admin login `503` | `ADMIN_PASSWORD` 32 se kam | 32+ characters ka password set karo |
| Admin login `401` | Password ghalat | Panel ka exact `ADMIN_PASSWORD` value daalo |
| Admin login `429` | 10 attempts/min | 1 minute ruk jao |
| Pairing `429` | 5 requests/min | 1 minute ruk jao |
| `/admin` 404 | Rewrite ka issue | `vercel.json` me `/admin` rewrite check karo |
| Page blank | Static files deploy nahi hui | Vercel me Output Directory = `public` confirm karo |

---

## 7) Security checklist

- [ ] `ADMIN_PASSWORD` **32+ characters**, random, sirf aapke paas
- [ ] `.env` kabhi GitHub par push na karo (`.gitignore` me hai)
- [ ] `config.json` me koi password na rakho (repo public ho sakta hai)
- [ ] Panel par `CORS_ORIGIN` set karo apne Vercel domain par
- [ ] Vercel project ko sirf zaroori logon ka access do
- [ ] Password change karne ke baad panel restart karo

---

## 8) Local testing (optional)

```bash
npm i -g vercel
vercel dev
```

Phir `http://localhost:3000` kholo. `vercel dev` `api/` functions bhi chalata hai, is liye proxy local par bhi test ho jayega.

---

Koi masla ho to panel ka `/api/public-config` pehle check karo — 90% issues wahin pata chal jaate hain.
