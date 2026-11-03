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
      bars.push({ time, open: +q.open[i].toFixed(4), high: +q.high[i].toFixed(4), low: +q.low[i].toFixed(4), close: +q.close[i].toFixed(4) })
    })
    if (bars.length < 200) throw new Error(`only ${bars.length} bars`)
    writeFileSync(`public/history/${tab}.json`, JSON.stringify(bars))
    console.log(`${tab}: ${bars.length} bars`)
  } catch (e) {
    console.error(`${tab} (${symbol}) failed: ${e.message}`)
    failed++
  }
}
process.exit(failed === Object.keys(SYMBOLS).length ? 1 : 0)
