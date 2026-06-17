import { useState, useEffect, useMemo } from 'react'
import './index.css'
import { useBtcData } from './hooks/useBtcData'
import { useMstrData } from './hooks/useMstrData'
import { sma, deathCrosses, goldenCrosses } from './lib/indicators'
import Chart from './components/Chart'
import RangeSelector, { type Range } from './components/RangeSelector'
import ThemeToggle from './components/ThemeToggle'

function useSystemDark() {
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return dark
}

export default function App() {
  const systemDark = useSystemDark()
  const [dark, setDark] = useState(systemDark)
  const [range, setRange] = useState<Range>('1Y')

  const { data, loading, error } = useBtcData()
  const { data: mstrData } = useMstrData()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // Compute MAs over the FULL dataset for accurate values even when zoomed in
  const ma50 = useMemo(() => sma(data, 50), [data])
  const ma200d = useMemo(() => sma(data, 200), [data])
  const ma200w = useMemo(() => sma(data, 1400), [data])
  const crosses = useMemo(() => deathCrosses(ma50, ma200d), [ma50, ma200d])
  const gCrosses = useMemo(() => goldenCrosses(ma50, ma200d), [ma50, ma200d])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">₿</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Mike's BTC/MSTR Dashboard</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">BTC / USD · Moving Averages</p>
          </div>
        </div>
        <ThemeToggle dark={dark} onToggle={() => setDark((d) => !d)} />
      </header>

      <main className="p-6 flex flex-col gap-4" style={{ height: 'calc(100vh - 73px)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            {loading && 'Fetching price data…'}
            {error && <span className="text-red-500">Error: {error}</span>}
            {!loading && !error && data.length > 0 && (
              <span>{data.length.toLocaleString()} daily candles loaded</span>
            )}
          </div>
          <RangeSelector value={range} onChange={setRange} />
        </div>

        <div className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 overflow-hidden shadow-sm">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400">
              <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading BTC price data…</span>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-red-400 text-sm">
              Failed to load data. Please try again in a moment.
            </div>
          ) : (
            <Chart
              data={data}
              ma50={ma50}
              ma200d={ma200d}
              ma200w={ma200w}
              mstr={mstrData}
              deathCrosses={crosses}
              goldenCrosses={gCrosses}
              range={range}
              dark={dark}
            />
          )}
        </div>

        <div className="flex gap-6 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
          <span>Data source: OKX public API · ~1,800 daily candles</span>
          <span>200W MA requires ~1,400 days of history to fully populate</span>
        </div>
      </main>
    </div>
  )
}
