export interface OhlcPoint {
  time: number // unix timestamp seconds
  open: number
  high: number
  low: number
  close: number
}

export interface LinePoint {
  time: number
  value: number
}

export function sma(data: OhlcPoint[], period: number): LinePoint[] {
  const result: LinePoint[] = []
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close
    }
    result.push({ time: data[i].time, value: sum / period })
  }
  return result
}
