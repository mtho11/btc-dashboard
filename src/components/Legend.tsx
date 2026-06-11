interface LegendItem {
  label: string
  color: string
  value?: number
  dashed?: boolean
}

interface LegendProps {
  items: LegendItem[]
}

function fmt(v?: number) {
  if (v == null) return '—'
  return v >= 1000
    ? '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : '$' + v.toFixed(2)
}

export default function Legend({ items }: LegendProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          {item.dashed ? (
            <svg width="24" height="4" viewBox="0 0 24 4">
              <line x1="0" y1="2" x2="24" y2="2" stroke={item.color} strokeWidth="2" strokeDasharray="4 2" />
            </svg>
          ) : (
            <span className="inline-block w-6 rounded" style={{ backgroundColor: item.color, height: 2 }} />
          )}
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.label}</span>
          {item.value != null && (
            <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-200">
              {fmt(item.value)}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
