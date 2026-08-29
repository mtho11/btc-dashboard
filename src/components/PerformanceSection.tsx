import type { OhlcPoint } from '../lib/indicators'

interface PerformanceSectionProps {
  data: OhlcPoint[]
  symbol: string
}

interface PerformanceMetric {
  label: string
  value: number | null
}

const DAY = 86_400

function closeAtOrBefore(data: OhlcPoint[], targetTime: number): number | null {
  let low = 0
  let high = data.length - 1
  let result: number | null = null

  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    if (data[middle].time <= targetTime) {
      result = data[middle].close
      low = middle + 1
    } else {
      high = middle - 1
    }
  }

  return result
}

function changeFrom(data: OhlcPoint[], targetTime: number): number | null {
  const latest = data[data.length - 1]?.close
  const baseline = closeAtOrBefore(data, targetTime)
  if (!latest || !baseline) return null
  return ((latest - baseline) / baseline) * 100
}

function formatPercent(value: number | null): string {
  if (value === null) return '—'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export default function PerformanceSection({ data, symbol }: PerformanceSectionProps) {
  const latest = data[data.length - 1]
  const latestTime = latest?.time
  const latestDate = latestTime ? new Date(latestTime * 1000) : null
  const ytdStart = latestDate
    ? Math.floor(Date.UTC(latestDate.getUTCFullYear(), 0, 1) / 1000)
    : 0

  const metrics: PerformanceMetric[] = latestTime
    ? [
        { label: '%D', value: changeFrom(data, latestTime - DAY) },
        { label: '%W', value: changeFrom(data, latestTime - 7 * DAY) },
        { label: '%M', value: changeFrom(data, latestTime - 30 * DAY) },
        { label: '% YTD', value: changeFrom(data, ytdStart) },
        { label: '% 1 Year', value: changeFrom(data, latestTime - 365 * DAY) },
        { label: '% 2 Year', value: changeFrom(data, latestTime - 730 * DAY) },
      ]
    : [
        { label: '%D', value: null },
        { label: '%W', value: null },
        { label: '%M', value: null },
        { label: '% YTD', value: null },
        { label: '% 1 Year', value: null },
        { label: '% 2 Year', value: null },
      ]

  return (
    <section aria-labelledby="performance-heading" className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 id="performance-heading" className="text-sm font-semibold">Performance</h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">{symbol} / USD</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white dark:bg-gray-900 px-3 py-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</div>
            <div className={`mt-1 text-sm font-semibold tabular-nums ${
              metric.value === null
                ? 'text-gray-400 dark:text-gray-500'
                : metric.value >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
            }`}>
              {formatPercent(metric.value)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
