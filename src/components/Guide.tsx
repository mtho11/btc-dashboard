import { useState } from 'react'

const AMBER = '#f59e0b'
const BLUE = '#3b82f6'
const PURPLE = '#a855f7'
const GREEN = '#22c55e'
const RED = '#ef4444'
const PINK = '#ec4899'

// ─── Step visuals ────────────────────────────────────────────────────────────

const VisualTabs = () => (
  <div className="flex flex-wrap gap-2 justify-center py-2">
    {[
      ['ALL', '#f59e0b'],
      ['HEATMAP', '#fb7185'],
      ['BTC', '#f97316'],
      ['ETH', '#818cf8'],
      ['SOL', '#a855f7'],
      ['SUI', '#60a5fa'],
      ['HYPE', '#10b981'],
      ['ZEC', '#eab308'],
      ['NEAR', '#38bdf8'],
      ['GOLD', '#fbbf24'],
      ['SILVER', '#94a3b8'],
      ['OIL', '#fb7185'],
      ['SPY', '#38bdf8'],
      ['QQQ', '#c084fc'],
    ].map(([label, color]) => (
      <span
        key={label}
        className="px-3 py-1.5 rounded-lg text-sm font-bold"
        style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
      >
        {label}
      </span>
    ))}
  </div>
)

const VisualTickerAndRefresh = () => (
  <svg viewBox="0 0 400 112" className="w-full rounded-lg overflow-hidden">
    <rect width="400" height="112" fill="#0f172a" rx="8"/>
    {/* Daily ticker snapshot */}
    <rect x="0" y="0" width="400" height="25" fill="#111827"/>
    <circle cx="14" cy="12.5" r="3" fill="#22c55e"/>
    <text x="22" y="16" fontSize="8" fill="#cbd5e1" fontWeight="700" fontFamily="Inter, sans-serif">DAILY</text>
    {[
      ['BTC', '-0.16%', RED], ['ETH', '+1.08%', GREEN], ['SUI', '+3.76%', GREEN], ['OIL', '-2.93%', RED], ['QQQ', '+2.77%', GREEN],
    ].map(([label, value, color], index) => (
      <g key={String(label)} transform={`translate(${70 + index * 66}, 0)`}>
        <text x="0" y="16" fontSize="7" fill="#e2e8f0" fontWeight="700" fontFamily="Inter, sans-serif">{label}</text>
        <text x="0" y="23" fontSize="6.5" fill={String(color)} fontFamily="monospace">{value}</text>
      </g>
    ))}
    {/* Header and refresh control snapshot */}
    <circle cx="16" cy="45" r="10" fill="#f97316"/>
    <text x="13" y="49" fontSize="10" fill="#fff" fontWeight="700" fontFamily="Inter, sans-serif">₿</text>
    <text x="32" y="47" fontSize="10" fill="#f8fafc" fontWeight="700" fontFamily="Inter, sans-serif">Mike's Trading Tracker</text>
    <rect x="284" y="35" width="96" height="21" rx="5" fill="#1f2937" stroke="#334155"/>
    <path d="M294 47a4 4 0 1 0 1-3" fill="none" stroke="#22c55e" strokeWidth="1.2" strokeLinecap="round"/>
    <text x="302" y="48.5" fontSize="7" fill="#cbd5e1" fontFamily="Inter, sans-serif">Refresh</text>
    <text x="346" y="48.5" fontSize="7" fill="#f8fafc" fontWeight="700" fontFamily="Inter, sans-serif">15 min</text>
    {/* Current tab row snapshot */}
    <rect x="10" y="71" width="380" height="29" rx="6" fill="#1f2937"/>
    {['ALL', 'HEATMAP', 'BTC', 'ETH', 'SOL', 'SUI', 'HYPE', 'ZEC'].map((tab, index) => (
      <g key={tab} transform={`translate(${[17, 59, 128, 170, 212, 254, 296, 344][index]}, 0)`}>
        <circle cx="4" cy="85" r="2.4" fill={index === 0 ? AMBER : index === 1 ? '#fb7185' : '#60a5fa'}/>
        <text x="9" y="87.5" fontSize="6.5" fill={index === 2 ? '#60a5fa' : '#cbd5e1'} fontFamily="Inter, sans-serif" fontWeight="700">{tab}</text>
      </g>
    ))}
  </svg>
)

