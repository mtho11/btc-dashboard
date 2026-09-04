#!/bin/sh
# Run from project root to refresh public/m2.json with latest FRED M2 data
curl -s 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=M2SL' | python3 -c "
import sys, json, csv
from datetime import datetime, timezone

rows = []
reader = csv.reader(sys.stdin)
next(reader)
for date_str, value_str in reader:
    if not value_str or value_str.strip() == '.':
        continue
    dt = datetime.strptime(date_str.strip(), '%Y-%m-%d').replace(tzinfo=timezone.utc)
    rows.append({'time': int(dt.timestamp()), 'value': float(value_str)})

print(json.dumps(rows))
" > public/m2.json
echo "Saved $(python3 -c \"import json; d=json.load(open('public/m2.json')); print(len(d))\") M2 data points"
