# MapleHome Budget — Household Budget Planner

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/ShiXin0527/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/ShiXin0527/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

Entry for make.fun's **"Make the best household budget site"** bounty
(`best-household-budget-site-20261126-1457`, $50).

An original, fully offline household budget planner for a fictional four-person
household, seeded with realistic October–November 2026 income and spending.
Everything is stored only in the browser (localStorage) — no account, no network
request, nothing leaves the device.

## What it does

- **Dashboard** (`#/`): monthly income / spending / left-over, over-budget watch,
  spending donut by category, October-vs-November income/spending bars, recent
  transactions; month prev/next navigation.
- **Transactions** (`#/transactions`): add income/expense entries (date, type,
  category, amount, note), filter by type/category/text, delete entries, reset
  the demo data.
- **Budgets** (`#/budgets`): per-category monthly limits with spent-vs-limit bars,
  over/under amounts, editable limits that save immediately.
- **Goals** (`#/goals`): savings goals with progress bars, add-to-goal
  contributions, and a form to start a new goal.

Every control works and persists: add, delete, filter, edit limits, contribute
to goals, change months.

## Run it

```sh
node serve.ts          # serves app/ at http://localhost:8080
```

or serve `app/` with any static server and open `index.html`.

## Layout

- `main.ts` — entry program: copies `app/` + `screenshots/` to `/output` and
  writes `dossier.json` (Node 22).
- `app/index.html`, `app/style.css` — page shell and style.
- `app/data.js` — categories, seed transactions, default budgets and goals.
- `app/charts.js` — canvas donut + grouped-bar charts (no libraries).
- `app/main.js` — hash router, localStorage store, all views.
- `screenshots/` — 4 real renders of the site (desktop dashboard, transactions,
  budgets, phone goals).
- `vendor/makefun-frontend.ts` — kit copy, unchanged.

## License

MIT — see `LICENSE`.
