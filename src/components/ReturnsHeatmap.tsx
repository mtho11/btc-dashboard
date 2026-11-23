import type { OhlcPoint } from '../lib/indicators'
import type { HeatmapInterval } from './HeatmapIntervalSelector'
import { ASSET_COLORS, type AssetData } from './AllAssetsChart'

const RANGE_SECONDS: Partial<Record<HeatmapInterval, number>> = {
  '1D': 86400,
  '1W': 7 * 86400,
  '1M': 30 * 86400,
  '6M': 180 * 86400,
  '1Y': 365 * 86400,
}

interface HeatmapEntry {
  label: string
  returnPercent: number | null
  offHighPercent: number | null
  price: number | null
  periodLow: number | null
  periodHigh: number | null
  currentPosition: number | null
  yearLow: number | null
  yearHigh: number | null
}

interface Props {
  assets: AssetData[]
  range: HeatmapInterval
  dark: boolean
  onSelect?: (label: string) => void
}

function closeAtOrBefore(data: OhlcPoint[], targetTime: number): number | null {
  let lower = 0
  let upper = data.length - 1
  let result: number | null = null
  while (lower <= upper) {
    const middle = Math.floor((lower + upper) / 2)
    if (data[middle].time <= targetTime) {
      result = data[middle].close
      lower = middle + 1
    } else {
      upper = middle - 1
    }
  }
  return result
}

function baselineTime(lastTime: number, range: HeatmapInterval): number {
  const lastDate = new Date(lastTime * 1000)
  if (range === 'MTD') return Math.floor(Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), 1) / 1000)
  if (range === 'YTD') return Math.floor(Date.UTC(lastDate.getUTCFullYear(), 0, 1) / 1000)
  return lastTime - (RANGE_SECONDS[range] ?? 0)
}

function calculateReturn(data: OhlcPoint[], range: HeatmapInterval): number | null {
  if (data.length === 0) return null
  const last = data[data.length - 1]
  const baseline = closeAtOrBefore(data, baselineTime(last.time, range))
  if (!baseline || baseline === 0) return null
  return ((last.close - baseline) / baseline) * 100
}

