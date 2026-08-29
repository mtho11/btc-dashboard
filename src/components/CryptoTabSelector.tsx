export type CryptoTab = 'BTC' | 'ETH' | 'SOL' | 'HYPE' | 'ZEC'

const TABS: CryptoTab[] = ['BTC', 'ETH', 'SOL', 'HYPE', 'ZEC']

interface CryptoTabSelectorProps {
  value: CryptoTab
  onChange: (tab: CryptoTab) => void
}

export default function CryptoTabSelector({ value, onChange }: CryptoTabSelectorProps) {
  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-lg">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-150 ${
            value === tab
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