const VisualHeatmap = () => (
  <svg viewBox="0 0 400 114" className="w-full rounded-lg overflow-hidden">
    <rect width="400" height="114" fill="#0f172a" rx="8"/>
    <text x="12" y="18" fontSize="11" fill="#f8fafc" fontWeight="700" fontFamily="Inter, sans-serif">1Y return heatmap</text>
    <text x="12" y="29" fontSize="7" fill="#94a3b8" fontFamily="Inter, sans-serif">Selected-period percentage returns</text>
    {[
      ['ZEC', '+158.68%', '#4b9d5c'], ['HYPE', '+139.13%', '#468e55'], ['SUI', '+53.44%', '#285c40'],
      ['OIL', '+48.42%', '#234f39'], ['BTC', '-23.98%', '#5f3037'], ['ETH', '-34.11%', '#71333b'],
    ].map(([label, value, color], index) => {
      const x = 12 + (index % 3) * 126
      const y = 39 + Math.floor(index / 3) * 35
      return <g key={String(label)}>
        <rect x={x} y={y} width="116" height="29" rx="5" fill={String(color)} stroke="rgba(255,255,255,.12)"/>
        <text x={x + 8} y={y + 12} fontSize="7" fill="#e2e8f0" fontWeight="700" fontFamily="Inter, sans-serif">{label}</text>
        <text x={x + 8} y={y + 23} fontSize="10" fill="#fff" fontWeight="700" fontFamily="Inter, sans-serif">{value}</text>
      </g>
    })}
  </svg>
)

const VisualAllChart = () => (
  <svg viewBox="0 0 400 90" className="w-full rounded-lg overflow-hidden">
    <rect width="400" height="90" fill="#0f172a" rx="8"/>
    {/* faded lines */}
    <path d="M 10,70 C 80,68 140,60 200,52 C 260,44 320,40 390,38" stroke="#f97316" strokeWidth="1" fill="none" opacity="0.25"/>
    <path d="M 10,72 C 80,69 140,65 200,58 C 260,50 320,52 390,56" stroke="#818cf8" strokeWidth="1" fill="none" opacity="0.25"/>
    <path d="M 10,68 C 80,65 140,58 200,55 C 260,52 320,48 390,44" stroke="#eab308" strokeWidth="1" fill="none" opacity="0.25"/>
    <path d="M 10,71 C 80,70 140,66 200,60 C 260,54 320,56 390,60" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.25"/>
    {/* winner: HYPE thick */}
    <path d="M 10,75 C 80,70 140,58 200,40 C 260,22 320,14 390,10" stroke="#10b981" strokeWidth="2.5" fill="none"/>
    {/* HYPE label */}
    <text x="316" y="8" fontSize="9" fill="#10b981" fontWeight="700" fontFamily="Inter, sans-serif">HYPE +119%</text>
    {/* axis labels */}
    <text x="378" y="18" fontSize="8" fill="#94a3b8" fontFamily="Inter, sans-serif">200%</text>
    <text x="380" y="82" fontSize="8" fill="#94a3b8" fontFamily="Inter, sans-serif">0%</text>
  </svg>
)

const VisualHover = () => (
  <svg viewBox="0 0 400 80" className="w-full rounded-lg overflow-hidden">
    <rect width="400" height="80" fill="#0f172a" rx="8"/>
    {/* faded lines */}
    <path d="M 10,55 C 100,53 200,50 390,48" stroke="#f97316" strokeWidth="1" fill="none" opacity="0.15"/>
    <path d="M 10,60 C 100,58 200,56 390,58" stroke="#818cf8" strokeWidth="1" fill="none" opacity="0.15"/>
    <path d="M 10,58 C 100,55 200,52 390,50" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.15"/>
    {/* highlighted line: ZEC */}
    <path d="M 10,62 C 80,60 160,65 220,68 C 280,71 340,70 390,72" stroke="#eab308" strokeWidth="2.5" fill="none"/>
    {/* crosshair */}
    <line x1="220" y1="10" x2="220" y2="75" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3"/>
    <line x1="10" y1="68" x2="390" y2="68" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3"/>
    {/* tooltip */}
    <rect x="228" y="56" width="80" height="22" rx="5" fill="rgba(10,14,26,0.95)" stroke="#eab308" strokeWidth="0.8"/>
    <circle cx="238" cy="67" r="4" fill="#eab308"/>
    <text x="246" y="71" fontSize="9" fill="#f0f2ff" fontWeight="700" fontFamily="Inter, sans-serif">ZEC</text>
    <text x="263" y="71" fontSize="9" fill="#ef4444" fontFamily="monospace">-28.4%</text>
  </svg>
)

