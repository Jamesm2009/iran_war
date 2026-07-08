// /api/windward.js — Vercel serverless function
// Fetches insights.windward.ai, extracts key maritime data, caches for 1 hour

let cache = { data: null, ts: 0 };
const CACHE_TTL = 3600 * 1000; // 1 hour

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Return cached data if fresh
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
    
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    // Return stale cache if available
    if (cache.data) {
      return res.status(200).json({ ...cache.data, cached: true, stale: true, error: err.message });
    }
    return res.status(500).json({ error: 'Failed to fetch Windward data', detail: err.message });
  }
}

function parseWindward(html) {
  const result = {
    source: 'insights.windward.ai',
    hormuz: { inbound: {}, outbound: {}, total: 0 },
    gulf: {},
    redSea: {},
    suez: {},
    vessels: { inbound: [], outbound: [] }
  };

  // Extract inbound/outbound totals
  // Pattern: "18 ← Inbound" and "27 → Outbound"  
  const inMatch = html.match(/(\d+)\s*←?\s*Inbound[\s\S]*?(\d+)\s*transits/i);
  const outMatch = html.match(/(\d+)\s*→?\s*Outbound[\s\S]*?(\d+)\s*transits/i);
  
  // Simpler extraction from the structured text
  const transitMatch = html.match(/On \d+ \w+,\s*(\d+)\s*vessels transited inbound and\s*(\d+)\s*outbound[^—]*—\s*(\d+)\s*in total/);
  if (transitMatch) {
    result.hormuz.inbound.total = parseInt(transitMatch[1]);
    result.hormuz.outbound.total = parseInt(transitMatch[2]);
    result.hormuz.total = parseInt(transitMatch[3]);
  }

  // AIS vs Dark
  const aisInMatch = html.match(/Inbound[\s\S]*?AIS[^:]*:\s*(\d+)\s*Dark:\s*(\d+)/i);
  if (aisInMatch) {
    result.hormuz.inbound.ais = parseInt(aisInMatch[1]);
    result.hormuz.inbound.dark = parseInt(aisInMatch[2]);
  }
  const aisOutMatch = html.match(/Outbound[\s\S]*?AIS[^:]*:\s*(\d+)\s*Dark:\s*(\d+)/i);
  if (aisOutMatch) {
    result.hormuz.outbound.ais = parseInt(aisOutMatch[1]);
    result.hormuz.outbound.dark = parseInt(aisOutMatch[2]);
  }

  // Corridor split - extract from "14 North · 4 South" patterns
  const corridorIn = html.match(/Inbound[\s\S]*?(\d+)\s*North\s*·?\s*(\d+)\s*South\s*Corridor/i);
  if (corridorIn) {
    result.hormuz.inbound.northern = parseInt(corridorIn[1]);
    result.hormuz.inbound.southern = parseInt(corridorIn[2]);
  }
  const corridorOut = html.match(/Outbound[\s\S]*?(\d+)\s*North\s*·?\s*(\d+)\s*South\s*Corridor/i);
  if (corridorOut) {
    result.hormuz.outbound.northern = parseInt(corridorOut[1]);
    result.hormuz.outbound.southern = parseInt(corridorOut[2]);
  }

  // Gulf-wide presence
  const gulfMatch = html.match(/(\d+)\s*cargo and tanker vessels were present in the Persian Gulf/i);
  if (gulfMatch) result.gulf.totalVessels = parseInt(gulfMatch[1]);

  const darkEvents = html.match(/(\d+)\s*dark-activity events/i);
  if (darkEvents) result.gulf.darkEvents = parseInt(darkEvents[1]);

  const riskMatch = html.match(/(\d+)\s*high-risk,\s*(\d+)\s*moderate,\s*(\d+)\s*low/i);
  if (riskMatch) {
    result.gulf.highRisk = parseInt(riskMatch[1]);
    result.gulf.moderate = parseInt(riskMatch[2]);
    result.gulf.lowRisk = parseInt(riskMatch[3]);
  }

  // Top flags
  const flagMatches = html.match(/Iran\s*\(?\s*(\d+)\)?[\s\S]*?Panama\s*\(?\s*(\d+)\)?[\s\S]*?Comoros\s*\(?\s*(\d+)\)?/i);
  if (flagMatches) {
    result.gulf.topFlags = [
      { flag: 'Iran', count: parseInt(flagMatches[1]) },
      { flag: 'Panama', count: parseInt(flagMatches[2]) },
      { flag: 'Comoros', count: parseInt(flagMatches[3]) }
    ];
  }

  // Red Sea - Bab-el-Mandeb
  const babMatch = html.match(/Bab-el-Mandeb[\s\S]*?(\d+)\s*Inbound[\s\S]*?(\d+)\s*Outbound/i);
  if (babMatch) {
    result.redSea.inbound = parseInt(babMatch[1]);
    result.redSea.outbound = parseInt(babMatch[2]);
  }

  // Suez
  const suezMatch = html.match(/Suez[\s\S]*?(\d+)\s*Inbound[\s\S]*?(\d+)\s*Outbound/i);
  if (suezMatch) {
    result.suez.inbound = parseInt(suezMatch[1]);
    result.suez.outbound = parseInt(suezMatch[2]);
  }

  // Outbound cargo value
  const cargoVal = html.match(/roughly\s*\$(\d+)M/i);
  if (cargoVal) result.hormuz.outbound.cargoValueM = parseInt(cargoVal[1]);

  // Vessel type breakdown from "8 Tanker 2 Bulk 8 Cargo"
  const vesselTypes = html.match(/(\d+)\s*Tanker\s*(\d+)\s*Bulk\s*(\d+)\s*Cargo/i);
  if (vesselTypes) {
    result.hormuz.inbound.tankers = parseInt(vesselTypes[1]);
    result.hormuz.inbound.bulk = parseInt(vesselTypes[2]);
    result.hormuz.inbound.cargo = parseInt(vesselTypes[3]);
  }

  // Data date
  const dateMatch = html.match(/Data as of\s*(\d+\s*\w+\s*\d{4})/i);
  if (dateMatch) result.dataDate = dateMatch[1];

  return result;
}
