import { useState, useEffect, useRef } from 'react'

export interface DayClose {
  time: number // unix seconds
  value: number
}

export function useMstrData() {
  const [data, setData] = useState<DayClose[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cache = useRef<DayClose[] | null>(null)

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

        const yahooUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/MSTR?interval=1d&range=5y'
        const res = await fetch('https://corsproxy.io/?' + encodeURIComponent(yahooUrl))
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const json = await res.json()
        const result = json?.chart?.result?.[0]
        const timestamps: number[] = result?.timestamp ?? []
        const closes: (number | null)[] = result?.indicators?.quote?.[0]?.close ?? []

        const points: DayClose[] = timestamps
          .map((ts, i) => ({ time: ts, value: closes[i] ?? 0 }))
          .filter((p) => p.value > 0)
          .sort((a, b) => a.time - b.time)

        if (!cancelled) {
          cache.current = points
          setData(points)
        }
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
