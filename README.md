# Iran War 2026 — Executive Intelligence Briefing

An interactive, periodically updated intelligence assessment covering the geopolitical and socio-economic impact of the 2026 Iran conflict across eight countries: **Canada · Colombia · UK · Germany · South Africa · Australia · USA · Ukraine**.

Deployed at: `https://your-vercel-domain.vercel.app`

---

## Repo Structure

```
/
├── index.html          # Main briefing — all content and logic
├── api/
│   ├── claude.js       # Vercel proxy → Anthropic API (AI intelligence panel)
│   └── market.js       # Vercel proxy → Alpha Vantage (live market data, 24hr cache)
└── README.md           # This file
```

---

## Environment Variables

Set these in **Vercel dashboard → Settings → Environment Variables**. Tick Production, Preview, and Development for each.

| Variable | Purpose | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | Powers the AI intelligence panel | [console.anthropic.com](https://console.anthropic.com) |
| `ALPHA_VANTAGE_KEY` | Live WTI crude and 10-year Treasury yield | [alphavantage.co](https://www.alphavantage.co/support/#api-key) — free |

Neither key is exposed to the browser. Both are read server-side by the Vercel functions in `/api/`.

---

## How the Briefing Works

### Content Structure — 7 Tabs

| Tab | Purpose | Update frequency |
|---|---|---|
| Overview | Strategic conclusions, AI intelligence panel, market charts | Every assessment |
| Scenarios | Four scenario paths with 0–3, 3–6, 6–9 month horizons and dynamic probability filters | Every assessment |
| Country Impact | Eight country cards with Sc2/Sc3 impact comparison | Every assessment |
| Thematic Analysis | Deep dives on Energy, Food & Agriculture, Financial Stress | When new data available |
| Risk Register | 15-factor Likelihood × Impact scoring, sorted highest to lowest | When factors change |
| Change Log | Full audit trail of every assessment update | Every assessment |
| Sources | Methodology, update discipline checklist, source categories | Occasional |

### Live Data

- **WTI crude spot price** — fetched from Alpha Vantage on page load, cached at Vercel CDN edge for 24 hours. All page loads within 24 hours share one API call.
- **US 10-year Treasury yield** — same mechanism.
- Forward curves beyond the spot price are estimated shapes (mild contango for WTI, flattish for rates) — not real futures data. This is noted clearly on the chart.

### AI Intelligence Panel

On the Overview tab, the Run Analysis button calls Claude via `/api/claude` with web search enabled. Five focus filters shape the query: All Events, Military/Strikes, Diplomacy/Agreements, Market/Economic, New Attack Vectors. Results are not cached — each click makes a fresh API call.

---

## The DATA Object — How to Update

All editorial content lives in a single `DATA` object near the bottom of `index.html`, inside the `<script>` block. **This is the only place you need to edit** for content updates. Changes to the DATA object propagate automatically to all tabs, charts, and the change log.

Key sections:

```javascript
DATA.meta           // Assessment number, day, date
DATA.scenarios      // Probabilities, time horizons, triggers — SINGLE SOURCE OF TRUTH
DATA.countries      // Eight country assessments
DATA.riskFactors    // 15 risk factors with scores and rationale
DATA.changeLog      // Audit trail — newest entry first
DATA.conclusions    // Strategic conclusions on Overview tab
DATA.filterMods     // Probability deltas per risk filter [sc1, sc2, sc3, sc4]
```

**Critical rule:** Scenario probabilities only exist in `DATA.scenarios`. They are never repeated anywhere else in the file.

---

## Editorial Review — Step by Step

### Before You Start

1. Run the AI panel on the Overview tab with each filter to survey what has changed
2. Check the four scenario trigger conditions against recent events
3. Check the four deal gaps — have any materially moved?
4. Review the market charts — is WTI above or below the $100 pain threshold? Is the 10-year yield approaching 5%?

**Core question before updating anything:**

> *Has the fundamental strategic picture changed, or have events confirmed the existing picture?*

---

### Update Sequence — Always Follow This Order

Updating out of sequence risks internal inconsistency between sections.

#### Step 1 — Scenario Probabilities

Update these first. Everything else flows from the scenario balance.

- Do any probabilities need to move?
- Do all four still sum to 100%?
- Move the current `prob` value to `was`, set the new `prob`, update `trend` arrow
- Update `horizons` text for any scenario whose outlook has changed

```javascript
// Example: Scenario 3 moving from 43% to 50%
{ id:3, prob:50, was:43, trend:"▲", ... }
```

#### Step 2 — Risk Register

For each of the 15 factors:
- Has the `l` (likelihood) score changed?
- Has the `i` (impact) score changed?
- Has `active` status changed?
- Does the `rationale` text need updating?

#### Step 3 — Thematic Deep Dives

For each of the three themes (Energy, Food & Agriculture, Financial Stress):
- Is there new data that changes the analysis?
- Has the TL;DR summary changed?
- Update the `sec-freshness` badge — `fresh-updated` with new date, or `fresh-unchanged` with last-reviewed date and rationale

#### Step 4 — Country Cards

For each of the eight countries:
- Has `direction` changed? (`worse` / `same` / `better`)
- Have `inflation` or `gdp` impact numbers moved?
- Has `vulnerability` text changed?
- Has the dominant `primaryScenario` changed?

#### Step 5 — Strategic Conclusions

Re-read all six conclusions:
- Are any factually wrong or outdated?
- Does the sequence still hold — most critical first?
- Does any conclusion need to be added, removed, or reclassified (`critical` / `normal` / `positive`)?

#### Step 6 — Change Log

Add a new entry at the **top** of the `changeLog` array for each material change:

```javascript
{ date:"June X", assessment:4, factor:"What changed",
  detail:"From what → to what, and why it matters.",
  dir:"worse",        // worse / better / watch
  scope:"Scenarios",  // which sections were reviewed
  sig:"critical"      // critical / high / watch
}
```

#### Step 7 — Meta

Update the assessment number, day counter, and date:

```javascript
meta: { assessment: 4, day: 102, date: "June 10, 2026" }
```

---

### What Triggers a New Assessment vs. a Minor Update

| Situation | Response |
|---|---|
| Scenario probability moves ≥ 5pp | New assessment number |
| A new risk factor becomes active | New assessment number |
| A deal gap closes or opens | New assessment number |
| A country's risk level changes | New assessment number |
| A new geographic front opens | New assessment number |
| Market data moves but analysis unchanged | Data refresh only — no new assessment |
| AI panel surfaces news confirming existing picture | Note in change log only |

---

### Pre-Publish Quality Check

Run through this before every commit:

- [ ] Scenario probabilities sum to 100%
- [ ] Every `was` value matches the previous `prob` value
- [ ] Change log has an entry for every section that changed
- [ ] No scenario probability appears anywhere except `DATA.scenarios`
- [ ] Every country marked `direction: "worse"` has a corresponding change log entry
- [ ] Assessment number and date updated in `DATA.meta`
- [ ] Unchanged thematic sections show correct last-reviewed date in `sec-freshness` badge
- [ ] Strategic conclusions read in order of analytical priority

---

### Risk Filter Modifiers

The `DATA.filterMods` object controls how activating each risk filter adjusts the displayed scenario probabilities. Values are deltas applied to `[sc1, sc2, sc3, sc4]` and must sum to zero across each row (activating a filter redistributes probability, it does not create it).

```javascript
filterMods: {
  f1: [-5, -3, 8, 0],   // IRGC escalation: -5 from Sc1, -3 from Sc2, +8 to Sc3
  f2: [-4, -2, 6, 0],
  ...
}
```

Update these whenever a factor's structural weight on the scenario balance changes.

---

## Track Record Principle

After several assessments the change log becomes a forecast accuracy record. Review it periodically:
- Were probability movements directionally correct?
- Did the scenario that materialised match the highest-probability call?
- Were the time horizons accurate?

This discipline is what separates a credible intelligence product from a news summary.

---

## Technical Notes

### Deploying Updates

1. Edit `index.html` (DATA object only for content updates)
2. Commit and push to GitHub
3. Vercel auto-deploys within ~30 seconds
4. Hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) to clear browser cache

### Market Data Cache

The 24-hour CDN cache on `/api/market` means Alpha Vantage is called at most once per day per endpoint, regardless of page load volume. If you need to force a fresh market data fetch (e.g. after a major intraday move), go to Vercel dashboard → your deployment → Functions → Purge Cache.

### Alpha Vantage Free Tier

25 calls/day. With the 24hr cache this is effectively unlimited for normal publishing use. The only way to hit the limit is repeated manual testing — calls reset at midnight UTC.

### AI Panel Rate

The Anthropic API charges per token. Each Run Analysis click costs approximately $0.01–0.02 at current pricing. For a private briefing with a small audience this is negligible.

---

## Assessment History

| Assessment | Date | Day | Key Development |
|---|---|---|---|
| 1 | May 13, 2026 | 14 | Original briefing — Brent ~$112, deal probability ~20% |
| 2 | May 26–27, 2026 | 87–88 | Ceasefire breached, MOU framework confirmed, bond stress peak |
| 3 | May 28, 2026 | 89 | IRGC strikes Kuwait US base — Scenario 3 raised to 43% |

---

*Analytical briefing — projections subject to revision. Not financial advice.*
