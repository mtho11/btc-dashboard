import { useEffect, useRef, useState } from 'react'
import { createChart, LineSeries, type IChartApi, type ISeriesApi, type Time } from 'lightweight-charts'
import type { OhlcPoint } from '../lib/indicators'
import type { Range } from './RangeSelector'

export const ASSET_COLORS: Record<string, string> = {
  BTC: '#f97316',
  ETH: '#818cf8',
  SOL: '#a855f7',
  HYPE: '#10b981',
  ZEC: '#eab308',
  GOLD: '#fbbf24',
  SILVER: '#94a3b8',
}

const RANGE_SECONDS: Record<Range, number> = {
  '1M': 30 * 86400,
  '3M': 90 * 86400,
  '6M': 180 * 86400,
  '1Y': 365 * 86400,
  '2Y': 730 * 86400,
  '5Y': 1825 * 86400,
}

export interface AssetData {
  label: string
  data: OhlcPoint[]
}

interface Props {
  assets: AssetData[]
  range: Range
  dark: boolean
}

type LegendEntry = { label: string; color: string; value: number; winner: boolean }

function applyLineStyles(
  seriesMap: Record<string, ISeriesApi<'Line'>>,
  highlighted: string | null,
  winner: string | null,
) {
  for (const [label, series] of Object.entries(seriesMap)) {
    const color = ASSET_COLORS[label] ?? '#888888'
    if (highlighted) {
      // hover mode: highlighted = bright thick, rest very faded
      series.applyOptions({
        color: label === highlighted ? color : color + '28',
        lineWidth: label === highlighted ? 3 : 1,
      })
    } else {
      // default mode: winner bright thick, rest lightly faded
      series.applyOptions({
        color: label === winner ? color : color + '55',
        lineWidth: label === winner ? 3 : 1,
      })
    }
  }
}

