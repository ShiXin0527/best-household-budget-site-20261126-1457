/* MapleHome Budget app: hash router, localStorage store, dashboard, transactions,
   budgets and savings goals. All state lives in this browser only. */
const view = document.getElementById("view");
const KEY = "maplehome-v1";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

function loadStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw); if (s.transactions) return s; }
  } catch (e) { /* corrupted store: reseed below */ }
  return { transactions: seedTransactions(), budgets: Object.assign({}, DEFAULT_BUDGETS),
    goals: JSON.parse(JSON.stringify(DEFAULT_GOALS)) };
}
function saveStore() { localStorage.setItem(KEY, JSON.stringify(store)); }
let store = loadStore();
let currentMonth = "2026-11";

function monthTx(month) { return store.transactions.filter((t) => t.date.startsWith(month)); }
function sums(list) {
  const inc = list.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const exp = list.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);
  return { inc, exp, left: inc - exp };
}
function monthLabel(month) {
  const [y, m] = month.split("-");
  return MONTHS[Number(m) - 1] + " " + y;
}
function shiftMonth(month, d) {
  const [y, m] = month.split("-").map(Number);
  const dt = new Date(y, m - 1 + d, 1);
  return dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0");
}
function monthNav() {
  return `<div class="monthnav"><button class="btn small ghost" id="prevMonth" type="button">‹ Prev</button>
    <strong>${monthLabel(currentMonth)}</strong>
    <button class="btn small ghost" id="nextMonth" type="button">Next ›</button></div>`;
}
function bindMonthNav(redraw) {
  document.getElementById("prevMonth").addEventListener("click", () => { currentMonth = shiftMonth(currentMonth, -1); redraw(); });
  document.getElementById("nextMonth").addEventListener("click", () => { currentMonth = shiftMonth(currentMonth, 1); redraw(); });
}
function kpiCard(label, value, sub) {
  return `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div><div class="kpi-sub">${sub}</div></div>`;
}

function renderHome() {
  const list = monthTx(currentMonth);
  const s = sums(list);
  const byCat = {};
  list.filter((t) => t.type === "expense").forEach((t) => { byCat[t.category] = (byCat[t.category] || 0) + t.amount; });
  const slices = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a])
    .map((c) => ({ label: c, value: byCat[c], color: CATEGORY_COLORS[c] || "#9aa7b0" }));
  const months = ["2026-10", "2026-11"];
  const inc = months.map((m) => sums(monthTx(m)).inc);
  const exp = months.map((m) => sums(monthTx(m)).exp);
  const recent = store.transactions.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const over = CATEGORIES.filter((c) => (byCat[c] || 0) > store.budgets[c]);
  view.innerHTML = `
  <section class="hero"><h1>November, at a glance.</h1>
    <p>Income, spending, budgets and goals for the Rivera household — everything on one page.</p>
    ${monthNav()}</section>
  <section class="kpis">
    ${kpiCard("Income", money(s.inc), monthLabel(currentMonth))}
    ${kpiCard("Spending", money(s.exp), monthLabel(currentMonth))}
    ${kpiCard("Left over", money(s.left), s.left >= 0 ? "under budget overall" : "over budget overall")}
    ${kpiCard("Budget limits", money(Object.values(store.budgets).reduce((a, b) => a + b, 0)), "all categories")}
    ${kpiCard("Over budget", over.length ? over.join(", ") : "None", over.length ? "check the Budgets page" : "every category on track")}
    ${kpiCard("Savings goals", store.goals.length + " active", "see Goals for progress")}
  </section>
  <section class="panel"><h2>Where the money went — ${monthLabel(currentMonth)}</h2>
    ${slices.length ? `<canvas id="donut" role="img" aria-label="Donut chart of spending by category"></canvas>`
      : `<p class="empty">No spending recorded in ${monthLabel(currentMonth)} yet. <a href="#/transactions">Add a transaction</a> to see the breakdown.</p>`}
  </section>
  <section class="panel"><h2>Income vs spending</h2>
    <canvas id="monthBars" role="img" aria-label="Bar chart comparing October and November income and spending"></canvas>
    <p class="caption">October spending ${money(exp[0])} on ${money(inc[0])} income; November ${money(exp[1])} on ${money(inc[1])}.</p></section>
  <section class="panel"><h2>Recent transactions</h2>
    ${txTable(recent)}
    <p><a class="btn" href="#/transactions">All transactions</a></p></section>`;
  bindMonthNav(renderHome);
  if (slices.length) drawDonut(document.getElementById("donut"), slices, { height: 250 });
  drawMonthBars(document.getElementById("monthBars"), ["Oct 2026", "Nov 2026"], inc, exp);
}

