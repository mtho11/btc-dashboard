// Backfills daily history for assets whose OKX instruments are too new for a 200D/200W MA.
// Writes public/history/<TAB>.json as [{time, open, high, low, close}] (time = UTC midnight, seconds).
import { mkdirSync, writeFileSync } from 'node:fs'

const SYMBOLS = { GOLD: 'GC=F', SILVER: 'SI=F', OIL: 'CL=F', SPY: 'SPY', QQQ: 'QQQ' }
mkdirSync('public/history', { recursive: true })

let failed = 0
for (const [tab, symbol] of Object.entries(SYMBOLS)) {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=20y&interval=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const result = (await res.json()).chart.result[0]
    const q = result.indicators.quote[0]
    const offset = result.meta.gmtoffset ?? 0
    const bars = []
    result.timestamp.forEach((t, i) => {
      if ([q.open[i], q.high[i], q.low[i], q.close[i]].some((v) => v == null)) return
      const time = Math.floor((t + offset) / 86400) * 86400
      const { open, close } = { open: q.open[i], close: q.close[i] }
      // Yahoo occasionally ships high < low; widen the range to cover open/close.
      const high = Math.max(q.high[i], q.low[i], open, close)
      const low = Math.min(q.high[i], q.low[i], open, close)
      // Skip non-positive prices (e.g. WTI in April 2020): the chart can't draw them.
      if (low <= 0) return
      bars.push({ time, open: +open.toFixed(4), high: +high.toFixed(4), low: +low.toFixed(4), close: +close.toFixed(4) })
    })
    // Yahoo can return two bars for one date (e.g. a live intraday bar); keep the later one and sort ascending.
    const byTime = new Map(bars.map((b) => [b.time, b]))
    bars.splice(0, bars.length, ...[...byTime.values()].sort((a, b) => a.time - b.time))
    if (bars.length < 200) throw new Error(`only ${bars.length} bars`)
    writeFileSync(`public/history/${tab}.json`, JSON.stringify(bars))
    console.log(`${tab}: ${bars.length} bars`)
  } catch (e) {
    console.error(`${tab} (${symbol}) failed: ${e.message}`)
    failed++
  }
}
process.exit(failed === Object.keys(SYMBOLS).length ? 1 : 0)
