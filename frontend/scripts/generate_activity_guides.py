"""
Generate activity visitor copy with Gemini (no strict sight word-budget).

  python scripts/generate_activity_guides.py
"""
from __future__ import annotations

import argparse
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from threading import Lock

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from generate_sight_guides import (  # noqa: E402
    BANNED,
    ENV_PATH,
    FRONTEND,
    MODELS,
    gemini_generate,
    load_env,
    load_json,
    parse_sights,
    save_json,
    word_count,
)

ACTIVITY_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "sights": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "id": {"type": "STRING"},
                    "cardSummary": {"type": "STRING"},
                    "about": {"type": "STRING"},
                    "where": {"type": "STRING"},
                    "what": {"type": "STRING"},
                    "expect": {"type": "STRING"},
                    "bring": {"type": "STRING"},
                    "know": {"type": "STRING"},
                },
                "required": [
                    "id",
                    "cardSummary",
                    "about",
                    "where",
                    "what",
                    "expect",
                    "bring",
                    "know",
                ],
            },
        }
    },
    "required": ["sights"],
}
INPUT_PATH = ROOT / "activity_guides" / "activities.input.json"
OUTPUT_PATH = ROOT / "activity_guides" / "generatedActivityGuides.json"
APP_PATH = FRONTEND / "src" / "pages" / "PlanBuilder" / "data" / "generatedActivityGuides.json"

ACTIVITY_SYSTEM = """You write activity briefings for Vietnam: classes, workshops, food crawls, rides, and joining-in, not sightseeing monuments.

TASK
Write practical copy a traveler can use to book and do THIS activity. Cover everything that matters: where it actually happens, what you do with your hands/body, pacing, what to bring, money, booking, safety, and the one similar thing people confuse it with.

No strict word count, but do not be thin. about should be 180–400 words. Each of where/what/expect/bring/know should be 60–120 words. Total roughly 500–900 words.

VOICE
Specific, calm, sequential. Same register as a careful Gemini chat. No brochure filler: stunning, breathtaking, must-visit, hidden gem, picturesque, unforgettable, bucket list.

GROUNDING
Catalog duration, hours, price label, city, and name are binding.
- If a price, exact alley, or operator name is uncertain, omit it and stay with the catalog figures.
- Distinguish this activity from the related sight or café on a different card — one clause.

FIELDS
cardSummary: 2 sentences, 35–80 words.
about: 2–4 paragraphs, the story of doing it.
where: where to catch it / meeting point type.
what: what this is (and is not).
expect: how the session unfolds, duration, group feel.
bring: clothes, cash, allergies, fitness.
know: booking, price band from catalog, who it suits, tip or etiquette.

Return JSON only:
{"sights":[{"id":"...","cardSummary":"...","about":"...","where":"...","what":"...","expect":"...","bring":"...","know":"..."}]}
"""


def format_row(row: dict) -> str:
    return "\n".join(
        [
            f"id: {row['id']}",
            f"Activity: {row['name']}",
            f"City: {row['cityName']}",
            f"Kind: {row.get('kindLabel') or row.get('kind')}",
            f"Duration: {row.get('durationLabel') or ''}",
            f"Hours: {row.get('hours') or ''}",
            f"Best time: {row.get('bestTime') or ''}",
            f"Price: {row.get('priceLabel') or ''}",
            f"Best for: {', '.join(row.get('bestFor') or [])}",
            f"Vibe: {row.get('vibe') or ''}",
            f"Hook: {row.get('hook') or ''}",
            f"Summary: {row.get('summary') or ''}",
            f"Catalog about: {row.get('about') or ''}",
            f"Why go: {row.get('whyGo') or ''}",
            "---",
        ]
    )


def acceptable(row: dict, item: dict) -> str | None:
    fields = ("cardSummary", "about", "where", "what", "expect", "bring", "know")
    for key in fields:
        if not str(item.get(key) or "").strip():
            return f"missing {key}"
    about_n = word_count(item["about"])
    if about_n < 150:
        return f"about words {about_n}<150"
    for key in ("where", "what", "expect", "bring", "know"):
        n = word_count(item[key])
        if n < 40:
            return f"{key} words {n}<40"
    blob = " ".join(str(item.get(k) or "") for k in fields).lower()
    for phrase in BANNED:
        if phrase in blob:
            return f"banned:{phrase}"
    return None


