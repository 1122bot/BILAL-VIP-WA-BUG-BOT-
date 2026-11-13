const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");

const WEB_DIR = path.join(__dirname, "..", "frontend", "dist");
const SETTINGS_PATH = path.join(__dirname, "site-settings.json");
const DATA_PATH = path.join(__dirname, "website-data.json");
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};
const ADMIN_SESSION_TTL = 12 * 60 * 60 * 1000;
const USER_SESSION_TTL = 24 * 60 * 60 * 1000;
const GUEST_SESSION_TTL = 180 * 24 * 60 * 60 * 1000;
const TOKEN_PREFIX = "Bearer ";

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(payload));
}

function isLoopbackAddress(address = "") {
  return address === "::1"
    || address === "127.0.0.1"
    || address.startsWith("::ffff:127.");
}

function readFreeMode() {
  if (!fs.existsSync(SETTINGS_PATH)) return true;

  const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
  if (typeof settings.freeMode !== "boolean") {
    throw new Error("backend/site-settings.json must contain a boolean freeMode value.");
  }
  return settings.freeMode;
}

function loadWebsiteData() {
  if (!fs.existsSync(DATA_PATH)) {
    return { keys: [], guestTokens: [], phoneOwners: {}, logs: [] };
  }
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  if (!Array.isArray(data.keys) || !Array.isArray(data.guestTokens)
    || !data.phoneOwners || typeof data.phoneOwners !== "object"
    || !Array.isArray(data.logs)) {
    throw new Error("backend/website-data.json has an invalid format.");
  }
  return data;
}

function writeJsonFile(filePath, data) {
  const temporaryPath = `${filePath}.tmp`;
  const contents = JSON.stringify(data, null, 2);
  fs.writeFileSync(temporaryPath, contents, { mode: 0o600 });
  try {
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    if (process.platform !== "win32" || !["EPERM", "EACCES", "EEXIST", "ENOTEMPTY"].includes(error.code)) {
      if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
      throw error;
    }
    fs.writeFileSync(filePath, contents, { mode: 0o600 });
    fs.unlinkSync(temporaryPath);
  }
}

async function readJsonBody(request, maxBytes = 4096) {
  const chunks = [];
  let bytesRead = 0;
  for await (const chunk of request) {
    bytesRead += Buffer.byteLength(chunk);
    if (bytesRead > maxBytes) {
      throw Object.assign(new Error("Request is too large."), { statusCode: 413 });
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("Request JSON is invalid."), { statusCode: 400 });
  }
}

