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

export function useCryptoOhlcData(instId: string | null, delayMs = 0, refreshKey = 0) {
  const [data, setData] = useState<OhlcPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!instId) { setData([]); setLoading(false); return }
    const cached = cache[instId]
    if (cached && refreshKey === 0) { setData(cached); setLoading(false); return }

    let cancelled = false
    if (cached) setData(cached)
    else setLoading(true)
    setError(null)

    async function refreshLatest(existing: OhlcPoint[]) {
      const latest = await fetchBatch(instId!)
      const byTime = new Map(existing.map((p) => [p.time, p]))
      for (const p of latest) byTime.set(p.time, p)
      return [...byTime.values()].sort((a, b) => a.time - b.time)
    }

    async function fetchData() {
      try {
        if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs))
        if (cancelled) return

        if (cached) {
          const merged = await refreshLatest(cached)
          if (!cancelled) { cache[instId!] = merged; setData(merged) }
          return
        }

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
  }, [instId, refreshKey])

  return { data, loading, error }
}
