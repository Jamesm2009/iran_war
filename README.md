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

### Seven Tabs

|Tab              |Purpose                                                                              |Update frequency       |
|-----------------|-------------------------------------------------------------------------------------|-----------------------|
|Overview         |Strategic conclusions, AI intelligence panel, market charts                          |Every assessment       |
|Scenarios        |Four scenario paths with 0–3, 3–6, 6–9 month horizons and dynamic probability filters|Every assessment       |
|Country Impact   |Eight country cards with Sc2/Sc3 impact comparison bars                              |Every assessment       |
|Thematic Analysis|Deep dives on Energy (crude + diesel), Food & Agriculture, Financial Stress          |When new data available|
|Risk Register    |17-factor Likelihood × Impact scoring, sorted highest to lowest                      |When factors change    |
|Change Log       |Full audit trail of every assessment update                                          |Every assessment       |
|Sources          |Methodology, update discipline checklist, source categories                          |Occasional             |

### Live Market Data

- **WTI crude spot price** and **US 10-year Treasury yield** fetched from Alpha Vantage via `/api/market` on page load
- Cached at Vercel CDN edge for 24 hours — all page loads share one API call per day
- Forward curves beyond spot are estimated shapes (mild contango for WTI, flattish for rates) — clearly noted on charts
- Free tier (25 calls/day) is effectively unlimited with the cache in place

### AI Intelligence Panel

On the Overview tab, five focus filters shape targeted web search queries:

|Filter                |What it searches for                             |
|----------------------|-------------------------------------------------|
|All Events            |Broadest scan — conflict + economic impact       |
|Military / Strikes    |IRGC actions, US responses, new fronts, weapons  |
|Diplomacy / Agreements|Deal signals, MOU updates, key statements        |
|Market / Economic     |Oil, bonds, inflation, currencies, sector impacts|
|New Attack Vectors    |Novel IRGC tactics, geographic escalations       |

Each filter triggers a fresh Claude API call with web search enabled. Results are not cached — every click retrieves current intelligence. Claude is instructed to always return exactly 3 items and to draw on available knowledge if live search results are thin.

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
DATA.riskFactors    // 17 risk factors with scores and rationale
DATA.changeLog      // Audit trail — newest entry first
DATA.conclusions    // Strategic conclusions on Overview tab
```

### Critical Rules

- **Scenario probabilities** exist only in `DATA.scenarios` — never repeated elsewhere
- **filterMods** deltas must sum to zero across each row (probability is redistributed, not created)
- **changeLog** entries go at the top of the array — newest first
- **assessment** number in `DATA.meta` increments with every material update

-----

## Editorial Review — Step by Step

### Before You Start

1. Run the AI panel on the Overview tab with each filter to survey what has changed
1. Check the four scenario trigger conditions against recent events
1. Check the four deal gaps — have any materially moved?
1. Review the market charts — is WTI above or below the $100 pain threshold? Is the 10-year yield approaching 5%?

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
// Example: Scenario 3 moving from 28% to 35%
{ id:3, prob:35, was:28, trend:"▲", ... }
```

#### Step 2 — Risk Register

For each of the 17 factors ask:

- Has the `l` (likelihood) score changed? (1–5)
- Has the `i` (impact) score changed? (1–5)
- Has `active` status changed?
- Does the `rationale` text need updating?

**Adding a new risk factor:** Assign the next sequential ID (currently F18+). If the factor scores 20+ (Critical), consider whether it also warrants a new scenario filter entry in `DATA.filterMods` and `DATA.filters`. If added, the new filterMods row must sum to zero.

#### Step 3 — Thematic Deep Dives

Three themes to review — **Energy (crude + diesel/refined products)**, **Food & Agriculture**, **Financial Stress**.

For each:

- Is there new data that changes the analysis?
- Has the TL;DR summary changed?
- Update the freshness badge — `fresh-updated` with new date, or `fresh-unchanged` with last-reviewed date

**Note on Energy theme:** Always consider both crude oil and refined products (diesel, jet fuel) separately. The indirect exposure chain — Gulf crude → Asian refinery → import-dependent economy — affects UK, Australia, Germany, and South Africa through diesel even when crude import exposure appears limited.

**Note on embedded charts:** The Energy thematic section contains two embedded charts (Goldman Sachs global oil inventory drawdown; crude oil grades by API gravity and sulfur content). These are base64-encoded images embedded directly in the HTML — no external hosting required. To update them, replace the base64 string in the relevant `<img src="data:image/png;base64,...">` tag.

