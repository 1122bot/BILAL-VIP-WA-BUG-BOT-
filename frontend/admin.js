const adminLoginView = document.querySelector("#admin-login-view");
const adminDashboard = document.querySelector("#admin-dashboard");
const adminLoginForm = document.querySelector("#admin-login-form");
const adminPassword = document.querySelector("#admin-password");
const adminLoginButton = document.querySelector("#admin-login-button");
const adminMessage = document.querySelector("#admin-message");
const adminModeToggle = document.querySelector("#admin-mode-toggle");
const createKeyForm = document.querySelector("#create-key-form");
const keyLabelInput = document.querySelector("#key-label");
const newKeyResult = document.querySelector("#new-key-result");
const keysList = document.querySelector("#keys-list");
const sessionsList = document.querySelector("#admin-sessions-list");
const logsList = document.querySelector("#admin-logs-list");
const keySearch = document.querySelector("#key-search");
const keyStatusFilter = document.querySelector("#key-status-filter");
const sessionSearch = document.querySelector("#session-search");
const sessionStatusFilter = document.querySelector("#session-status-filter");
const logSearch = document.querySelector("#log-search");
const adminRefreshButton = document.querySelector("#admin-refresh-button");
const exportLogsButton = document.querySelector("#export-logs-button");
const messageLogDialog = document.querySelector("#message-log-dialog");
const messageLogList = document.querySelector("#message-log-list");
const messageLogSearch = document.querySelector("#message-log-search");
const messageLogStatus = document.querySelector("#message-log-status");
const messageLogRefreshButton = document.querySelector("#message-log-refresh");
const ADMIN_TOKEN_KEY = "bilalAdminSession";
let currentKeys = [];
let currentSessions = [];
let currentLogs = [];
let currentMessageLogs = [];
let activeMessageLogNumber = "";
let messageLogRequestController = null;

document.querySelector("#year").textContent = new Date().getFullYear();

function getApiBase() {
  const value = window.BILAL_API_URL || window.location.origin;
  return new URL(value).origin.replace(/\/+$/, "");
}

function showMessage(message, type = "") {
  adminMessage.textContent = message;
  adminMessage.className = `inline-message ${type}`;
  adminMessage.hidden = !message;
}

async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  const response = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || "Request to the server failed.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function makeCell(text, className = "") {
  const cell = document.createElement("span");
  cell.className = className;
  cell.textContent = text;
  return cell;
}

function makeEmpty(text) {
  const empty = document.createElement("div");
  empty.className = "admin-empty";
  empty.textContent = text;
  return empty;
}

function renderKeys() {
  const query = keySearch.value.trim().toLowerCase();
  const statusFilter = keyStatusFilter.value;
  const keys = currentKeys.filter(key => {
    const isRevoked = Boolean(key.revokedAt);
    return (!query || key.label.toLowerCase().includes(query))
      && (statusFilter === "all" || (statusFilter === "revoked") === isRevoked);
  });
  keysList.replaceChildren();
  document.querySelector("#key-results-count").textContent = `${keys.length} of ${currentKeys.length}`;
  if (!keys.length) {
    keysList.append(makeEmpty(currentKeys.length ? "No keys match these filters." : "No access keys have been created."));
    return;
  }
  for (const key of keys) {
    const row = document.createElement("article");
    row.className = "admin-row";
    const info = document.createElement("div");
    info.className = "admin-row-main";
    info.append(
      makeCell(key.label, "admin-row-title"),
      makeCell(`Created ${new Date(key.createdAt).toLocaleString("en-US")} · ${key.activeNumbers} number(s)`, "admin-row-meta"),
    );
    if (key.lastUsedAt) info.append(makeCell(`Last used ${new Date(key.lastUsedAt).toLocaleString("en-US")}`, "admin-row-meta"));
    const status = makeCell(key.revokedAt ? "Revoked" : "Active", `admin-pill ${key.revokedAt ? "is-revoked" : "is-active"}`);
    const actions = document.createElement("div");
    actions.className = "admin-row-actions";
    const rename = document.createElement("button");
    rename.type = "button";
    rename.className = "manage-button";
    rename.textContent = "Rename";
    rename.setAttribute("aria-label", `Rename key ${key.label}`);
    rename.addEventListener("click", () => renameKey(key.id, key.label));
    actions.append(rename);
    if (!key.revokedAt) {
      const revoke = document.createElement("button");
      revoke.type = "button";
      revoke.className = "revoke-button";
      revoke.textContent = "Revoke";
      revoke.addEventListener("click", () => revokeKey(key.id, key.label));
      actions.append(revoke);
    }
    row.append(info, status, actions);
    keysList.append(row);
  }
}

