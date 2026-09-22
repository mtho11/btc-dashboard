export type RefreshInterval = 0 | 300_000 | 900_000 | 1_800_000 | 3_600_000

export const REFRESH_INTERVALS: Array<{ value: RefreshInterval; label: string }> = [
  { value: 0, label: 'Off' },
  { value: 300_000, label: '5 min' },
  { value: 900_000, label: '15 min' },
  { value: 1_800_000, label: '30 min' },
  { value: 3_600_000, label: '1 hour' },
]

interface Props {
  value: RefreshInterval
  onChange: (value: RefreshInterval) => void
}

export default function RefreshIntervalSelector({ value, onChange }: Props) {
  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-2.5 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
      <svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M13.3 7.1A5.5 5.5 0 1 1 11.8 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        <path d="M11.4 1.8v2.6H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>Refresh</span>
      <select
        aria-label="Auto-refresh interval"
        value={value}
        onChange={(event) => onChange(Number(event.target.value) as RefreshInterval)}
        className="cursor-pointer appearance-none bg-transparent font-semibold text-gray-700 outline-none dark:text-gray-200"
      >
        {REFRESH_INTERVALS.map((interval) => (
          <option key={interval.value} value={interval.value}>{interval.label}</option>
        ))}
      </select>
    </label>
  )
}
