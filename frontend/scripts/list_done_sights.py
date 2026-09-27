"""List overnight-eligible sights whose generated guides currently meet the word budget."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT.parent
INPUT = ROOT / "sight_guides" / "sights.input.json"
GUIDES = ROOT / "sight_guides" / "generatedVisitorGuides.json"
SKIP_FILES = (
    ROOT / "sight_guides" / "skip_hcmc_top19.json",
    ROOT / "sight_guides" / "skip_long_curated.json",
)


def word_count(text: str) -> int:
    return len(re.findall(r"\S+", text or ""))


def word_target(hours: float) -> int:
    slots = max(1, int(float(hours) * 2 + 0.5))
    return min(5000, slots * 300)


def word_floor(target: int) -> int:
    slack = min(20, max(8, int(target * 0.03)))
    return max(1, target - slack)


def load_skip() -> set[str]:
    ids: set[str] = set()
    for path in SKIP_FILES:
        if not path.exists():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, list):
            for row in data:
                if isinstance(row, str):
                    ids.add(row)
                elif isinstance(row, dict) and row.get("id"):
                    ids.add(str(row["id"]))
        elif isinstance(data, dict):
            ids.update(map(str, data.keys()))
    return ids


def ok(row: dict, guide_row: dict) -> bool:
    guide = (guide_row.get("guide") or "").strip()
    card = (guide_row.get("cardSummary") or "").strip()
    if not guide or not card:
        return False
    target = word_target(float(row.get("durationHours") or 1))
    got = word_count(guide)
    low, high = word_floor(target), min(5000, int(target * 1.20) if target < 5000 else 5000)
    return low <= got <= high


sights = json.loads(INPUT.read_text(encoding="utf-8"))
guides = json.loads(GUIDES.read_text(encoding="utf-8"))
skip = load_skip()
todo = [s for s in sights if s["id"] not in skip]
done = []
pending = []
for s in todo:
    g = guides.get(s["id"])
    if isinstance(g, dict) and ok(s, g):
        done.append(s)
    else:
        pending.append(s)

by_city: dict[str, list[str]] = defaultdict(list)
for s in done:
    by_city[s.get("city") or s.get("location") or "?"].append(s["name"])

out = ROOT / "sight_guides" / "done_sights_by_city.txt"
lines = [
    f"overnight pool {len(todo)}",
    f"done {len(done)}",
    f"not yet {len(pending)}",
    "",
]
for city in sorted(by_city, key=lambda c: (-len(by_city[c]), c)):
    names = by_city[city]
    lines.append(f"{city} ({len(names)})")
    for n in names:
        lines.append(f"  - {n}")
    lines.append("")
lines.append("not yet by city:")
pend_city: dict[str, list[str]] = defaultdict(list)
for s in pending:
    pend_city[s.get("city") or s.get("location") or "?"].append(s["name"])
for city in sorted(pend_city, key=lambda c: (-len(pend_city[c]), c)):
    lines.append(f"  {city}: {len(pend_city[city])} — " + ", ".join(pend_city[city]))
out.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(out)
