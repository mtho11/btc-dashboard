import { useState, useEffect, useRef } from 'react'
import type { OhlcPoint } from '../lib/indicators'

// OKX history-candles: [ts_ms, open, high, low, close, vol, volCcy, volCcyQuote, confirm]
const OKX = 'https://www.okx.com/api/v5/market/history-candles'
const BATCH = 300
const BATCHES = 6 // 6 × 300 = 1800 days > 1400 needed for 200W MA

async function fetchBatch(after?: string): Promise<OhlcPoint[]> {
  const params = new URLSearchParams({ instId: 'BTC-USDT', bar: '1D', limit: String(BATCH) })
  if (after) params.set('after', after)
  const res = await fetch(`${OKX}?${params}`)
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

export function useBtcData() {
  const [data, setData] = useState<OhlcPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cache = useRef<OhlcPoint[] | null>(null)

  useEffect(() => {
    if (cache.current) {
      setData(cache.current)
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const allPoints: OhlcPoint[] = []
        let after: string | undefined

        for (let i = 0; i < BATCHES; i++) {
          const batch = await fetchBatch(after)
          if (batch.length === 0) break
          allPoints.push(...batch)
          // OKX returns newest-first; oldest entry in this batch becomes the next `after`
          after = String(batch[batch.length - 1].time * 1000)
          if (cancelled) return
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
  }, [])

  return { data, loading, error }
}
