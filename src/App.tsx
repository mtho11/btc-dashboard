import { useState, useEffect, useMemo } from 'react'
import './index.css'
import { useBtcData } from './hooks/useBtcData'
import { useCryptoOhlcData } from './hooks/useCryptoOhlcData'
import { useStaticOhlcData } from './hooks/useStaticOhlcData'
import { useM2Data } from './hooks/useM2Data'
import { sma, deathCrosses, goldenCrosses } from './lib/indicators'
import Chart from './components/Chart'
import AllAssetsChart from './components/AllAssetsChart'
import RangeSelector, { isRange, type Range } from './components/RangeSelector'
import CryptoTabSelector, { isCryptoTab, type CryptoTab } from './components/CryptoTabSelector'
import PerformanceSection from './components/PerformanceSection'
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
  const [range, setRange] = useState<Range>(() => {
    const timeframe = new URLSearchParams(window.location.search).get('range')
    return isRange(timeframe) ? timeframe : '1Y'
  })
  const [cryptoTab, setCryptoTab] = useState<CryptoTab>(() => {
    const asset = new URLSearchParams(window.location.search).get('asset')
    return isCryptoTab(asset) ? asset : 'BTC'
  })

  const m2Data = useM2Data()
  const { data: btcData, loading: btcLoading, error: btcError } = useBtcData()
  const allDelay = (n: number) => cryptoTab === 'ALL' ? n * 1200 : 0
  const { data: ethData, loading: ethLoading, error: ethError } = useCryptoOhlcData(cryptoTab === 'ETH' || cryptoTab === 'ALL' ? 'ETH-USDT' : null, allDelay(0))
  const { data: solData, loading: solLoading, error: solError } = useCryptoOhlcData(cryptoTab === 'SOL' || cryptoTab === 'ALL' ? 'SOL-USDT' : null, allDelay(1))
  const { data: hypeData, loading: hypeLoading, error: hypeError } = useCryptoOhlcData(cryptoTab === 'HYPE' || cryptoTab === 'ALL' ? 'HYPE-USDT' : null, allDelay(2))
  const { data: zecData, loading: zecLoading, error: zecError } = useCryptoOhlcData(cryptoTab === 'ZEC' || cryptoTab === 'ALL' ? 'ZEC-USDT' : null, allDelay(3))
  // PAXG (PAX Gold) = 1 troy oz gold, trades on OKX — same live API as BTC/ETH/SOL
  const { data: goldData, loading: goldLoading, error: goldError } = useCryptoOhlcData(cryptoTab === 'GOLD' || cryptoTab === 'ALL' ? 'PAXG-USDT' : null, allDelay(4))
  const { data: silverData, loading: silverLoading, error: silverError } = useStaticOhlcData(cryptoTab === 'SILVER' || cryptoTab === 'ALL' ? 'silver.json' : null)

  const data = cryptoTab === 'BTC' ? btcData
    : cryptoTab === 'ETH' ? ethData
    : cryptoTab === 'SOL' ? solData
    : cryptoTab === 'HYPE' ? hypeData
    : cryptoTab === 'ZEC' ? zecData
    : cryptoTab === 'GOLD' ? goldData
    : silverData
  const loading = cryptoTab === 'BTC' ? btcLoading
    : cryptoTab === 'ETH' ? ethLoading
    : cryptoTab === 'SOL' ? solLoading
    : cryptoTab === 'HYPE' ? hypeLoading
    : cryptoTab === 'ZEC' ? zecLoading
    : cryptoTab === 'GOLD' ? goldLoading
    : silverLoading
  const error = cryptoTab === 'BTC' ? btcError
    : cryptoTab === 'ETH' ? ethError
    : cryptoTab === 'SOL' ? solError
    : cryptoTab === 'HYPE' ? hypeError
    : cryptoTab === 'ZEC' ? zecError
    : cryptoTab === 'GOLD' ? goldError
    : silverError

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const asset = params.get('asset')
      const timeframe = params.get('range')
      if (isCryptoTab(asset)) setCryptoTab(asset)
      if (isRange(timeframe)) setRange(timeframe)
    }
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [])

  const selectCryptoTab = (tab: CryptoTab) => {
    const url = new URL(window.location.href)
    url.searchParams.set('asset', tab)
    window.history.pushState({}, '', url)
    setCryptoTab(tab)
  }

  const selectRange = (timeframe: Range) => {
    const url = new URL(window.location.href)
    url.searchParams.set('range', timeframe)
    window.history.pushState({}, '', url)
    setRange(timeframe)
  }

  const allAssets = useMemo(() => [
    { label: 'BTC', data: btcData },
    { label: 'ETH', data: ethData },
    { label: 'SOL', data: solData },
    { label: 'HYPE', data: hypeData },
    { label: 'ZEC', data: zecData },
    { label: 'GOLD', data: goldData },
    { label: 'SILVER', data: silverData },
  ], [btcData, ethData, solData, hypeData, zecData, goldData, silverData])

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
            <h1 className="text-lg font-bold tracking-tight">Mike's Crypto Tracker</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {cryptoTab === 'ALL'
                ? 'All Assets · % Return'
                : `${cryptoTab === 'GOLD' ? 'Gold' : cryptoTab === 'SILVER' ? 'Silver' : cryptoTab} / USD · Moving Averages`}
            </p>
          </div>
        </div>
        <ThemeToggle dark={dark} onToggle={() => setDark((d) => !d)} />
      </header>

      <main className="p-6 flex flex-col gap-4" style={{ height: 'calc(100vh - 73px)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CryptoTabSelector value={cryptoTab} onChange={selectCryptoTab} />
            {(cryptoTab === 'ALL' ? (btcLoading || ethLoading || solLoading || hypeLoading || zecLoading || goldLoading || silverLoading) : loading) && (
              <span className="text-xs text-gray-400 dark:text-gray-500">Loading…</span>
            )}
            {cryptoTab !== 'ALL' && error && <span className="text-xs text-red-500">Error: {error}</span>}
          </div>
          <RangeSelector value={range} onChange={selectRange} />
        </div>

        <div className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 overflow-hidden shadow-sm">
          {cryptoTab === 'ALL' ? (
            <AllAssetsChart
              assets={allAssets}
              range={range}
              dark={dark}
            />
          ) : loading ? (
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
              deathCrosses={crosses}
              goldenCrosses={gCrosses}
              m2={m2Data}
              symbol={cryptoTab}
              range={range}
              dark={dark}
            />
          )}
        </div>

        {cryptoTab !== 'ALL' && <PerformanceSection data={data} symbol={cryptoTab} />}

        <div className="flex gap-6 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
          {cryptoTab === 'ALL' ? (
            <>
              <span>All assets normalized to % return from range start</span>
              <span>Silver: nightly refresh · All others: live OKX data</span>
            </>
          ) : (
            <>
              <span>Data source: OKX public API · ~1,800 daily candles</span>
              <span>200W MA requires ~1,400 days of history to fully populate</span>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
