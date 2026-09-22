import { ASSET_COLORS, type AssetData } from './AllAssetsChart'

interface Props {
  assets: AssetData[]
}

function dailyReturn(data: AssetData['data']): number | null {
  const latest = data[data.length - 1]
  const previous = data[data.length - 2]
  if (!latest || !previous || previous.close === 0) return null
  return ((latest.close - previous.close) / previous.close) * 100
}

function TickerItem({ label, value }: { label: string; value: number | null }) {
  const positive = (value ?? 0) >= 0
  const valueColor = value === null ? 'text-gray-400 dark:text-gray-500' : positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'

  return (
    <div className="inline-flex shrink-0 items-center gap-2 border-r border-gray-200 px-4 py-2 text-xs dark:border-gray-800">
      <span className="h-2 w-2 rounded-full" style={{ background: ASSET_COLORS[label] ?? '#64748b' }} />
      <span className="font-semibold text-gray-700 dark:text-gray-200">{label}</span>
      <span className={`font-semibold tabular-nums ${valueColor}`}>
        {value === null ? '—' : `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`}
      </span>
    </div>
  )
}

export default function TickerTape({ assets }: Props) {
  const entries = assets.map(({ label, data }) => ({ label, value: dailyReturn(data) }))

  return (
    <section aria-label="Daily market return ticker" className="overflow-hidden border-t border-gray-200 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-900/70">
      <div className="flex items-stretch">
        <div className="z-10 flex shrink-0 items-center gap-1.5 border-r border-gray-200 bg-gray-100 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 shadow-[8px_0_12px_rgba(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:shadow-[8px_0_12px_rgba(0,0,0,0.18)]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Daily
        </div>
        <div className="min-w-0 overflow-hidden">
          <div className="ticker-track flex w-max">
            {entries.map((entry) => <TickerItem key={entry.label} {...entry} />)}
            <div className="flex" aria-hidden="true">
              {entries.map((entry) => <TickerItem key={`duplicate-${entry.label}`} {...entry} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
