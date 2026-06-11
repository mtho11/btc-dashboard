import { useEffect, useRef, useState } from 'react'
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
  type Time,
} from 'lightweight-charts'
import type { OhlcPoint, LinePoint } from '../lib/indicators'
import type { Range } from './RangeSelector'
import Legend from './Legend'

const MA_COLORS = {
  ma50: '#f59e0b',
  ma200d: '#3b82f6',
  ma200w: '#a855f7',
}

function rangeToSeconds(range: Range): number {
  const DAY = 86400
  switch (range) {
    case '1M': return 30 * DAY
    case '3M': return 90 * DAY
    case '6M': return 180 * DAY
    case '1Y': return 365 * DAY
    case '2Y': return 730 * DAY
    case '5Y': return 1825 * DAY
    case 'ALL': return Infinity
  }
}

interface ChartProps {
  data: OhlcPoint[]
  ma50: LinePoint[]
  ma200d: LinePoint[]
  ma200w: LinePoint[]
  range: Range
  dark: boolean
}

export default function Chart({ data, ma50, ma200d, ma200w, range, dark }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const ma50Ref = useRef<ISeriesApi<'Line'> | null>(null)
  const ma200dRef = useRef<ISeriesApi<'Line'> | null>(null)
  const ma200wRef = useRef<ISeriesApi<'Line'> | null>(null)

  const [legendValues, setLegendValues] = useState<{
    price?: number; ma50?: number; ma200d?: number; ma200w?: number
  }>({})

  // Init chart once
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
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: dark ? '#2d3148' : '#e2e8f0',
      },
      timeScale: {
        borderColor: dark ? '#2d3148' : '#e2e8f0',
        timeVisible: true,
      },
      handleScroll: true,
      handleScale: true,
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    const ma50Series = chart.addSeries(LineSeries, {
      color: MA_COLORS.ma50,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })

    const ma200dSeries = chart.addSeries(LineSeries, {
      color: MA_COLORS.ma200d,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })

    const ma200wSeries = chart.addSeries(LineSeries, {
      color: MA_COLORS.ma200w,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    })

    chartRef.current = chart
    candleRef.current = candleSeries
    ma50Ref.current = ma50Series
    ma200dRef.current = ma200dSeries
    ma200wRef.current = ma200wSeries

    chart.subscribeCrosshairMove((param) => {
      if (!param.time) {
        setLegendValues({})
        return
      }
      const getVal = (series: ISeriesApi<'Line'>) =>
        (param.seriesData.get(series) as LineData | undefined)?.value

      const candleData = param.seriesData.get(candleSeries) as CandlestickData | undefined

      setLegendValues({
        price: candleData?.close,
        ma50: getVal(ma50Series),
        ma200d: getVal(ma200dSeries),
        ma200w: getVal(ma200wSeries),
      })
    })

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.resize(containerRef.current.clientWidth, containerRef.current.clientHeight)
      }
    })
    if (containerRef.current.parentElement) {
      ro.observe(containerRef.current.parentElement)
    }

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update colors when theme changes
  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.applyOptions({
      layout: { textColor: dark ? '#94a3b8' : '#64748b' },
      grid: {
        vertLines: { color: dark ? '#1e2130' : '#f1f5f9' },
        horzLines: { color: dark ? '#1e2130' : '#f1f5f9' },
      },
      rightPriceScale: { borderColor: dark ? '#2d3148' : '#e2e8f0' },
      timeScale: { borderColor: dark ? '#2d3148' : '#e2e8f0' },
    })
  }, [dark])

  // Update series data when data changes
  useEffect(() => {
    if (!candleRef.current || !ma50Ref.current || !ma200dRef.current || !ma200wRef.current) return
    if (data.length === 0) return

    candleRef.current.setData(
      data.map((d) => ({
        time: d.time as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    )
    ma50Ref.current.setData(ma50.map((d) => ({ time: d.time as Time, value: d.value })))
    ma200dRef.current.setData(ma200d.map((d) => ({ time: d.time as Time, value: d.value })))
    ma200wRef.current.setData(ma200w.map((d) => ({ time: d.time as Time, value: d.value })))
  }, [data, ma50, ma200d, ma200w])

  // Update visible range when range selector changes
  useEffect(() => {
    if (!chartRef.current || data.length === 0) return
    const secs = rangeToSeconds(range)
    const last = data[data.length - 1].time
    if (secs === Infinity) {
      chartRef.current.timeScale().fitContent()
    } else {
      chartRef.current.timeScale().setVisibleRange({
        from: (last - secs) as Time,
        to: last as Time,
      })
    }
  }, [range, data])

  const lastPrice = data.length ? data[data.length - 1].close : undefined
  const lastMa50 = ma50.length ? ma50[ma50.length - 1].value : undefined
  const lastMa200d = ma200d.length ? ma200d[ma200d.length - 1].value : undefined
  const lastMa200w = ma200w.length ? ma200w[ma200w.length - 1].value : undefined

  const legendItems = [
    { label: 'BTC/USD', color: '#22c55e', value: legendValues.price ?? lastPrice },
    { label: '50D MA', color: MA_COLORS.ma50, value: legendValues.ma50 ?? lastMa50 },
    { label: '200D MA', color: MA_COLORS.ma200d, value: legendValues.ma200d ?? lastMa200d },
    { label: '200W MA', color: MA_COLORS.ma200w, value: legendValues.ma200w ?? lastMa200w },
  ]

  return (
    <div className="flex flex-col gap-3 h-full">
      <Legend items={legendItems} />
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  )
}
