/**
 * Vercel Serverless Function — Market Data Proxy with 24hr Cache v3
 *
 * Fetches live WTI crude and US 10-year Treasury yield
 * from Alpha Vantage using a server-side environment variable.
 *
 * Caching strategy:
 *   - Vercel CDN caches each response for 24 hours (s-maxage=86400)
 *   - Alpha Vantage is called at most ONCE per day per endpoint
 *   - All page loads within 24hrs share the cached response
 *   - Free tier (25 calls/day) is effectively unlimited for normal use
 *
 * Setup:
 *   Vercel dashboard → Settings → Environment Variables:
 *   Name:  ALPHA_VANTAGE_KEY
 *   Value: your key from alphavantage.co
 *   Environments: Production, Preview, Development (tick all)
 *
 * Endpoints:
 *   /api/market?type=wti    → WTI spot price + date
 *   /api/market?type=rates  → 10yr Treasury yield + date
 */

export default async function handler(req, res) {
  const { type } = req.query;

  if (!process.env.ALPHA_VANTAGE_KEY) {
    return res.status(500).json({
      error: 'ALPHA_VANTAGE_KEY not set. Add it in Vercel dashboard → Settings → Environment Variables.'
    });
  }

  const key = process.env.ALPHA_VANTAGE_KEY;

  const endpoints = {
    wti:   `https://www.alphavantage.co/query?function=WTI&interval=daily&apikey=${key}`,
    rates: `https://www.alphavantage.co/query?function=TREASURY_YIELD&interval=daily&maturity=10year&apikey=${key}`
  };

  if (!endpoints[type]) {
    return res.status(400).json({ error: `Unknown type "${type}". Use "wti" or "rates".` });
  }

  try {
    const response = await fetch(endpoints[type]);
    const data = await response.json();

    // Alpha Vantage returns Information or Note keys when rate-limited
    if (data['Information'] || data['Note']) {
      return res.status(429).json({
        error: 'Alpha Vantage rate limit reached. Charts using fallback values.',
        detail: data['Information'] || data['Note']
      });
    }

    const latest = data?.data?.[0];
    if (!latest) {
      return res.status(502).json({ error: 'No data returned from Alpha Vantage.' });
    }

    const payload = {
      value: parseFloat(latest.value),
      date:  latest.date
    };

    // Cache at Vercel CDN edge for 24 hours.
    // s-maxage = CDN cache duration (86400s = 24hrs)
    // stale-while-revalidate = serve stale for up to 1hr while
    // fetching fresh data in background — keeps responses instant.
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');

    return res.status(200).json(payload);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

