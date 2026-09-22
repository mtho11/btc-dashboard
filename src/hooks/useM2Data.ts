import { useState, useEffect } from 'react'
import type { LinePoint } from '../lib/indicators'

// Static file served from public/ — updated periodically via scripts/fetch-m2.sh
const M2_URL = import.meta.env.BASE_URL + 'm2.json'
let cache: LinePoint[] | null = null

export function useM2Data(refreshKey = 0) {
  const [data, setData] = useState<LinePoint[]>(cache ?? [])

  useEffect(() => {
    if (cache && refreshKey === 0) { setData(cache); return }
    fetch(`${M2_URL}?refresh=${refreshKey}`)
      .then((r) => r.json())
      .then((rows: LinePoint[]) => {
        cache = rows
        setData(rows)
      })
      .catch(() => {})
  }, [refreshKey])

  return data
}