function renderSessions() {
  const query = sessionSearch.value.trim().toLowerCase();
  const statusFilter = sessionStatusFilter.value;
  const sessions = currentSessions.filter(session => {
    const searchable = `${session.number || ""} ${session.ownerLabel || ""} ${session.status || ""}`.toLowerCase();
    return (!query || searchable.includes(query))
      && (statusFilter === "all" || session.status === statusFilter);
  });
  sessionsList.replaceChildren();
  document.querySelector("#session-results-count").textContent = `${sessions.length} of ${currentSessions.length}`;
  if (!sessions.length) {
    sessionsList.append(makeEmpty(currentSessions.length ? "No sessions match these filters." : "No paired numbers are currently active."));
    return;
  }
  for (const session of sessions) {
    const row = document.createElement("article");
    row.className = "admin-row";
    const info = document.createElement("div");
    info.className = "admin-row-main";
    info.append(
      makeCell(`+${session.number}`, "admin-row-title"),
      makeCell(session.ownerLabel, "admin-row-meta"),
    );
    const state = makeCell((session.status || "unknown").replaceAll("_", " "), `admin-pill ${session.status === "connected" ? "is-active" : ""}`);
    const updated = makeCell(session.updatedAt ? new Date(session.updatedAt).toLocaleString("en-US") : "", "admin-row-meta");
    const actions = document.createElement("div");
    actions.className = "admin-row-actions";
    const disconnect = document.createElement("button");
    disconnect.type = "button";
    disconnect.className = "revoke-button";
    disconnect.textContent = "Disconnect";
    disconnect.setAttribute("aria-label", `Disconnect WhatsApp number +${session.number}`);
    disconnect.addEventListener("click", () => removeSession(session.number, disconnect));
    const viewMessages = document.createElement("button");
    viewMessages.type = "button";
    viewMessages.className = "manage-button";
    viewMessages.textContent = "View message history";
    viewMessages.setAttribute("aria-label", `View message history for WhatsApp number +${session.number}`);
    viewMessages.addEventListener("click", () => openMessageLog(session.number));
    actions.append(viewMessages, disconnect);
    row.append(info, state, updated, actions);
    sessionsList.append(row);
  }
}

function renderLogs() {
  const query = logSearch.value.trim().toLowerCase();
  const logs = currentLogs.filter(log => {
    const searchable = `${log.action} ${JSON.stringify(log.details || {})}`.toLowerCase();
    return !query || searchable.includes(query);
  });
  logsList.replaceChildren();
  document.querySelector("#log-results-count").textContent = `${logs.length} of ${currentLogs.length}`;
  if (!logs.length) {
    logsList.append(makeEmpty(currentLogs.length ? "No activity matches this search." : "No activity has been recorded yet."));
    return;
  }
  for (const log of logs) {
    const row = document.createElement("article");
    row.className = "admin-row log-row";
    const info = document.createElement("div");
    info.className = "admin-row-main";
    info.append(makeCell(log.action.replaceAll(".", " "), "admin-row-title"));
    const details = Object.entries(log.details || {}).map(([key, value]) => `${key}: ${value}`).join(" · ");
    if (details) info.append(makeCell(details, "admin-row-meta"));
    row.append(info, makeCell(new Date(log.createdAt).toLocaleString("en-US"), "admin-row-meta"));
    logsList.append(row);
  }
}

function renderOverview(data) {
  currentKeys = data.keys;
  currentSessions = data.sessions;
  currentLogs = data.logs;
  document.querySelector("#admin-free-mode").textContent = data.freeMode ? "ON" : "OFF";
  document.querySelector("#admin-mode-description").textContent = data.freeMode
    ? "Anyone can create a guest session and request pairing codes."
    : "Only users with active access keys can sign in and request pairing codes.";
  adminModeToggle.textContent = data.freeMode ? "Turn Free Mode off" : "Turn Free Mode on";
  document.querySelector("#admin-key-count").textContent = String(data.keys.filter(key => !key.revokedAt).length);
  document.querySelector("#admin-session-count").textContent = String(data.sessions.filter(session => session.status === "connected").length);
  document.querySelector("#admin-guest-count").textContent = String(data.activeGuestSessions || 0);
  document.querySelector("#admin-last-updated").textContent = `Last updated ${new Date().toLocaleTimeString("en-US")}`;
  renderKeys();
  renderSessions();
  renderLogs();
}

async function loadOverview() {
  const data = await apiRequest("/api/admin/overview");
  renderOverview(data);
}

async function openDashboard() {
  if (!sessionStorage.getItem(ADMIN_TOKEN_KEY)) {
    adminLoginView.hidden = false;
    adminDashboard.hidden = true;
    return;
  }

  try {
    await loadOverview();
    adminLoginView.hidden = true;
    adminDashboard.hidden = false;
  } catch (error) {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    adminLoginView.hidden = false;
    adminDashboard.hidden = true;
    if (error.status !== 401) showMessage(error.message, "is-error");
  }
}

