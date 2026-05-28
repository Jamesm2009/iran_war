/**
 * Vercel Serverless Function — Market Data Proxy
 *
 * Fetches live WTI crude and US 10-year Treasury yield
 * from Alpha Vantage using a server-side environment variable.
 *
 * Setup:
 * In Vercel dashboard → Settings → Environment Variables add:
 *   Name:  ALPHA_VANTAGE_KEY
 *   Value: your key from alphavantage.co (free, instant)
 *   Environments: Production, Preview, Development (tick all)
 *
 * Called from the HTML as:
 *   /api/market?type=wti    → returns WTI spot price + date
 *   /api/market?type=rates  → returns 10yr yield + date
 *
 * Free tier limit: 25 calls/day (~12 page loads).
 * Charts fall back to hardcoded values gracefully if limit hit.
 */

export default async function handler(req, res) {
  const { type } = req.query;

  if (!process.env.ALPHA_VANTAGE_KEY) {
    return res.status(500).json({
      error: 'ALPHA_VANTAGE_KEY not set. Add it in Vercel dashboard → Settings → Environment Variables.'
    });
  }

  const key = process.env.ALPHA_VANTAGE_KEY;

  // Alpha Vantage endpoints
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

    // Alpha Vantage returns an Information key when rate-limited
    if (data['Information'] || data['Note']) {
      return res.status(429).json({
        error: 'Alpha Vantage rate limit reached (25 calls/day on free tier). Charts using fallback values.',
        detail: data['Information'] || data['Note']
      });
    }

    const latest = data?.data?.[0];
    if (!latest) {
      return res.status(502).json({ error: 'No data returned from Alpha Vantage.' });
    }

    return res.status(200).json({
      value: parseFloat(latest.value),
      date:  latest.date
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
