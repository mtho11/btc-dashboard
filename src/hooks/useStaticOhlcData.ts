import { useState, useEffect } from 'react'
import type { OhlcPoint } from '../lib/indicators'

const cache: Record<string, OhlcPoint[]> = {}

export function useStaticOhlcData(filename: string | null, refreshKey = 0) {
  const [data, setData] = useState<OhlcPoint[]>(filename && cache[filename] ? cache[filename] : [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!filename) { setData([]); return }
    if (cache[filename] && refreshKey === 0) { setData(cache[filename]); return }
    setLoading(true)
    setError(null)
    fetch(`${import.meta.env.BASE_URL}${filename}?refresh=${refreshKey}`)
      .then((r) => r.json())
      .then((rows: OhlcPoint[]) => {
        cache[filename] = rows
        setData(rows)
        setLoading(false)
      })
      .catch((e) => { setError(String(e)); setLoading(false) })
  }, [filename, refreshKey])

  return { data, loading, error }
}