const VisualMAs = () => (
  <svg viewBox="0 0 400 90" className="w-full rounded-lg overflow-hidden">
    <rect width="400" height="90" fill="#0f172a" rx="8"/>
    {/* candles (simplified) */}
    {[30,50,70,90,110,130,150,170,190,210,230,250,270,290,310,330,350,370].map((x, i) => {
      const h = 25 + Math.sin(i * 0.6) * 18
      const green = i % 3 !== 0
      return (
        <g key={x}>
          <rect x={x-3} y={60-h} width={6} height={h} fill={green ? '#22c55e' : '#ef4444'} opacity="0.6"/>
        </g>
      )
    })}
    {/* 50D MA amber */}
    <path d="M 20,55 C 80,52 140,45 200,38 C 260,32 320,35 390,40" stroke={AMBER} strokeWidth="1.8" fill="none"/>
    {/* 200D MA blue */}
    <path d="M 20,65 C 90,62 160,55 220,48 C 290,42 340,44 390,46" stroke={BLUE} strokeWidth="1.8" fill="none"/>
    {/* 200W MA purple */}
    <path d="M 20,75 C 150,73 280,70 390,68" stroke={PURPLE} strokeWidth="1.5" fill="none"/>
    {/* labels */}
    <text x="6" y="40" fontSize="8" fill={AMBER} fontFamily="Inter, sans-serif">50D</text>
    <text x="6" y="52" fontSize="8" fill={BLUE} fontFamily="Inter, sans-serif">200D</text>
    <text x="6" y="76" fontSize="8" fill={PURPLE} fontFamily="Inter, sans-serif">200W</text>
  </svg>
)

const VisualCrosses = () => (
  <svg viewBox="0 0 400 100" className="w-full rounded-lg overflow-hidden">
    <rect width="400" height="100" fill="#0f172a" rx="8"/>
    {/* 50D MA amber */}
    <path d="M 20,70 C 70,65 100,55 130,45 C 160,35 190,30 220,28 C 270,25 330,38 390,45" stroke={AMBER} strokeWidth="2" fill="none"/>
    {/* 200D MA blue */}
    <path d="M 20,55 C 60,53 100,50 130,48 C 160,46 190,40 220,35 C 270,30 330,32 390,35" stroke={BLUE} strokeWidth="2" fill="none"/>
    {/* death cross at x=130 */}
    <line x1="130" y1="30" x2="130" y2="90" stroke={RED} strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>
    <polygon points="130,28 123,18 137,18" fill={RED}/>
    <rect x="128" y="8" width="4" height="11" fill={RED}/>
    <text x="90" y="14" fontSize="8" fill={RED} fontFamily="Inter, sans-serif" fontWeight="700">Death cross</text>
    {/* golden cross at x=220 */}
    <line x1="220" y1="24" x2="220" y2="90" stroke={GREEN} strokeWidth="1" strokeDasharray="3,3" opacity="0.5"/>
    <polygon points="220,80 213,70 227,70" fill={GREEN}/>
    <rect x="218" y="80" width="4" height="10" fill={GREEN}/>
    <text x="228" y="88" fontSize="8" fill={GREEN} fontFamily="Inter, sans-serif" fontWeight="700">Golden cross</text>
  </svg>
)

