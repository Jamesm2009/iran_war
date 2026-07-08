# Iran War 2026 — Executive Intelligence Briefing -- STILL NEEDS UPDATE July 8th, 2026

An interactive, periodically updated intelligence assessment covering the geopolitical and socio-economic impact of the 2026 Iran conflict across eight countries: **Canada · Colombia · UK · Germany · South Africa · Australia · USA · Ukraine**.

---

## Repo Structure

```
/
iran_war/
  index.html          ← Vercel serves this at /
  data/
    a18.json           ← Fetched at /data/a18.json ✓
    manifest.json      ✓
    market_history.json ✓
    scenario_history.json ✓
  api/
    windward.js        ← Fix: rename from "windward" to "windward.js"
    claude.js          ← Existing
    market.js          ← Existing
  package.json
  vercel.json
```

---

## Environment Variables

Set in **Vercel dashboard → Settings → Environment Variables**. Tick Production, Preview, and Development for each.

| Variable            | Purpose                                   | Where to get it                                                        |
|---------------------|-------------------------------------------|------------------------------------------------------------------------|
| `ANTHROPIC_API_KEY` | Powers the AI intelligence panel          | [console.anthropic.com](https://console.anthropic.com)                 |
| `ALPHA_VANTAGE_KEY` | Live WTI crude and 10-year Treasury yield | [alphavantage.co](https://www.alphavantage.co/support/#api-key) — free |

Neither key is exposed to the browser. Both are read server-side by the Vercel functions in `/api/`.

---

## How the Briefing Works

### Five Tabs

| Tab              | Purpose                                                                                          | Update frequency        |
|------------------|--------------------------------------------------------------------------------------------------|-------------------------|
| Overview         | Strategic conclusions, thematic deep-dives (expandable), market charts                          | Every assessment        |
| Scenarios        | Probability Cone Panel + four scenario cards with exact 90-day horizon windows and risk filters  | Every assessment        |
| Country Impact   | Eight country cards with Sc2/Sc3 impact comparison bars; click for full modal detail            | Every assessment        |
| Risk Register    | Likelihood × Impact scoring (max 25), sorted highest to lowest; expandable rationale rows       | When factors change     |
| Sources & Resources | Methodology, update guide, source categories, full change log                                | Occasional              |

> **Note:** Thematic Analysis (Energy, Food & Agriculture, Financial Stress) is embedded in the Overview tab as expandable sections, not a separate tab. The Change Log is embedded in the Sources & Resources tab.

### Live Market Data

- **WTI crude futures curve** — CME settles updated manually each assessment (embed actual settle prices in `wtiSettles` array)
- **US 10-year Treasury yield** — FRED DGS10 fetched via `/api/market?type=fred-dgs10` on page load; falls back to editorial estimate if endpoint unavailable
- Forward yields derived from CME ZN futures (ZNU6/ZNZ6) using modified duration ≈ 7.8; noted as implied, not spot
- Alpha Vantage 24-hour CDN cache — 25 calls/day free tier is effectively unlimited with caching in place

### Probability Cone Panel

A standalone interactive fan chart above the scenario cards in the Scenarios tab. Shows four scenario probability trajectories across three 90-day horizon windows, with filter-adjustable uncertainty bands.

**What it shows:** Central probability paths (solid lines) + analytical sensitivity range (shaded bands = all filters off vs all filters on). Not statistical confidence intervals — analytical sensitivity only.

**Seven filter chips** activate risk factors that shift displayed probabilities and reshape the cone. Each chip has an **ⓘ lightbox** showing the factor's full rationale and per-scenario delta values.

**Update cadence: every assessment (~2 weeks).** Three items to update:

```javascript
// 1. Current assessment probabilities
const CONE_BASE = [5, 22, 62, 11];  // [Sc1, Sc2, Sc3, Sc4]

// 2. Expected trajectory per scenario across three horizons (Now / Sep 2 / Dec 1)
const CONE_SC_TRENDS = [
  [5,  4,  3],   // Sc1 — Deal
  [22, 18, 15],  // Sc2 — Stalemate
  [62, 67, 71],  // Sc3 — Prolonged
  [11, 11, 11]   // Sc4 — Collapse
];

// 3. Update "was X%" text in the four HTML probability card elements:
// id="cm1" through id="cm4" — change the cone-prob-was span text
```

Filter chips and lightbox content (`CONE_FILTERS` array) only need updating when factor rationales or delta values change materially.

### AI Intelligence Panel

Removed from Assessment 9 onwards — replaced by the structured pre-build intelligence review workflow documented below. The `/api/claude.js` serverless function remains in the repo for potential future use.

---

## The DATA Object — Single Source of Truth

All editorial content lives in one `DATA` object near the bottom of `index.html` inside the `<script>` block. **This is the only place to edit for content updates.** Changes propagate automatically to all tabs, cards, charts, and the change log.

### Key Sections

```javascript
DATA.meta           // Assessment number, day counter, date
DATA.metrics        // Six hero metric cards (top of page)
DATA.priceMoves     // War-start vs current price comparison (four assets)
DATA.scenarios      // Probabilities, 90-day horizons, triggers — CANONICAL PROBABILITY SOURCE
DATA.filterMods     // Probability deltas per risk filter [sc1, sc2, sc3, sc4]
DATA.filters        // Risk filter labels and impact descriptions (7 filters, f1–f7)
DATA.countries      // Eight country assessments
DATA.riskFactors    // Risk factors with L×I scores and rationale
DATA.changeLog      // Audit trail — newest entry first
DATA.conclusions    // Strategic conclusions on Overview tab
```

**Separate from DATA** — the Probability Cone Panel has its own JavaScript constants at the top of the script block:

```javascript
CONE_BASE           // Current four probabilities — must match DATA.scenarios
CONE_SC_TRENDS      // Trajectory arrays for the fan chart
CONE_FILTERS        // Filter chip labels, impact text, and delta arrays
```

### Critical Rules

- **Scenario probabilities** exist only in `DATA.scenarios` — never repeated elsewhere. `CONE_BASE` must be updated to match after every probability change.
- **filterMods** deltas must sum to zero across each row (probability is redistributed, not created)
- **changeLog** entries go at the top of the array — newest first
- **assessment** number in `DATA.meta` increments with every material update
- **Horizon text** in `DATA.scenarios` uses exact calendar dates (Now → Sep 2, Sep 2 → Dec 1, Dec 1 → Mar 2) — not generic "0–3 months"

---

## Editorial Review — Step by Step

### Intelligence Review (Before Touching Code)

1. Gather intelligence package — ISW daily updates, Al Jazeera live blog, Axios, NBC National Security, HormuzLetter, KobeissiLetter, TheIranWatcher
2. Run parallel web searches: corroborating evidence · contrary evidence · specific mechanism/deal-gap implication
3. Review all four deal gaps — have any materially moved?
4. Check scenario trigger conditions against recent events
5. Check market signals — WTI above/below $100 pain threshold? 10-year yield approaching 5%?

**Core question before updating anything:**

> *Has the fundamental strategic picture changed, or have events confirmed the existing picture?*

Produce a structured analytical memo covering recommended probability shifts (with explicit reasoning), risk factor changes, country card updates, and what to cut before adding. Confirm all changes before writing any code.

---

### Update Sequence — Always Follow This Order

#### Step 1 — Scenario Probabilities (update first)

Everything else flows from the scenario balance.

- Move current `prob` to `was`, set the new `prob`, update `trend` arrow (▲ / ▼ / →)
- All four must sum to 100%
- Every movement requires stated reasoning
- Update `horizons` text when the outlook materially changes — rewrite for what actually belongs in each time window, do not mechanically relabel old content
- **Also update `CONE_BASE`** to match the new probabilities, and revise `CONE_SC_TRENDS` to reflect the updated trajectory

```javascript
// Example: Scenario 3 moving from 48% to 62%
{ id:3, prob:62, was:48, trend:"▲", ... }

// And in CONE_BASE:
const CONE_BASE = [5, 22, 62, 11];
```

#### Step 2 — Risk Register

For each factor ask:

- Has the `l` (likelihood) score changed? (1–5)
- Has the `i` (impact) score changed? (1–5)
- Has `active` status changed?
- Does the `rationale` text need updating?

Score ≥ 20 = Critical · 15–19 = High · < 15 = candidate for removal.

**Adding a new risk factor:** Assign the next sequential ID. If the factor scores 20+ (Critical) with scenario implications, add a corresponding row to `DATA.filterMods` and `DATA.filters`. The new `filterMods` row must sum to zero. Also add a new chip to `CONE_FILTERS` if appropriate.

#### Step 3 — Thematic Deep Dives

Three themes embedded in the Overview tab: **Energy (crude + diesel/refined products)**, **Food & Agriculture**, **Financial Stress**.

For each:

- Is there new data that changes the analysis?
- Has the TL;DR changed?
- Update the freshness badge — `fresh-updated` with new date, or `fresh-unchanged` with last-reviewed date

**Energy note:** Always assess crude AND refined products (diesel, jet fuel) separately. The indirect exposure chain — Gulf crude → Asian refinery → finished diesel → import-dependent economy — affects UK, Germany, Australia, and South Africa even without direct Gulf crude imports. This is a refinery grade configuration problem (Gulf medium-sour vs US light-sweet WTI), not just a price problem.

#### Step 4 — Country Cards

Eight fields per card: `direction` · `inflation` · `gdp` · `sc3inf` · `sc3gdp` · `vulnerability` · `primaryScenario` · `primaryTheme` · `detail`

Country impact figures are **directional estimates** (calibrated against IMF, Oxford Economics, and Bloomberg Economics ranges — approximately ±1pp variance). Label them as such; do not present as point forecasts.

#### Step 5 — Strategic Conclusions

- Order by analytical priority: most critical first, positive findings last
- Classify each: `critical` / `normal` / `positive`
- Target 60–80 words per conclusion — executive-grade concision
- Re-read all conclusions for factual currency before publishing

#### Step 6 — Change Log

Prepend a new entry at the top of `changeLog`:

```javascript
{ date:"Jun 7", assessment:11, factor:"Description of what changed",
  detail:"From what → to what, and why it matters.",
  dir:"worse",           // worse | better | watch
  scope:"Sc+Countries",  // Scenarios | Countries | Themes | Sc+Countries | Themes+Countries | All sections
  sig:"critical"         // critical | high | watch
}
```

#### Step 7 — Meta

Update assessment number, day counter, and date:

```javascript
meta: { assessment:11, day:101, date:"June 7, 2026" }
```

Also update: navbar (`nav-meta` span text) · hero dateline · footer · page `<title>` tag.

---

### What Triggers a New Assessment vs. a Data Refresh

| Situation                                          | Response                              |
|----------------------------------------------------|---------------------------------------|
| Scenario probability moves ≥ 5pp                   | New assessment number                 |
| A new risk factor becomes active                   | New assessment number                 |
| A deal gap closes or opens                         | New assessment number                 |
| A country's risk level changes                     | New assessment number                 |
| A new geographic front opens                       | New assessment number                 |
| Thematic analysis materially revised               | New assessment number                 |
| Market data moves but analysis unchanged           | Data refresh only — no new assessment |
| Intelligence confirms existing picture             | Note in change log only               |

---

### Pre-Publish Quality Check

Run through this before every commit:

- [ ] JavaScript syntax check passes (`node --check` on extracted script block)
- [ ] Scenario probabilities sum to 100%
- [ ] Every `was` value matches the previous `prob` value
- [ ] Trend arrows (▲ ▼ →) are correct for each scenario
- [ ] `CONE_BASE` matches `DATA.scenarios` probabilities
- [ ] `CONE_SC_TRENDS` trajectories reviewed and updated
- [ ] Change log has an entry for every section that changed
- [ ] No scenario probability appears anywhere except `DATA.scenarios` and `CONE_BASE`
- [ ] Every country marked `direction: "worse"` has a corresponding change log entry
- [ ] Assessment number and date updated in `DATA.meta`, navbar, hero dateline, footer, and `<title>` tag
- [ ] Freshness badges reference correct assessment number
- [ ] Horizon windows contain content appropriate to that time window (not mechanically relabelled)
- [ ] Strategic conclusions ordered by priority, 60–80 words each, factually current
- [ ] `filterMods` deltas sum to zero across all 7 rows (f1 through f7)
- [ ] `CONE_FILTERS` delta arrays also sum to zero across all 7 rows

---

### Risk Filter Modifiers

The `DATA.filterMods` object controls how activating each risk filter adjusts the scenario card probabilities. Values are deltas applied to `[sc1, sc2, sc3, sc4]` and **must sum to zero** across each row. The `CONE_FILTERS` array in the Probability Cone Panel uses separate (but related) delta arrays — verify both when adding or changing a filter.

There are currently **7 filters** (f1–f7):

```javascript
filterMods: {
  f1: [-5, -3,  8,  0],  // IRGC Geographic Escalation — military escalation driver
  f2: [-4, -2,  6,  0],  // IRGC / Govt Split — deal enforceability risk
  f3: [-3, -1,  4,  0],  // Netanyahu Undermining — Lebanon gap blocker / principal-agent trap
  f4: [ 2, -3,  2, -1],  // Bond Market Stress — financial feedback loop (ACTIVE A11)
  f5: [ 1, -2,  3, -2],  // EU Gas Storage Crisis — winter energy risk
  f6: [-3,  4,  2, -3],  // US Munitions Depleted — reduces US leverage
  f7: [-2, -1,  3,  0],  // Stagflation Trap (medium-term) — 3–9 month lag
}
```

Update `filterMods` whenever a factor's structural weight on the scenario balance changes materially. When adding a new filter, verify the new row sums to zero before committing.

---

## Assessment History

| Assessment | Date             | Day  | Sc1 | Sc2 | Sc3 | Sc4 | Key Development                                                                                                        |
|------------|------------------|------|-----|-----|-----|-----|------------------------------------------------------------------------------------------------------------------------|
| 1          | May 13, 2026     | 14   | 20% | 40% | 32% | 8%  | Original briefing — Brent ~$112, deal probability ~20%, ceasefire fragile                                             |
| 2          | May 26–27, 2026  | 87   | 20% | 40% | 32% | 8%  | Ceasefire breached, MOU framework confirmed, bond stress peak                                                         |
| 3          | May 28, 2026     | 89   | 14% | 37% | 43% | 6%  | IRGC strikes Kuwait US base — Scenario 3 raised to 43%                                                               |
| 4          | May 28, 2026     | 89   | 14% | 37% | 43% | 6%  | Diesel/refined products analysis — Australia risk Elevated→High; S. Africa fiscal crisis; UK/Germany revised up       |
| 5          | May 30, 2026     | 91   | 10% | 40% | 42% | 8%  | MOU confirmed as Sc2 architecture; IRGC field actions contradict diplomatic track; Goldman Sachs inventory floor; UAE coalition; NATO 3.0; f7 added |
| 6          | May 30, 2026     | 92   | 22% | 42% | 28% | 8%  | Sc3 reconciled; Canada technical recession; Colombia 100bp hike; UK Q1 beat; Ukraine contraction; S. Africa hike      |
| 7          | Jun 2, 2026      | 94   | 10% | 33% | 46% | 11% | Sc3 base case confirmed; talks suspended; PSGA toll system confirmed; mid-July supply cliff revised; Super El Niño; six strategic clocks added |
| 8          | Jun 3, 2026      | 95   | 10% | 33% | 46% | 11% | Tabs 7→5 structural review; F10 revised to Critical; JPMorgan inventory floor embedded; country impact figures labelled directional |
| 9          | Jun 4, 2026      | 96   | 8%  | 31% | 49% | 12% | Iran nuclear capability claim (unverified); House War Powers 215-208; juntocracy framing; IRGC militia fracturing; F19, F20 added |
| 10         | Jun 5, 2026      | 99   | 7%  | 33% | 48% | 12% | Mina al Fahal drone attack; Russia-Iran $25B Rosatom MOU; Iran oil exports collapse 84%; UK/France 15-nation mine-clearing mission; ISM 71.3; all 8 country cards revised |
| 11         | Jun 7, 2026      | 101  | 5%  | 22% | 62% | 11% | Iran fires 4-wave missile salvo on Israel (Op True Promise 5); IRGC voids April 8 ceasefire via Fars News; Iran declares deal "no longer feasible"; Netanyahu strikes Beirut defying Trump twice; principal-agent trap active; F4 activated; F22 added; Probability Cone Panel added |

---

## Technical Notes

### JavaScript Syntax Check (run before every deploy)

A syntax error in the DATA object breaks the entire briefing — all tabs, charts, and cards stop working silently. Always validate before deploying:

```bash
# Node cannot parse HTML directly — extract the script block first
# Then check the extracted JS:
node --check extracted_script.js
```

Any `Unexpected token` error points to a missing comma, unclosed quote, or merged object. **Most common failure modes:**

- Missing comma after the `changeLog` array closing bracket
- Missing comma between the `scenarios` array and `filterMods` (introduced when replacing scenarios block)
- Merged changelog entries (two objects run together without comma separator)
- Changelog entries appended (not prepended) to the array

### Deploying Updates

1. Edit `index.html` (DATA object + CONE constants only for content updates)
2. Extract script block and run syntax check
3. Commit and push to GitHub
4. Vercel auto-deploys within ~30 seconds
5. Hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) to clear browser cache

### If Vercel Doesn't Pick Up Changes

1. Go to GitHub → your repo → the file → pencil icon (Edit)
2. Make a trivial change (add/remove a blank line)
3. Commit directly in GitHub
4. Vercel detects the commit and redeploys

### Market Data

- **WTI chart:** Uses actual CME settle prices embedded in the `wtiSettles` array — update manually each assessment with real CME data
- **Treasury chart:** FRED DGS10 fetched via `/api/market?type=fred-dgs10` (James holds the FRED API key, stored as Vercel env var). Falls back to editorial estimate array if endpoint unavailable. Forward yields derived from CME ZN futures using MD ≈ 7.8
- **CME futures data:** Manually refreshed each assessment — WTI backwardation curve and ZN Treasury note futures
- **Hardcoded editorial fallback:** When live endpoints unavailable, clearly labelled estimates are used

### Four Deal Gaps Table — Column Widths

The deal gaps table uses `table-layout: fixed` with a `<colgroup>` defining explicit column widths. If columns appear incorrectly proportioned, verify both are present:

```html
<table> <!-- must have table-layout:fixed in CSS -->
  <colgroup>
    <col style="width:10%">   <!-- Gap label -->
    <col style="width:22%">   <!-- US Position -->
    <col style="width:22%">   <!-- Iran Position -->
    <col style="width:16%">   <!-- IRGC -->
    <col style="width:30%">   <!-- Bridgeable? -->
  </colgroup>
```

Without `table-layout: fixed` in the CSS, browsers ignore `colgroup` widths entirely.

---

## Track Record Principle

After several assessments the change log becomes a forecast accuracy record. Review it periodically:

- Were probability movements directionally correct?
- Did the scenario that materialised match the highest-probability call?
- Were the time horizons accurate?
- Were country impact assessments borne out by subsequent data?

This discipline is what separates a credible intelligence product from a news summary.

---

*Analytical briefing — projections as of latest assessment date, subject to revision. Not financial advice.*
