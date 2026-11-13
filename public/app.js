/* =====================================================================
   BILAL VIP BOT — Pairing page logic
   ===================================================================== */
(function () {
  "use strict";

  /* ----------------------------- countries ---------------------------- */
  const COUNTRIES = [
    { iso: "PK", name: "Pakistan",       dial: "92",  flag: "🇵🇰" },
    { iso: "IN", name: "India",          dial: "91",  flag: "🇮🇳" },
    { iso: "BD", name: "Bangladesh",     dial: "880", flag: "🇧🇩" },
    { iso: "AE", name: "UAE",            dial: "971", flag: "🇦🇪" },
    { iso: "SA", name: "Saudi Arabia",   dial: "966", flag: "🇸🇦" },
    { iso: "QA", name: "Qatar",          dial: "974", flag: "🇶🇦" },
    { iso: "KW", name: "Kuwait",         dial: "965", flag: "🇰🇼" },
    { iso: "OM", name: "Oman",           dial: "968", flag: "🇴🇲" },
    { iso: "BH", name: "Bahrain",        dial: "973", flag: "🇧🇭" },
    { iso: "US", name: "United States",  dial: "1",   flag: "🇺🇸" },
    { iso: "GB", name: "United Kingdom", dial: "44",  flag: "🇬🇧" },
    { iso: "CA", name: "Canada",         dial: "1",   flag: "🇨🇦" },
    { iso: "AU", name: "Australia",      dial: "61",  flag: "🇦🇺" },
    { iso: "DE", name: "Germany",        dial: "49",  flag: "🇩🇪" },
    { iso: "FR", name: "France",         dial: "33",  flag: "🇫🇷" },
    { iso: "IT", name: "Italy",          dial: "39",  flag: "🇮🇹" },
    { iso: "ES", name: "Spain",          dial: "34",  flag: "🇪🇸" },
    { iso: "NL", name: "Netherlands",    dial: "31",  flag: "🇳🇱" },
    { iso: "BE", name: "Belgium",        dial: "32",  flag: "🇧🇪" },
    { iso: "CH", name: "Switzerland",    dial: "41",  flag: "🇨🇭" },
    { iso: "AT", name: "Austria",        dial: "43",  flag: "🇦🇹" },
    { iso: "SE", name: "Sweden",         dial: "46",  flag: "🇸🇪" },
    { iso: "NO", name: "Norway",         dial: "47",  flag: "🇳🇴" },
    { iso: "DK", name: "Denmark",        dial: "45",  flag: "🇩🇰" },
    { iso: "FI", name: "Finland",        dial: "358", flag: "🇫🇮" },
    { iso: "PL", name: "Poland",         dial: "48",  flag: "🇵🇱" },
    { iso: "RU", name: "Russia",         dial: "7",   flag: "🇷🇺" },
    { iso: "TR", name: "Turkey",         dial: "90",  flag: "🇹🇷" },
    { iso: "IR", name: "Iran",           dial: "98",  flag: "🇮🇷" },
    { iso: "AF", name: "Afghanistan",    dial: "93",  flag: "🇦🇫" },
    { iso: "ID", name: "Indonesia",      dial: "62",  flag: "🇮🇩" },
    { iso: "MY", name: "Malaysia",       dial: "60",  flag: "🇲🇾" },
    { iso: "SG", name: "Singapore",      dial: "65",  flag: "🇸🇬" },
    { iso: "PH", name: "Philippines",    dial: "63",  flag: "🇵🇭" },
    { iso: "TH", name: "Thailand",       dial: "66",  flag: "🇹🇭" },
    { iso: "VN", name: "Vietnam",        dial: "84",  flag: "🇻🇳" },
    { iso: "CN", name: "China",          dial: "86",  flag: "🇨🇳" },
    { iso: "JP", name: "Japan",          dial: "81",  flag: "🇯🇵" },
    { iso: "KR", name: "South Korea",    dial: "82",  flag: "🇰🇷" },
    { iso: "HK", name: "Hong Kong",      dial: "852", flag: "🇭🇰" },
    { iso: "NG", name: "Nigeria",        dial: "234", flag: "🇳🇬" },
    { iso: "KE", name: "Kenya",          dial: "254", flag: "🇰🇪" },
    { iso: "ZA", name: "South Africa",   dial: "27",  flag: "🇿🇦" },
    { iso: "EG", name: "Egypt",          dial: "20",  flag: "🇪🇬" },
    { iso: "MA", name: "Morocco",        dial: "212", flag: "🇲🇦" },
    { iso: "DZ", name: "Algeria",        dial: "213", flag: "🇩🇿" },
    { iso: "BR", name: "Brazil",         dial: "55",  flag: "🇧🇷" },
    { iso: "MX", name: "Mexico",         dial: "52",  flag: "🇲🇽" },
    { iso: "AR", name: "Argentina",      dial: "54",  flag: "🇦🇷" },
    { iso: "CL", name: "Chile",          dial: "56",  flag: "🇨🇱" },
    { iso: "CO", name: "Colombia",       dial: "57",  flag: "🇨🇴" },
    { iso: "LK", name: "Sri Lanka",      dial: "94",  flag: "🇱🇰" },
    { iso: "NP", name: "Nepal",          dial: "977", flag: "🇳🇵" },
    { iso: "UA", name: "Ukraine",        dial: "380", flag: "🇺🇦" },
    { iso: "IQ", name: "Iraq",           dial: "964", flag: "🇮🇶" },
    { iso: "JO", name: "Jordan",         dial: "962", flag: "🇯🇴" },
    { iso: "LB", name: "Lebanon",        dial: "961", flag: "🇱🇧" },
    { iso: "SY", name: "Syria",          dial: "963", flag: "🇸🇾" },
  ];

  /* ------------------------------- dom -------------------------------- */
  const $ = (id) => document.getElementById(id);

  const cc          = $("cc");
  const ccBtn       = $("ccBtn");
  const ccFlag      = $("ccFlag");
  const ccCode      = $("ccCode");
  const ccPanel     = $("ccPanel");
  const ccSearch    = $("ccSearch");
  const ccList      = $("ccList");
  const phoneInput  = $("phoneInput");
  const phoneShell  = $("phoneShell");
  const pairForm    = $("pairForm");
  const pairBtn     = $("pairBtn");
  const pairBtnLbl  = $("pairBtnLabel");
  const alertBox    = $("alertBox");
  const result      = $("result");
  const codeBox     = $("codeBox");
  const codeValue   = $("codeValue");
  const resultPhone = $("resultPhone");
  const toastWrap   = $("toastWrap");

  let selected = COUNTRIES[0];
  let busy = false;
  let lastCode = "";

  /* ---------------------------- country picker ------------------------ */
  function renderList(filter) {
    const q = (filter || "").trim().toLowerCase();
    const items = COUNTRIES.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q.replace(/\+/g, "")) ||
        c.iso.toLowerCase() === q
    );

    ccList.innerHTML = "";

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.style.padding = "22px 10px";
      empty.textContent = "No country found";
      ccList.appendChild(empty);
      return;
    }

    items.forEach((c) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cc__item" + (c.iso === selected.iso ? " is-active" : "");
      btn.setAttribute("role", "option");
      btn.innerHTML =
        '<span class="cc__flag">' + c.flag + "</span>" +
        "<span>" + c.name + "</span>" +
        '<span class="dial">+' + c.dial + "</span>";
      btn.addEventListener("click", () => {
        selected = c;
        ccFlag.textContent = c.flag;
        ccCode.textContent = "+" + c.dial;
        closePicker();
        phoneInput.focus();
      });
      ccList.appendChild(btn);
    });
  }

  function openPicker() {
    cc.classList.add("is-open");
    ccBtn.setAttribute("aria-expanded", "true");
    ccSearch.value = "";
    renderList("");
    setTimeout(() => ccSearch.focus(), 60);
  }

  function closePicker() {
    cc.classList.remove("is-open");
    ccBtn.setAttribute("aria-expanded", "false");
  }

  ccBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    cc.classList.contains("is-open") ? closePicker() : openPicker();
  });

  ccSearch.addEventListener("input", () => renderList(ccSearch.value));

  document.addEventListener("click", (e) => {
    if (!cc.contains(e.target)) closePicker();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePicker();
  });

  /* --------------------------- phone input ---------------------------- */
  phoneInput.addEventListener("input", () => {
    const digits = phoneInput.value.replace(/\D/g, "").slice(0, 14);
    phoneInput.value = digits.replace(/^0+/, "");
    phoneShell.classList.remove("is-invalid");
  });

  /* ------------------------------ toast ------------------------------- */
  const ICON_OK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  const ICON_ERR =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>';

  function toast(message, type) {
    const el = document.createElement("div");
    el.className = "toast toast--" + (type === "error" ? "error" : "ok");
    el.innerHTML = (type === "error" ? ICON_ERR : ICON_OK) + "<span></span>";
    el.querySelector("span").textContent = message;
    toastWrap.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-out");
      setTimeout(() => el.remove(), 260);
    }, 2600);
  }

  /* ------------------------------ alert ------------------------------- */
  const ICON_WARN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17.5v.01"/><path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>';

  function showAlert(message, type) {
    alertBox.innerHTML = "";
    if (!message) return;
    const el = document.createElement("div");
    el.className = "alert alert--" + (type || "error");
    el.innerHTML = ICON_WARN + "<span></span>";
    el.querySelector("span").textContent = message;
    alertBox.appendChild(el);
  }

  /* ----------------------------- clipboard ---------------------------- */
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

  codeBox.addEventListener("click", async () => {
    if (!lastCode) return;
    const ok = await copyText(lastCode);
    toast(ok ? "Pairing code copied" : "Copy failed — select it manually", ok ? "ok" : "error");
  });

  codeBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      codeBox.click();
    }
  });

  /* ------------------------------ submit ------------------------------ */
  function setBusy(state) {
    busy = state;
    pairBtn.disabled = state;
    if (state) {
      pairBtnLbl.innerHTML = '<span class="spinner"></span>';
      pairBtn.style.gap = "10px";
    } else {
      pairBtnLbl.textContent = "Get Pairing Code";
    }
  }

  pairForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy) return;

    showAlert("");
    phoneShell.classList.remove("is-invalid");

    const local = phoneInput.value.replace(/\D/g, "");
    const full = selected.dial + local;

    if (local.length < 6) {
      phoneShell.classList.add("is-invalid");
      showAlert("Enter a valid WhatsApp number.", "error");
      phoneInput.focus();
      return;
    }
    if (full.length < 8 || full.length > 15) {
      phoneShell.classList.add("is-invalid");
      showAlert("Number with country code must be 8–15 digits.", "error");
      return;
    }

    setBusy(true);
    result.hidden = true;

    try {
      const res = await fetch("/api/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: full }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.status) {
        showAlert(data.message || "Pairing code generate nahi ho saka. Dobara try karein.", "error");
        return;
      }

      lastCode = data.code || data.pairingCode || "";
      codeValue.textContent = lastCode;
      resultPhone.textContent = "+" + (data.phone || full);
      result.hidden = false;
      result.scrollIntoView({ behavior: "smooth", block: "nearest" });
      toast("Pairing code ready", "ok");
    } catch (err) {
      showAlert("Network error — connection check karein aur dobara try karein.", "error");
    } finally {
      setBusy(false);
    }
  });

  /* --------------------------- boot: branding ------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  (async function loadMeta() {
    try {
      const res = await fetch("/api/public-config", { headers: { Accept: "application/json" } });
      if (!res.ok) return;
      const cfg = await res.json();

      if (cfg && cfg.freeMode === false) {
        const badge = document.getElementById("statusBadge");
        badge.className = "badge badge--warn";
        badge.innerHTML = '<span class="badge__dot"></span> Free mode off';
      }

      const c = cfg && cfg.community;
      if (c) {
        const links = document.getElementById("communityLinks");
        if (links) {
          const urls = [c.telegramChannel, c.whatsappChannel, c.ownerContact];
          Array.from(links.children).forEach((a, i) => {
            const url = urls[i];
            if (url) {
              a.href = url;
              a.style.display = "";
            } else {
              a.style.display = "none";
            }
          });
        }
      }
    } catch (_) {
      /* silent — branding is optional */
    }
  })();
})();
