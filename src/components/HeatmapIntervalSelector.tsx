export type HeatmapInterval = '1D' | '1W' | '1M' | 'MTD' | '6M' | 'YTD' | '1Y'

export const HEATMAP_INTERVALS: HeatmapInterval[] = ['1D', '1W', '1M', 'MTD', '6M', 'YTD', '1Y']

export function isHeatmapInterval(value: string | null): value is HeatmapInterval {
  return value !== null && HEATMAP_INTERVALS.includes(value as HeatmapInterval)
}

interface Props {
  value: HeatmapInterval
  onChange: (value: HeatmapInterval) => void
}

export default function HeatmapIntervalSelector({ value, onChange }: Props) {
  return (
    <div aria-label="Heatmap interval" className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-lg">
      {HEATMAP_INTERVALS.map((interval) => (
        <button
          key={interval}
          onClick={() => onChange(interval)}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
            value === interval
              ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          {interval}
        </button>
      ))}
    </div>
  )
}
