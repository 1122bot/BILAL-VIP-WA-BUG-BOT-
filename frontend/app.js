import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js/max";

const connectionMessage = document.querySelector("#connection-message");
const pairForm = document.querySelector("#pair-form");
const pairButton = document.querySelector("#pair-button");
const pairResult = document.querySelector("#pairing-result");
const sessionsList = document.querySelector("#sessions-list");
const refreshButton = document.querySelector("#refresh-button");
const sessionSearch = document.querySelector("#session-search");
const statTotal = document.querySelector("#stat-total");
const statConnected = document.querySelector("#stat-connected");
const statWaiting = document.querySelector("#stat-waiting");
const statAlerts = document.querySelector("#stat-alerts");
const userLoginForm = document.querySelector("#user-login-form");
const userLoginButton = document.querySelector("#user-login-button");
const userLogoutButton = document.querySelector("#user-logout-button");
const accessKeyInput = document.querySelector("#access-key");
const freeModeBadge = document.querySelector("#free-mode-badge");
const freeModeLabel = document.querySelector("#free-mode-label");
const freeModeDescription = document.querySelector("#free-mode-description");
const backendConnectionForm = document.querySelector("#backend-connection-form");
const backendUrlInput = document.querySelector("#backend-url");
const backendConnectionMessage = document.querySelector("#backend-connection-message");
const backendConnectButton = document.querySelector("#backend-connect-button");
const loginPlaceholder = document.querySelector("#login-placeholder");
const countryPicker = document.querySelector("#country-picker");
const countryPickerButton = document.querySelector("#country-picker-button");
const countryPickerPanel = document.querySelector("#country-picker-panel");
const countryPickerFlag = document.querySelector("#country-picker-flag");
const countryPickerLabel = document.querySelector("#country-picker-label");
const countrySearch = document.querySelector("#country-search");
const countryOptions = document.querySelector("#country-options");
const selectedCallingCode = document.querySelector("#selected-calling-code");
const USER_TOKEN_KEY = "bilalUserSession";
const GUEST_TOKEN_KEY = "bilalGuestSession";
const BACKEND_URL_KEY = "bilalBackendApiUrl";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const regionsWithoutStandardFlag = new Set(["AC", "TA"]);
const countries = getCountries()
  .map(code => ({
    code,
    name: regionNames.of(code) || code,
    callingCode: getCountryCallingCode(code),
  }))
  .sort((left, right) => left.name.localeCompare(right.name, "en"));

let latestSessions = [];
let currentFreeMode = null;
let selectedCountry = "PK";
let authToken = sessionStorage.getItem(USER_TOKEN_KEY) || "";
let authType = authToken ? "user" : "";

document.querySelector("#year").textContent = new Date().getFullYear();

function getApiBase() {
  const value = localStorage.getItem(BACKEND_URL_KEY) || window.BILAL_API_URL || window.location.origin;
  return new URL(value).origin.replace(/\/+$/, "");
}

function setMessage(message, type = "") {
  connectionMessage.textContent = message;
  connectionMessage.className = `inline-message ${type}`;
  connectionMessage.hidden = !message;
}