#### Step 4 — Country Cards

For each of the eight countries:

- Has `direction` changed? (`worse` / `same` / `better`)
- Have `inflation` or `gdp` impact numbers moved?
- Has `vulnerability` text changed?
- Has the dominant `primaryScenario` or `primaryTheme` changed?
- Has the `detail` paragraph changed?

**Diesel/refined products checklist per country:**

|Country    |Key diesel/fuel watch                                                                    |
|-----------|-----------------------------------------------------------------------------------------|
|🇦🇺 Australia|Diesel reserves (IEA 90-day standard); Asian refinery feedstock; domestic refinery status|
|🇬🇧 UK       |ARA diesel price; refining capacity; jet fuel import ratio                               |
|🇩🇪 Germany  |European diesel futures; logistics and industrial input costs                            |
|🇿🇦 S. Africa|Diesel levy relief cost vs contingency reserve; fuel subsidy fiscal pressure             |
|🇨🇴 Colombia |Transport diesel cost vs fertiliser cost — double compound; election cycle watch         |
|🇺🇦 Ukraine  |Agricultural diesel + fertiliser — triple constraint with war damage                     |
|🇺🇸 USA      |Domestic refining insulation; consumer diesel price at pump                              |
|🇨🇦 Canada   |Western Canada logistics; domestic refining capacity; tariff-driven recession watch      |

#### Step 5 — Strategic Conclusions

Re-read all conclusions:

- Are any factually wrong or outdated?
- Does the sequence still hold — most critical first?
- Add, remove, or reclassify (`critical` / `normal` / `positive`) as needed

#### Step 6 — Change Log

Add a new entry at the **top** of the `changeLog` array for each material change:

```javascript
{ date:"June X", assessment:7, factor:"What changed",
  detail:"From what → to what, and why it matters.",
  dir:"worse",           // worse / better / watch
  scope:"Sc+Countries",  // sections reviewed together
  sig:"critical"         // critical / high / watch
}
```

Scope options: `Scenarios` · `Countries` · `Themes` · `Sc+Countries` · `Themes+Countries` · `All sections`

#### Step 7 — Meta

Update assessment number, day counter, and date:

```javascript
meta: { assessment:7, day:103, date:"June 5, 2026" }
```

Also update the navbar and hero dateline — search for the previous assessment number and date, replace throughout.

-----

### What Triggers a New Assessment vs. a Data Refresh

|Situation                                         |Response                             |
|--------------------------------------------------|-------------------------------------|
|Scenario probability moves ≥ 5pp                  |New assessment number                |
|A new risk factor becomes active                  |New assessment number                |
|A deal gap closes or opens                        |New assessment number                |
|A country's risk level changes                    |New assessment number                |
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
- [ ] Assessment number and date updated in `DATA.meta` and in the navbar/hero dateline
- [ ] Unchanged thematic sections show correct last-reviewed date in freshness badge
- [ ] Thematic section badges do not reference a prior assessment number
- [ ] Strategic conclusions read in order of analytical priority
- [ ] `filterMods` deltas still sum to zero across **all 7 rows** (f1 through f7)

-----

### Risk Filter Modifiers

The `DATA.filterMods` object controls how activating each risk filter adjusts displayed scenario probabilities. Values are deltas applied to `[sc1, sc2, sc3, sc4]` and **must sum to zero** across each row.

There are currently **7 filters** (f1–f7). Each corresponds to a Critical-rated risk factor (score ≥ 20) with meaningful scenario weighting implications:

```javascript
filterMods: {
  f1: [-5, -3,  8,  0],  // IRGC Geographic Escalation — military escalation driver
  f2: [-4, -2,  6,  0],  // IRGC / Govt Split — deal enforceability risk
  f3: [-3, -1,  4,  0],  // Netanyahu Undermining — Lebanon gap blocker
  f4: [ 2, -3,  2, -1],  // Bond Market Stress — financial feedback loop
  f5: [ 1, -2,  3, -2],  // EU Gas Storage Crisis — winter energy risk
  f6: [-3,  4,  2, -3],  // US Munitions Depleted — reduces US leverage
  f7: [-2, -1,  3,  0],  // Stagflation Trap (medium-term) — 3–9 month lag
}
```

