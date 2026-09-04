import { useState, useEffect } from 'react'
import type { OhlcPoint } from '../lib/indicators'

const OKX = 'https://www.okx.com/api/v5/market/history-candles'
const BATCH = 300
const BATCHES = 6

const cache: Record<string, OhlcPoint[]> = {}

async function fetchBatch(instId: string, after?: string, attempt = 0): Promise<OhlcPoint[]> {
  const params = new URLSearchParams({ instId, bar: '1D', limit: String(BATCH) })
  if (after) params.set('after', after)
  const res = await fetch(`${OKX}?${params}`)
  if (res.status === 429 && attempt < 3) {
    await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
    return fetchBatch(instId, after, attempt + 1)
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

export function useCryptoOhlcData(instId: string | null, delayMs = 0) {
  const [data, setData] = useState<OhlcPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!instId) { setData([]); setLoading(false); return }
    if (cache[instId]) { setData(cache[instId]); setLoading(false); return }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchData() {
      try {
        if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs))
        if (cancelled) return

        const allPoints: OhlcPoint[] = []
        let after: string | undefined

        for (let i = 0; i < BATCHES; i++) {
          const batch = await fetchBatch(instId!, after)
          if (batch.length === 0) break
          allPoints.push(...batch)
          after = String(batch[batch.length - 1].time * 1000)
          if (cancelled) return
        }

        const seen = new Set<number>()
        const deduped = allPoints
          .filter((p) => { if (seen.has(p.time)) return false; seen.add(p.time); return true })
          .sort((a, b) => a.time - b.time)

        if (!cancelled) {
          cache[instId!] = deduped
          setData(deduped)
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [instId])

  return { data, loading, error }
}