async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${getApiBase()}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The backend did not respond in time. Check the backend URL and try again.");
    }
    throw new Error("Could not reach the backend. Check that it is running, its URL is correct, and its CORS_ORIGIN allows this website.");
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The backend URL did not return API data. Enter the URL of the running WhatsApp backend.");
  }
  if (!response.ok) {
    const error = new Error(data.error || "Request to the server failed.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function updateStats(sessions) {
  statTotal.textContent = String(sessions.length);
  statConnected.textContent = String(sessions.filter(session => session.status === "connected").length);
  statWaiting.textContent = String(sessions.filter(session => ["waiting_for_pairing", "pairing_code_issued", "connecting"].includes(session.status)).length);
  statAlerts.textContent = String(sessions.filter(session => ["disconnected", "logged_out", "needs_repair"].includes(session.status)).length);
}

function statusLabel(status) {
  const labels = {
    connected: "Connected",
    connecting: "Connecting",
    disconnected: "Disconnected",
    logged_out: "Logged out",
    needs_repair: "Needs re-pairing",
    pairing_code_issued: "Code issued",
    waiting_for_pairing: "Awaiting pairing",
  };
  return labels[status] || "Preparing";
}

function getFilteredSessions(sessions) {
  const keyword = sessionSearch.value.trim().toLowerCase();
  if (!keyword) return sessions;
  return sessions.filter(session =>
    String(session.number || "").toLowerCase().includes(keyword)
    || statusLabel(session.status).toLowerCase().includes(keyword)
  );
}

function renderSessions(sessions) {
  latestSessions = Array.isArray(sessions) ? sessions : [];
  updateStats(latestSessions);
  const visibleSessions = getFilteredSessions(latestSessions);
  if (!visibleSessions.length) {
    sessionsList.innerHTML = `<div class="empty-state"><span class="empty-icon">◌</span><p>${latestSessions.length ? "No matching numbers found." : "You have no paired numbers yet."}</p></div>`;
    return;
  }
  sessionsList.replaceChildren(...visibleSessions.map(session => {
    const item = document.createElement("article");
    item.className = "session-card";
    const number = document.createElement("strong");
    number.className = "session-number";
    number.textContent = `+${session.number}`;
    const updated = document.createElement("span");
    updated.className = "session-updated";
    updated.textContent = session.updatedAt
      ? new Date(session.updatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
      : "";
    const state = document.createElement("span");
    state.className = `session-state ${session.status === "connected" ? "is-connected" : ""}`;
    const dot = document.createElement("span");
    dot.className = "status-dot";
    state.append(dot, document.createTextNode(statusLabel(session.status)));
    const meta = document.createElement("div");
    meta.className = "session-meta";
    meta.append(updated, state);
    item.append(number, meta);
    return item;
  }));
}

function setCommunityLink(id, url, unavailableId) {
  const link = document.querySelector(`#${id}`);
  const unavailable = unavailableId ? document.querySelector(`#${unavailableId}`) : null;
  try {
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error("Unsupported link protocol.");
    link.href = parsedUrl.href;
    link.hidden = false;
    if (unavailable) unavailable.hidden = true;
  } catch {
    link.hidden = true;
    if (unavailable) unavailable.hidden = false;
  }
}

function setCountryFlag(element, countryCode) {
  if (regionsWithoutStandardFlag.has(countryCode)) {
    element.className = "country-flag country-flag-fallback";
    element.textContent = countryCode;
    return;
  }
  element.className = `country-flag fi fi-${countryCode.toLowerCase()}`;
  element.textContent = "";
}

function renderCountryOptions() {
  const query = countrySearch.value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const matchingCountries = countries.filter(country =>
    `${country.name} ${country.code} +${country.callingCode}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .includes(query)
  );
  countryOptions.replaceChildren();

  if (!matchingCountries.length) {
    const empty = document.createElement("p");
    empty.className = "country-options-empty";
    empty.textContent = "No countries found.";
    countryOptions.append(empty);
    return;
  }

  for (const country of matchingCountries) {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "country-option";
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", String(country.code === selectedCountry));
    const flag = document.createElement("span");
    flag.setAttribute("aria-hidden", "true");
    setCountryFlag(flag, country.code);
    const name = document.createElement("span");
    name.className = "country-option-name";
    name.textContent = country.name;
    const callingCode = document.createElement("span");
    callingCode.className = "country-option-code";
    callingCode.textContent = `+${country.callingCode}`;
    option.append(flag, name, callingCode);
    option.addEventListener("click", () => selectCountry(country));
    countryOptions.append(option);
  }
}

function selectCountry(country) {
  selectedCountry = country.code;
  setCountryFlag(countryPickerFlag, country.code);
  countryPickerLabel.textContent = `${country.name} (+${country.callingCode})`;
  selectedCallingCode.textContent = `+${country.callingCode}`;
  closeCountryPicker();
  document.querySelector("#phone-number").focus();
}

function closeCountryPicker() {
  countryPickerPanel.hidden = true;
  countryPickerButton.setAttribute("aria-expanded", "false");
}

function normalizePhoneNumber(value) {
  const rawNumber = value.trim();
  if (!rawNumber) return "";
  const isInternational = rawNumber.startsWith("+");
  const digits = rawNumber.replace(/\D/g, "");
  const callingCode = getCountryCallingCode(selectedCountry);
  if (!isInternational && digits.startsWith(callingCode)) {
    const internationalNumber = parsePhoneNumberFromString(`+${digits}`);
    if (internationalNumber?.isPossible()) return internationalNumber.number.replace(/\D/g, "");
  }
  const parsed = parsePhoneNumberFromString(
    rawNumber,
    isInternational ? undefined : selectedCountry,
  );
  if (parsed) return parsed.number.replace(/\D/g, "");
  return isInternational ? digits : `${callingCode}${digits}`;
}

countryPickerButton.addEventListener("click", () => {
  const isOpen = !countryPickerPanel.hidden;
  countryPickerPanel.hidden = isOpen;
  countryPickerButton.setAttribute("aria-expanded", String(!isOpen));
  if (!isOpen) {
    countrySearch.value = "";
    renderCountryOptions();
    countrySearch.focus();
  }
});

countrySearch.addEventListener("input", renderCountryOptions);
countrySearch.addEventListener("keydown", event => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    countryOptions.querySelector(".country-option")?.focus();
  } else if (event.key === "Escape") {
    closeCountryPicker();
    countryPickerButton.focus();
  }
});

document.addEventListener("click", event => {
  if (!countryPicker.contains(event.target)) closeCountryPicker();
});

renderCountryOptions();

function renderPublicConfig(config) {
  currentFreeMode = config.freeMode === true;
  freeModeBadge.classList.toggle("mode-on", currentFreeMode);
  freeModeBadge.classList.toggle("mode-off", !currentFreeMode);
  freeModeLabel.textContent = currentFreeMode ? "FREE MODE ON" : "FREE MODE OFF";
  freeModeDescription.textContent = currentFreeMode
    ? "Pair a WhatsApp number without signing in. Your session list remains private to this browser."
    : "Sign in with an access key to pair a number and manage your own sessions.";
  document.querySelector(".pairing-panel .panel-heading h2").textContent = currentFreeMode
    ? "Pair WhatsApp number"
    : "Sign in to continue";
  const community = config.community || {};
  setCommunityLink("telegram-channel-link", community.telegramChannel);
  setCommunityLink("telegram-username-link", community.telegramUsername
    ? `https://t.me/${community.telegramUsername.replace(/^@/, "")}`
    : "");
  setCommunityLink("whatsapp-channel-link", community.whatsappChannel);
  setCommunityLink("whatsapp-group-link", community.whatsappGroup, "whatsapp-group-unavailable");
  setCommunityLink("owner-contact-link", community.ownerContact || "https://wa.me/923078071982");
}

function updateAccessView() {
  const signedIn = authType === "user" || (currentFreeMode && Boolean(authToken));
  const showLogin = !currentFreeMode && !signedIn;
  pairForm.hidden = !signedIn;
  userLoginForm.hidden = !showLogin;
  loginPlaceholder.hidden = currentFreeMode || signedIn;
  userLogoutButton.hidden = authType !== "user";
  if (!currentFreeMode && !signedIn) {
    statTotal.textContent = "—";
    statConnected.textContent = "—";
    statWaiting.textContent = "—";
    statAlerts.textContent = "—";
    sessionsList.innerHTML = '<div class="empty-state"><span class="empty-icon">◌</span><p>Sign in to view your WhatsApp sessions.</p></div>';
  }
}

async function refreshPublicConfig() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let config;
  try {
    config = await apiRequest("/api/public-config", { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
  renderPublicConfig(config);
  updateAccessView();
  backendConnectionForm.hidden = true;
  setMessage("", "");
}

function showBackendConnectionError(error) {
  const configuredUrl = localStorage.getItem(BACKEND_URL_KEY) || window.BILAL_API_URL || "";
  freeModeLabel.textContent = "BACKEND OFFLINE";
  freeModeBadge.classList.remove("mode-on");
  freeModeBadge.classList.add("mode-off");
  freeModeDescription.textContent = "The website could not load access settings from the WhatsApp backend.";
  document.querySelector(".pairing-panel .panel-heading h2").textContent = "Backend connection required";
  backendConnectionMessage.textContent = error.message;
  backendConnectionForm.hidden = false;
  backendUrlInput.value = configuredUrl;
  pairForm.hidden = true;
  userLoginForm.hidden = true;
  loginPlaceholder.hidden = true;
}

async function createGuestSession() {
  const result = await apiRequest("/api/auth/guest", { method: "POST" });
  authToken = result.token;
  authType = "guest";
  localStorage.setItem(GUEST_TOKEN_KEY, authToken);
}

async function refreshSessions() {
  if (!authToken) {
    updateAccessView();
    return false;
  }
  try {
    const data = await apiRequest("/api/sessions");
    renderSessions(data.sessions);
    updateAccessView();
    setMessage("", "");
    return true;
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      if (authType === "guest") localStorage.removeItem(GUEST_TOKEN_KEY);
      else sessionStorage.removeItem(USER_TOKEN_KEY);
      authToken = "";
      authType = "";
      updateAccessView();
      if (currentFreeMode) {
        await createGuestSession();
        return refreshSessions();
      }
      setMessage(error.message, "is-error");
      return false;
    }
    setMessage(error.message, "is-error");
    return false;
  }
}

async function initialize() {
  try {
    await refreshPublicConfig();
    if (!authToken && currentFreeMode) {
      authToken = localStorage.getItem(GUEST_TOKEN_KEY) || "";
      authType = authToken ? "guest" : "";
      if (!authToken) await createGuestSession();
    }
    updateAccessView();
    await refreshSessions();
  } catch (error) {
    showBackendConnectionError(error);
    setMessage(error.message, "is-error");
  }
}

backendConnectionForm.addEventListener("submit", async event => {
  event.preventDefault();
  let backendUrl;
  try {
    backendUrl = new URL(backendUrlInput.value.trim());
    if (!["http:", "https:"].includes(backendUrl.protocol) || backendUrl.username || backendUrl.password) {
      throw new Error("Enter a valid HTTP or HTTPS backend URL without credentials.");
    }
    if (window.location.protocol === "https:" && backendUrl.protocol !== "https:") {
      throw new Error("This website uses HTTPS, so the backend URL must also use HTTPS.");
    }
  } catch (error) {
    backendConnectionMessage.textContent = error instanceof TypeError
      ? "Enter a valid HTTP or HTTPS backend URL."
      : error.message;
    return;
  }

  const previousBackendUrl = localStorage.getItem(BACKEND_URL_KEY) || window.BILAL_API_URL || window.location.origin;
  if (new URL(previousBackendUrl).origin !== backendUrl.origin) {
    localStorage.removeItem(GUEST_TOKEN_KEY);
    sessionStorage.removeItem(USER_TOKEN_KEY);
    authToken = "";
    authType = "";
  }
  localStorage.setItem(BACKEND_URL_KEY, backendUrl.origin);
  backendConnectButton.disabled = true;
  backendConnectButton.querySelector("span").textContent = "Connecting...";
  try {
    await initialize();
  } finally {
    backendConnectButton.disabled = false;
    backendConnectButton.querySelector("span").textContent = "Save URL and retry";
  }
});

userLoginForm.addEventListener("submit", async event => {
  event.preventDefault();
  userLoginButton.disabled = true;
  userLoginButton.querySelector("span").textContent = "Signing in...";
  try {
    const result = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ key: accessKeyInput.value }),
    });
    authToken = result.token;
    authType = "user";
    sessionStorage.setItem(USER_TOKEN_KEY, authToken);
    localStorage.removeItem(GUEST_TOKEN_KEY);
    accessKeyInput.value = "";
    updateAccessView();
    await refreshSessions();
  } catch (error) {
    setMessage(error.message, "is-error");
  } finally {
    userLoginButton.disabled = false;
    userLoginButton.querySelector("span").textContent = "Sign in";
  }
});