**Note on f7 (Stagflation Trap):** This filter operates on a longer transmission lag than the others — central bank decisions take 2–6 quarters to flow through the economy. It is weighted more conservatively (±2–3pp) than military escalation filters (±6–8pp). Key watchpoints for reassessing f7's weight: **ECB June 5**, **Fed June 18**, **BoE June 19**. A surprise pivot on falling energy prices would reduce this factor's weight; confirmed holds or hikes lock it in.

Update filterMods whenever a factor's structural weight on the scenario balance changes materially. When adding a new filter, verify the new row sums to zero before committing.

-----

## Assessment History

|Assessment|Date           |Day  |Key Development                                                                                                                                      |
|----------|---------------|-----|-----------------------------------------------------------------------------------------------------------------------------------------------------|
|1         |May 13, 2026   |14   |Original briefing — Brent ~$112, deal probability ~20%, ceasefire fragile                                                                            |
|2         |May 26–27, 2026|87–88|Ceasefire breached, MOU framework confirmed, bond stress peak                                                                                        |
|3         |May 28, 2026   |89   |IRGC strikes Kuwait US base — Scenario 3 raised to 43%                                                                                              |
|4         |May 28, 2026   |89   |Diesel/refined products analysis — Australia risk revised Elevated → High; S. Africa fiscal crisis confirmed; UK/Germany impact revised up           |
|5         |May 30, 2026   |91   |MOU confirmed as Sc2 architecture; IRGC field actions contradict diplomatic track; Goldman Sachs inventory floor embedded; UAE third coalition member revealed; NATO 3.0 fiscal addendum; oil grades chart embedded; f7 Stagflation Trap filter added|
|6         |May 30, 2026   |92   |Sc3 reconciled to 28% (A5 May 29 optimism partially reversed by overnight IRGC evidence and GS inventory data); Canada technical recession confirmed; Colombia election + 100bp emergency rate hike; UK Q1 GDP beat noted; Ukraine Q1 contraction; S. Africa rate hike + IIF downgrade; F17 Colombia political risk added|

-----

## Technical Notes

### JavaScript Syntax Check (run before every deploy)

A syntax error in the DATA object breaks the entire briefing — all tabs, charts, and the AI panel stop working. Always validate before deploying:

```bash
# In your project folder
node --check index.html
```

If that doesn't work (Node may not parse HTML directly), extract the script block manually and check it. Any `Unexpected token` error points to a missing comma, unclosed quote, or merged object in the DATA object.

### Deploying Updates

1. Edit `index.html` (DATA object only for content updates)
1. Run syntax check
1. Commit and push to GitHub
1. Vercel auto-deploys within ~30 seconds
1. Hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) to clear browser cache

### If Vercel Doesn't Pick Up Changes

If the GitHub → Vercel webhook isn't triggering a redeploy:

1. Go to GitHub → your repo → the file → pencil icon (Edit)
1. Make a trivial change (add/remove a blank line)
1. Commit directly in GitHub
1. Vercel will detect the commit and redeploy

### Market Data Cache

The 24-hour CDN cache on `/api/market` means Alpha Vantage is called at most once per day per endpoint. To force a fresh market data fetch (e.g. after a major intraday move), go to Vercel dashboard → Deployments → your deployment → purge cache, or trigger a new deployment.

### Alpha Vantage Free Tier

25 calls/day. With the 24hr cache this is effectively unlimited for normal publishing use. The limit resets at midnight UTC. During active development and testing, repeated page loads can exhaust the daily quota — this is normal and self-resolves overnight.

### Anthropic API Costs

Each AI panel Run Analysis click costs approximately $0.01–0.03 at current pricing (varies by response length and web search results). For a private briefing with a small audience this is negligible.

### AI Panel Behaviour

The AI panel searches the web and synthesises results. A few things to know:

- Web search availability varies — some query types return richer results than others on a given day
- Claude is instructed to always return 3 items and to draw on available knowledge if live search results are thin
- Results are not cached — each click makes a fresh API call
- The `All Events` filter is the most reliable — use it first if other filters return limited results

-----

## Track Record Principle

After several assessments the change log becomes a forecast accuracy record. Review it periodically:

- Were probability movements directionally correct?
- Did the scenario that materialised match the highest-probability call?
- Were the time horizons accurate?
- Were country impact assessments borne out by subsequent data?

This discipline is what separates a credible intelligence product from a news summary.

-----

*Analytical briefing — projections as of latest assessment date, subject to revision. Not financial advice.*
