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

export interface CrossPoint {
  time: number
}

// Returns timestamps where fast MA crosses BELOW slow MA (death cross)
export function deathCrosses(fast: LinePoint[], slow: LinePoint[]): CrossPoint[] {
  const slowMap = new Map(slow.map((p) => [p.time, p.value]))
  const crosses: CrossPoint[] = []
  for (let i = 1; i < fast.length; i++) {
    const prevFast = fast[i - 1].value
    const prevSlow = slowMap.get(fast[i - 1].time)
    const currFast = fast[i].value
    const currSlow = slowMap.get(fast[i].time)
    if (prevSlow == null || currSlow == null) continue
    if (prevFast >= prevSlow && currFast < currSlow) {
      crosses.push({ time: fast[i].time })
    }
  }
  return crosses
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