function startWebServer({ pairNumber, removeSession, getMessageLogs, getSessions }) {
  const host = process.env.HOST || "0.0.0.0";
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port.");
  }

  const allowedOrigins = new Set(
    (process.env.CORS_ORIGIN || "")
      .split(",")
      .map(origin => origin.trim())
      .filter(Boolean)
  );
  const maxSessions = Number(process.env.MAX_SESSIONS || 10);
  if (!Number.isInteger(maxSessions) || maxSessions < 1 || maxSessions > 100) {
    throw new Error("MAX_SESSIONS must be an integer from 1 to 100.");
  }
  const adminSecret = process.env.ADMIN_PASSWORD || process.env.FREE_MODE_ADMIN_SECRET || "";
  let freeMode = readFreeMode();
  const data = loadWebsiteData();
  const community = {
    telegramChannel: process.env.TELEGRAM_CHANNEL_URL || "https://t.me/bilal_king_vip",
    telegramUsername: process.env.TELEGRAM_USERNAME || "bilal_babar_982",
    whatsappChannel: process.env.WHATSAPP_CHANNEL_URL || "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
    whatsappGroup: process.env.WHATSAPP_GROUP_URL || "",
    ownerContact: process.env.OWNER_CONTACT_URL || "https://wa.me/923078071982",
  };

  const pairingLocks = new Set();
  const pairingRequests = new Map();
  const loginAttempts = new Map();
  const userSessions = new Map();
  const adminSessions = new Map();

  const persistData = () => writeJsonFile(DATA_PATH, data);
  const logEvent = (action, details = {}) => {
    data.logs.unshift({
      id: crypto.randomUUID(),
      action,
      details,
      createdAt: new Date().toISOString(),
    });
    data.logs.length = Math.min(data.logs.length, 1000);
    persistData();
  };
  const getBearerToken = request => {
    const authorization = request.headers.authorization || "";
    return authorization.startsWith(TOKEN_PREFIX) ? authorization.slice(TOKEN_PREFIX.length) : "";
  };
  const tokenHash = token => crypto.createHash("sha256").update(token).digest("hex");
  const findKey = keyId => data.keys.find(key => key.id === keyId && !key.revokedAt);
  const getAuth = request => {
    const token = getBearerToken(request);
    if (!token) return null;
    const hash = tokenHash(token);
    const now = Date.now();
    const adminSession = adminSessions.get(hash);
    if (adminSession) {
      if (adminSession.expiresAt > now) return { type: "admin", hash };
      adminSessions.delete(hash);
    }
    const userSession = userSessions.get(hash);
    if (userSession) {
      if (userSession.expiresAt > now && findKey(userSession.keyId)) {
        return { type: "user", keyId: userSession.keyId, principal: `key:${userSession.keyId}`, hash };
      }
      userSessions.delete(hash);
    }
    const guest = data.guestTokens.find(item => item.hash === hash && item.expiresAt > now);
    if (guest && freeMode) return { type: "guest", principal: `guest:${hash}`, hash };
    return null;
  };
  const countOwnedSessions = keyId => Object.values(data.phoneOwners).filter(owner => owner === `key:${keyId}`).length;
  const createSessionToken = (sessionMap, sessionData, ttl) => {
    const token = crypto.randomBytes(32).toString("base64url");
    sessionMap.set(tokenHash(token), { ...sessionData, expiresAt: Date.now() + ttl });
    return token;
  };
  const requireAdmin = (request, response) => {
    const auth = getAuth(request);
    if (auth?.type === "admin") return auth;
    sendJson(response, 401, { error: "Admin login is required." });
    return null;
  };
  const readBodyOrRespond = async (request, response) => {
    try {
      return await readJsonBody(request);
    } catch (error) {
      sendJson(response, error.statusCode || 400, { error: error.message || "Request could not be read." });
      return null;
    }
  };
  const handleLoginRateLimit = (request, response) => {
    const ip = request.socket.remoteAddress || "unknown";
    const now = Date.now();
    const attempts = (loginAttempts.get(ip) || []).filter(time => now - time < 60_000);
    if (attempts.length >= 10) {
      sendJson(response, 429, { error: "Too many login attempts. Please try again in one minute." });
      return false;
    }
    loginAttempts.set(ip, [...attempts, now]);
    return true;
  };

  const server = http.createServer(async (request, response) => {
    let requestUrl;
    try {
      requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    } catch {
      sendJson(response, 400, { error: "URL request is invalid." });
      return;
    }
    const origin = request.headers.origin;
    let sameOrigin = false;
    if (origin) {
      try {
        sameOrigin = new URL(origin).host === request.headers.host;
      } catch {
        sendJson(response, 403, { error: "Origin is invalid." });
        return;
      }
    }
    if (origin && !sameOrigin && !allowedOrigins.has(origin)) {
      sendJson(response, 403, { error: "Origin is not allowed." });
      return;
    }
    if (origin) {
      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Vary", "Origin");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    }
    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    if (requestUrl.pathname.startsWith("/api/")) {
      if (request.method === "GET" && requestUrl.pathname === "/api/public-config") {
        sendJson(response, 200, { freeMode, community });
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/api/auth/guest") {
        if (!freeMode) {
          sendJson(response, 403, { error: "Free Mode is off. Sign in with an access key to continue." });
          return;
        }
        if (!handleLoginRateLimit(request, response)) return;
        const token = crypto.randomBytes(32).toString("base64url");
        const now = Date.now();
        data.guestTokens = data.guestTokens.filter(item => item.expiresAt > now);
        data.guestTokens.push({
          hash: tokenHash(token),
          createdAt: new Date().toISOString(),
          expiresAt: now + GUEST_SESSION_TTL,
        });
        try {
          persistData();
        } catch (error) {
          data.guestTokens.pop();
          console.error("Failed to create a guest session:", error);
          sendJson(response, 500, { error: "Failed to start a guest session." });
          return;
        }
        sendJson(response, 200, { token, expiresAt: now + GUEST_SESSION_TTL });
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/api/auth/login") {
        if (!handleLoginRateLimit(request, response)) return;
        const parsed = await readBodyOrRespond(request, response);
        if (!parsed) return;
        const keyValue = typeof parsed.key === "string" ? parsed.key.trim() : "";
        const hash = tokenHash(keyValue);
        const key = data.keys.find(item => item.hash === hash && !item.revokedAt);
        if (!key) {
          sendJson(response, 401, { error: "Invalid or revoked access key." });
          return;
        }
        key.lastUsedAt = new Date().toISOString();
        const token = createSessionToken(userSessions, { keyId: key.id }, USER_SESSION_TTL);
        try {
          persistData();
        } catch (error) {
          console.error("Failed to record key login:", error);
          sendJson(response, 500, { error: "Failed to complete login." });
          return;
        }
        sendJson(response, 200, { token, expiresAt: Date.now() + USER_SESSION_TTL });
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/api/auth/admin-login") {
        if (!handleLoginRateLimit(request, response)) return;
        if (adminSecret.length < 32) {
          sendJson(response, 503, { error: "Admin login is unavailable. Configure ADMIN_PASSWORD with at least 32 characters." });
          return;
        }
        const parsed = await readBodyOrRespond(request, response);
        if (!parsed) return;
        const secret = Buffer.from(typeof parsed.secret === "string" ? parsed.secret : "");
        const expected = Buffer.from(adminSecret);
        if (secret.length !== expected.length || !crypto.timingSafeEqual(secret, expected)) {
          sendJson(response, 401, { error: "Invalid admin credentials." });
          return;
        }
        loginAttempts.delete(request.socket.remoteAddress || "unknown");
        const token = createSessionToken(adminSessions, {}, ADMIN_SESSION_TTL);
        try {
          logEvent("admin.login");
        } catch (error) {
          adminSessions.delete(tokenHash(token));
          console.error("Failed to record admin login:", error);
          sendJson(response, 500, { error: "Failed to complete admin login." });
          return;
        }
        sendJson(response, 200, { token, expiresAt: Date.now() + ADMIN_SESSION_TTL });
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/api/auth/logout") {
        const auth = getAuth(request);
        if (!auth) {
          sendJson(response, 401, { error: "Your session has expired. Please sign in again." });
          return;
        }
        if (auth.type === "admin") adminSessions.delete(auth.hash);
        else if (auth.type === "user") userSessions.delete(auth.hash);
        else if (auth.type === "guest") {
          const index = data.guestTokens.findIndex(item => item.hash === auth.hash);
          if (index >= 0) {
            const [guest] = data.guestTokens.splice(index, 1);
            try {
              persistData();
            } catch (error) {
              data.guestTokens.splice(index, 0, guest);
              console.error("Failed to revoke the guest session:", error);
              sendJson(response, 500, { error: "Failed to sign out." });
              return;
            }
          }
        }
        sendJson(response, 200, { ok: true });
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/api/admin/free-mode") {
        if (!requireAdmin(request, response)) return;
        const parsed = await readBodyOrRespond(request, response);
        if (!parsed) return;
        if (typeof parsed.enabled !== "boolean") {
          sendJson(response, 400, { error: "The enabled field must be a boolean." });
          return;
        }
        try {
          writeJsonFile(SETTINGS_PATH, { freeMode: parsed.enabled });
          freeMode = parsed.enabled;
          logEvent("admin.free_mode_changed", { enabled: freeMode });
          sendJson(response, 200, { freeMode });
        } catch (error) {
          console.error("Failed to save Free Mode setting:", error);
          sendJson(response, 500, { error: "Failed to save Free Mode setting." });
        }
        return;
      }

      if (request.method === "GET" && requestUrl.pathname === "/api/admin/overview") {
        if (!requireAdmin(request, response)) return;
        const keys = data.keys.map(key => ({
          id: key.id,
          label: key.label,
          createdAt: key.createdAt,
          lastUsedAt: key.lastUsedAt || null,
          revokedAt: key.revokedAt || null,
          activeNumbers: countOwnedSessions(key.id),
        }));
        const sessions = getSessions().filter(session => session.number).map(session => {
          const owner = data.phoneOwners[session.number] || null;
          const keyId = owner?.startsWith("key:") ? owner.slice(4) : null;
          const key = keyId ? data.keys.find(item => item.id === keyId) : null;
          return { ...session, ownerLabel: owner?.startsWith("guest:") ? "Free Mode guest" : key?.label || "Unassigned" };
        });
        const activeGuestSessions = data.guestTokens.filter(item => item.expiresAt > Date.now()).length;
        sendJson(response, 200, {
          freeMode,
          keys,
          sessions,
          activeGuestSessions,
          logs: data.logs.slice(0, 500),
        });
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/api/admin/keys") {
        if (!requireAdmin(request, response)) return;
        const parsed = await readBodyOrRespond(request, response);
        if (!parsed) return;
        const label = typeof parsed.label === "string" ? parsed.label.trim().slice(0, 80) : "";
        if (!label) {
          sendJson(response, 400, { error: "Enter a label for this access key." });
          return;
        }
        const keyValue = `wabot_${crypto.randomBytes(32).toString("base64url")}`;
        const key = {
          id: crypto.randomUUID(),
          hash: tokenHash(keyValue),
          label,
          createdAt: new Date().toISOString(),
          lastUsedAt: null,
          revokedAt: null,
        };
        data.keys.push(key);
        try {
          logEvent("admin.key_created", { keyId: key.id, label });
        } catch (error) {
          data.keys.pop();
          console.error("Failed to save the access key:", error);
          sendJson(response, 500, { error: "Failed to create the access key." });
          return;
        }
        sendJson(response, 201, { key: keyValue, id: key.id, label, createdAt: key.createdAt });
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/api/admin/keys/rename") {
        if (!requireAdmin(request, response)) return;
        const parsed = await readBodyOrRespond(request, response);
        if (!parsed) return;
        const label = typeof parsed.label === "string" ? parsed.label.trim().slice(0, 80) : "";
        if (!label) {
          sendJson(response, 400, { error: "Enter a label for this access key." });
          return;
        }
        const key = data.keys.find(item => item.id === parsed.keyId);
        if (!key) {
          sendJson(response, 404, { error: "Access key not found." });
          return;
        }
        const previousLabel = key.label;
        key.label = label;
        try {
          logEvent("admin.key_renamed", { keyId: key.id, previousLabel, label });
        } catch (error) {
          key.label = previousLabel;
          console.error("Failed to rename the access key:", error);
          sendJson(response, 500, { error: "Failed to rename the access key." });
          return;
        }
        sendJson(response, 200, { ok: true, label });
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/api/admin/keys/revoke") {
        if (!requireAdmin(request, response)) return;
        const parsed = await readBodyOrRespond(request, response);
        if (!parsed) return;
        const key = data.keys.find(item => item.id === parsed.keyId && !item.revokedAt);
        if (!key) {
          sendJson(response, 404, { error: "Active access key not found." });
          return;
        }
        key.revokedAt = new Date().toISOString();
        try {
          logEvent("admin.key_revoked", { keyId: key.id, label: key.label });
        } catch (error) {
          delete key.revokedAt;
          console.error("Failed to revoke the access key:", error);
          sendJson(response, 500, { error: "Failed to revoke the access key." });
          return;
        }
        sendJson(response, 200, { ok: true });
        return;
      }

      if (request.method === "GET" && requestUrl.pathname === "/api/admin/logs") {
        if (!requireAdmin(request, response)) return;
        sendJson(response, 200, { logs: data.logs.slice(0, 500) });
        return;
      }

      const messageLogMatch = requestUrl.pathname.match(/^\/api\/admin\/sessions\/(\d+)\/messages$/);
      if (request.method === "GET" && messageLogMatch) {
        if (!requireAdmin(request, response)) return;
        const number = messageLogMatch[1];
        if (!/^\d{8,15}$/.test(number)) {
          sendJson(response, 400, { error: "Select a valid WhatsApp number." });
          return;
        }
        const requestedLimit = Number(requestUrl.searchParams.get("limit") || 100);
        const limit = Number.isInteger(requestedLimit) ? Math.min(200, Math.max(1, requestedLimit)) : 100;
        if (typeof getMessageLogs !== "function") {
          sendJson(response, 503, { error: "WhatsApp message logs are unavailable in this server configuration." });
          return;
        }
        sendJson(response, 200, {
          number,
          logs: getMessageLogs(number, limit),
          limit,
        });
        return;
      }

      if (request.method === "POST" && requestUrl.pathname === "/api/admin/sessions/remove") {
        if (!requireAdmin(request, response)) return;
        const parsed = await readBodyOrRespond(request, response);
        if (!parsed) return;
        const number = typeof parsed.number === "string" ? parsed.number.replace(/\D/g, "") : "";
        if (!/^\d{8,15}$/.test(number)) {
          sendJson(response, 400, { error: "Select a valid WhatsApp number." });
          return;
        }
        if (pairingLocks.has(number)) {
          sendJson(response, 409, { error: "A pairing request for this number is still in progress." });
          return;
        }
        const sessionExists = getSessions().some(session => session.number === number);
        const hasOwner = Object.hasOwn(data.phoneOwners, number);
        if (!sessionExists && !hasOwner) {
          sendJson(response, 404, { error: "WhatsApp session not found." });
          return;
        }
        if (typeof removeSession !== "function") {
          sendJson(response, 503, { error: "Session removal is unavailable in this server configuration." });
          return;
        }
        try {
          await removeSession(number);
        } catch (error) {
          console.error(`Failed to disconnect WhatsApp session ${number}:`, error);
          const statusCode = error.statusCode === 409 ? 409 : 500;
          sendJson(response, statusCode, {
            error: statusCode === 409
              ? error.message
              : "Could not safely disconnect this WhatsApp session.",
          });
          return;
        }
        const previousOwner = data.phoneOwners[number];
        delete data.phoneOwners[number];
        try {
          logEvent("admin.session_removed", { number });
        } catch (error) {
          if (previousOwner) data.phoneOwners[number] = previousOwner;
          console.error(`WhatsApp session ${number} was disconnected, but its ownership record could not be saved:`, error);
          sendJson(response, 500, { error: "The WhatsApp session was disconnected, but its ownership record could not be saved." });
          return;
        }
        sendJson(response, 200, { ok: true, number });
        return;
      }

      const isPairRequest = request.method === "POST" && requestUrl.pathname === "/api/pair";
      const isSessionsRequest = request.method === "GET" && requestUrl.pathname === "/api/sessions";
      if (isPairRequest || isSessionsRequest) {
        if (!freeMode && !isSessionsRequest && !isPairRequest) {
          sendJson(response, 403, { error: "Free Mode is off. Sign in with an access key to continue." });
          return;
        }
        const auth = getAuth(request);
        const validUser = auth?.type === "user" && findKey(auth.keyId);
        const validGuest = freeMode && auth?.type === "guest";
        if (!validUser && !validGuest) {
          sendJson(response, 401, {
            error: freeMode
              ? "Start a guest session or sign in with an access key."
              : "Sign in with an access key to continue.",
          });
          return;
        }
        if (isSessionsRequest) {
          const sessions = getSessions().filter(session =>
            session.number && data.phoneOwners[session.number] === auth.principal
          );
          sendJson(response, 200, { sessions });
          return;
        }

        const clientIp = request.socket.remoteAddress || "unknown";
        const now = Date.now();
        const recentRequests = (pairingRequests.get(clientIp) || []).filter(time => now - time < 60_000);
        if (recentRequests.length >= 5) {
          sendJson(response, 429, { error: "Too many requests. Please try again in one minute." });
          return;
        }
        const parsed = await readBodyOrRespond(request, response);
        if (!parsed) return;
        const number = typeof parsed.phoneNumber === "string" ? parsed.phoneNumber.replace(/\D/g, "") : "";
        if (!/^\d{8,15}$/.test(number)) {
          sendJson(response, 400, { error: "Enter a WhatsApp number with country code, 8-15 digits." });
          return;
        }
        if (pairingLocks.has(number)) {
          sendJson(response, 409, { error: "A pairing request for this number is currently in progress." });
          return;
        }
        const currentOwner = data.phoneOwners[number];
        if (currentOwner && currentOwner !== auth.principal) {
          sendJson(response, 409, { error: "This number is already assigned to another account." });
          return;
        }
        const sessions = getSessions();
        const existing = sessions.find(session => session.number === number);
        if (existing && ["connected", "connecting"].includes(existing.status)) {
          sendJson(response, 409, { error: "This number is already connected or is currently connecting." });
          return;
        }
        const knownNumbers = new Set(sessions.map(session => session.number).filter(Boolean));
        if (!knownNumbers.has(number) && knownNumbers.size >= maxSessions) {
          sendJson(response, 409, { error: `The maximum limit of ${maxSessions} numbers has been reached.` });
          return;
        }

        pairingLocks.add(number);
        pairingRequests.set(clientIp, [...recentRequests, now]);
        try {
          const pairingCode = await pairNumber(number);
          data.phoneOwners[number] = auth.principal;
          const keyId = auth.type === "user" ? auth.keyId : null;
          if (keyId) {
            const key = findKey(keyId);
            if (key) key.lastUsedAt = new Date().toISOString();
          }
          logEvent("pairing.requested", { number, owner: auth.type === "user" ? keyId : "guest" });
          sendJson(response, 200, { number, pairingCode });
        } catch (error) {
          console.error(`Pairing request failed for ${number}:`, error);
          sendJson(response, 502, { error: error.message || "The pairing code could not be generated." });
        } finally {
          pairingLocks.delete(number);
        }
        return;
      }

      if (requestUrl.pathname.startsWith("/api/admin/")) {
        sendJson(response, 404, { error: "Admin API endpoint not found." });
        return;
      }
      sendJson(response, 404, { error: "API endpoint not found." });
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { error: "Method is not allowed." });
      return;
    }
    let relativePath;
    try {
      relativePath = requestUrl.pathname === "/"
        ? "index.html"
        : requestUrl.pathname === "/admin" || requestUrl.pathname === "/admin/"
          ? "admin.html"
          : decodeURIComponent(requestUrl.pathname.slice(1));
    } catch {
      sendJson(response, 400, { error: "Path is invalid." });
      return;
    }
    const filePath = path.resolve(WEB_DIR, relativePath);
    if (filePath !== WEB_DIR && !filePath.startsWith(`${WEB_DIR}${path.sep}`)) {
      sendJson(response, 403, { error: "Path is not allowed." });
      return;
    }
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      sendJson(response, 404, { error: "File not found." });
      return;
    }
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; img-src 'self' data:; connect-src 'self' https: http:",
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    fs.createReadStream(filePath).pipe(response);
  });

  server.on("error", error => {
    console.error("Web server failed:", error);
  });
  server.listen(port, host, () => {
    const localHost = host === "0.0.0.0" || host === "::" ? "localhost" : host;
    const localUrl = `http://${localHost}:${port}`;
    console.log(`WA BOT web running at ${localUrl}`);
    if (localHost === "localhost" && host !== "localhost" && host !== "127.0.0.1") {
      console.log(`Server is listening on all network interfaces (HOST=${host}).`);
    }
    const shouldOpenBrowser = process.env.OPEN_BROWSER === "true"
      || (process.env.OPEN_BROWSER !== "false" && process.platform === "win32" && Boolean(process.stdin.isTTY));
    if (!shouldOpenBrowser) return;
    const opener = process.platform === "win32" ? "cmd.exe" : process.platform === "darwin" ? "open" : "xdg-open";
    const args = process.platform === "win32" ? ["/c", "start", "", localUrl] : [localUrl];
    const browser = spawn(opener, args, { detached: true, stdio: "ignore" });
    browser.once("error", error => {
      console.error(`Could not open the local dashboard automatically: ${error.message}`);
    });
    browser.unref();
  });
  return server;
}

module.exports = { startWebServer };
