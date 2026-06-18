export type TickerSymbol = 'BTC' | 'QQQ' | 'SPY'

const SYMBOLS: TickerSymbol[] = ['BTC', 'QQQ', 'SPY']

interface SymbolSelectorProps {
  value: TickerSymbol
  onChange: (s: TickerSymbol) => void
}

export default function SymbolSelector({ value, onChange }: SymbolSelectorProps) {
  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-lg">
      {SYMBOLS.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
            value === s
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}
