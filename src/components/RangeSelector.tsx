export type Range = '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | 'ALL'

const RANGES: Range[] = ['1M', '3M', '6M', '1Y', '2Y', '5Y', 'ALL']

interface RangeSelectorProps {
  value: Range
  onChange: (r: Range) => void
}

export default function RangeSelector({ value, onChange }: RangeSelectorProps) {
  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-lg">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
            value === r
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  )
}