userLogoutButton.addEventListener("click", async () => {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } catch (error) {
    if (error.status !== 401) setMessage(error.message, "is-error");
  }
  if (authType === "guest") localStorage.removeItem(GUEST_TOKEN_KEY);
  else sessionStorage.removeItem(USER_TOKEN_KEY);
  authToken = "";
  authType = "";
  if (currentFreeMode) {
    try {
      await createGuestSession();
    } catch (error) {
      setMessage(error.message, "is-error");
    }
  }
  updateAccessView();
  await refreshSessions();
});

pairForm.addEventListener("submit", async event => {
  event.preventDefault();
  const phoneNumberInput = document.querySelector("#phone-number");
  pairButton.disabled = true;
  pairButton.innerHTML = "<span>Generating code...</span><span class=\"spinner\"></span>";
  pairResult.hidden = true;
  try {
    const phoneNumber = normalizePhoneNumber(phoneNumberInput.value);
    if (!/^\d{8,15}$/.test(phoneNumber)) {
      throw new Error("Enter a valid phone number with its country calling code.");
    }
    const data = await apiRequest("/api/pair", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    });
    pairResult.className = "pairing-result";
    pairResult.replaceChildren();
    const label = document.createElement("p");
    label.className = "result-label";
    label.textContent = `PAIRING CODE · +${data.number}`;
    const codeWrap = document.createElement("div");
    codeWrap.className = "pairing-code-wrap";
    const code = document.createElement("strong");
    code.className = "pairing-code";
    code.textContent = data.pairingCode;
    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "copy-button";
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(data.pairingCode);
        copyButton.textContent = "Copied";
        setTimeout(() => { copyButton.textContent = "Copy"; }, 1200);
      } catch {
        copyButton.textContent = "Copy failed";
      }
    });
    codeWrap.append(code, copyButton);
    const help = document.createElement("p");
    help.className = "result-help";
    help.textContent = "On your phone, open WhatsApp → Linked devices → Link a device → Link with phone number, then enter this code.";
    pairResult.append(label, codeWrap, help);
    pairResult.hidden = false;
    await refreshSessions();
  } catch (error) {
    pairResult.textContent = error.message;
    pairResult.className = "pairing-result is-error";
    pairResult.hidden = false;
  } finally {
    pairButton.disabled = false;
    pairButton.innerHTML = "<span>Create pairing code</span><span aria-hidden=\"true\">↗</span>";
  }
});

sessionSearch.addEventListener("input", () => renderSessions(latestSessions));
refreshButton.addEventListener("click", refreshSessions);
initialize();
window.setInterval(async () => {
  try {
    await refreshPublicConfig();
    await refreshSessions();
  } catch (error) {
    setMessage(error.message, "is-error");
  }
}, 15_000);
