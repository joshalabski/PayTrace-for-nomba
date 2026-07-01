/* ============================================================
   NOMBA PULSE — Merchant Dashboard
   Vanilla HTML/CSS/JS. No frameworks.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const naira = (n) => "₦" + Math.round(n).toLocaleString("en-NG");
  const pad = (n) => String(n).padStart(2, "0");
  const timeStr = (d) => `${pad(d.getHours() % 12 || 12)}:${pad(d.getMinutes())} ${d.getHours() >= 12 ? "PM" : "AM"}`;

  const ICONS = {
    card:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    transfer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    ussd:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M12 18h.01"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    x:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4"/><circle cx="12" cy="12" r="3"/></svg>',
  };

  const METHOD = {
    card:     { icon: ICONS.card,     label: "POS Card Tap" },
    transfer: { icon: ICONS.transfer, label: "Bank Transfer" },
    ussd:     { icon: ICONS.ussd,     label: "USSD Payment" },
  };

  const FIRST = ["Chidi", "Amara", "Tunde", "Ngozi", "Emeka", "Funke", "Bola", "Ifeoma", "Yusuf", "Zainab", "Obi", "Aisha", "Kelechi", "Femi"];
  const ERRORS = [
    { code: "E-204", msg: "Customer's bank declined the transaction due to insufficient funds." },
    { code: "E-117", msg: "Network timeout — the card issuer did not respond in time." },
    { code: "E-330", msg: "Payment amount does not match the value displayed on your POS." },
    { code: "E-451", msg: "Transfer was reversed by the sending bank." },
  ];

  let txIdSeq = 1000;
  const state = {
    transactions: [],
    disputes: [],
    filter: "all",
    view: "home",
    user: null,
  };
  let appBooted = false;

  /* ---------- Seed data ---------- */
  function makeTx(opts = {}) {
    const methods = Object.keys(METHOD);
    const method = opts.method || methods[Math.floor(Math.random() * methods.length)];
    const status = opts.status || (Math.random() < 0.72 ? "success" : Math.random() < 0.6 ? "pending" : "failed");
    const amount = opts.amount || (Math.floor(Math.random() * 48) + 2) * 500;
    const date = opts.date || new Date(Date.now() - Math.floor(Math.random() * 5 * 3600 * 1000));
    const customer = FIRST[Math.floor(Math.random() * FIRST.length)] + " " + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + ".";
    return {
      id: "TX" + (++txIdSeq),
      merchantId: "NMB-" + (Math.floor(Math.random() * 90000) + 10000),
      method, status, amount, date, customer,
      error: status === "failed" ? ERRORS[Math.floor(Math.random() * ERRORS.length)] : null,
      isNew: false,
    };
  }

  function seed() {
    const presets = [
      { status: "success" }, { status: "success" }, { status: "pending" },
      { status: "success" }, { status: "failed" }, { status: "success" },
      { status: "pending" }, { status: "success" }, { status: "failed" },
      { status: "success" }, { status: "success" },
    ];
    state.transactions = presets.map((p) => makeTx(p)).sort((a, b) => b.date - a.date);
    // Seed one in-progress dispute
    const failedSeed = state.transactions.find((t) => t.status === "failed");
    if (failedSeed) openDispute(failedSeed, 1, true);
  }

  /* ---------- Date label ---------- */
  function setDate() {
    const d = new Date();
    $("#dateLabel").textContent = d.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
  }

  /* ============================================================
     HOME / PULSE
     ============================================================ */
  function computeTotals() {
    let expected = 0, received = 0, success = 0, pending = 0, failed = 0;
    state.transactions.forEach((t) => {
      expected += t.amount;
      if (t.status === "success") { received += t.amount; success++; }
      else if (t.status === "pending") pending++;
      else failed++;
    });
    return { expected, received, gap: expected - received, success, pending, failed };
  }

  function statusFor(totals) {
    if (totals.failed > 0 || state.disputes.some((d) => d.step < 2)) {
      return { key: "red",   label: "Action Required", color: "var(--red)",   soft: "var(--red-soft)",   glow: "rgba(223,59,70,.4)",
        note: `${totals.failed} failed payment${totals.failed !== 1 ? "s" : ""} need your attention. Tap Disputes to resolve.` };
    }
    if (totals.pending > 0) {
      return { key: "amber", label: "Pending", color: "var(--amber)", soft: "var(--amber-soft)", glow: "rgba(224,138,0,.4)",
        note: `${totals.pending} transaction${totals.pending !== 1 ? "s are" : " is"} still settling. They usually clear within minutes.` };
    }
    return { key: "green", label: "All Good", color: "var(--green)", soft: "var(--primary-soft)", glow: "var(--primary-glow)",
      note: "Every expected payment has landed. You're fully settled for today." };
  }

  function renderHome() {
    const t = computeTotals();
    const s = statusFor(t);
    const card = $("#moneyGapCard");
    card.style.setProperty("--status-color", s.color);
    card.style.setProperty("--status-soft", s.soft);
    card.style.setProperty("--status-glow", s.glow);

    if (state.user) {
      const nameEl = $(".greeting-name");
      if (nameEl) nameEl.textContent = state.user.business;
    }

    $("#statusChip").textContent = s.label;
    $("#statusNote").textContent = s.note;
    $("#expectedVal").textContent = naira(t.expected);
    $("#msSuccess").textContent = t.success;
    $("#msPending").textContent = t.pending;
    $("#msFailed").textContent = t.failed;

    // animate received value + gauge
    const pct = t.expected ? t.received / t.expected : 0;
    animateNumber($("#receivedVal"), t.received);
    animateNumber($("#gapVal"), t.gap);
    const circ = 326.7;
    requestAnimationFrame(() => {
      $("#gaugeFill").style.strokeDashoffset = String(circ - circ * pct);
    });
    animateNumber($("#gaugePct"), Math.round(pct * 100), { suffix: "%", plain: true });
  }

  function animateNumber(el, target, opts = {}) {
    const start = 0, dur = 900, t0 = performance.now();
    const fmt = opts.plain ? (v) => Math.round(v) + (opts.suffix || "") : (v) => naira(v);
    function frame(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ============================================================
     ACTIVITY FEED
     ============================================================ */
  function renderFeed() {
    const feed = $("#feed");
    const list = state.transactions.filter((t) => state.filter === "all" || t.status === state.filter);
    if (!list.length) {
      feed.innerHTML = `<li class="empty"><strong>Nothing here yet</strong>No ${state.filter} transactions right now.</li>`;
      return;
    }
    feed.innerHTML = list.map(txRow).join("");
    $$(".tx", feed).forEach((el) => el.addEventListener("click", () => openTxModal(el.dataset.id)));
  }

  function txRow(t) {
    const m = METHOD[t.method];
    const tagText = t.status === "success" ? "Success" : t.status === "pending" ? "Pending" : "Failed";
    const amt = t.status === "failed" ? `<span class="tx-amount neg">${naira(t.amount)}</span>`
                                      : `<span class="tx-amount">${naira(t.amount)}</span>`;
    const statusIcon = t.status === "success" ? ICONS.check : t.status === "pending" ? ICONS.clock : ICONS.x;
    return `
      <li class="tx tx--${t.status} ${t.isNew ? "is-new" : ""}" data-id="${t.id}">
        <div class="tx-icon">${statusIcon}</div>
        <div class="tx-main">
          <div class="tx-title">${t.customer}</div>
          <div class="tx-method">${m.label}<span class="dot"></span>${timeStr(t.date)}</div>
        </div>
        <div class="tx-right">
          ${amt}
          <span class="tx-tag tag--${t.status}">${tagText}</span>
        </div>
      </li>`;
  }

  /* ---------- Live simulation ---------- */
  function startLive() {
    setInterval(() => {
      const tx = makeTx({ date: new Date() });
      tx.isNew = true;
      state.transactions.unshift(tx);
      if (state.transactions.length > 40) state.transactions.pop();
      renderHome();
      updateDisputeBadge();
      if (state.view === "activity") {
        renderFeed();
        setTimeout(() => { tx.isNew = false; }, 2500);
      }
      // Pending tx settles after a while
      if (tx.status === "pending") {
        setTimeout(() => {
          tx.status = Math.random() < 0.8 ? "success" : "failed";
          if (tx.status === "failed") tx.error = ERRORS[Math.floor(Math.random() * ERRORS.length)];
          renderHome();
          if (state.view === "activity") renderFeed();
        }, 6000 + Math.random() * 4000);
      }
      toast(`New ${METHOD[tx.method].label} • ${naira(tx.amount)}`);
    }, 9000);
  }

  /* ============================================================
     TRANSACTION MODAL
     ============================================================ */
  function openTxModal(id) {
    const t = state.transactions.find((x) => x.id === id);
    if (!t) return;
    const m = METHOD[t.method];
    const statusIcon = t.status === "success" ? ICONS.check : t.status === "pending" ? ICONS.clock : ICONS.x;
    const tagText = t.status === "success" ? "Successful" : t.status === "pending" ? "Pending settlement" : "Failed";

    const errorBlock = t.error ? `
      <div class="md-error">
        <div class="err-code">Error ${t.error.code}</div>
        <div class="err-msg">${t.error.msg}</div>
      </div>` : "";

    const disputed = state.disputes.some((d) => d.tx.id === t.id);
    const canDispute = (t.status === "failed" || t.status === "pending") && !disputed;

    const actions = canDispute ? `
      <div class="md-actions">
        <button class="btn-dispute" data-dispute="${t.id}">${ICONS.x.replace('stroke-width="2.5"','stroke-width="2"')} Dispute Transaction</button>
        <button class="btn-share" data-share>Share Receipt</button>
      </div>`
      : `<div class="md-actions"><button class="btn-share" data-share style="flex:1">Share Receipt</button></div>`;

    $("#modalBody").innerHTML = `
      <div class="md-head">
        <div class="tx-icon tx--${t.status === "success" ? "success" : t.status}" style="background:var(--${t.status === "success" ? "primary-soft" : t.status === "pending" ? "amber-soft" : "red-soft"});color:var(--${t.status === "success" ? "green" : t.status === "pending" ? "amber" : "red"})">${statusIcon}</div>
        <div>
          <div class="md-amount">${naira(t.amount)}</div>
          <div class="md-sub">${m.label} • ${tagText}</div>
        </div>
      </div>
      ${errorBlock}
      <div class="md-rows">
        <div class="md-row"><span class="k">Customer</span><span class="v">${t.customer}</span></div>
        <div class="md-row"><span class="k">Transaction ID</span><span class="v">${t.id}</span></div>
        <div class="md-row"><span class="k">Merchant ID</span><span class="v">${t.merchantId}</span></div>
        <div class="md-row"><span class="k">Method</span><span class="v">${m.label}</span></div>
        <div class="md-row"><span class="k">Timestamp</span><span class="v">${t.date.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span></div>
        <div class="md-row"><span class="k">Status</span><span class="v" style="color:var(--${t.status === "success" ? "green" : t.status === "pending" ? "amber" : "red"})">${tagText}</span></div>
      </div>
      ${actions}`;

    const db = $("#modalBody [data-dispute]");
    if (db) db.addEventListener("click", () => {
      closeModal($("#txModal"));
      openDispute(t, 0);
      toast("Dispute filed with Nomba support");
      switchView("disputes");
    });
    const sh = $("#modalBody [data-share]");
    if (sh) sh.addEventListener("click", () => toast("Receipt link copied to clipboard"));

    showModal($("#txModal"));
  }

  /* ============================================================
     DISPUTES
     ============================================================ */
  const DISPUTE_STEPS = ["Reported", "Nomba Reviewing", "Resolved"];
  const SMART = {
    "E-204": { tip: "Ask the customer to confirm their account balance, then retry the tap. If it fails again, suggest an alternative card or bank transfer.", say: "Hi! The payment didn't go through — your bank reported insufficient funds. Could you try again or use a transfer?" },
    "E-117": { tip: "This was a network hiccup, not a real charge. Confirm no money left the customer, then simply retry the transaction.", say: "Sorry, our network timed out and nothing was charged. Let's try that payment one more time." },
    "E-330": { tip: "The amount entered doesn't match your POS. Re-enter the exact figure shown on your terminal before retrying.", say: "There was a small amount mismatch. Let me re-enter the correct total and we'll try again." },
    "E-451": { tip: "The sending bank reversed this transfer. Ask the customer for proof of debit; if none, request a fresh transfer.", say: "Your bank reversed the transfer, so it didn't reach us. Could you kindly resend the payment?" },
    "default": { tip: "Confirm the payment details with your customer and retry. Nomba support will verify the settlement on our end.", say: "Let's confirm the details and try the payment again." },
  };

  function openDispute(tx, step = 0, silent = false) {
    if (state.disputes.some((d) => d.tx.id === tx.id)) return;
    state.disputes.unshift({ tx, step, ts: new Date() });
    updateDisputeBadge();
    if (!silent && state.view === "disputes") renderDisputes();
    // auto-advance review -> resolved over time for demo realism
    advanceDispute(tx.id);
  }

  function advanceDispute(id) {
    const d = state.disputes.find((x) => x.tx.id === id);
    if (!d) return;
    const tick = () => {
      const dd = state.disputes.find((x) => x.tx.id === id);
      if (!dd || dd.step >= 2) return;
      dd.step++;
      updateDisputeBadge();
      renderHome();
      if (state.view === "disputes") renderDisputes();
      if (dd.step === 2) toast("A dispute was resolved by Nomba support");
      else setTimeout(tick, 12000 + Math.random() * 6000);
    };
    setTimeout(tick, 10000 + Math.random() * 6000);
  }

  function renderDisputes() {
    const wrap = $("#disputes");
    if (!state.disputes.length) {
      wrap.innerHTML = `
        <div class="empty">
          ${ICONS.check}
          <strong>No active disputes</strong>
          You're all caught up. Failed payments you report will appear here.
        </div>`;
      return;
    }
    wrap.innerHTML = state.disputes.map(disputeCard).join("");
    $$("[data-copy]", wrap).forEach((b) => b.addEventListener("click", () => {
      const txt = b.getAttribute("data-copy");
      navigator.clipboard && navigator.clipboard.writeText(txt).catch(() => {});
      toast("Message copied — ready to send");
    }));
    $$("[data-nudge]", wrap).forEach((b) => b.addEventListener("click", () => toast("Reminder sent to Nomba support")));
  }

  function disputeCard(d) {
    const t = d.tx;
    const code = t.error ? t.error.code : "default";
    const smart = SMART[code] || SMART.default;
    const steps = DISPUTE_STEPS.map((name, i) => {
      const cls = i < d.step ? "done" : i === d.step ? (d.step === 2 ? "done" : "active") : "";
      const ic = i < d.step || (i === 2 && d.step === 2) ? ICONS.check : i === d.step ? ICONS.clock : "";
      const when = i <= d.step ? timeStr(new Date(d.ts.getTime() + i * 7 * 60000)) : "Awaiting";
      return `<div class="tl-step ${cls}"><div class="tl-dot">${ic}</div><div class="tl-body"><div class="tl-name">${name}</div><div class="tl-time">${when}</div></div></div>`;
    }).join("");

    const resolved = d.step === 2;
    return `
      <div class="dispute">
        <div class="dispute-top">
          <div class="tx-icon tx--failed" style="background:var(--red-soft);color:var(--red)">${ICONS.transfer}</div>
          <div class="dispute-info">
            <div class="dispute-cust">${t.customer}</div>
            <div class="dispute-meta">${METHOD[t.method].label} • ${t.id}</div>
          </div>
          <div class="dispute-amt">${naira(t.amount)}</div>
        </div>
        ${t.error ? `<div class="dispute-reason">${ICONS.x} ${t.error.code}: ${t.error.msg}</div>` : ""}
        <div class="timeline">${steps}</div>
        <div class="smart-box">
          <div class="smart-box-head">${ICONS.spark} Smart Suggestion</div>
          <p>${resolved ? "Resolved — funds reconciled. No further action needed. You can let the customer know the issue is sorted." : smart.tip}</p>
          <button class="smart-copy" data-copy="${smart.say.replace(/"/g, "&quot;")}">${ICONS.transfer} Copy message for customer</button>
        </div>
        ${resolved ? "" : `<button class="dispute-btn" data-nudge style="background:var(--surface-2);color:var(--text);box-shadow:none;border:1px solid var(--border)">Nudge Nomba Support</button>`}
      </div>`;
  }

  function updateDisputeBadge() {
    const open = state.disputes.filter((d) => d.step < 2).length;
    const badge = $("#disputeBadge");
    if (open > 0) { badge.textContent = open; badge.hidden = false; }
    else badge.hidden = true;
  }

  /* ============================================================
     SUPPORT CHAT
     ============================================================ */
  const CHAT_REPLIES = [
    "Thanks for reaching out! I'm pulling up your account now.",
    "I can see your recent transactions. Could you share the transaction ID you're asking about?",
    "Got it — I've flagged this for our settlements team. You'll see an update within minutes.",
    "Good news: that payment is confirmed on our end and will reflect shortly.",
    "Is there anything else I can help you with today?",
  ];
  let chatTurn = 0;

  function initChat() {
    $("#chatLog").innerHTML = "";
    chatTurn = 0;
    const fname = state.user ? state.user.firstName : "there";
    addBubble("agent", `Hi ${fname} 👋 I'm your Nomba support assistant. How can I help with your payments today?`);
  }
  function addBubble(who, text) {
    const log = $("#chatLog");
    const b = document.createElement("div");
    b.className = "bubble " + who;
    b.textContent = text;
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
  }
  function agentTyping(then) {
    const log = $("#chatLog");
    const t = document.createElement("div");
    t.className = "bubble agent typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
    setTimeout(() => { t.remove(); then(); }, 1100 + Math.random() * 700);
  }

  /* ============================================================
     NAVIGATION
     ============================================================ */
  function switchView(view) {
    state.view = view;
    $$(".view").forEach((v) => v.classList.toggle("view--active", v.dataset.view === view));
    $$(".tab").forEach((t) => t.classList.toggle("tab--active", t.dataset.goto === view));
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (view === "home") renderHome();
    if (view === "activity") renderFeed();
    if (view === "disputes") renderDisputes();
  }

  /* ============================================================
     MODAL UTILS
     ============================================================ */
  function showModal(el) { el.hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal(el) { el.hidden = true; document.body.style.overflow = ""; }

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.innerHTML = `${ICONS.check.replace('stroke-width="2.5"','stroke-width="2"')} ${msg}`;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => { el.hidden = true; }, 320);
    }, 2600);
  }

  /* ============================================================
     THEME
     ============================================================ */
  function initTheme() {
    let saved;
    try { saved = localStorage.getItem("nomba-theme"); } catch (e) {}
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
    const toggle = () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("nomba-theme", next); } catch (e) {}
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next === "dark" ? "#07110e" : "#0b8f6a");
    };
    $$(".theme-toggle").forEach((btn) => btn.addEventListener("click", toggle));
  }

  /* ============================================================
     EVENT WIRING
     ============================================================ */
  function wire() {
    // tab + goto buttons
    $$("[data-goto]").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.goto)));

    // filters
    $("#filters").addEventListener("click", (e) => {
      const f = e.target.closest(".filter");
      if (!f) return;
      state.filter = f.dataset.filter;
      $$(".filter").forEach((x) => x.classList.toggle("filter--active", x === f));
      renderFeed();
    });

    // tx modal close
    $("#modalClose").addEventListener("click", () => closeModal($("#txModal")));
    $("#txModal").addEventListener("click", (e) => { if (e.target.id === "txModal") closeModal($("#txModal")); });

    // support chat
    $("#supportBtn").addEventListener("click", () => { initChat(); showModal($("#chatModal")); $("#chatField").focus(); });
    $("#chatClose").addEventListener("click", () => closeModal($("#chatModal")));
    $("#chatModal").addEventListener("click", (e) => { if (e.target.id === "chatModal") closeModal($("#chatModal")); });
    $("#chatForm").addEventListener("submit", (e) => {
      e.preventDefault();
      if (e.nativeEvent && e.nativeEvent.isComposing) return;
      const field = $("#chatField");
      const val = field.value.trim();
      if (!val) return;
      addBubble("me", val);
      field.value = "";
      agentTyping(() => addBubble("agent", CHAT_REPLIES[Math.min(chatTurn++, CHAT_REPLIES.length - 1)]));
    });

    // esc to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!$("#txModal").hidden) closeModal($("#txModal"));
        if (!$("#chatModal").hidden) closeModal($("#chatModal"));
        if (!$("#profileModal").hidden) closeModal($("#profileModal"));
      }
    });
  }

  /* ============================================================
     AUTH / SESSION
     ============================================================ */
  function titleCase(str) {
    return str.replace(/[^a-zA-Z]+/g, " ").trim().split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  function makeUser(loginId, viaGoogle) {
    if (viaGoogle) {
      return { firstName: "Adaeze", name: "Adaeze Okafor", business: "Adaeze's Stores",
        email: "adaeze.okafor@gmail.com", merchantId: "NMB-" + (Math.floor(Math.random() * 90000) + 10000), via: "google" };
    }
    const raw = (loginId || "").trim();
    const handle = raw.includes("@") ? raw.split("@")[0] : raw;
    const pretty = titleCase(handle) || "Merchant";
    const first = pretty.split(" ")[0];
    const email = raw.includes("@") ? raw : handle.toLowerCase() + "@business.com";
    const hasBizWord = /\b(store|stores|shop|ventures|enterprise|enterprises|mart|hub|foods|global)\b/i.test(pretty);
    const business = hasBizWord ? pretty : pretty + "'s Store";
    return { firstName: first, name: pretty, business,
      email, merchantId: "NMB-" + (Math.floor(Math.random() * 90000) + 10000), via: "password" };
  }

  function saveSession(user) {
    try { localStorage.setItem("nomba-session", JSON.stringify(user)); } catch (e) {}
  }
  function loadSession() {
    try { return JSON.parse(localStorage.getItem("nomba-session") || "null"); } catch (e) { return null; }
  }

  function showAuth() {
    $("#authScreen").hidden = false;
    $("#app").hidden = true;
  }

  function enterApp(user, animate) {
    state.user = user;
    saveSession(user);
    const auth = $("#authScreen");
    const reveal = () => {
      auth.hidden = true;
      auth.classList.remove("is-leaving");
      $("#app").hidden = false;
      bootApp();
    };
    if (animate) {
      auth.classList.add("is-leaving");
      setTimeout(reveal, 440);
    } else {
      reveal();
    }
  }

  function bootApp() {
    if (appBooted) { renderHome(); return; }
    appBooted = true;
    setDate();
    seed();
    wire();
    renderHome();
    updateDisputeBadge();
    startLive();
  }

  function logout() {
    try { localStorage.removeItem("nomba-session"); } catch (e) {}
    location.reload();
  }

  function wireAuth() {
    // password visibility
    $("#passToggle").addEventListener("click", () => {
      const inp = $("#loginPass");
      inp.type = inp.type === "password" ? "text" : "password";
      $("#passToggle").setAttribute("aria-label", inp.type === "password" ? "Show password" : "Hide password");
    });

    // email/username + password login
    $("#loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      if (e.nativeEvent && e.nativeEvent.isComposing) return;
      const id = $("#loginId").value.trim();
      const pass = $("#loginPass").value;
      const err = $("#authError");
      if (!id) { return showAuthError("Please enter your email or username."); }
      if (pass.length < 4) { return showAuthError("Password must be at least 4 characters."); }
      err.hidden = true;
      const btn = $("#signinBtn");
      btn.classList.add("loading");
      btn.textContent = "Signing in";
      setTimeout(() => enterApp(makeUser(id, false), true), 850);
    });

    // google
    $("#googleBtn").addEventListener("click", () => {
      const btn = $("#googleBtn");
      btn.style.opacity = ".7"; btn.style.pointerEvents = "none";
      setTimeout(() => enterApp(makeUser(null, true), true), 750);
    });

    // benign links
    $("#forgotLink").addEventListener("click", (e) => { e.preventDefault(); showAuthError("Password reset isn't available in this demo — just sign in with any details."); });
    $("#signupLink").addEventListener("click", (e) => { e.preventDefault(); $("#loginId").focus(); });
  }

  function showAuthError(msg) {
    const err = $("#authError");
    err.textContent = msg;
    err.hidden = false;
    err.style.animation = "none";
    requestAnimationFrame(() => { err.style.animation = ""; });
  }

  /* ============================================================
     PROFILE DRAWER
     ============================================================ */
  function openProfile() {
    const u = state.user;
    if (!u) return;
    $("#profileName").textContent = u.business;
    $("#profileEmail").textContent = u.email;
    $("#profileMerchant").textContent = u.merchantId;

    const t = computeTotals();
    const rate = t.success + t.failed > 0 ? Math.round((t.success / (t.success + t.failed)) * 100) : 100;
    const stats = [
      { label: "Received today", value: naira(t.received), sub: "across " + t.success + " payments", pos: true },
      { label: "Outstanding gap", value: naira(t.gap), sub: t.pending + " pending" },
      { label: "Success rate", value: rate + "%", sub: t.failed + " failed", pos: rate >= 80 },
      { label: "Open disputes", value: String(state.disputes.filter((d) => d.step < 2).length), sub: state.disputes.length + " total" },
    ];
    $("#profileStats").innerHTML = stats.map((s) => `
      <div class="pstat">
        <div class="pstat-label">${s.label}</div>
        <div class="pstat-value ${s.pos ? "pos" : ""}">${s.value}</div>
        <div class="pstat-sub">${s.sub}</div>
      </div>`).join("");

    showModal($("#profileModal"));
  }

  function wireProfile() {
    $("#avatarBtn").addEventListener("click", openProfile);
    $("#profileClose").addEventListener("click", () => closeModal($("#profileModal")));
    $("#profileModal").addEventListener("click", (e) => { if (e.target.id === "profileModal") closeModal($("#profileModal")); });
    $("#logoutBtn").addEventListener("click", logout);
    $$("[data-profile-action]").forEach((b) => b.addEventListener("click", () => {
      const action = b.getAttribute("data-profile-action");
      closeModal($("#profileModal"));
      if (action === "chat") { initChat(); showModal($("#chatModal")); $("#chatField").focus(); }
      else toast("Business settings are coming soon");
    }));
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    initTheme();
    wireAuth();
    wireProfile();

    const session = loadSession();
    if (session) {
      enterApp(session, false);
    } else {
      showAuth();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