function txTable(list) {
  if (!list.length) return `<p class="empty">No transactions match. Try clearing the filters, or add one below.</p>`;
  return `<table class="tbl"><thead><tr><th>Date</th><th>Note</th><th>Category</th><th>Type</th><th>Amount</th><th></th></tr></thead><tbody>
  ${list.map((t) => `<tr><td>${t.date}</td><td>${esc(t.note)}</td><td>${t.category}</td>
    <td class="${t.type}">${t.type === "income" ? "Income" : "Expense"}</td>
    <td class="${t.type}">${t.type === "income" ? "+" : "−"}${money(t.amount)}</td>
    <td><button class="del" type="button" data-del="${t.id}" aria-label="Delete ${esc(t.note)}">Delete</button></td></tr>`).join("")}
  </tbody></table>`;
}

function renderTransactions() {
  view.innerHTML = `
  <section class="hero small"><h1>Transactions</h1><p>Every dollar in and out — add, filter and remove entries.</p></section>
  <section class="panel"><h2>Add a transaction</h2>
    <form id="addForm" class="form">
      <label>Date <input name="date" type="date" value="2026-11-27" required></label>
      <label>Type <select name="type"><option value="expense">Expense</option><option value="income">Income</option></select></label>
      <label>Category <select name="category">${CATEGORIES.map((c) => `<option>${c}</option>`).join("")}</select></label>
      <label>Amount (USD) <input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required></label>
      <label class="wide">Note <input name="note" type="text" placeholder="e.g. Weekly shop" maxlength="80" required></label>
      <button class="btn" type="submit">Add transaction</button>
      <span id="addMsg" class="caption" role="status"></span>
    </form></section>
  <section class="panel"><h2>All transactions</h2>
    <div class="search-row">
      <select id="fType" aria-label="Filter by type"><option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option></select>
      <select id="fCat" aria-label="Filter by category"><option value="">All categories</option>${CATEGORIES.map((c) => `<option>${c}</option>`).join("")}</select>
      <input id="fText" type="search" placeholder="Search notes…" aria-label="Search notes">
      <button class="btn small outline" id="resetData" type="button">Reset demo data</button>
    </div>
    <div id="txWrap"></div>
    <p class="caption" id="txCount"></p></section>`;
  let fType = "", fCat = "", fText = "";
  const draw = () => {
    const list = store.transactions.slice().sort((a, b) => b.date.localeCompare(a.date))
      .filter((t) => (!fType || t.type === fType) && (!fCat || t.category === fCat)
        && (!fText || t.note.toLowerCase().includes(fText)));
    document.getElementById("txWrap").innerHTML = txTable(list);
    document.getElementById("txCount").textContent = list.length + " of " + store.transactions.length + " transactions shown.";
    document.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
      store.transactions = store.transactions.filter((t) => t.id !== b.dataset.del);
      saveStore(); draw();
    }));
  };
  document.getElementById("fType").addEventListener("change", (e) => { fType = e.target.value; draw(); });
  document.getElementById("fCat").addEventListener("change", (e) => { fCat = e.target.value; draw(); });
  document.getElementById("fText").addEventListener("input", (e) => { fText = e.target.value.trim().toLowerCase(); draw(); });
  document.getElementById("resetData").addEventListener("click", () => {
    store = { transactions: seedTransactions(), budgets: Object.assign({}, DEFAULT_BUDGETS),
      goals: JSON.parse(JSON.stringify(DEFAULT_GOALS)) };
    saveStore(); draw();
    document.getElementById("addMsg").textContent = "Demo data restored.";
  });
  document.getElementById("addForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const amount = Number(fd.get("amount"));
    if (!(amount > 0)) { document.getElementById("addMsg").textContent = "Enter an amount above $0."; return; }
    store.transactions.push({ id: "t" + Date.now(), date: fd.get("date"), type: fd.get("type"),
      category: fd.get("category"), amount, note: fd.get("note").trim() });
    saveStore(); e.target.reset();
    document.getElementById("addMsg").textContent = "Added — it is saved in this browser.";
    draw();
  });
  draw();
}

