# Mike's Trading Tracker

A responsive market dashboard for comparing crypto, commodities, and U.S. equities. It combines a normalized multi-asset view with detailed candlestick charts, moving averages, market-structure markers, and return snapshots.

**Live dashboard:** [mtho11.github.io/btc-dashboard](https://mtho11.github.io/btc-dashboard/)

## Current capabilities

- Asset tabs for **BTC, ETH, SOL, SUI, HYPE, ZEC, NEAR, GOLD, SILVER, OIL, SPY,** and **QQQ**.
- **ALL** view to compare every asset as a normalized percentage return from the selected range start.
- **HEATMAP** view, directly beside ALL, to rank each asset's percentage return for the selected range with intensity-scaled green/red cells.
- Daily candlestick charts with 50-day, 200-day, and 200-week moving averages.
- Green golden-cross and red death-cross arrows at 50D/200D intersections, each with a matching semi-transparent dashed date guide.
- Green/red dots when price crosses the 50-day moving average.
- Dashed period-high and period-low levels with values displayed on the price scale.
- A US M2 liquidity overlay on the left axis; the selected asset price and moving averages use the right axis.
- Performance panel for daily, weekly, monthly, YTD, one-year, and two-year returns.
- Light and dark themes, responsive layout, crosshair inspection, zooming, and panning.

## Dashboard guide

Open **Guide** in the top-right of the dashboard for the current visual walkthrough. It covers asset selection, the ALL comparison chart, candlesticks and moving averages, cross markers, M2, period high/low levels, and return metrics.

### Asset and range links

The selected asset and timeframe are saved in the URL, so views are shareable and bookmarkable:

```text
https://mtho11.github.io/btc-dashboard/?asset=ETH&range=1Y
```

Supported assets: `ALL`, `HEATMAP`, `BTC`, `ETH`, `SOL`, `SUI`, `HYPE`, `ZEC`, `NEAR`, `GOLD`, `SILVER`, `OIL`, `SPY`, and `QQQ`.

Supported ranges: `1M`, `3M`, `6M`, `1Y`, `2Y`, `5Y`, and `ALL`.

## Data and refresh behavior

| Data | Source | Refresh behavior |
| --- | --- | --- |
| BTC, ETH, SOL, SUI, HYPE, ZEC, NEAR, Gold (PAXG) | OKX public API | Loaded live in the browser |
| U.S. M2 | FRED | Refreshed daily by GitHub Actions |
| Silver, WTI Oil, SPY, QQQ | Yahoo Finance | Refreshed daily by GitHub Actions |

The crypto chart requests approximately 1,800 daily candles so the 200-week moving average has enough history to populate. Market data is informational only and may be delayed or unavailable.

## Stack

- React + TypeScript + Vite
- TradingView Lightweight Charts
- Tailwind CSS
- GitHub Pages + GitHub Actions

## Develop locally

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

The GitHub Pages workflow deploys pushes to `master`. A scheduled workflow also refreshes the static M2, commodity, and equity data files each day.
