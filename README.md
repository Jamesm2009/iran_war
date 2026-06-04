# Iran War 2026 — Executive Intelligence Briefing

An interactive, periodically updated intelligence assessment covering the geopolitical and socio-economic impact of the 2026 Iran conflict across eight countries: **Canada · Colombia · UK · Germany · South Africa · Australia · USA · Ukraine**.

-----

## Repo Structure

```
/
├── index.html          # Main briefing — all content and logic
├── api/
│   ├── claude.js       # Vercel proxy → Anthropic API (AI intelligence panel)
│   └── market.js       # Vercel proxy → Alpha Vantage (live market data, 24hr cache)
└── README.md           # This file
```

-----

## Environment Variables

Set in **Vercel dashboard → Settings → Environment Variables**. Tick Production, Preview, and Development for each.

|Variable           |Purpose                                  |Where to get it                                                       |
|-------------------|-----------------------------------------|----------------------------------------------------------------------|
|`ANTHROPIC_API_KEY`|Powers the AI intelligence panel         |[console.anthropic.com](https://console.anthropic.com)                |
|`ALPHA_VANTAGE_KEY`|Live WTI crude and 10-year Treasury yield|[alphavantage.co](https://www.alphavantage.co/support/#api-key) — free|

Neither key is exposed to the browser. Both are read server-side by the Vercel functions in `/api/`.

-----

## How the Briefing Works

### Five Tabs (v8.0+)

|Tab                |Purpose                                                                                                     |Update frequency   |
|-------------------|------------------------------------------------------------------------------------------------------------|-------------------|
|Overview           |Strategic conclusions, strategic clocks, thematic analysis (expandable), market charts, AI panel (collapsed)|Every assessment   |
|Scenarios          |Four scenario paths with 0–3, 3–6, 6–9 month horizons and dynamic probability filters                       |Every assessment   |
|Country Impact     |Eight country cards with Sc2/Sc3 impact comparison bars                                                     |Every assessment   |
|Risk Register      |Active risk factors with Likelihood × Impact scoring, sorted highest to lowest                              |When factors change|
|Sources & Resources|Analysis framework, methodology, update checklist, source categories, change log                            |Every assessment   |

**Note:** From v8.0, the Thematic Analysis (Energy, Food, Financial Stress) lives as expandable sections within the Overview tab, and the Change Log is a collapsible section within Sources & Resources. This reduces tab overload for readers who can get overwhelmed by volume.

### Live Market Data

- **WTI crude spot price** and **US 10-year Treasury yield** fetched from Alpha Vantage via `/api/market` on page load
- Cached at Vercel CDN edge for 24 hours — all page loads share one API call per day
- Forward curves beyond spot are estimated shapes — clearly noted on charts
- Free tier (25 calls/day) is effectively unlimited with the cache in place

### AI Intelligence Panel

Collapsed by default (v8.0+) to reduce cognitive load for casual readers. Click the banner to expand. Five focus filters shape targeted web search queries:

|Filter                |What it searches for                             |
|----------------------|-------------------------------------------------|
|All Events            |Broadest scan — conflict + economic impact       |
|Military / Strikes    |IRGC actions, US responses, new fronts, weapons  |
|Diplomacy / Agreements|Deal signals, MOU updates, key statements        |
|Market / Economic     |Oil, bonds, inflation, currencies, sector impacts|
|New Attack Vectors    |Novel IRGC tactics, geographic escalations       |

Each filter triggers a fresh Claude API call with web search enabled. Results are not cached.

-----

## Analysis Framework

This briefing applies four analytical layers, in this order:

1. **Structural constraints first.** What physically cannot happen regardless of diplomacy? Hormuz mine-clearing takes months. Munitions replenishment takes years. EU gas storage physics are fixed by October. These are hard boundaries, not preferences.
1. **Incentive asymmetry.** Who has the shorter clock? Trump faces mid-July supply cliff + November midterms. The IRGC has no electoral clock, no bond market, no petrol constituency — and is monetising the stalemate. Clock asymmetry structurally favours Iran.
1. **Four deal gaps — all must close simultaneously.** Uranium, Lebanon/Hezbollah, Hormuz control, frozen funds. Any single gap blocks Scenario 1. Lebanon is currently least bridgeable.
1. **Scenario probability = base rate + risk filter sensitivity.** Probabilities are analyst judgement, not statistical modelling. Treat them as ordinal rankings rather than literal probabilities. The filter system shows directional sensitivity across scenarios.

The Freedman framing (Foreign Affairs, May 27): Trump cannot win on stated terms, cannot leave without appearing to lose, and cannot resume strikes given munitions depletion and War Powers constraints. This “exit problem” explains why Sc2 + Sc3 together account for ~79% of assessed probability.

-----

## The DATA Object — Single Source of Truth

All editorial content lives in one `DATA` object near the bottom of `index.html` inside the `<script>` block. **This is the only place to edit for content updates.** Changes propagate automatically to all tabs, cards, charts, and the change log.

### Key Sections

```javascript
DATA.meta           // Assessment number, day counter, date
DATA.metrics        // Six hero metric cards (top of page)
DATA.priceMoves     // War-start vs current price comparison
DATA.scenarios      // Probabilities, time horizons, triggers
DATA.filterMods     // Probability deltas per risk filter [sc1, sc2, sc3, sc4]
DATA.filters        // Risk filter labels and impact descriptions (7 filters)
DATA.countries      // Eight country assessments
DATA.riskFactors    // Active risk factors (score ≥ 15) with L×I scores and rationale
DATA.changeLog      // Audit trail — newest entry first
DATA.conclusions    // Strategic conclusions on Overview tab
```

### Critical Rules

- **Scenario probabilities** exist only in `DATA.scenarios` — never repeated elsewhere
- **filterMods** deltas must sum to zero across each row (probability is redistributed, not created)
- **changeLog** entries go at the top of the array — newest first
- **assessment** number in `DATA.meta` increments with every material update
- **Country impact figures** (inflation/GDP) are directional estimates ±~1pp — label them as such, not as point forecasts
- **Risk factors scoring below 15** are removed from the active register each assessment cycle

-----

## Editorial Review — Step by Step

### Before You Start

1. Run the AI panel on the Overview tab with each filter to survey what has changed
1. Check the four scenario trigger conditions against recent events
1. Check the four deal gaps — have any materially moved?
1. Review the market charts — is WTI above or below the $100 pain threshold? Is the 10-year yield approaching 5%?
1. Check futures curve backwardation — is the Jul+1/Jul+2 spread widening or narrowing? (Widening = market pricing longer disruption)

**Core question before updating anything:**

> *Has the fundamental strategic picture changed, or have events confirmed the existing picture?*

-----

### Update Sequence — Always Follow This Order

#### Step 1 — Scenario Probabilities (update first)

Everything else flows from the scenario balance.

- Do any probabilities need to move? If yes, by how much and why?
- Do all four still sum to 100%?
- Move current `prob` to `was`, set the new `prob`, update `trend` arrow (▲ / ▼ / →)
- Update `horizons` text for any scenario whose outlook has materially changed

```javascript
// Example: Scenario 3 moving from 46% to 50%
{ id:3, prob:50, was:46, trend:"▲", ... }
```

#### Step 2 — Risk Register

For each active factor ask:

- Has the `l` (likelihood) score changed? (1–5)
- Has the `i` (impact) score changed? (1–5)
- Does the `rationale` text need updating?
- Does any factor now score below 15? → Remove it

**Threshold rule (v8.0+):** Factors scoring below 15 are cut from the active register. Factors scoring 15–19 = High; 20+ = Critical.

**Adding a new factor:** Assign the next sequential ID. If score ≥ 20 (Critical), consider whether it also warrants a new `filterMods` row. Any new filterMods row must sum to zero.

#### Step 3 — Thematic Deep Dives

Three themes live in the Overview tab as expandable sections: **Energy**, **Food & Agriculture**, **Financial Stress**.

For each:

- Is there new data that changes the analysis?
- Has the TL;DR summary changed?
- Update the freshness badge date

**Energy theme specific:** Always consider both crude and refined products (diesel, jet fuel) separately. Also check the futures curve — is backwardation widening or narrowing? Update the Futures vs Spot callout with fresh data when available.

**Data credibility note:** Oil inventory figures have known reporting variance. Upgrade confidence language when multiple independent sources converge (IEA + EIA + Goldman Sachs + Bloomberg = high confidence). Single-source claims should be labelled accordingly.

#### Step 4 — Country Cards

For each country, ask:

- Has its risk level changed?
- Have the inflation or GDP impact estimates changed materially?
- Has the direction arrow changed?

**Labelling rule (v8.0+):** All CPI and GDP impact figures carry an implied ±~1pp variance. Include “directional estimate” language in methodology; do not present figures as point forecasts.

#### Step 5 — Strategic Conclusions

Review `DATA.conclusions` in order. Ask for each:

- Is this still analytically supported?
- Should it move up or down in priority?
- Is there a new conclusion that belongs here?

Maximum ~6 conclusions. Lead with the most actionable/most changed.

#### Step 6 — Change Log

Add one entry per material change. Format:

```javascript
{ date:"Jun 10", assessment:9, factor:"Short descriptive title",
  detail:"Full explanation of what changed and why.",
  dir:"worse|better|watch", scope:"Scenarios|Countries|Themes|All sections", sig:"critical|high|watch" }
```

#### Step 7 — Meta

Update assessment number, day counter, and date:

```javascript
meta: { assessment:9, day:103, date:"June 10, 2026" }
```

Also update: navbar meta spans, hero dateline, footer text, freshness badges on each section.

-----

### What Triggers a New Assessment vs. a Data Refresh

|Situation                                         |Response                             |
|--------------------------------------------------|-------------------------------------|
|Scenario probability moves ≥ 5pp                  |New assessment number                |
|A new risk factor becomes active (score ≥ 15)     |New assessment number                |
|A deal gap closes or opens                        |New assessment number                |
|A country’s risk level changes                    |New assessment number                |
|A new geographic front opens                      |New assessment number                |
|Thematic analysis materially revised              |New assessment number                |
|Market data moves but analysis unchanged          |Data refresh only — no new assessment|
|AI panel surfaces news confirming existing picture|Note in change log only              |

-----

### Pre-Publish Quality Check

Run through this before every commit:

- [ ] JavaScript syntax check passes (see Technical Notes below)
- [ ] Scenario probabilities sum to 100%
- [ ] Every `was` value matches the previous `prob` value
- [ ] Trend arrows (▲ ▼ →) are correct for each scenario
- [ ] Change log has an entry for every section that changed
- [ ] No scenario probability appears anywhere except `DATA.scenarios`
- [ ] Every country marked `direction: "worse"` has a corresponding change log entry
- [ ] Assessment number and date updated in `DATA.meta`, navbar, hero dateline, and footer
- [ ] Unchanged thematic sections show correct last-reviewed date in freshness badge
- [ ] Strategic conclusions read in order of analytical priority
- [ ] `filterMods` deltas sum to zero across all 7 rows (f1 through f7)
- [ ] No active risk factor scores below 15 (cut or justify retention)
- [ ] Country impact figures described as directional estimates, not point forecasts

-----

### Risk Filter Modifiers

The `DATA.filterMods` object controls how activating each risk filter adjusts displayed scenario probabilities. Values are deltas applied to `[sc1, sc2, sc3, sc4]` and **must sum to zero** across each row.

There are currently **7 filters** (f1–f7). Each corresponds to a Critical-rated risk factor (score ≥ 20) with meaningful scenario weighting implications:

```javascript
filterMods: {
  f1: [-5, -3,  8,  0],  // IRGC Geographic Escalation
  f2: [-4, -2,  6,  0],  // IRGC / Govt Split
  f3: [-3, -1,  4,  0],  // Netanyahu Undermining
  f4: [ 2, -3,  2, -1],  // Bond Market Stress
  f5: [ 1, -2,  3, -2],  // EU Gas Storage Crisis
  f6: [-3,  4,  2, -3],  // US Munitions Depleted
  f7: [-2, -1,  3,  0],  // Stagflation Trap (3–9 month lag)
}
```

Key watchpoints for f7 (Stagflation Trap): **ECB Jun 5**, **Fed Jun 18**, **BoE Jun 19**. A surprise pivot on falling energy prices would reduce this factor’s weight; confirmed holds or hikes lock it in.

-----

## Assessment History

|Assessment|Date           |Day  |Key Development                                                                                                                                                                                       |
|----------|---------------|-----|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|1         |May 13, 2026   |14   |Original briefing — Brent ~$112, deal probability ~20%, ceasefire fragile                                                                                                                             |
|2         |May 26–27, 2026|87–88|Ceasefire breached, MOU framework confirmed, bond stress peak                                                                                                                                         |
|3         |May 28, 2026   |89   |IRGC strikes Kuwait US base — Scenario 3 raised to 43%                                                                                                                                                |
|4         |May 28, 2026   |89   |Diesel/refined products analysis — Australia risk Elevated→High; S. Africa fiscal crisis confirmed; UK/Germany revised up                                                                             |
|5         |May 30, 2026   |91   |MOU confirmed as Sc2; IRGC field actions contradict diplomatic track; Goldman Sachs inventory floor; UAE coalition member; NATO 3.0; f7 added                                                         |
|6         |May 30, 2026   |92   |Sc3 reconciled to 28%; Canada technical recession; Colombia election + 100bp hike; UK GDP beat; Ukraine Q1 contraction; SA rate hikes; F17 added                                                      |
|7         |Jun 2, 2026    |95   |Sc3 raised to 46% (base case); Iran suspended talks; PSGA toll system confirmed; mid-July supply cliff; F18 nuclear demonstration added                                                               |
|8         |Jun 3, 2026    |97   |Structural review: 7→5 tabs; F13/F14/F17/F18 cut (all ≤12); F10 revised to Critical (IEA/EIA/GS inventory convergence); futures vs spot callout; analysis framework surfaced; Colombia election update|

-----

## Technical Notes

### JavaScript Syntax Check (run before every deploy)

A syntax error in the DATA object breaks the entire briefing. Always validate before deploying:

```bash
# Extract the script block from the HTML, then check it
node --check index.html
```

If Node doesn’t parse HTML directly, extract the `<script>` block manually and check it. Any `Unexpected token` error points to a missing comma, unclosed quote, or merged object.

### Deploying Updates

1. Edit `index.html` (DATA object only for content updates)
1. Run syntax check
1. Commit and push to GitHub
1. Vercel auto-deploys within ~30 seconds
1. Hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) to clear browser cache

### If Vercel Doesn’t Pick Up Changes

Go to GitHub → your repo → the file → pencil icon (Edit) → make a trivial change → commit. Vercel will detect and redeploy.

### Market Data Cache

24-hour CDN cache on `/api/market`. To force a fresh fetch: Vercel dashboard → Deployments → purge cache, or trigger a new deployment.

### Anthropic API Costs

Each AI panel click costs approximately $0.01–0.03. For a private briefing with a small audience, negligible.

-----

## Track Record Principle

After several assessments the change log becomes a forecast accuracy record. Review it periodically:

- Were probability movements directionally correct?
- Did the scenario that materialised match the highest-probability call?
- Were country impact assessments borne out by subsequent data?
- Did risk factors cut (score < 15) later re-emerge at higher scores?

This discipline is what separates a credible intelligence product from a news summary.

-----

*Analytical briefing — projections as of latest assessment date, subject to revision. Not financial advice.*