export default function AllAssetsChart({ assets, range, dark }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<Record<string, ISeriesApi<'Line'>>>({})
  const tooltipRef = useRef<HTMLDivElement>(null)
  const prevHighlightRef = useRef<string | null>(null)
  const winnerRef = useRef<string | null>(null)
  const winnerValueRef = useRef<number | null>(null)

  const [legend, setLegend] = useState<LegendEntry[]>([])
  const [winnerLabel, setWinnerLabel] = useState<string | null>(null)

  // Keep winnerRef in sync with state (so crosshair closure can read it)
  useEffect(() => { winnerRef.current = winnerLabel }, [winnerLabel])

  // Create / destroy chart when theme changes
  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: dark ? '#94a3b8' : '#64748b',
      },
      grid: {
        vertLines: { color: dark ? '#1e2130' : '#f1f5f9' },
        horzLines: { color: dark ? '#1e2130' : '#f1f5f9' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: {
        visible: true,
        borderColor: dark ? '#2d3148' : '#e2e8f0',
      },
      timeScale: {
        borderColor: dark ? '#2d3148' : '#e2e8f0',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: true,
      handleScroll: true,
    })
    chartRef.current = chart

    chart.subscribeCrosshairMove((param) => {
      const tooltip = tooltipRef.current
      if (!param.time || !param.point || !param.seriesData.size) {
        // Off chart — restore default styles, hide tooltip
        if (prevHighlightRef.current !== null) {
          prevHighlightRef.current = null
          applyLineStyles(seriesRef.current, null, winnerRef.current)
        }
        if (tooltip) tooltip.style.display = 'none'
        return
      }

      // Use crosshair Y (same coordinate space as priceToCoordinate)
      const crosshairY = param.point.y
      let closestLabel: string | null = null
      let minDist = Infinity
      const entries: LegendEntry[] = []

      for (const [label, series] of Object.entries(seriesRef.current)) {
        const d = param.seriesData.get(series) as { value: number } | undefined
        if (d === undefined) continue
        const y = series.priceToCoordinate(d.value)
        if (y !== null) {
          const dist = Math.abs(y - crosshairY)
          if (dist < minDist) { minDist = dist; closestLabel = label }
        }
        entries.push({ label, color: ASSET_COLORS[label] ?? '#888', value: d.value, winner: false })
      }

      // Treat as hovered if within 30px of the nearest line
      const hovered = minDist < 30 ? closestLabel : null

      // Only call applyOptions when highlight actually changes (perf)
      if (hovered !== prevHighlightRef.current) {
        prevHighlightRef.current = hovered
        applyLineStyles(seriesRef.current, hovered, winnerRef.current)
      }

      // Update tooltip via direct DOM (avoids re-render on every mouse move)
      if (tooltip && hovered) {
        const hoveredEntry = entries.find(e => e.label === hovered)
        if (hoveredEntry) {
          const color = ASSET_COLORS[hovered] ?? '#888'
          const val = hoveredEntry.value
          const sign = val >= 0 ? '+' : ''
          const valColor = val >= 0 ? '#22c55e' : '#ef4444'
          tooltip.style.display = 'flex'
          // Position: to the right of cursor, at the series Y
          const seriesY = seriesRef.current[hovered]?.priceToCoordinate(val) ?? param.point.y
          tooltip.style.left = `${param.point.x + 14}px`
          tooltip.style.top = `${(seriesY ?? param.point.y) - 16}px`
          tooltip.innerHTML = `
            <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></span>
            <span style="font-weight:700;font-size:12px;color:#f0f2ff;">${hovered}</span>
            <span style="font-family:monospace;font-size:12px;color:${valColor};">${sign}${val.toFixed(2)}%</span>
          `
        }
      } else if (tooltip) {
        tooltip.style.display = 'none'
      }

      // Update legend sorted by value
      entries.sort((a, b) => b.value - a.value)
      const top = hovered ?? winnerRef.current
      entries.forEach(e => { e.winner = e.label === top })
      setLegend(entries)
    })

    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.resize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      }
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = {}
    }
  }, [dark])

  // Manage series and data whenever assets or range changes
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    // Remove series no longer in assets
    for (const label of Object.keys(seriesRef.current)) {
      if (!assets.find(a => a.label === label)) {
        chart.removeSeries(seriesRef.current[label])
        delete seriesRef.current[label]
      }
    }

    // Add series for new assets
    for (const { label } of assets) {
      if (!seriesRef.current[label]) {
        const color = ASSET_COLORS[label] ?? '#888888'
        seriesRef.current[label] = chart.addSeries(LineSeries, {
          color,
          lineWidth: 2,
          priceFormat: { type: 'percent', minMove: 0.01 },
          lastValueVisible: false,
          priceLineVisible: false,
        })
      }
    }

    // Compute % return from range start for each asset
    const now = Math.floor(Date.now() / 1000)
    const startTs = now - RANGE_SECONDS[range]
    const endReturns: Record<string, number> = {}

    for (const { label, data } of assets) {
      const series = seriesRef.current[label]
      if (!series) continue
      if (!data.length) { series.setData([]); continue }

      const filtered = data.filter(d => d.time >= startTs)
      if (!filtered.length) { series.setData([]); continue }

      const base = filtered[0].close
      const points = filtered.map(d => ({
        time: d.time as Time,
        value: ((d.close - base) / base) * 100,
      }))
      series.setData(points)
      endReturns[label] = points[points.length - 1].value
    }

    // Determine winner from end values
    const sorted = Object.entries(endReturns).sort((a, b) => b[1] - a[1])
    const winner = sorted[0]?.[0] ?? null
    setWinnerLabel(winner)
    winnerRef.current = winner
    winnerValueRef.current = sorted[0]?.[1] ?? null
    prevHighlightRef.current = null

    applyLineStyles(seriesRef.current, null, winner)

    // Build legend from end values
    const legendEntries: LegendEntry[] = sorted.map(([label, value]) => ({
      label,
      color: ASSET_COLORS[label] ?? '#888',
      value,
      winner: label === winner,
    }))
    setLegend(legendEntries)

    if (sorted.length > 0) {
      try {
        chart.timeScale().setVisibleRange({ from: startTs as Time, to: now as Time })
      } catch { /* ignore */ }
    }
  }, [assets, range, dark])

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Winner banner */}
      {winnerLabel && legend.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 dark:text-gray-500">Top performer</span>
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: (ASSET_COLORS[winnerLabel] ?? '#888') + '22', color: ASSET_COLORS[winnerLabel] }}
          >
            {winnerLabel}
          </span>
          <span className="text-sm font-mono font-semibold" style={{ color: ASSET_COLORS[winnerLabel] }}>
            {winnerValueRef.current !== null
              ? (winnerValueRef.current >= 0 ? '+' : '') + winnerValueRef.current.toFixed(2) + '%'
              : null}
          </span>
        </div>
      )}

      {/* Chart + tooltip overlay */}
      <div className="relative flex-1 min-h-0">
        <div ref={containerRef} className="w-full h-full" />
        <div
          ref={tooltipRef}
          style={{
            display: 'none',
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 10,
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(10, 14, 26, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            padding: '5px 10px',
            whiteSpace: 'nowrap',
          }}
        />
      </div>

      {/* Legend row */}
      {legend.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs pb-0.5">
          {legend.map(e => (
            <span
              key={e.label}
              className="flex items-center gap-1.5"
              style={{ opacity: e.winner ? 1 : 0.5 }}
            >
              <span
                className="inline-block rounded-full"
                style={{ width: e.winner ? 10 : 8, height: e.winner ? 3 : 2, background: e.color, flexShrink: 0 }}
              />
              <span
                className={`font-semibold ${e.winner ? '' : 'text-gray-500 dark:text-gray-400'}`}
                style={e.winner ? { color: e.color } : {}}
              >
                {e.label}
              </span>
              <span className="font-mono" style={{ color: e.value >= 0 ? '#22c55e' : '#ef4444' }}>
                {(e.value >= 0 ? '+' : '') + e.value.toFixed(1) + '%'}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
