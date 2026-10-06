import { useState } from 'react'

export default function RefreshButton({ onRefresh }: { onRefresh: () => void }) {
  const [spinning, setSpinning] = useState(false)

  const handleClick = () => {
    onRefresh()
    setSpinning(true)
    window.setTimeout(() => setSpinning(false), 1000)
  }

  return (
    <button
      onClick={handleClick}
      title="Refresh data"
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-2.5 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500"
    >
      <svg className={`h-3.5 w-3.5 text-emerald-500 ${spinning ? 'animate-spin' : ''}`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M13.3 7.1A5.5 5.5 0 1 1 11.8 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        <path d="M11.4 1.8v2.6H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Refresh
    </button>
  )
}