const VisualM2 = () => (
  <svg viewBox="0 0 400 90" className="w-full rounded-lg overflow-hidden">
    <rect width="400" height="90" fill="#0f172a" rx="8"/>
    {/* axes */}
    <line x1="48" y1="8" x2="48" y2="80" stroke="#1e2640" strokeWidth="1"/>
    <line x1="352" y1="8" x2="352" y2="80" stroke="#1e2640" strokeWidth="1"/>
    {/* left axis labels (M2) */}
    <text x="2" y="30" fontSize="8" fill={PINK} fontFamily="Inter, sans-serif">$23T</text>
    <text x="2" y="60" fontSize="8" fill={PINK} fontFamily="Inter, sans-serif">$21T</text>
    <text x="2" y="78" fontSize="8" fill={PINK} fontFamily="Inter, sans-serif">$20T</text>
    {/* right axis labels (price) */}
    <text x="356" y="22" fontSize="8" fill="#94a3b8" fontFamily="Inter, sans-serif">$100k</text>
    <text x="356" y="55" fontSize="8" fill="#94a3b8" fontFamily="Inter, sans-serif">$60k</text>
    <text x="356" y="78" fontSize="8" fill="#94a3b8" fontFamily="Inter, sans-serif">$30k</text>
    {/* BTC price line (blue) */}
    <path d="M 52,72 C 100,70 150,65 190,50 C 230,35 270,18 310,15 C 330,20 345,32 352,38" stroke={BLUE} strokeWidth="1.5" fill="none" opacity="0.8"/>
    {/* M2 pink dashed */}
    <path d="M 52,76 C 130,72 230,64 352,52" stroke={PINK} strokeWidth="1.5" fill="none" strokeDasharray="5,4" opacity="0.6"/>
    <text x="250" y="48" fontSize="8" fill={PINK} fontFamily="Inter, sans-serif">M2 →</text>
    <text x="265" y="25" fontSize="8" fill={BLUE} fontFamily="Inter, sans-serif">BTC price →</text>
    {/* arrow showing lag */}
    <text x="90" y="14" fontSize="8" fill="#64748b" fontFamily="Inter, sans-serif">3–6 month lag</text>
  </svg>
)

const VisualStats = () => (
  <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden border border-gray-700/50">
    {[
      ['%D', '-0.47%', false],
      ['%W', '+3.38%', true],
      ['%M', '+25.76%', true],
      ['%YTD', '-8.02%', false],
      ['%1Y', '-26.05%', false],
      ['%2Y', '+39.30%', true],
    ].map(([label, val, pos]) => (
      <div key={String(label)} className="bg-gray-800/50 px-3 py-2.5">
        <div className="text-gray-500 text-xs mb-1">{label}</div>
        <div className="font-mono text-sm font-semibold" style={{ color: pos ? GREEN : RED }}>{val}</div>
      </div>
    ))}
  </div>
)

const VisualPeriodLines = () => (
  <svg viewBox="0 0 400 80" className="w-full rounded-lg overflow-hidden">
    <rect width="400" height="80" fill="#0f172a" rx="8"/>
    {/* price area */}
    <path d="M 20,60 C 70,55 110,40 160,30 C 200,22 250,35 300,45 C 340,52 370,48 390,45 L 390,72 L 20,72 Z" fill="rgba(59,130,246,0.08)"/>
    <path d="M 20,60 C 70,55 110,40 160,30 C 200,22 250,35 300,45 C 340,52 370,48 390,45" stroke={BLUE} strokeWidth="1.5" fill="none" opacity="0.5"/>
    {/* period high */}
    <line x1="20" y1="22" x2="390" y2="22" stroke="#64748b" strokeWidth="1" strokeDasharray="4,5"/>
    <text x="330" y="18" fontSize="8" fill="#94a3b8" fontFamily="Inter, sans-serif">Period high</text>
    {/* period low */}
    <line x1="20" y1="60" x2="390" y2="60" stroke="#64748b" strokeWidth="1" strokeDasharray="4,5"/>
    <text x="332" y="68" fontSize="8" fill="#94a3b8" fontFamily="Inter, sans-serif">Period low</text>
  </svg>
)

// ─── Steps ───────────────────────────────────────────────────────────────────

type Step = {
  title: string
  body: string[]
  tip?: string
  visual?: React.ReactNode
}