async function revokeKey(keyId, label) {
  if (!window.confirm(`Revoke the access key "${label}"? Users signed in with it will lose access.`)) return;
  try {
    await apiRequest("/api/admin/keys/revoke", {
      method: "POST",
      body: JSON.stringify({ keyId }),
    });
    showMessage(`Access key "${label}" was revoked.`, "is-success");
    await loadOverview();
  } catch (error) {
    showMessage(error.message, "is-error");
  }
}

async function renameKey(keyId, currentLabel) {
  const label = window.prompt("Enter a new label for this access key:", currentLabel);
  if (label === null || label.trim() === currentLabel) return;
  try {
    await apiRequest("/api/admin/keys/rename", {
      method: "POST",
      body: JSON.stringify({ keyId, label }),
    });
    showMessage("Access key label updated.", "is-success");
    await loadOverview();
  } catch (error) {
    showMessage(error.message, "is-error");
  }
}

async function removeSession(number, button) {
  const confirmed = window.confirm(
    `Disconnect WhatsApp number +${number} and remove its saved session? This signs the device out and it must be paired again to reconnect. Other numbers will not be affected.`,
  );
  if (!confirmed) return;
  button.disabled = true;
  try {
    await apiRequest("/api/admin/sessions/remove", {
      method: "POST",
      body: JSON.stringify({ number }),
    });
    if (activeMessageLogNumber === number) messageLogDialog.close();
    showMessage(`WhatsApp number +${number} was disconnected and removed.`, "is-success");
    await loadOverview();
  } catch (error) {
    showMessage(error.message, "is-error");
    button.disabled = false;
  }
}

function renderMessageLogs() {
  const query = messageLogSearch.value.trim().toLowerCase();
  const logs = currentMessageLogs.filter(log =>
    `${log.text} ${log.senderName} ${log.sender} ${log.chat} ${log.type} ${log.direction}`.toLowerCase().includes(query)
  );
  messageLogList.replaceChildren();
  document.querySelector("#message-log-count").textContent = `${logs.length} of ${currentMessageLogs.length}`;
  if (!logs.length) {
    const empty = document.createElement("li");
    empty.className = "admin-empty";
    empty.textContent = currentMessageLogs.length
      ? "No messages match this search."
      : "No messages recorded for this number during the current bot session.";
    messageLogList.append(empty);
    return;
  }
  for (const log of logs) {
    const item = document.createElement("li");
    item.className = `message-log-entry is-${log.direction}`;
    const header = document.createElement("div");
    header.className = "message-log-entry-header";
    const direction = makeCell(log.direction === "outgoing" ? "Sent" : "Received", "message-log-direction");
    const sender = makeCell(log.senderName || log.sender || log.chat, "message-log-sender");
    const timestamp = makeCell(new Date(log.timestamp).toLocaleString("en-US"), "message-log-time");
    header.append(direction, sender, timestamp);
    const body = makeCell(log.text, "message-log-text");
    const details = makeCell(`${log.type} · ${log.chat}`, "message-log-details");
    item.append(header, body, details);
    messageLogList.append(item);
  }
  messageLogList.scrollTop = messageLogList.scrollHeight;
}

async function refreshMessageLog() {
  if (!activeMessageLogNumber || !messageLogDialog.open) return;
  const number = activeMessageLogNumber;
  messageLogRequestController?.abort();
  const controller = new AbortController();
  messageLogRequestController = controller;
  messageLogRefreshButton.disabled = true;
  messageLogStatus.textContent = "Loading recent messages...";
  try {
    const data = await apiRequest(`/api/admin/sessions/${encodeURIComponent(number)}/messages?limit=200`, { signal: controller.signal });
    if (activeMessageLogNumber !== number || !messageLogDialog.open) return;
    currentMessageLogs = data.logs;
    renderMessageLogs();
    messageLogStatus.textContent = `Showing up to ${data.limit} recent messages for +${data.number}.`;
  } catch (error) {
    if (error.name === "AbortError") return;
    if (activeMessageLogNumber !== number) return;
    messageLogStatus.textContent = error.message;
    messageLogStatus.className = "admin-section-description is-error";
  } finally {
    if (messageLogRequestController === controller) {
      messageLogRequestController = null;
      messageLogRefreshButton.disabled = false;
    }
  }
}

function openMessageLog(number) {
  messageLogRequestController?.abort();
  activeMessageLogNumber = number;
  currentMessageLogs = [];
  messageLogSearch.value = "";
  document.querySelector("#message-log-number").textContent = `WhatsApp number +${number}`;
  messageLogStatus.className = "admin-section-description";
  messageLogDialog.showModal();
  renderMessageLogs();
  refreshMessageLog();
}

