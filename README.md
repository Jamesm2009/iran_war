# Iran War 2026 — Executive Intelligence Assessment

**KCM International** · Assessment Series · Live Dashboard

## Overview

A living intelligence briefing tracking four scenarios for the Iran–US conflict, updated each assessment cycle with probability weightings, market data, country impact analysis, and a scored risk register.

**Live site:** Deployed via Vercel from this repository.

## Architecture

The briefing uses a data-separated architecture: static JSON files hold assessment content, and a thin HTML frontend renders whichever assessment the reader selects.

```
index.html              ← Frontend (single-page app, vanilla JS + Chart.js)
data/
  manifest.json          ← Assessment index + pointer to latest
  a18.json               ← Assessment 18 (latest)
  a17.json               ← Assessment 17
  ...
  a11.json               ← Assessment 11 (earliest)
  scenario_history.json  ← Sc1–Sc4 probability evolution across all assessments
  market_history.json    ← WTI, Brent, 10Y, 30Y, USD/JPY, Hormuz transits
api/
  windward.js            ← Vercel serverless: scrapes Windward AI, 1-hour cache
  market.js              ← Vercel serverless: FRED / Alpha Vantage proxy
vercel.json              ← Routing and cache headers
```

## Scenarios Tracked

| ID | Scenario | Current (A18) |
|----|----------|---------------|
| Sc1 | Quick Deal — Resolved by mid-2026 | 2% ▼ |
| Sc2 | Managed Stalemate — Theater, not equilibrium | 10% ▼ |
| Sc3 | Prolonged Conflict / Re-escalation — Dominant | 65% ▲ |
| Sc4 | Regime Change / Collapse | 23% ▲ |

## Countries Covered

Canada · Colombia · UK · Germany · South Africa · Australia · USA · Ukraine

## Key Analytical Frameworks

- **Four-Deal-Gap Framework:** Uranium, Lebanon/Hezbollah, frozen funds, GOP Senate hawks — all four must close for Sc1
- **Rotating-Gap Thesis:** Iran deliberately cycles blocking conditions to buy time
- **Sc3→Sc4 Continuum:** Prolonged conflict naturally compounds into regime change conditions
- **Infrastructure Half-Life:** How quickly can degraded military assets reconstitute
- **Diesel/Refined Products Exposure Chain:** Gulf medium-sour crude → Asian refineries → UK, Germany, Australia, South Africa diesel

## Assessment Workflow

1. Intelligence scan (15+ source categories)
2. Cross-reference and gap identification
3. Pre-build analytical memo → James confirms go/no-go
4. Produce new `a{N}.json` data file
5. Update `manifest.json`, `scenario_history.json`, `market_history.json`
6. Push to GitHub → Vercel auto-deploys

## Data Sources

- **Maritime:** Windward AI (insights.windward.ai) — live scrape via serverless function. **UPDATE DATA MANUALLY ON EACH ASSESSMENT**.
- **Market:** CME Group (oil futures), Investing.com (yields), FRED API
- **Geopolitical:** ISW/CTP, Hormuz Report, Kpler, Atlantic Council
- **OSINT:** iranwarmap.com, iranwarlive.com, iranstrike.com, iranmonitor.online, hormuzstraitmonitor.com
- **Institute Of War:** understandingwar.org
- 
## Frontend Tabs

| Tab | Content |
|-----|---------|
| Current | Hero metrics, maritime intel (Windward live), scenario cards, country cards |
| Charts | Scenario probability evolution, price comparison, oil/yields/Hormuz/yen charts |
| Analysis | Risk register (20 factors, expandable rationale), changelog |
| Archive | All published assessments A11–A18, click to load |
| Sources | Intelligence source links, methodology, conclusions |

## Deployment

- **Platform:** Vercel (auto-deploy from GitHub main branch)
- **Cache:** Static data files cached 60s. Windward API cached 1 hour server-side.
- **Cache busting:** If Vercel serves stale content after push, go to Vercel Dashboard → Deployments → latest → Redeploy with "Clear build cache" checked.

## Version History

- **v2.0** (July 8, 2026) — Complete architecture redesign. Data-separated JSON + thin frontend. Charts, archive, Windward integration.
- **v1.x** (May–July 2026) — Monolithic HTML with embedded DATA object. Assessments 1–17.

---

*KCM International · For assessment only · Not for redistribution*
