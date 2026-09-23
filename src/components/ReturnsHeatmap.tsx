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
}

interface Props {
  assets: AssetData[]
  range: HeatmapInterval
  dark: boolean
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

export default function ReturnsHeatmap({ assets, range, dark }: Props) {
  const entries: HeatmapEntry[] = assets
    .map(({ label, data }) => ({ label, returnPercent: calculateReturn(data, range) }))
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
        {entries.map(({ label, returnPercent }) => {
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

          return (
            <div
              key={label}
              className="min-h-32 rounded-xl border p-4 flex flex-col justify-between transition-transform hover:-translate-y-0.5"
              style={{ background, borderColor: `${color}55` }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold" style={{ color: ASSET_COLORS[label] ?? color }}>{label}</span>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: ASSET_COLORS[label] ?? color }} />
              </div>
              <div className="mt-5">
                <div className="text-3xl font-bold tabular-nums" style={{ color: valueColor }}>
                  {formatReturn(returnPercent)}
                </div>
                <div className="mt-1 text-xs font-medium" style={{ color: returnPercent === null ? '#94a3b8' : intensity > 0.52 ? 'rgba(255,255,255,0.82)' : (dark ? '#94a3b8' : '#64748b') }}>
                  {range} return
                </div>
              </div>
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