def generate_one(api_key: str, row: dict) -> dict:
    prompt = "Write activity copy. Keep the id unchanged.\n\n" + format_row(row)
    last_err = None
    for model in MODELS:
        for attempt in range(4):
            try:
                raw = gemini_generate(
                    api_key,
                    model,
                    prompt,
                    timeout=120,
                    system=ACTIVITY_SYSTEM,
                    schema=ACTIVITY_SCHEMA,
                )
                parsed = parse_sights(raw)
                item = next((p for p in parsed if str(p.get("id")) == row["id"]), parsed[0] if parsed else None)
                if not item:
                    raise RuntimeError("missing activity payload")
                problem = acceptable(row, item)
                if problem:
                    prompt = (
                        "Rewrite. Keep the id unchanged. Previous draft rejected: "
                        f"{problem}. Cover every field fully.\n\n" + format_row(row)
                    )
                    raise RuntimeError(problem)
                return {
                    "id": row["id"],
                    "name": row["name"],
                    "cityName": row["cityName"],
                    "cardSummary": item["cardSummary"].strip(),
                    "about": item["about"].strip(),
                    "where": item["where"].strip(),
                    "what": item["what"].strip(),
                    "expect": item["expect"].strip(),
                    "bring": item["bring"].strip(),
                    "know": item["know"].strip(),
                }
            except Exception as err:  # noqa: BLE001
                last_err = err
                msg = str(err)
                print(f"    retry {model} #{attempt + 1}: {msg[:180]}", flush=True)
                if "HTTP 429" in msg or "RESOURCE_EXHAUSTED" in msg:
                    time.sleep(70)
                    continue
                if "HTTP 503" in msg or "high demand" in msg.lower():
                    time.sleep(25)
                    continue
                if "HTTP 404" in msg or "no longer available" in msg.lower():
                    break
                time.sleep(3 * (attempt + 1))
    raise RuntimeError(last_err)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--ids", type=str, default="")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--include-authored", action="store_true")
    args = parser.parse_args()

    env = load_env(ENV_PATH)
    api_key = env.get("GEMINI_API_KEY") or ""
    if not api_key:
        print("Missing GEMINI_API_KEY in frontend/.env.local", file=sys.stderr)
        return 1

    rows = load_json(INPUT_PATH, None)
    if not isinstance(rows, list) or not rows:
        print("Run: npx tsx scripts/export-activity-guide-inputs.ts", file=sys.stderr)
        return 1

    wanted = {s.strip() for s in args.ids.split(",") if s.strip()}
    if wanted:
        rows = [r for r in rows if r["id"] in wanted]
    if not args.include_authored:
        rows = [r for r in rows if not r.get("authored")]
    if args.limit:
        rows = rows[: args.limit]

    existing = load_json(OUTPUT_PATH, {})
    if not isinstance(existing, dict) or not existing:
        existing = load_json(APP_PATH, {})
    if not isinstance(existing, dict):
        existing = {}

    todo = []
    for row in rows:
        if args.force or row["id"] not in existing:
            todo.append(row)
        elif acceptable(row, existing[row["id"]]):
            todo.append(row)

    print(f"{len(rows)} activities in run, {len(todo)} to generate, {len(existing)} already on disk", flush=True)
    if not todo:
        save_json(APP_PATH, existing)
        return 0

    done = 0
    lock = Lock()

    def run_one(index: int, row: dict):
        print(f"[{index + 1}/{len(todo)}] {row['id']}", flush=True)
        try:
            return row["id"], generate_one(api_key, row), None
        except Exception as err:  # noqa: BLE001
            return row["id"], None, str(err)

    with ThreadPoolExecutor(max_workers=1) as pool:
        futs = [pool.submit(run_one, i, row) for i, row in enumerate(todo)]
        for fut in as_completed(futs):
            sid, item, err = fut.result()
            if err or not item:
                print(f"  FAIL {sid}: {err}", file=sys.stderr, flush=True)
                continue
            with lock:
                existing[sid] = item
                done += 1
                save_json(OUTPUT_PATH, existing)
                save_json(APP_PATH, existing)
            print(f"  saved {done}/{len(todo)}", flush=True)

    save_json(OUTPUT_PATH, existing)
    save_json(APP_PATH, existing)
    print(f"Wrote {len(existing)} activity guides ({done} new/updated) to {APP_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
