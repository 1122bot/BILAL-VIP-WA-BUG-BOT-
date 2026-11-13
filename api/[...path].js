/**
 * =====================================================================
 *  BILAL VIP BOT — Transparent API Proxy  (api/[...path].js)
 * =====================================================================
 *  Ye aap ke existing frontend ke SAARE /api/* calls (public-config,
 *  auth/guest, auth/login, auth/admin-login, sessions, admin/*) ko
 *  current active panel par forward karta hai.
 *
 *  Isliye Vercel domain permanent rehta hai: frontend same-origin calls
 *  karta hai, aur ye function unhe panel tak pahuncha deta hai.
 *
 *  User ka Authorization header as-is forward hota hai, is liye guest /
 *  access-key / admin login sab pehle ki tarah kaam karte hain.
 * =====================================================================
 */

const GITHUB_OWNER = process.env.GITHUB_OWNER || '1122bot';
const GITHUB_REPO = process.env.GITHUB_REPO || 'BILAL-VIP-WA-BUG-BOT-';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const CONFIG_PATH = process.env.CONFIG_PATH || 'config.json';

const CONFIG_URL =
  process.env.CONFIG_URL ||
  `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${CONFIG_PATH}`;

const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'proxy-authorization',
  'proxy-authenticate',
  'te',
  'trailer',
  'content-length',
  'accept-encoding',
  // origin/referer strip: panel ka CORS same-origin check fail na ho
  'origin',
  'referer',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-real-ip',
  'x-vercel-id',
  'x-vercel-forwarded-for',
]);

async function loadConfig() {
  const response = await fetch(`${CONFIG_URL}?t=${Date.now()}`, {
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`config.json fetch failed (HTTP ${response.status})`);
  const config = JSON.parse(await response.text());
  if (!config || !config.panel_backend_url) {
    throw new Error('config.json mein panel_backend_url missing hai');
  }
  return config;
}

async function readRawBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === 'string') return req.body;
    return JSON.stringify(req.body);
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

  // Health check (rewrite na ho to bhi kaam kare)
  if (String(req.url).split('?')[0] === '/api/health') {
    res.status(200);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(
      JSON.stringify({
        status: true,
        service: 'BILAL VIP BOT API Proxy',
        config_url: CONFIG_URL,
        time: new Date().toISOString(),
      })
    );
  }

  let config;
  try {
    config = await loadConfig();
  } catch (err) {
    res.status(502);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(
      JSON.stringify({
        status: false,
        error: 'CONFIG_FETCH_FAILED',
        message: 'GitHub se config.json nahi mila. Repo / branch / path check karein.',
        detail: err.message,
      })
    );
  }

  const backend = String(config.panel_backend_url).replace(/\/+$/, '');
  const targetUrl = `${backend}${req.url}`;

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (HOP_BY_HOP.has(key.toLowerCase())) continue;
    headers[key] = Array.isArray(value) ? value.join(', ') : value;
  }
  // Panel-side service identification (future use / logging)
  if (config.api_secret) headers['x-api-secret'] = config.api_secret;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await readRawBody(req);

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
      signal: controller.signal,
    });

    const buffer = Buffer.from(await upstream.arrayBuffer());

    res.status(upstream.status);
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    res.setHeader('X-Panel-Backend', backend);
    res.end(buffer);
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    res.status(502);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        status: false,
        error: isTimeout ? 'PANEL_TIMEOUT' : 'PANEL_UNREACHABLE',
        message: isTimeout
          ? 'Panel ne time par jawab nahi diya.'
          : 'Active panel offline hai ya URL ghalat hai. config.json update karein.',
        detail: err.message,
      })
    );
  } finally {
    clearTimeout(timer);
  }
};
