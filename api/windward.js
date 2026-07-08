// /api/windward.js — Vercel serverless function
// Fetches insights.windward.ai, extracts key maritime data, caches for 1 hour

let cache = { data: null, ts: 0 };
const CACHE_TTL = 3600 * 1000;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
  
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return res.status(200).json({ ...cache.data, cached: true, cachedAt: new Date(cache.ts).toISOString() });
  }

  try {
    const response = await fetch('https://insights.windward.ai', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KCM-Intelligence/1.0)' }
    });
    const html = await response.text();
    const data = parseWindward(html);
    data.fetchedAt = new Date().toISOString();
    data.cached = false;
    cache = { data, ts: Date.now() };
    return res.status(200).json(data);
  } catch (err) {
    if (cache.data) {
      return res.status(200).json({ ...cache.data, cached: true, stale: true, error: err.message });
    }
    return res.status(500).json({ error: 'Failed to fetch Windward data', detail: err.message });
  }
};

function parseWindward(html) {
  const result = {
    source: 'insights.windward.ai',
    hormuz: { inbound: {}, outbound: {}, total: 0 },
    gulf: {},
    redSea: {},
    suez: {}
  };

  // Transit totals: "On 6 July, 18 vessels transited inbound and 27 outbound...45 in total"
  const tm = html.match(/(\d+)\s*vessels transited inbound and\s*(\d+)\s*outbound[\s\S]*?(\d+)\s*in total/);
  if (tm) {
    result.hormuz.inbound.total = +tm[1];
    result.hormuz.outbound.total = +tm[2];
    result.hormuz.total = +tm[3];
  }

  // AIS/Dark counts - look for the specific pattern near "Inbound" and "Outbound" sections
  // Pattern: "18 ← Inbound...AIS: 14 Dark: 4"
  const inSection = html.match(/Inbound\s*\d+\s*transits[\s\S]*?AIS[\s\S]*?:\s*(\d+)\s*Dark:\s*(\d+)/i);
  if (inSection) {
    result.hormuz.inbound.ais = +inSection[1];
    result.hormuz.inbound.dark = +inSection[2];
  }
  // Pattern: "27 → Outbound...AIS: 23 Dark: 4"  
  const outSection = html.match(/Outbound\s*\d+\s*transits[\s\S]*?AIS[\s\S]*?:\s*(\d+)\s*Dark:\s*(\d+)/i);
  if (outSection) {
    result.hormuz.outbound.ais = +outSection[1];
    result.hormuz.outbound.dark = +outSection[2];
  }

  // If the above didn't match, try simpler fallback
  if (!result.hormuz.inbound.dark && result.hormuz.inbound.total) {
    // Count dark from "Four inbound and four outbound vessels ran fully dark"
    const darkMatch = html.match(/(\w+)\s*inbound and\s*(\w+)\s*outbound vessels ran fully dark/i);
    if (darkMatch) {
      const wordToNum = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8 };
      result.hormuz.inbound.dark = wordToNum[darkMatch[1].toLowerCase()] || +darkMatch[1] || 0;
      result.hormuz.outbound.dark = wordToNum[darkMatch[2].toLowerCase()] || +darkMatch[2] || 0;
      result.hormuz.inbound.ais = result.hormuz.inbound.total - result.hormuz.inbound.dark;
      result.hormuz.outbound.ais = result.hormuz.outbound.total - result.hormuz.outbound.dark;
    }
  }

  // Corridor split: "14 North · 4 South"
  const corridorIn = html.match(/(\d+)\s*North\s*·\s*(\d+)\s*South\s*Corridor/);
  if (corridorIn) {
    result.hormuz.inbound.northern = +corridorIn[1];
    result.hormuz.inbound.southern = +corridorIn[2];
  }

  // Gulf-wide: "861 cargo and tanker vessels were present in the Persian Gulf"
  const gm = html.match(/(\d+)\s*cargo and tanker vessels were present in the Persian Gulf/);
  if (gm) result.gulf.totalVessels = +gm[1];

  // Dark activity events
  const de = html.match(/(\d+)\s*dark-activity events/);
  if (de) result.gulf.darkEvents = +de[1];

  // Risk: "132 high-risk, 197 moderate, 546 low"
  const rm = html.match(/(\d+)\s*high-risk,\s*(\d+)\s*moderate,\s*(\d+)\s*low/i);
  if (rm) {
    result.gulf.highRisk = +rm[1];
    result.gulf.moderate = +rm[2];
    result.gulf.lowRisk = +rm[3];
  }

  // Bab-el-Mandeb: "14 Inbound / 18 Outbound"
  const bm = html.match(/Bab-el-Mandeb[\s\S]*?(\d+)\s*Inbound[\s\S]*?(\d+)\s*Outbound/);
  if (bm) {
    result.redSea.inbound = +bm[1];
    result.redSea.outbound = +bm[2];
  }

  // Suez
  const sm = html.match(/Suez Crossings[\s\S]*?(\d+)\s*Inbound[\s\S]*?(\d+)\s*Outbound/);
  if (sm) {
    result.suez.inbound = +sm[1];
    result.suez.outbound = +sm[2];
  }

  // Cargo value
  const cv = html.match(/totaled roughly \$(\d+)M/);
  if (cv) result.hormuz.outbound.cargoValueM = +cv[1];

  // GPS jamming
  const gps = html.match(/(\d+)\s*JAMMED VESSELS/);
  if (gps) result.gulf.gpsJammed = +gps[1];

  // Data date
  const dd = html.match(/Data as of\s*(\d+\s*\w+\s*\d{4})/);
  if (dd) result.dataDate = dd[1];

  return result;
}
