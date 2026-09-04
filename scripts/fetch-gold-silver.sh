#!/bin/sh
# Run from project root to refresh public/gold.json and public/silver.json
python3 -c "
import urllib.request, json

def fetch(symbol, out):
    url = f'https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=5y'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as r:
        d = json.load(r)
    result = d['chart']['result'][0]
    timestamps = result['timestamp']
    q = result['indicators']['quote'][0]
    points = []
    for i, t in enumerate(timestamps):
        o, h, l, c = q['open'][i], q['high'][i], q['low'][i], q['close'][i]
        if None in (o, h, l, c): continue
        points.append({'time': t, 'open': round(o,4), 'high': round(h,4), 'low': round(l,4), 'close': round(c,4)})
    points.sort(key=lambda p: p['time'])
    with open(out, 'w') as f:
        json.dump(points, f)
    print(f'{symbol}: {len(points)} pts, last close: {points[-1][\"close\"]}')

fetch('GC=F', 'public/gold.json')
fetch('SI=F', 'public/silver.json')
"