const steps: Step[] = [
  {
    title: 'Welcome to Mike\'s Trading Tracker',
    body: [
      'Track Bitcoin, Ethereum, Solana, Sui, Hyperliquid, Zcash, NEAR, Gold, Silver, Oil, SPY, and QQQ from one dashboard. Use ALL for a normalized comparison, HEATMAP for ranked period returns, or open a single asset for a detailed candlestick view.',
      'The ticker tape at the top shows each tracked asset\'s one-day return. Crypto data is sourced from OKX; M2 comes from FRED; commodity and equity snapshots are refreshed daily from Yahoo Finance.',
    ],
    tip: 'Use the Refresh control in the top bar to choose Off, 5 minutes, 15 minutes, 30 minutes, or 1 hour. The selected asset and range are preserved in the URL, so you can bookmark any view.',
    visual: <VisualTabs />,
  },
  {
    title: 'Ticker tape & refresh controls',
    body: [
      'The daily ticker tape sits above the dashboard title and shows the latest one-day percentage return for every tracked asset. Green indicates a gain; red indicates a loss. It scrolls continuously and pauses when you hover it.',
      'The Refresh control is in the header. Choose Off, 5 minutes, 15 minutes, 30 minutes, or 1 hour. A 15-minute interval is the default for new visitors and your choice is remembered on this device.',
    ],
    tip: 'Commodity and equity figures use the latest available daily close, while crypto updates from the OKX market feed. The tape may briefly show a dash while data is loading.',
    visual: <VisualTickerAndRefresh />,
  },
  {
    title: 'Start with the ALL tab',
    body: [
      'The ALL tab is the best starting point. It shows every asset on one chart, each normalized to % return from the start of the selected range. This instantly answers: "Which asset has actually made me money this year?"',
      'The top performer is highlighted with a thick, bright line. All others are faded so the winner is immediately obvious no matter how cluttered the chart gets.',
    ],
    tip: 'Change the range (1M · 3M · 6M · 1Y · 2Y · 5Y) to compare different horizons. The highlighted leader updates as the range changes.',
    visual: <VisualHeatmap />,
  },
  {
    title: 'Scan returns in HEATMAP',
    body: [
      'The HEATMAP tab sits beside ALL and ranks every tracked asset by percentage return over the selected timeframe. Green cells are positive, red cells are negative, and stronger color intensity indicates a larger move.',
      'Each card uses the asset\'s latest available close and the first close in the selected period, so markets with different trading calendars can still be compared quickly.',
    ],
    tip: 'Use HEATMAP when you want a fast ranking; switch to ALL when you want to see how those returns developed over time.',
    visual: <VisualAllChart />,
  },
  {
    title: 'Hover to inspect any line',
    body: [
      'In the ALL view, move your cursor over any line to focus on it. The hovered line turns bright and thick while everything else fades. A tooltip appears showing the asset\'s exact % return at that date.',
      'Scrub left and right to sweep through time — watch rankings shift. You might see HYPE was deep in the red before a sudden surge, or Gold quietly outperforming all year.',
    ],
    tip: 'Use the cursor to compare the same point in time across assets. The comparison chart shows normalized returns, not price levels.',
    visual: <VisualHover />,
  },
  {
    title: 'Reading a single asset chart',
    body: [
      'Click any tab to see its candlestick chart. Each candle is one day: green = price went up, red = price went down. The wick shows the high and low; the body shows open and close.',
      'Three moving average lines are overlaid to show trend direction. The 50-day MA (amber) reacts quickly to price changes. The 200-day MA (blue) is slower and more reliable for long-term trend. The 200-week MA (purple) is the multi-year baseline.',
    ],
    tip: 'Moving averages are trend indicators, not predictions. The price scale is on the right; the M2 overlay, when available, uses the left scale.',
    visual: <VisualMAs />,
  },
  {
    title: 'Death & Golden Crosses',
    body: [
      'The chart marks intersections between the 50-day and 200-day averages. A green up arrow marks a golden cross (50D moves above 200D); a red down arrow marks a death cross (50D moves below 200D). Each marker has a matching dashed guide to the date axis.',
      'Small green and red dots mark where price crosses the 50-day average. Use longer ranges to see more historical signals.',
    ],
    tip: 'Crosses are lagging signals: they describe a change already underway and should be considered alongside price action and your own risk process.',
    visual: <VisualCrosses />,
  },
  {
    title: 'M2 money supply overlay',
    body: [
      'The pink dashed line shows US M2 money supply, a measure of broad dollar liquidity. It uses the left axis so it doesn\'t distort the asset price on the right axis.',
      'M2 is a macro context series, not a trading signal. Its timing and relationship to individual assets can vary.',
    ],
    tip: 'Use the legend and crosshair to read the M2 level at a particular date alongside the selected asset.',
    visual: <VisualM2 />,
  },
  {
    title: 'Period high & low lines',
    body: [
      'Two dashed horizontal lines mark the highest and lowest price within your selected range. These aren\'t all-time records — just the extremes of the window you\'re looking at.',
      'These levels act as natural resistance (near the period high) and support (near the period low). Price approaching the period high often slows down; approaching the period low may find buyers.',
    ],
    tip: 'Change the range to see how these levels shift. A price near its 1Y high but in the middle of its 5Y range tells a very different story than one near both highs at once.',
    visual: <VisualPeriodLines />,
  },
  {
    title: 'Performance stats',
    body: [
      'The stats row at the bottom shows % return over six timeframes: Day, Week, Month, Year-to-date, 1 Year, and 2 Year. All figures are from the most recent close. Green = positive, red = negative.',
      'Read across the row to understand momentum. If %D and %W are red but %1Y and %2Y are green, you\'re likely in a short-term dip inside a longer uptrend — potentially a buying opportunity. If everything is red, the downtrend is broad.',
    ],
    tip: 'Compare %YTD vs %1Y. If %1Y is far better than %YTD, last year\'s strong finish is making the current year look worse than it is. If %YTD > %1Y, momentum is accelerating.',
    visual: <VisualStats />,
  },
  {
    title: 'A practical workflow',
    body: ['Use the dashboard to organize information before making your own decision:'],
    visual: (
      <div className="flex flex-col gap-2">
        {[
          ['Start in ALL view', 'Compare normalized returns over the timeframe you care about.'],
          ['Scan HEATMAP', 'Rank every asset by selected-period return before drilling into a chart.'],
          ['Check the ticker', 'See the latest daily move across every tracked asset at a glance.'],
          ['Open a single asset', 'Inspect daily candles, moving averages, price/MA crossings, and range extremes.'],
          ['Check the performance row', 'Compare short-term returns with YTD, 1-year, and 2-year changes.'],
          ['Use M2 as context', 'Read the macro liquidity series without mixing its scale with the asset price.'],
          ['Compare different asset types', 'Use Gold, Silver, Oil, SPY, and QQQ alongside the crypto tabs for broader context.'],
          ['Bookmark a view', 'The URL updates with your asset and range, so you can return to it directly.'],
        ].map(([title, desc]) => (
          <div key={String(title)} className="flex gap-3 items-start">
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: AMBER }} />
            <div>
              <span className="text-xs font-semibold" style={{ color: AMBER }}>{title} — </span>
              <span className="text-xs text-gray-400">{desc}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void
}

export default function Guide({ onClose }: Props) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-gray-900 border border-gray-700/80 rounded-2xl w-full shadow-2xl flex flex-col"
        style={{ maxWidth: 520, maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold" style={{ fontSize: 10 }}>₿</span>
            </div>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: AMBER }}>Guide</span>
            <span className="text-xs text-gray-600">Step {step + 1} of {steps.length}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-200 transition-colors text-xl leading-none"
            aria-label="Close guide"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
          {current.visual && (
            <div className="mb-5">{current.visual}</div>
          )}
          <h2 className="text-lg font-bold text-white mb-3 leading-snug">{current.title}</h2>
          {current.body.map((p, i) => (
            <p key={i} className="text-sm text-gray-400 leading-relaxed mb-3">{p}</p>
          ))}
          {current.tip && (
            <div className="mt-4 rounded-lg px-4 py-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: AMBER }}>Tip  </span>
              <span className="text-sm" style={{ color: 'rgba(253,230,138,0.75)' }}>{current.tip}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-5 pt-4 border-t border-gray-800 flex-shrink-0">
          {/* Step dots */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="rounded-full transition-all duration-150"
                style={{
                  width: i === step ? 16 : 6,
                  height: 6,
                  background: i === step ? AMBER : '#374151',
                }}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
              >
                ← Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={onClose}
                className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                style={{ background: AMBER, color: '#000' }}
              >
                Start exploring →
              </button>
            ) : (
              <button
                onClick={() => setStep(s => s + 1)}
                className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors bg-gray-700 hover:bg-gray-600 text-white"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
