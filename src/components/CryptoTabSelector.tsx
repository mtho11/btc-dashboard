export type CryptoTab = 'ALL' | 'HEATMAP' | 'BTC' | 'ETH' | 'SOL' | 'SUI' | 'HYPE' | 'ZEC' | 'NEAR' | 'GOLD' | 'SILVER' | 'OIL' | 'SPY' | 'QQQ'

export const CRYPTO_TABS: CryptoTab[] = ['ALL', 'HEATMAP', 'BTC', 'ETH', 'SOL', 'SUI', 'HYPE', 'ZEC', 'NEAR', 'GOLD', 'SILVER', 'OIL', 'SPY', 'QQQ']

export function isCryptoTab(value: string | null): value is CryptoTab {
  return value !== null && CRYPTO_TABS.includes(value as CryptoTab)
}

interface CryptoTabSelectorProps {
  value: CryptoTab
  onChange: (tab: CryptoTab) => void
}

function TabIcon({ tab }: { tab: CryptoTab }) {
  const common = { className: 'w-3.5 h-3.5 shrink-0', viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true }

  switch (tab) {
    case 'ALL':
      return <svg {...common}><rect x="2" y="2" width="5" height="5" rx="1" fill="#f59e0b"/><rect x="9" y="2" width="5" height="5" rx="1" fill="#fbbf24"/><rect x="2" y="9" width="5" height="5" rx="1" fill="#fbbf24"/><rect x="9" y="9" width="5" height="5" rx="1" fill="#f59e0b"/></svg>
    case 'HEATMAP':
      return <svg {...common}><rect x="2" y="2" width="5" height="5" rx="1" fill="#22c55e"/><rect x="9" y="2" width="5" height="5" rx="1" fill="#86efac"/><rect x="2" y="9" width="5" height="5" rx="1" fill="#fca5a5"/><rect x="9" y="9" width="5" height="5" rx="1" fill="#ef4444"/></svg>
    case 'BTC':
      return <span aria-hidden className="w-3.5 h-3.5 rounded-full bg-orange-500 text-[10px] leading-[14px] text-center text-white font-bold">₿</span>
    case 'ETH':
      return <svg {...common}><path d="M8 1.5 3.7 8 8 10.5 12.3 8 8 1.5Z" fill="#818cf8"/><path d="m8 14-4.3-5L8 11.5 12.3 9 8 14Z" fill="#a5b4fc"/></svg>
    case 'SOL':
      return <svg {...common}><path d="M4 3h8l-2 2H2l2-2Zm0 4h8l-2 2H2l2-2Zm0 4h8l-2 2H2l2-2Z" fill="#a855f7"/></svg>
    case 'SUI':
      return <svg {...common}><path d="M8 1.5C6.4 4.2 3.7 6.7 3.7 9.6a4.3 4.3 0 0 0 8.6 0C12.3 6.7 9.6 4.2 8 1.5Z" fill="#60a5fa"/></svg>
    case 'HYPE':
      return <svg {...common}><path d="M9.2 1.5 3.5 9h3.7L6.8 14.5 12.5 7H8.8l.4-5.5Z" fill="#10b981"/></svg>
    case 'ZEC':
      return <svg {...common}><circle cx="8" cy="8" r="6" fill="#eab308"/><path d="M5 5h6L5 11h6M8 3v10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>
    case 'NEAR':
      return <svg {...common}><path d="M3 12 7.8 4l1.7 8 3.5-8" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    case 'GOLD':
      return <svg {...common}><circle cx="8" cy="8" r="5.5" fill="#fbbf24"/><circle cx="8" cy="8" r="3.2" stroke="#fef3c7" strokeWidth="1"/></svg>
    case 'SILVER':
      return <svg {...common}><circle cx="8" cy="8" r="5.5" fill="#94a3b8"/><path d="M5 8h6" stroke="#e2e8f0" strokeWidth="1.2" strokeLinecap="round"/></svg>
    case 'OIL':
      return <svg {...common}><path d="M8 1.5C6.3 4.5 4.2 6.6 4.2 9.3a3.8 3.8 0 1 0 7.6 0C11.8 6.6 9.7 4.5 8 1.5Z" fill="#fb7185"/></svg>
    case 'SPY':
      return <svg {...common}><path d="m2.5 11 3-3 2.2 1.6L13.5 4" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 4h3.5v3.5" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    case 'QQQ':
      return <svg {...common}><circle cx="4" cy="8" r="2" fill="#c084fc"/><circle cx="8" cy="8" r="2" fill="#d8b4fe"/><circle cx="12" cy="8" r="2" fill="#c084fc"/></svg>
  }
}

function TabButton({ tab, selected, onChange, emphasis = 'asset' }: { tab: CryptoTab; selected: boolean; onChange: (tab: CryptoTab) => void; emphasis?: 'asset' | 'all' | 'heatmap' }) {
  const activeColor = emphasis === 'all'
    ? 'text-amber-500 dark:text-amber-400'
    : emphasis === 'heatmap'
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-blue-600 dark:text-blue-400'

  return (
    <button
      onClick={() => onChange(tab)}
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-150 ${
        selected
          ? `bg-white dark:bg-gray-700 ${activeColor} shadow-sm`
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
      }`}
    >
      <TabIcon tab={tab} />
      {tab}
    </button>
  )
}

export default function CryptoTabSelector({ value, onChange }: CryptoTabSelectorProps) {
  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-lg">
      <TabButton tab="ALL" selected={value === 'ALL'} onChange={onChange} emphasis="all" />
      <TabButton tab="HEATMAP" selected={value === 'HEATMAP'} onChange={onChange} emphasis="heatmap" />
      <div className="w-px bg-gray-300 dark:bg-gray-600 my-1" />
      {(['BTC', 'ETH', 'SOL', 'SUI', 'HYPE', 'ZEC', 'NEAR', 'GOLD', 'SILVER', 'OIL', 'SPY', 'QQQ'] as const).map((tab) => (
        <TabButton key={tab} tab={tab} selected={value === tab} onChange={onChange} />
      ))}
    </div>
  )
}