function csvCell(value) {
  const text = String(value ?? "");
  const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

async function exportLogs() {
  exportLogsButton.disabled = true;
  try {
    const data = await apiRequest("/api/admin/logs");
    const rows = [
      ["Timestamp", "Action", "Details"],
      ...data.logs.map(log => [log.createdAt, log.action, JSON.stringify(log.details || {})]),
    ];
    const csv = rows.map(row => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showMessage(`Exported ${data.logs.length} audit entries.`, "is-success");
  } catch (error) {
    showMessage(error.message, "is-error");
  } finally {
    exportLogsButton.disabled = false;
  }
}

adminLoginForm.addEventListener("submit", async event => {
  event.preventDefault();
  adminLoginButton.disabled = true;
  adminLoginButton.querySelector("span").textContent = "Signing in...";
  try {
    const result = await apiRequest("/api/auth/admin-login", {
      method: "POST",
      body: JSON.stringify({ secret: adminPassword.value }),
    });
    sessionStorage.setItem(ADMIN_TOKEN_KEY, result.token);
    adminPassword.value = "";
    showMessage("");
    await openDashboard();
  } catch (error) {
    showMessage(error.message, "is-error");
  } finally {
    adminLoginButton.disabled = false;
    adminLoginButton.querySelector("span").textContent = "Sign in securely";
  }
});

adminModeToggle.addEventListener("click", async () => {
  adminModeToggle.disabled = true;
  try {
    const overview = await apiRequest("/api/admin/overview");
    await apiRequest("/api/admin/free-mode", {
      method: "POST",
      body: JSON.stringify({ enabled: !overview.freeMode }),
    });
    showMessage(`Free Mode is now ${overview.freeMode ? "OFF" : "ON"}.`, "is-success");
    await loadOverview();
  } catch (error) {
    showMessage(error.message, "is-error");
  } finally {
    adminModeToggle.disabled = false;
  }
});

createKeyForm.addEventListener("submit", async event => {
  event.preventDefault();
  const submitButton = createKeyForm.querySelector("button");
  submitButton.disabled = true;
  try {
    const result = await apiRequest("/api/admin/keys", {
      method: "POST",
      body: JSON.stringify({ label: keyLabelInput.value }),
    });
    keyLabelInput.value = "";
    newKeyResult.replaceChildren();
    const title = document.createElement("strong");
    title.textContent = `New key for ${result.label}`;
    const warning = document.createElement("p");
    warning.textContent = "Copy and share this key securely. It will not be shown again.";
    const keyLine = document.createElement("div");
    keyLine.className = "generated-key-line";
    const keyText = document.createElement("code");
    keyText.textContent = result.key;
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy-button";
    copy.textContent = "Copy";
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(result.key);
        copy.textContent = "Copied";
      } catch {
        showMessage("Clipboard access failed. Select and copy the key manually.", "is-error");
      }
    });
    keyLine.append(keyText, copy);
    newKeyResult.append(title, warning, keyLine);
    newKeyResult.hidden = false;
    showMessage("Access key created.", "is-success");
    await loadOverview();
  } catch (error) {
    showMessage(error.message, "is-error");
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelector("#admin-logout-button").addEventListener("click", async () => {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } catch (error) {
    if (error.status !== 401) showMessage(error.message, "is-error");
  }
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  adminDashboard.hidden = true;
  adminLoginView.hidden = false;
});

keySearch.addEventListener("input", renderKeys);
keyStatusFilter.addEventListener("change", renderKeys);
sessionSearch.addEventListener("input", renderSessions);
sessionStatusFilter.addEventListener("change", renderSessions);
logSearch.addEventListener("input", renderLogs);
exportLogsButton.addEventListener("click", exportLogs);
messageLogSearch.addEventListener("input", renderMessageLogs);
messageLogRefreshButton.addEventListener("click", refreshMessageLog);
document.querySelector("#message-log-close").addEventListener("click", () => messageLogDialog.close());
messageLogDialog.addEventListener("click", event => {
  if (event.target === messageLogDialog) messageLogDialog.close();
});
messageLogDialog.addEventListener("close", () => {
  messageLogRequestController?.abort();
  messageLogRequestController = null;
  messageLogRefreshButton.disabled = false;
  activeMessageLogNumber = "";
  currentMessageLogs = [];
});
adminRefreshButton.addEventListener("click", async () => {
  adminRefreshButton.disabled = true;
  try {
    await loadOverview();
    showMessage("Dashboard refreshed.", "is-success");
  } catch (error) {
    showMessage(error.message, "is-error");
  } finally {
    adminRefreshButton.disabled = false;
  }
});

openDashboard();
window.setInterval(() => {
  if (!adminDashboard.hidden) loadOverview().catch(error => showMessage(error.message, "is-error"));
}, 15_000);
window.setInterval(() => {
  if (messageLogDialog.open) refreshMessageLog();
}, 10_000);
