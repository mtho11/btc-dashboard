interface LegendItem {
  label: string
  color: string
  value?: number
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
          <span
            className="inline-block w-6 h-0.5 rounded"
            style={{ backgroundColor: item.color, height: 2 }}
          />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {item.label}
          </span>
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