function renderBudgets() {
  const list = monthTx(currentMonth);
  const byCat = {};
  list.filter((t) => t.type === "expense").forEach((t) => { byCat[t.category] = (byCat[t.category] || 0) + t.amount; });
  view.innerHTML = `
  <section class="hero small"><h1>Budgets — ${monthLabel(currentMonth)}</h1>
    <p>Monthly limits per category. Change a limit and save — spending updates at once.</p>
    ${monthNav()}</section>
  <section class="panel"><div id="budgetList">
    ${CATEGORIES.map((c) => {
      const spent = byCat[c] || 0, limit = store.budgets[c];
      const pct = Math.min(100, Math.round(spent / limit * 100));
      const left = limit - spent;
      return `<div class="budget-row"><div class="budget-head"><strong>${c}</strong>
        <span>${money(spent)} of ${money(limit)} · ${left >= 0 ? money(left) + " left" : money(-left) + " over"}</span></div>
        <div class="bar"><div class="bar-fill ${left < 0 ? "over" : ""}" style="width:${pct}%"></div></div>
        <label class="limit">Monthly limit $ <input type="number" min="0" step="1" value="${limit}" data-budget="${c}"></label></div>`;
    }).join("")}</div>
    <p><button class="btn" id="saveBudgets" type="button">Save limits</button>
    <span id="budgetMsg" class="caption" role="status"></span></p>
    <p class="caption">Total limits ${money(Object.values(store.budgets).reduce((a, b) => a + b, 0))} a month.
    Spending so far in ${monthLabel(currentMonth)}: ${money(Object.values(byCat).reduce((a, b) => a + b, 0))}.</p></section>`;
  bindMonthNav(renderBudgets);
  document.getElementById("saveBudgets").addEventListener("click", () => {
    document.querySelectorAll("[data-budget]").forEach((inp) => {
      const v = Number(inp.value);
      if (Number.isFinite(v) && v >= 0) store.budgets[inp.dataset.budget] = Math.round(v);
    });
    saveStore(); renderBudgets();
    document.getElementById("budgetMsg").textContent = "Limits saved.";
  });
}

function renderGoals() {
  view.innerHTML = `
  <section class="hero small"><h1>Savings goals</h1><p>What the household is saving for — and how close each goal is.</p></section>
  <section class="panel"><div class="goals">
    ${store.goals.map((g) => {
      const pct = Math.min(100, Math.round(g.saved / g.target * 100));
      return `<article class="goal"><h3>${esc(g.name)}</h3><p>${esc(g.note)}</p>
        <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
        <p><strong>${money(g.saved)}</strong> of ${money(g.target)} · ${pct}%</p>
        <form class="goal-form" data-goal="${g.id}">
          <label>Add savings $ <input type="number" min="1" step="1" placeholder="100" required></label>
          <button class="btn small" type="submit">Add to goal</button></form></article>`;
    }).join("")}</div></section>
  <section class="panel"><h2>Start a new goal</h2>
    <form id="goalForm" class="form">
      <label class="wide">Goal name <input name="name" type="text" placeholder="e.g. New washing machine" maxlength="60" required></label>
      <label>Target (USD) <input name="target" type="number" min="1" step="1" placeholder="500" required></label>
      <label>Already saved (USD) <input name="saved" type="number" min="0" step="1" value="0"></label>
      <button class="btn" type="submit">Add goal</button>
      <span id="goalMsg" class="caption" role="status"></span></form></section>`;
  document.querySelectorAll(".goal-form").forEach((f) => f.addEventListener("submit", (e) => {
    e.preventDefault();
    const amt = Number(new FormData(f).get("amount") || f.querySelector("input").value);
    const g = store.goals.find((x) => x.id === f.dataset.goal);
    if (g && amt > 0) { g.saved += Math.round(amt); saveStore(); renderGoals(); }
  }));
  document.getElementById("goalForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    store.goals.push({ id: "g" + Date.now(), name: fd.get("name").trim(),
      target: Math.round(Number(fd.get("target"))), saved: Math.round(Number(fd.get("saved")) || 0), note: "Added by the household." });
    saveStore(); renderGoals();
    document.getElementById("goalMsg").textContent = "Goal added.";
  });
}

function route() {
  const hash = location.hash.replace(/^#\/?/, "");
  const page = hash.split("/")[0] || "home";
  document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === page));
  if (page === "transactions") renderTransactions();
  else if (page === "budgets") renderBudgets();
  else if (page === "goals") renderGoals();
  else renderHome();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);
route();
