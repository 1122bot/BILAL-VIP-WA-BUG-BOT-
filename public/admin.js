/* =====================================================================
   BILAL VIP BOT — Admin panel logic
   ===================================================================== */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const TOKEN_KEY = "bilal_admin_token";

  const authWrap   = $("authWrap");
  const dash       = $("dash");
  const loginForm  = $("loginForm");
  const loginBtn   = $("loginBtn");
  const loginBtnLbl= $("loginBtnLabel");
  const pwInput    = $("pwInput");
  const pwShell    = $("pwShell");
  const pwToggle   = $("pwToggle");
  const loginAlert = $("loginAlert");

  const fmSwitch   = $("fmSwitch");
  const fmTitle    = $("fmTitle");
  const fmDesc     = $("fmDesc");

  const keysBody   = $("keysBody");
  const keyForm    = $("keyForm");
  const keyLabel   = $("keyLabel");

  const sessionsBody   = $("sessionsBody");
  const sessionSearch  = $("sessionSearch");
  const sessionFilter  = $("sessionFilter");

  const logList   = $("logList");
  const logSearch = $("logSearch");

  const toastWrap = $("toastWrap");

  let token = sessionStorage.getItem(TOKEN_KEY) || "";
  let state = { freeMode: false, keys: [], sessions: [], activeGuestSessions: 0, logs: [] };
  let refreshTimer = null;
  let freeModeBusy = false;

  /* ------------------------------- icons ------------------------------ */
  const ICON_OK  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  const ICON_ERR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>';
  const ICON_WARN= '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17.5v.01"/><path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>';
  const ICON_EMPTY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 4v16"/></svg>';

  /* ------------------------------- utils ------------------------------ */
  function toast(message, type) {
    const el = document.createElement("div");
    el.className = "toast toast--" + (type === "error" ? "error" : "ok");
    el.innerHTML = (type === "error" ? ICON_ERR : ICON_OK) + "<span></span>";
    el.querySelector("span").textContent = message;
    toastWrap.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-out");
      setTimeout(() => el.remove(), 260);
    }, 2800);
  }

  function alertBox(container, message, type) {
    container.innerHTML = "";
    if (!message) return;
    const el = document.createElement("div");
    el.className = "alert alert--" + (type || "error");
    el.innerHTML = ICON_WARN + "<span></span>";
    el.querySelector("span").textContent = message;
    container.appendChild(el);
  }

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }

  function timeAgo(iso) {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    if (isNaN(diff)) return "—";
    const s = Math.floor(diff / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    const d = Math.floor(h / 24);
    return d + "d ago";
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (_) {
      return false;
    }
  }

  /* -------------------------------- api ------------------------------- */
  async function api(path, options) {
    const opts = options || {};
    const headers = Object.assign(
      { Accept: "application/json" },
      opts.body ? { "Content-Type": "application/json" } : {},
      token ? { Authorization: "Bearer " + token } : {},
      opts.headers || {}
    );

    const res = await fetch(path, {
      method: opts.method || (opts.body ? "POST" : "GET"),
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    let data = {};
    try { data = await res.json(); } catch (_) { data = {}; }

    if (res.status === 401 && token) {
      signOut(true);
      throw new Error("Session expired. Please sign in again.");
    }

    if (!res.ok) {
      const err = new Error(data.error || "Request failed (HTTP " + res.status + ")");
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  /* ------------------------------- auth ------------------------------- */
  function showLogin() {
    authWrap.classList.remove("is-hidden");
    dash.classList.remove("is-active");
  }

  function showDash() {
    authWrap.classList.add("is-hidden");
    dash.classList.add("is-active");
  }

  function signOut(silent) {
    token = "";
    sessionStorage.removeItem(TOKEN_KEY);
    if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
    showLogin();
    if (!silent) toast("Signed out", "ok");
  }

  pwToggle.addEventListener("click", () => {
    const isPw = pwInput.type === "password";
    pwInput.type = isPw ? "text" : "password";
    pwToggle.setAttribute("aria-label", isPw ? "Hide password" : "Show password");
    pwToggle.style.color = isPw ? "#00e5a0" : "";
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox(loginAlert, "");
    pwShell.classList.remove("is-invalid");

    const secret = pwInput.value;
    if (secret.length < 8) {
      pwShell.classList.add("is-invalid");
      alertBox(loginAlert, "Enter your admin password.", "error");
      pwInput.focus();
      return;
    }

    loginBtn.disabled = true;
    loginBtnLbl.innerHTML = '<span class="spinner"></span>';

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.token) {
        const msg =
          res.status === 503
            ? "Admin login is disabled. Set ADMIN_PASSWORD (32+ characters) on the panel."
            : res.status === 429
            ? "Too many attempts. Wait a minute and try again."
            : data.error || "Incorrect password.";
        alertBox(loginAlert, msg, "error");
        pwShell.classList.add("is-invalid");
        return;
      }

      token = data.token;
      sessionStorage.setItem(TOKEN_KEY, token);
      pwInput.value = "";
      showDash();
      toast("Welcome back, owner", "ok");
      await load();
      startAutoRefresh();
    } catch (err) {
      alertBox(loginAlert, "Network error — could not reach the panel.", "error");
    } finally {
      loginBtn.disabled = false;
      loginBtnLbl.textContent = "Sign in";
    }
  });

  $("logoutBtn").addEventListener("click", () => signOut(false));
  $("refreshBtn").addEventListener("click", () => load(true));

  /* ------------------------------- load ------------------------------- */
  async function load(manual) {
    try {
      const data = await api("/api/admin/overview");
      state = {
        freeMode: !!data.freeMode,
        keys: Array.isArray(data.keys) ? data.keys : [],
        sessions: Array.isArray(data.sessions) ? data.sessions : [],
        activeGuestSessions: data.activeGuestSessions || 0,
        logs: Array.isArray(data.logs) ? data.logs : [],
      };
      render();
      if (manual) toast("Refreshed", "ok");
    } catch (err) {
      if (manual) toast(err.message || "Refresh failed", "error");
      else console.warn("overview load failed:", err.message);
    }
  }

  function startAutoRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
      if (document.visibilityState === "visible" && !freeModeBusy) load(false);
    }, 15000);
  }

  /* ------------------------------ render ------------------------------ */
  function render() {
    renderStats();
    renderFreeMode();
    renderKeys();
    renderSessions();
    renderLogs();
  }

  function renderStats() {
    const activeKeys = state.keys.filter((k) => !k.revokedAt).length;
    const connected = state.sessions.filter((s) => s.status === "connected").length;

    $("statFreeMode").textContent = state.freeMode ? "ON" : "OFF";
    $("statFreeMode").className = "stat__value " + (state.freeMode ? "is-accent" : "is-mute");
    $("statFreeModeSub").textContent = state.freeMode ? "Public pairing open" : "Keys required";

    $("statKeys").textContent = activeKeys;
    $("statSessions").textContent = state.sessions.length;
    $("statSessionsSub").textContent = connected + " connected";
    $("statGuests").textContent = state.activeGuestSessions;
  }

  function renderFreeMode() {
    fmSwitch.classList.toggle("is-on", state.freeMode);
    fmSwitch.setAttribute("aria-checked", String(state.freeMode));
    fmSwitch.disabled = freeModeBusy;
    fmTitle.textContent = state.freeMode ? "Free pairing is ON" : "Free pairing is OFF";
    fmDesc.textContent = state.freeMode
      ? "Anyone can request a pairing code without an access key."
      : "Only users with a valid access key can pair.";
  }

  fmSwitch.addEventListener("click", async () => {
    if (freeModeBusy) return;
    const next = !state.freeMode;
    freeModeBusy = true;
    fmSwitch.disabled = true;

    try {
      const data = await api("/api/admin/free-mode", { body: { enabled: next } });
      state.freeMode = !!data.freeMode;
      renderFreeMode();
      renderStats();
      toast("Free mode " + (state.freeMode ? "enabled" : "disabled"), "ok");
      load(false);
    } catch (err) {
      toast(err.message || "Could not change free mode", "error");
    } finally {
      freeModeBusy = false;
      fmSwitch.disabled = false;
    }
  });

  /* ------------------------------- keys ------------------------------- */
  function renderKeys() {
    if (!state.keys.length) {
      keysBody.innerHTML =
        '<tr><td colspan="6"><div class="empty">' + ICON_EMPTY +
        "<div>No access keys yet. Create one above.</div></div></td></tr>";
      return;
    }

    keysBody.innerHTML = state.keys
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((k) => {
        const revoked = !!k.revokedAt;
        const badge = revoked
          ? '<span class="badge badge--bad"><span class="badge__dot"></span>Revoked</span>'
          : '<span class="badge badge--ok"><span class="badge__dot"></span>Active</span>';

        return (
          "<tr>" +
            "<td><strong>" + esc(k.label) + "</strong></td>" +
            '<td class="muted">' + fmtDate(k.createdAt) + "</td>" +
            '<td class="muted">' + (k.lastUsedAt ? timeAgo(k.lastUsedAt) : "Never") + "</td>" +
            '<td class="mono">' + (k.activeNumbers || 0) + "</td>" +
            "<td>" + badge + "</td>" +
            '<td><div class="actions">' +
              (revoked
                ? ""
                : '<button class="btn btn--ghost btn--sm" data-rename="' + esc(k.id) + '" data-label="' + esc(k.label) + '">Rename</button>' +
                  '<button class="btn btn--danger btn--sm" data-revoke="' + esc(k.id) + '">Revoke</button>') +
            "</div></td>" +
          "</tr>"
        );
      })
      .join("");
  }

  keyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const label = keyLabel.value.trim();
    if (!label) {
      toast("Enter a label for the key", "error");
      keyLabel.focus();
      return;
    }

    try {
      const data = await api("/api/admin/keys", { body: { label } });
      keyLabel.value = "";
      $("newKeyValue").textContent = data.key;
      $("keyModal").classList.add("is-open");
      toast("Access key created", "ok");
      load(false);
    } catch (err) {
      toast(err.message || "Could not create key", "error");
    }
  });

  keysBody.addEventListener("click", async (e) => {
    const renameBtn = e.target.closest("[data-rename]");
    const revokeBtn = e.target.closest("[data-revoke]");

    if (renameBtn) {
      const id = renameBtn.getAttribute("data-rename");
      const current = renameBtn.getAttribute("data-label") || "";
      const label = window.prompt("New label for this key:", current);
      if (label === null) return;
      const trimmed = label.trim();
      if (!trimmed) { toast("Label cannot be empty", "error"); return; }

      try {
        await api("/api/admin/keys/rename", { body: { keyId: id, label: trimmed } });
        toast("Key renamed", "ok");
        load(false);
      } catch (err) {
        toast(err.message || "Rename failed", "error");
      }
      return;
    }

    if (revokeBtn) {
      const id = revokeBtn.getAttribute("data-revoke");
      if (!window.confirm("Revoke this key? Users with it will lose access immediately.")) return;
      try {
        await api("/api/admin/keys/revoke", { body: { keyId: id } });
        toast("Key revoked", "ok");
        load(false);
      } catch (err) {
        toast(err.message || "Revoke failed", "error");
      }
    }
  });

  $("copyKeyBtn").addEventListener("click", async () => {
    const ok = await copyText($("newKeyValue").textContent);
    toast(ok ? "Key copied" : "Copy failed", ok ? "ok" : "error");
  });

  $("closeKeyModal").addEventListener("click", () => {
    $("keyModal").classList.remove("is-open");
  });

  $("keyModal").addEventListener("click", (e) => {
    if (e.target === $("keyModal")) $("keyModal").classList.remove("is-open");
  });

  /* ----------------------------- sessions ----------------------------- */
  const STATUS_MAP = {
    connected:            { label: "Connected",    cls: "badge--ok" },
    connecting:           { label: "Connecting",   cls: "badge--warn" },
    pairing_code_issued:  { label: "Code issued",  cls: "badge--violet" },
    waiting_for_pairing:  { label: "Awaiting",     cls: "badge--idle" },
    logged_out:           { label: "Logged out",   cls: "badge--bad" },
    needs_repair:         { label: "Needs repair", cls: "badge--bad" },
  };

  function renderSessions() {
    const q = sessionSearch.value.trim().toLowerCase();
    const filter = sessionFilter.value;

    const list = state.sessions.filter((s) => {
      const num = String(s.number || "");
      if (q && !num.includes(q) && !String(s.ownerLabel || "").toLowerCase().includes(q)) return false;
      if (filter && s.status !== filter) return false;
      return true;
    });

    if (!list.length) {
      sessionsBody.innerHTML =
        '<tr><td colspan="5"><div class="empty">' + ICON_EMPTY +
        "<div>No devices found.</div></div></td></tr>";
      return;
    }

    sessionsBody.innerHTML = list
      .map((s) => {
        const meta = STATUS_MAP[s.status] || { label: s.status || "Unknown", cls: "badge--idle" };
        return (
          "<tr>" +
            '<td class="mono">+' + esc(s.number) + "</td>" +
            '<td class="muted">' + esc(s.ownerLabel || "Unassigned") + "</td>" +
            '<td><span class="badge ' + meta.cls + '"><span class="badge__dot"></span>' + meta.label + "</span></td>" +
            '<td class="muted">' + timeAgo(s.updatedAt) + "</td>" +
            '<td><div class="actions">' +
              '<button class="btn btn--danger btn--sm" data-remove="' + esc(s.number) + '">Disconnect</button>' +
            "</div></td>" +
          "</tr>"
        );
      })
      .join("");
  }

  sessionSearch.addEventListener("input", renderSessions);
  sessionFilter.addEventListener("change", renderSessions);

  sessionsBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    const number = btn.getAttribute("data-remove");
    if (!window.confirm("Disconnect +" + number + "?\n\nThe session will be deleted and the user must pair again.")) return;

    btn.disabled = true;
    try {
      await api("/api/admin/sessions/remove", { body: { number } });
      toast("Device disconnected", "ok");
      load(false);
    } catch (err) {
      toast(err.message || "Disconnect failed", "error");
      btn.disabled = false;
    }
  });

  /* ------------------------------- logs ------------------------------- */
  const ACTION_LABEL = {
    "admin.login": "Admin signed in",
    "admin.free_mode_changed": "Free mode changed",
    "admin.key_created": "Access key created",
    "admin.key_renamed": "Access key renamed",
    "admin.key_revoked": "Access key revoked",
    "admin.session_removed": "Device disconnected",
    "pairing.requested": "Pairing requested",
  };

  function renderLogs() {
    const q = logSearch.value.trim().toLowerCase();

    const list = state.logs.filter((l) => {
      if (!q) return true;
      const hay = (l.action + " " + JSON.stringify(l.details || {})).toLowerCase();
      return hay.includes(q);
    });

    if (!list.length) {
      logList.innerHTML = '<div class="empty">' + ICON_EMPTY + "<div>No activity recorded.</div></div>";
      return;
    }

    logList.innerHTML = list
      .slice(0, 120)
      .map((l) => {
        const detail = l.details && Object.keys(l.details).length
          ? Object.entries(l.details)
              .map(([k, v]) => k + ": " + (typeof v === "object" ? JSON.stringify(v) : v))
              .join(" · ")
          : "";
        return (
          '<div class="log-item">' +
            '<span class="log-item__dot"></span>' +
            '<div class="log-item__body">' +
              '<div class="log-item__action">' + esc(ACTION_LABEL[l.action] || l.action) + "</div>" +
              (detail ? '<div class="log-item__detail">' + esc(detail) + "</div>" : "") +
            "</div>" +
            '<span class="log-item__time">' + fmtDate(l.createdAt) + "</span>" +
          "</div>"
        );
      })
      .join("");
  }

  logSearch.addEventListener("input", renderLogs);

  /* ------------------------------- boot ------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  (async function boot() {
    if (!token) {
      showLogin();
      return;
    }
    showDash();
    await load(false);
    startAutoRefresh();
  })();
})();
