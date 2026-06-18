import { useState, useEffect, useRef } from 'react'
import type { OhlcPoint } from '../lib/indicators'

const cache: Record<string, OhlcPoint[]> = {}

export function useStockOhlcData(symbol: string | null) {
  const [data, setData] = useState<OhlcPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancelRef = useRef(false)

  useEffect(() => {
    if (!symbol) { setData([]); setLoading(false); return }

    if (cache[symbol]) { setData(cache[symbol]); setLoading(false); return }

    cancelRef.current = false
    setLoading(true)
    setError(null)

    async function fetchData() {
      try {
        const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=10y`
        const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(yahooUrl))
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const json = await res.json()
        const result = json?.chart?.result?.[0]
        const timestamps: number[] = result?.timestamp ?? []
        const q = result?.indicators?.quote?.[0] ?? {}

        const points: OhlcPoint[] = timestamps
          .map((ts, i) => ({
            // Normalize to midnight UTC to match BTC timestamp format
            time: Math.floor(ts / 86400) * 86400,
            open: q.open?.[i] ?? 0,
            high: q.high?.[i] ?? 0,
            low: q.low?.[i] ?? 0,
            close: q.close?.[i] ?? 0,
          }))
          .filter((p) => p.close > 0)
          .sort((a, b) => a.time - b.time)

        if (!cancelRef.current) {
          cache[symbol] = points
          setData(points)
        }
      } catch (e) {
        if (!cancelRef.current) setError((e as Error).message)
      } finally {
        if (!cancelRef.current) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelRef.current = true }
  }, [symbol])

  return { data, loading, error }
}
