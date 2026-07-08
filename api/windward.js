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
      headers: { 'User-Agent': 'KCM-Intelligence-Briefing/1.0' }
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

  const tm = html.match(/(\d+)\s*vessels transited inbound and\s*(\d+)\s*outbound[^—]*—\s*(\d+)\s*in total/);
  if (tm) { result.hormuz.inbound.total = +tm[1]; result.hormuz.outbound.total = +tm[2]; result.hormuz.total = +tm[3]; }

  const aisIn = html.match(/AIS[^\d]*?(\d+)[\s\S]*?Dark[^\d]*?(\d+)/i);
  if (aisIn) { result.hormuz.inbound.ais = +aisIn[1]; result.hormuz.inbound.dark = +aisIn[2]; }

  const gm = html.match(/(\d+)\s*cargo and tanker vessels were present/i);
  if (gm) result.gulf.totalVessels = +gm[1];

  const rm = html.match(/(\d+)\s*high-risk,\s*(\d+)\s*moderate,\s*(\d+)\s*low/i);
  if (rm) { result.gulf.highRisk = +rm[1]; result.gulf.moderate = +rm[2]; result.gulf.lowRisk = +rm[3]; }

  const bm = html.match(/Bab-el-Mandeb[\s\S]*?(\d+)\s*Inbound[\s\S]*?(\d+)\s*Outbound/i);
  if (bm) { result.redSea.inbound = +bm[1]; result.redSea.outbound = +bm[2]; }

  const sm = html.match(/Suez[\s\S]*?(\d+)\s*Inbound[\s\S]*?(\d+)\s*Outbound/i);
  if (sm) { result.suez.inbound = +sm[1]; result.suez.outbound = +sm[2]; }

  const cargoVal = html.match(/roughly\s*\$(\d+)M/i);
  if (cargoVal) result.hormuz.outbound.cargoValueM = +cargoVal[1];

  const dateMatch = html.match(/Data as of\s*(\d+\s*\w+\s*\d{4})/i);
  if (dateMatch) result.dataDate = dateMatch[1];

  return result;
}
