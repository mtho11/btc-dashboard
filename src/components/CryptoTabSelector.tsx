import { useState, useRef, useEffect } from 'react'

export type CryptoTab = 'ALL' | 'HEATMAP' | 'BTC' | 'ETH' | 'SOL' | 'SUI' | 'HYPE' | 'ZEC' | 'NEAR' | 'GOLD' | 'SILVER' | 'OIL' | 'SPY' | 'QQQ'

export interface CustomTabDef {
  symbol: string
  instId: string
}

export const CRYPTO_TABS: CryptoTab[] = ['ALL', 'HEATMAP', 'BTC', 'ETH', 'SOL', 'SUI', 'HYPE', 'ZEC', 'NEAR', 'GOLD', 'SILVER', 'OIL', 'SPY', 'QQQ']

export function isCryptoTab(value: string | null): value is CryptoTab {
  return value !== null && (CRYPTO_TABS as string[]).includes(value)
}

interface CryptoTabSelectorProps {
  value: string
  onChange: (tab: string) => void
  customTabs?: CustomTabDef[]
  onAddCustom?: (tab: CustomTabDef) => void
  onRemoveCustom?: (symbol: string) => void
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

function TabButton({ tab, selected, onChange, emphasis = 'asset' }: { tab: CryptoTab; selected: boolean; onChange: (tab: string) => void; emphasis?: 'asset' | 'all' | 'heatmap' }) {
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

function CustomTabButton({ tab, selected, onChange, onRemove }: {
  tab: CustomTabDef
  selected: boolean
  onChange: (s: string) => void
  onRemove: (s: string) => void
}) {
  return (
    <div className="group relative inline-flex items-center">
      <button
        onClick={() => onChange(tab.symbol)}
        className={`inline-flex items-center gap-1.5 pl-3 pr-7 py-1.5 rounded-md text-sm font-semibold transition-all duration-150 ${
          selected
            ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
        }`}
      >
        <span className="w-3.5 h-3.5 shrink-0 rounded-full bg-violet-400 dark:bg-violet-500 flex items-center justify-center text-[8px] text-white font-bold leading-none">
          {tab.symbol.charAt(0)}
        </span>
        {tab.symbol}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(tab.symbol) }}
        aria-label={`Remove ${tab.symbol}`}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
      >
        ×
      </button>
    </div>
  )
}

export default function CryptoTabSelector({ value, onChange, customTabs = [], onAddCustom, onRemoveCustom }: CryptoTabSelectorProps) {
  const [adding, setAdding] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const handleAdd = () => {
    const raw = inputVal.trim().toUpperCase()
    if (!raw) { setAdding(false); return }

    let symbol: string
    let instId: string

    if (raw.includes('-')) {
      symbol = raw.split('-')[0]
      instId = raw
    } else {
      symbol = raw
      instId = `${raw}-USDT`
    }

    if ((CRYPTO_TABS as string[]).includes(symbol)) return
    if (customTabs.some(t => t.symbol === symbol)) return

    onAddCustom?.({ symbol, instId })
    onChange(symbol)
    setInputVal('')
    setAdding(false)
  }

  const handleCancel = () => {
    setAdding(false)
    setInputVal('')
  }

  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/60 p-1 rounded-lg flex-wrap">
      <TabButton tab="ALL" selected={value === 'ALL'} onChange={onChange} emphasis="all" />
      <TabButton tab="HEATMAP" selected={value === 'HEATMAP'} onChange={onChange} emphasis="heatmap" />
      <div className="w-px bg-gray-300 dark:bg-gray-600 my-1" />
      {(['BTC', 'ETH', 'SOL', 'SUI', 'HYPE', 'ZEC', 'NEAR', 'GOLD', 'SILVER', 'OIL', 'SPY', 'QQQ'] as const).map((tab) => (
        <TabButton key={tab} tab={tab} selected={value === tab} onChange={onChange} />
      ))}
      {customTabs.length > 0 && <div className="w-px bg-gray-300 dark:bg-gray-600 my-1" />}
      {customTabs.map((tab) => (
        <CustomTabButton
          key={tab.symbol}
          tab={tab}
          selected={value === tab.symbol}
          onChange={onChange}
          onRemove={onRemoveCustom ?? (() => {})}
        />
      ))}
      {adding ? (
        <div className="inline-flex items-center gap-1 px-1">
          <input
            ref={inputRef}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') handleCancel()
            }}
            placeholder="DOGE or DOGE-USDT"
            className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 w-32 outline-none focus:border-violet-400 dark:focus:border-violet-500"
          />
          <button
            onClick={handleAdd}
            className="text-xs font-bold text-violet-500 hover:text-violet-700 dark:hover:text-violet-300 px-1 py-1 transition-colors"
            title="Add"
          >✓</button>
          <button
            onClick={handleCancel}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-1 py-1 transition-colors"
            title="Cancel"
          >✕</button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          title="Add custom symbol"
          className="px-2 py-1 rounded-md text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          +
        </button>
      )}
    </div>
  )
}