function formatReturn(value: number | null) {
  if (value === null) return '—'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function percentOffHigh(data: OhlcPoint[]): number | null {
  const latest = data[data.length - 1]
  if (!latest) return null
  const high = data.reduce((maximum, point) => Math.max(maximum, point.high), Number.NEGATIVE_INFINITY)
  if (!Number.isFinite(high) || high === 0) return null
  return ((latest.close - high) / high) * 100
}

function formatOffHigh(value: number | null) {
  if (value === null) return '— off high'
  if (value >= -0.01) return 'At high'
  return `${value.toFixed(1)}% off high`
}

function periodRange(data: OhlcPoint[], range: HeatmapInterval) {
  const last = data[data.length - 1]
  if (!last) return { periodLow: null, periodHigh: null, currentPosition: null }
  const periodStart = baselineTime(last.time, range)
  const firstIndex = data.findIndex((point) => point.time >= periodStart)
  const points = firstIndex === -1 ? [last] : data.slice(firstIndex)
  const periodLow = points.reduce((minimum, point) => Math.min(minimum, point.low), Number.POSITIVE_INFINITY)
  const periodHigh = points.reduce((maximum, point) => Math.max(maximum, point.high), Number.NEGATIVE_INFINITY)
  if (!Number.isFinite(periodLow) || !Number.isFinite(periodHigh)) {
    return { periodLow: null, periodHigh: null, currentPosition: null }
  }
  const currentPosition = periodHigh === periodLow
    ? 0.5
    : Math.min(1, Math.max(0, (last.close - periodLow) / (periodHigh - periodLow)))
  return { periodLow, periodHigh, currentPosition }
}

function yearRange(data: OhlcPoint[]) {
  const last = data[data.length - 1]
  if (!last) return { yearLow: null, yearHigh: null }
  const points = data.filter((point) => point.time >= last.time - 365 * 86400)
  const yearLow = points.reduce((minimum, point) => Math.min(minimum, point.low), Number.POSITIVE_INFINITY)
  const yearHigh = points.reduce((maximum, point) => Math.max(maximum, point.high), Number.NEGATIVE_INFINITY)
  if (!Number.isFinite(yearLow) || !Number.isFinite(yearHigh)) return { yearLow: null, yearHigh: null }
  return { yearLow, yearHigh }
}

function formatPrice(value: number | null) {
  if (value === null) return '—'
  const maximumFractionDigits = value >= 1000 ? 0 : value >= 1 ? 2 : 4
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits })}`
}

export default function ReturnsHeatmap({ assets, range, dark, onSelect }: Props) {
  const entries: HeatmapEntry[] = assets
    .map(({ label, data }) => ({ label, returnPercent: calculateReturn(data, range), offHighPercent: percentOffHigh(data), price: data.length ? data[data.length - 1].close : null, ...periodRange(data, range), ...yearRange(data) }))
    .sort((a, b) => (b.returnPercent ?? -Infinity) - (a.returnPercent ?? -Infinity))
  const maxMagnitude = Math.max(1, ...entries.map((entry) => Math.abs(entry.returnPercent ?? 0)))

  return (
    <section aria-labelledby="heatmap-heading" className="h-full overflow-auto pr-1">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 id="heatmap-heading" className="text-xl font-bold tracking-tight">{range} return heatmap</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Percentage change from the start of the selected period to each asset&apos;s latest close.</p>
        </div>
        <span className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">{entries.length} assets</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {entries.map(({ label, returnPercent, offHighPercent, price, periodLow, periodHigh, yearLow, yearHigh }) => {
          const positive = (returnPercent ?? 0) >= 0
          const intensity = returnPercent === null ? 0 : 0.1 + (Math.abs(returnPercent) / maxMagnitude) * 0.68
          const color = returnPercent === null ? '#64748b' : positive ? '#22c55e' : '#ef4444'
          const background = returnPercent === null
            ? (dark ? 'rgba(100,116,139,0.08)' : 'rgba(100,116,139,0.05)')
            : positive
              ? `rgba(34,197,94,${intensity})`
              : `rgba(239,68,68,${intensity})`
          const valueColor = returnPercent === null
            ? '#94a3b8'
            : intensity > 0.28
              ? '#ffffff'
              : positive
                ? (dark ? '#86efac' : '#15803d')
                : (dark ? '#fca5a5' : '#b91c1c')
          const mutedColor = returnPercent === null
            ? '#94a3b8'
            : intensity > 0.52
              ? 'rgba(255,255,255,0.82)'
              : (dark ? '#94a3b8' : '#64748b')

          return (
            <div
              key={label}
              role="button"
              tabIndex={0}
              title={`Open ${label} tab`}
              onClick={() => onSelect?.(label)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(label) } }}
              className="min-h-44 cursor-pointer rounded-xl border p-4 flex flex-col justify-between transition-transform hover:-translate-y-0.5"
              style={{ background, borderColor: `${color}55` }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="font-semibold" style={{ color: ASSET_COLORS[label] ?? color }}>
                    {offHighPercent !== null && offHighPercent >= -5 && (
                      <span className="mr-1" style={{ color: '#fbbf24' }} role="img" aria-label="Within 5% of high" title="Within 5% of the high">★</span>
                    )}
                    {label}
                  </span>
                  <span
                    className="truncate text-xs font-medium"
                    style={{ color: offHighPercent === null ? '#94a3b8' : offHighPercent >= -0.01 ? '#22c55e' : (dark ? '#fecaca' : '#b91c1c') }}
                    title="Percentage below the highest loaded candle high"
                  >
                    {formatOffHigh(offHighPercent)}
                  </span>
                  <span
                    className="shrink-0 text-xs font-medium tabular-nums"
                    style={{ color: dark ? '#94a3b8' : '#64748b' }}
                    title={`Highest price in the selected ${range} period`}
                  >
                    {range} high {formatPrice(periodHigh)}
                  </span>
                </div>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: ASSET_COLORS[label] ?? color }} />
              </div>
              <div className="mt-5">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-3xl font-bold tabular-nums" style={{ color: valueColor }}>
                    {formatReturn(returnPercent)}
                  </div>
                  <div className="text-lg font-semibold tabular-nums" style={{ color: valueColor }} title="Latest close">
                    {formatPrice(price)}
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3 text-xs font-medium" style={{ color: mutedColor }}>
                  <span>{range} return</span>
                  <span>Latest price</span>
                </div>
              </div>
              {(() => {
                const span = yearLow !== null && yearHigh !== null ? yearHigh - yearLow : 0
                const at = (value: number | null) => (value === null || span <= 0 ? null : Math.min(1, Math.max(0, (value - (yearLow as number)) / span)) * 100)
                const segStart = at(periodLow)
                const segEnd = at(periodHigh)
                const marker = at(price)
                return (
                  <div
                    className="mt-4"
                    aria-label={`${range} range ${formatPrice(periodLow)} to ${formatPrice(periodHigh)} within the 52 week range ${formatPrice(yearLow)} to ${formatPrice(yearHigh)}`}
                    title={`${range} range: ${formatPrice(periodLow)} – ${formatPrice(periodHigh)}`}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs font-medium tabular-nums" style={{ color: mutedColor }}>
                      <span>{formatPrice(yearLow)}</span>
                      <span className="opacity-80">52wk range</span>
                      <span>{formatPrice(yearHigh)}</span>
                    </div>
                    <div className="relative mt-1.5 h-1.5 rounded-full" style={{ background: dark ? 'rgba(15,23,42,0.55)' : 'rgba(15,23,42,0.18)' }}>
                      {segStart !== null && segEnd !== null && (
                        <div
                          className="absolute inset-y-0 rounded-full"
                          style={{ left: `${segStart}%`, width: `${Math.max(segEnd - segStart, 1.5)}%`, background: color }}
                        />
                      )}
                      {marker !== null && (
                        <span
                          className="absolute top-full mt-0.5 -translate-x-1/2"
                          style={{ left: `${marker}%`, width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: `7px solid ${dark ? '#e2e8f0' : '#334155'}` }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="h-2" />
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span>Lower return</span>
        <div className="h-2 w-32 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(239,68,68,.8), rgba(100,116,139,.18), rgba(34,197,94,.8))' }} />
        <span>Higher return</span>
      </div>
    </section>
  )
}
