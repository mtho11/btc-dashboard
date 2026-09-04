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

export default function AllAssetsChart({ assets, range, dark }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<Record<string, ISeriesApi<'Line'>>>({})
  const [legend, setLegend] = useState<LegendEntry[]>([])
  const [winnerLabel, setWinnerLabel] = useState<string | null>(null)

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
      if (!param.time || !param.seriesData.size) return
      const entries: LegendEntry[] = []
      for (const [label, series] of Object.entries(seriesRef.current)) {
        const d = param.seriesData.get(series) as { value: number } | undefined
        if (d !== undefined) {
          entries.push({ label, color: ASSET_COLORS[label] ?? '#888', value: d.value, winner: false })
        }
      }
      if (!entries.length) return
      entries.sort((a, b) => b.value - a.value)
      const max = entries[0].value
      entries.forEach(e => { e.winner = e.value === max })
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

    // Apply styling: winner = thick full-color, others = thin faded
    for (const { label } of assets) {
      const series = seriesRef.current[label]
      if (!series) continue
      const isWinner = label === winner
      const color = ASSET_COLORS[label] ?? '#888888'
      series.applyOptions({
        color: isWinner ? color : color + '55',
        lineWidth: isWinner ? 3 : 1,
      })
    }

    // Build initial legend from end values
    const legendEntries: LegendEntry[] = sorted.map(([label, value]) => ({
      label,
      color: ASSET_COLORS[label] ?? '#888',
      value,
      winner: label === winner,
    }))
    setLegend(legendEntries)

    // Only set visible range if we have at least one series with data
    if (sorted.length > 0) {
      try {
        chart.timeScale().setVisibleRange({ from: startTs as Time, to: now as Time })
      } catch {
        // ignore if chart not ready
      }
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
          <span
            className="text-sm font-mono font-semibold"
            style={{ color: ASSET_COLORS[winnerLabel] }}
          >
            {legend.find(e => e.winner) &&
              ((legend.find(e => e.winner)!.value >= 0 ? '+' : '') + legend.find(e => e.winner)!.value.toFixed(2) + '%')}
          </span>
        </div>
      )}

      {/* Chart */}
      <div ref={containerRef} className="flex-1 min-h-0" />

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
              <span className={`font-semibold ${e.winner ? '' : 'text-gray-500 dark:text-gray-400'}`} style={e.winner ? { color: e.color } : {}}>
                {e.label}
              </span>
              <span
                className="font-mono"
                style={{ color: e.value >= 0 ? '#22c55e' : '#ef4444' }}
              >
                {(e.value >= 0 ? '+' : '') + e.value.toFixed(1) + '%'}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
