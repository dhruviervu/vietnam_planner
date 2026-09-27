"""Scan generated visitor guides for filler phrases. Rewrite loop comes later.

  python scripts/qc_sight_guides.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "sight_guides" / "generatedVisitorGuides.json"

BANNED = [
    r"hidden gem",
    r"picturesque paradise",
    r"breathtaking",
    r"must-visit",
    r"\bstunning\b",
    r"bucket list",
    r"unforgettable experience",
    r"best kept secret",
    r"a must see",
    r"postcard[- ]perfect",
]


def main() -> int:
    if not OUTPUT.exists():
        print(f"missing {OUTPUT}", file=sys.stderr)
        return 1
    data = json.loads(OUTPUT.read_text(encoding="utf-8"))
    hits: list[str] = []
    short: list[str] = []
    for sid, row in sorted(data.items()):
        text = f"{row.get('cardSummary', '')}\n{row.get('guide', '')}"
        words = len(re.findall(r"\S+", row.get("guide") or ""))
        if words < 80:
            short.append(f"{sid} ({words} words)")
        low = text.lower()
        for pat in BANNED:
            if re.search(pat, low):
                hits.append(f"{sid}: {pat}")
    print(f"scanned {len(data)} guides")
    print(f"banned-phrase hits: {len(hits)}")
    for line in hits[:40]:
        print(" ", line)
    print(f"short guides: {len(short)}")
    for line in short[:20]:
        print(" ", line)
    return 1 if hits or short else 0


if __name__ == "__main__":
    raise SystemExit(main())
