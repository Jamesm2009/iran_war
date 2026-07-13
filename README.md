# 403(b) Trade P&L Tracker

Next.js 14 dashboard for tracking trade decisions, fund allocations, dividends, and P&L in your Eagle Mountain International Church 403(b) plan.

## Quick Start

### 1. Push to GitHub
Open this folder in **GitHub Desktop** (or upload via GitHub.com) and push to a new repo called `trade-tracker`.

### 2. Connect to Vercel
- Go to [vercel.com/new](https://vercel.com/new)
- Import the `trade-tracker` repo
- Add these **Environment Variables** before deploying:

| Variable | Value |
|----------|-------|
| `UPSTASH_REDIS_REST_URL` | `https://valued-flounder-79434.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | *(your Upstash token from the Upstash console)* |
| `DASHBOARD_PASSWORD` | *(your chosen password)* |

- Click **Deploy**

### 3. Seed the Data
Go to your deployed site → **Admin → Seed Data** → upload your `401k_Trade_Tracker` xlsx file → **Upload & Seed Redis**.
The spreadsheet is parsed entirely in your browser, so no terminal or local install is needed.

This loads transactions, transfer detail, dividend detail, trade decisions, fund YTD summaries, and fund universe into Redis with a `tt_` prefix (separate from `mf_dashboard_cache`, which lives in the same Upstash database).

---

## Keeping Data Current

There are three separate update paths, and they capture different things. Knowing which one to use for which kind of update matters.

### A. Weekly Balance (Admin → Weekly Balance)
**Use for:** a quick balance check-in between transactions — e.g. logging what Empower shows on a Friday even though nothing happened that week.

**Captures:** total account balance, per-fund balances (recalculates the allocation pie chart), and optionally the TRRLX (Target Date 2060) share price, which builds the benchmark comparison chart over time.

**Does NOT capture:** individual transactions, dividends, fees, or transfer line items. The Activity Log and Dividend tabs will not grow from this form alone.

Frequency: as often as you like — weekly, or whenever you check the balance. Safe to run multiple times on the same date; it overwrites that date's entry instead of duplicating it.

### B. Trade Decision (Admin → Trade Decision)
**Use for:** logging a deliberate rebalance — a strategic "sell X, buy Y" decision, the kind that shows up as a card on the Trade P&L tab.

**Captures:** one trade entry with funds sold/bought, amounts, notes, and macro regime tag.

Frequency: whenever you make a rebalancing decision.

### C. Full Spreadsheet Re-seed (Admin → Seed Data)
**Use for:** bringing in the detailed transaction history — individual transfers, dividends, and fees as reported by Empower — so the Activity Log, Dividend tab, and Fund Detail transfer timeline stay current.

**Captures:** everything — transactions, transfer detail, dividend detail, fund universe, YTD summary. This is currently the only way new line-item transactions get into the dashboard.

**Important — what survives a re-seed:** your Weekly Balance history and any TRRLX price snapshots you've entered are preserved and merged with the spreadsheet's own data (manual entries win on any date conflict). Trade Decisions are replaced with the current 13 rebalance entries baked into the seed script — if you've edited any of those 13 through the Admin panel, a re-seed will revert them. Everything else (transactions, transfer detail, dividend detail, YTD summary, fund universe) is fully replaced by whatever is in the spreadsheet at seed time.

**Workflow:** update your `401k_Trade_Tracker` spreadsheet with the new rows from your Empower statements (Transactions, Transfer Detail, Dividend Detail sheets), then re-upload it via Admin → Seed Data. Same file, refreshed data — no need for a new file version.

Frequency: whenever you want the Activity Log and Dividends tab to reflect new transactions. There's no granular "log one dividend" or "log one transfer" form yet — that's the next planned feature if the batch-spreadsheet workflow becomes tedious.

---

## Architecture

- **Framework**: Next.js 14 (App Router)
- **Database**: Upstash Redis (same instance as KCM mutual funds dashboard)
- **Charts**: Recharts
- **Auth**: Cookie-based password gate (middleware)
- **Redis prefix**: All keys use `tt_` to avoid collision
- **Spreadsheet parsing**: done client-side in the browser (SheetJS via CDN) when you seed through Admin — the server-side API route only writes the already-parsed JSON to Redis

## Known Ticker Corrections
Two tickers in the source spreadsheet don't match their real-world symbols. The seed script corrects these automatically on every upload:

| Spreadsheet Ticker | Corrected To | Fund |
|---|---|---|
| MQLAX | MCZZX | MML Barings Core Bond I |
| TRRJX | TRRLX | T. Rowe Price Retirement 2060 |

## Tabs

| Tab | Purpose |
|-----|---------|
| **Portfolio** | Balance, YTD return, allocation pie (by fund or asset class), fund-level performance breakdown, contributions-by-source, performance charts |
| **Trade P&L** | Trade decision cards with expandable transfer detail |
| **Fund Detail** | Click any fund for transfers, dividends, metrics |
| **Dividends** | Monthly income chart, by-fund breakdown, annualized yield |
| **Activity** | All transactions, filterable, expandable, CSV export |
| **Admin** | Weekly balance update, trade decision entry, spreadsheet seeding |

## Color Palette — "Coastal"
Navy headers → sand/brown cards → cream backgrounds.
