import { useState, useEffect, useRef } from 'react'
import type { OhlcPoint } from '../lib/indicators'

// OKX history-candles: [ts_ms, open, high, low, close, vol, volCcy, volCcyQuote, confirm]
const OKX = 'https://www.okx.com/api/v5/market/history-candles'
const BATCH = 300
const BATCHES = 12 // 12 × 300 = 3600 days: 1400 for the 200W MA plus a 5Y view

async function fetchBatch(after?: string, attempt = 0): Promise<OhlcPoint[]> {
  const params = new URLSearchParams({ instId: 'BTC-USDT', bar: '1D', limit: String(BATCH) })
  if (after) params.set('after', after)
  const res = await fetch(`${OKX}?${params}`)
  if (res.status === 429 && attempt < 5) {
    await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
    return fetchBatch(after, attempt + 1)
  }
  if (!res.ok) throw new Error(`OKX HTTP ${res.status}`)
  const json: { data: string[][] } = await res.json()
  return json.data.map((k) => ({
    time: Math.floor(Number(k[0]) / 1000),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
  }))
}

export function useBtcData(refreshKey = 0) {
  const [data, setData] = useState<OhlcPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cache = useRef<OhlcPoint[] | null>(null)

  useEffect(() => {
    if (cache.current && refreshKey === 0) {
      setData(cache.current)
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchData() {
      try {
        setError(null)

        if (cache.current) {
          const latest = await fetchBatch()
          const byTime = new Map(cache.current.map((p) => [p.time, p]))
          for (const p of latest) byTime.set(p.time, p)
          const merged = [...byTime.values()].sort((a, b) => a.time - b.time)
          if (!cancelled) { cache.current = merged; setData(merged) }
          return
        }

        setLoading(true)

        const allPoints: OhlcPoint[] = []
        let after: string | undefined

        for (let i = 0; i < BATCHES; i++) {
          const batch = await fetchBatch(after)
          if (batch.length === 0) break
          allPoints.push(...batch)
          // OKX returns newest-first; oldest entry in this batch becomes the next `after`
          after = String(batch[batch.length - 1].time * 1000)
          if (cancelled) return
          await new Promise(r => setTimeout(r, 250))
        }

        // Sort ascending and deduplicate
        const seen = new Set<number>()
        const deduped = allPoints
          .filter((p) => {
            if (seen.has(p.time)) return false
            seen.add(p.time)
            return true
          })
          .sort((a, b) => a.time - b.time)

        cache.current = deduped
        setData(deduped)
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [refreshKey])

  return { data, loading, error }
}
