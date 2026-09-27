"""One-off inventory for overnight guide generation."""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

FRONTEND = Path(__file__).resolve().parent.parent
ROOT = Path(__file__).resolve().parent
sights = json.loads((ROOT / "sight_guides" / "sights.input.json").read_text(encoding="utf-8"))
print("sights", len(sights))
hours = Counter()
for s in sights:
    h = float(s.get("durationHours") or 1)
    slots = max(1, int(h * 2 + 0.5))
    wt = min(5000, slots * 300)
    hours[wt] += 1
print("word targets:")
for k in sorted(hours):
    print(f"  {k} words: {hours[k]}")

keys: set[str] = set()
short: list[str] = []
long: list[str] = []
data = FRONTEND / "src" / "pages" / "PlanBuilder" / "data"
for p in data.glob("experienceGuides*.ts"):
    t = p.read_text(encoding="utf-8")
    for sid, body in re.findall(r"^  '([^']+)': `(.*?)`", t, re.M | re.S):
        keys.add(sid)
        wc = len(re.findall(r"\S+", body))
        if wc < 200:
            short.append(sid)
        else:
            long.append(sid)
print("curated keys", len(keys))
print("curated <200 words", len(set(short)))
print("curated >=200 words", len(set(long)))
print("sights without curated", sum(1 for s in sights if s["id"] not in keys))
print("hcmc sights", sum(1 for s in sights if s.get("city") == "Ho Chi Minh City"))
todo = [s for s in sights if s["id"] not in set(long)]
print("todo if skip long curated", len(todo))
skip_path = ROOT / "sight_guides" / "skip_long_curated.json"
skip_path.write_text(json.dumps(sorted(set(long)), indent=2) + "\n", encoding="utf-8")
print("wrote", skip_path)
