/**
 * =====================================================================
 *  BILAL VIP BOT — Vercel Pairing Proxy  (api/pair.js)
 * =====================================================================
 *  Har request par GitHub ki raw config.json (no-cache) fetch karta hai,
 *  current active panel ka URL nikalta hai, aur us panel ke existing
 *  /api/pair endpoint se 8-character pairing code wapas laata hai.
 *
 *  Panel badalna ho? Sirf config.json update karein — Vercel same rahega.
 *
 *  Flow:
 *    1. GitHub raw config.json  ->  panel_backend_url + api_secret
 *    2. POST <panel>/api/auth/guest   (free mode ON ho to guest token)
 *    3. POST <panel>/api/pair         (Bearer guest token + phoneNumber)
 *    4. { status: true, code: "ABCD-1EFG" }  wapas
 * =====================================================================
 */

/* ------------------------- config source ------------------------- */
const GITHUB_OWNER = process.env.GITHUB_OWNER || '1122bot';
const GITHUB_REPO = process.env.GITHUB_REPO || 'BILAL-VIP-WA-BUG-BOT-';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const CONFIG_PATH = process.env.CONFIG_PATH || 'config.json';

// CONFIG_URL env se poora URL override ho sakta hai (fork / testing ke liye)
const CONFIG_URL =
  process.env.CONFIG_URL ||
  `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${CONFIG_PATH}`;

/* --------------------------- helpers ----------------------------- */
function setNoCache(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

function json(res, status, payload) {
  setNoCache(res);
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(payload));
}

function normalizePhone(input) {
  if (!input) return null;
  const digits = String(input).replace(/[^\d]/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

async function loadConfig() {
  const response = await fetch(`${CONFIG_URL}?t=${Date.now()}`, {
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      'User-Agent': 'BILAL-VIP-BOT-Pairing/1.0',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`config.json fetch failed (HTTP ${response.status})`);
  }

  const text = await response.text();
  let config;
  try {
    config = JSON.parse(text);
  } catch (_) {
    throw new Error('config.json valid JSON nahi hai');
  }

  if (!config || typeof config !== 'object') throw new Error('config.json empty hai');
  if (!config.panel_backend_url) throw new Error('config.json mein panel_backend_url missing hai');

  return config;
}

async function panelRequest(url, options = {}, timeoutMs = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/* --------------------------- handler ----------------------------- */
module.exports = async function handler(req, res) {
  setNoCache(res);

  if (req.method === 'OPTIONS') return res.status(204).end();

  // Health check: /api/health  ya  /api/pair?health=1
  if (req.query.health || String(req.url).includes('/api/health')) {
    return json(res, 200, {
      status: true,
      service: 'BILAL VIP BOT Pairing Proxy',
      config_url: CONFIG_URL,
      time: new Date().toISOString(),
    });
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return json(res, 405, {
      status: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Sirf GET ya POST allowed hai.',
    });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const rawPhone = body.phone || body.phoneNumber || req.query.phone;
  const phone = normalizePhone(rawPhone);

  if (!phone) {
    return json(res, 400, {
      status: false,
      error: 'INVALID_PHONE',
      message: 'Sahi phone number dein, country code ke sath (8-15 digits).',
    });
  }

  /* ---------------- 1) fresh config from GitHub ---------------- */
  let config;
  try {
    config = await loadConfig();
  } catch (err) {
    return json(res, 502, {
      status: false,
      error: 'CONFIG_FETCH_FAILED',
      message: 'GitHub se config.json nahi mila. Repo / branch / path check karein.',
      detail: err.message,
    });
  }

  const backend = String(config.panel_backend_url).replace(/\/+$/, '');

  try {
    /* ---------------- 2) guest session (free mode gate) ---------------- */
    const guestResponse = await panelRequest(`${backend}/api/auth/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BILAL-VIP-BOT-Pairing/1.0',
      },
      body: '{}',
    });

    const guest = await guestResponse.json().catch(() => ({}));

    if (!guestResponse.ok) {
      return json(res, guestResponse.status, {
        status: false,
        error: guestResponse.status === 403 ? 'FREE_MODE_OFF' : 'PANEL_ERROR',
        message:
          guest.error ||
          (guestResponse.status === 403
            ? 'Free mode filhal band hai. Admin se premium access lein.'
            : 'Panel ne request reject kar di.'),
      });
    }

    if (!guest.token) {
      return json(res, 502, {
        status: false,
        error: 'PANEL_ERROR',
        message: 'Panel se guest token nahi mila.',
      });
    }

    /* ---------------- 3) pairing code ---------------- */
    const pairResponse = await panelRequest(`${backend}/api/pair`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${guest.token}`,
        'User-Agent': 'BILAL-VIP-BOT-Pairing/1.0',
      },
      body: JSON.stringify({ phoneNumber: phone }),
    });

    const data = await pairResponse.json().catch(() => ({}));

    if (!pairResponse.ok || !data.pairingCode) {
      return json(res, pairResponse.status >= 400 ? pairResponse.status : 502, {
        status: false,
        error: data.error || 'PAIRING_FAILED',
        message: data.error || 'Pairing code generate nahi ho saka. Dobara try karein.',
      });
    }

    return json(res, 200, {
      status: true,
      phone: data.number || phone,
      code: data.pairingCode,
      pairingCode: data.pairingCode,
      brand: config.brand_name || 'BILAL VIP BOT',
      panel: backend,
    });
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return json(res, 502, {
      status: false,
      error: isTimeout ? 'PANEL_TIMEOUT' : 'PANEL_UNREACHABLE',
      message: isTimeout
        ? 'Panel ne time par jawab nahi diya. Panel running hai ya nahi check karein.'
        : 'Active panel offline hai ya URL ghalat hai. config.json mein panel_backend_url update karein.',
      detail: err.message,
    });
  }
};
