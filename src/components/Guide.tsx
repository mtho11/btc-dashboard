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
      ['BTC', '#f97316'],
      ['ETH', '#818cf8'],
      ['SOL', '#a855f7'],
      ['HYPE', '#10b981'],
      ['ZEC', '#eab308'],
      ['GOLD', '#fbbf24'],
      ['SILVER', '#94a3b8'],
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
      'This dashboard tracks 7 assets — Bitcoin, Ethereum, Solana, Hyperliquid, Zcash, Gold, and Silver — all in one place. You can compare their performance, spot trend changes, and see how global money supply relates to price moves.',
      'No account needed. Crypto prices update live from OKX\'s public API. Silver and the US M2 money supply refresh automatically every night.',
    ],
    tip: 'All 7 tabs are accessible at any time from the top bar. The selected asset and range are saved in the URL, so you can bookmark any view.',
    visual: <VisualTabs />,
  },
  {
    title: 'Start with the ALL tab',
    body: [
      'The ALL tab is the best starting point. It shows every asset on one chart, each normalized to % return from the start of the selected range. This instantly answers: "Which asset has actually made me money this year?"',
      'The top performer is highlighted with a thick, bright line. All others are faded so the winner is immediately obvious no matter how cluttered the chart gets.',
    ],
    tip: 'Change the range (1M · 3M · 6M · 1Y · 2Y · 5Y) to compare over different horizons. Gold might win over 5Y while HYPE leads over 1Y — the winner badge updates instantly.',
    visual: <VisualAllChart />,
  },
  {
    title: 'Hover to inspect any line',
    body: [
      'In the ALL view, move your cursor over any line to focus on it. The hovered line turns bright and thick while everything else fades. A tooltip appears showing the asset\'s exact % return at that date.',
      'Scrub left and right to sweep through time — watch rankings shift. You might see HYPE was deep in the red before a sudden surge, or Gold quietly outperforming all year.',
    ],
    tip: 'Look for lines that are rising steeply while others are flat or falling. A line catching up fast may signal accelerating momentum — especially meaningful if it just had a golden cross.',
    visual: <VisualHover />,
  },
  {
    title: 'Reading a single asset chart',
    body: [
      'Click any tab to see its candlestick chart. Each candle is one day: green = price went up, red = price went down. The wick shows the high and low; the body shows open and close.',
      'Three moving average lines are overlaid to show trend direction. The 50-day MA (amber) reacts quickly to price changes. The 200-day MA (blue) is slower and more reliable for long-term trend. The 200-week MA (purple) is the multi-year baseline.',
    ],
    tip: 'When price is above all three MAs, the asset is in a confirmed uptrend. Below all three = downtrend. The 200D MA is often the line traders watch most for BTC.',
    visual: <VisualMAs />,
  },
  {
    title: 'Death & Golden Crosses',
    body: [
      'The chart automatically marks where the 50-day MA crosses the 200-day MA. A golden cross (▲) happens when the 50D crosses above the 200D — historically a long-term bullish signal. A death cross (▼) is the opposite.',
      'Switch to the 5Y range on BTC to see all historical crosses. You\'ll notice golden crosses often appear near the start of bull runs, and death crosses near market tops.',
    ],
    tip: 'Crosses are lagging signals — they confirm a trend that already started, not predict one. Use them to validate a position, not time an exact entry. Combine with M2 expansion for conviction.',
    visual: <VisualCrosses />,
  },
  {
    title: 'M2 money supply overlay',
    body: [
      'The pink dashed line (left axis) shows US M2 money supply in billions — a measure of total dollar liquidity. When the Fed expands M2, more money flows into risk assets. Research shows BTC often rallies 3–6 months after M2 starts accelerating.',
      'The M2 line uses its own left axis so it doesn\'t interfere with the asset price on the right. Think of it as the macro tide — when the tide comes in, most boats rise.',
    ],
    tip: 'Watch for divergences: M2 rising while crypto is flat or falling = potential catch-up rally ahead. M2 falling while crypto is at highs = macro headwind. A golden cross + rising M2 is historically very bullish.',
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
    title: 'Tricks to use it to your advantage',
    body: ['Put these patterns together to build a complete picture before acting:'],
    visual: (
      <div className="flex flex-col gap-2">
        {[
          ['Start in ALL view', 'Get the macro picture first — who\'s winning this timeframe?'],
          ['Use 2Y range in ALL', 'See a full bull/bear cycle to understand where you are in the market structure.'],
          ['Watch the 200W MA', 'BTC has historically bottomed near the purple 200W MA. It\'s the "bear market floor."'],
          ['M2 + golden cross = conviction', 'When M2 is expanding AND a golden cross fires, that combination has historically preceded major bull runs.'],
          ['Gold vs crypto divergence', 'If Gold is rising but BTC is flat, risk appetite may be low — money is in "safe haven" mode.'],
          ['Check %YTD vs %1Y', 'Spot whether momentum is accelerating or fading relative to last year\'s performance.'],
          ['Bookmark views', 'The URL updates with your asset and range — bookmark BTC/5Y or HYPE/1Y to jump back instantly.'],
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
