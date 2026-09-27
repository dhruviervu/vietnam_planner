"""
Batch-generate visitor guides with Gemini.

  python scripts/generate_sight_guides.py
  python scripts/generate_sight_guides.py --limit 8
  python scripts/generate_sight_guides.py --ids temple-literature,cu-chi

Reads frontend/.env.local (GEMINI_API_KEY). Resumes into
src/pages/PlanBuilder/data/generatedVisitorGuides.json
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from threading import Lock

ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT.parent
INPUT_PATH = ROOT / "sight_guides" / "sights.input.json"
OUTPUT_PATH = ROOT / "sight_guides" / "generatedVisitorGuides.json"
SUMMARIES_PATH = FRONTEND / "src" / "pages" / "PlanBuilder" / "data" / "generatedCardSummaries.json"
APP_GUIDES_PATH = FRONTEND / "src" / "pages" / "PlanBuilder" / "data" / "generatedVisitorGuides.json"
ENV_PATH = FRONTEND / ".env.local"
CHECKPOINT = ROOT / "sight_guides" / "generate.checkpoint.json"
SAMPLE_PATH = ROOT / "sight_guides" / "quality_samples.json"
SKIP_FILES = (
    ROOT / "sight_guides" / "skip_hcmc_top19.json",
    ROOT / "sight_guides" / "skip_long_curated.json",
)

REQUEST_GAP_SEC = 12.0
_last_request = 0.0
_request_lock = Lock()

MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
]

BANNED = (
    "hidden gem",
    "picturesque paradise",
    "breathtaking",
    "must-visit",
    "stunning",
    "bucket list",
    "unforgettable experience",
    "best kept secret",
    "a must see",
    "postcard-perfect",
)

SYSTEM = """You write on-site visitor guides for Vietnam in the same register as a careful, long Gemini chat: specific, calm, sequential, never brochure.

TASK
Write a guide the traveler can follow while standing at THIS place. The guide field must contain AT LEAST wordTarget English words, and no more than 120% of wordTarget. Count before you return. If you are short, add numbered look-at-this sections until you hit wordTarget. Never pad with restaurants in other cities.

VOICE (this is the quality bar)
- Numbered sections. The traveler is walked through the place in order: first impression, then what to look at, then how to spend the time.
- Hold two ideas at once when the place needs it (architecture AND living use; legend AND evidence; tourist photo AND actual rules).
- Name the thing you are looking at. Tell the visitor where to stand. Then move them.
- Current visitor notes belong in Overview when access, restoration, hours, or enforcement has changed.
- Distinguish this pin from the one people confuse it with — one short clause, not a tour of the city.
- No filler: stunning, breathtaking, must-visit, hidden gem, picturesque, unforgettable, bucket list, postcard-perfect.

GROUNDING
Catalog hours, duration, name, and location are binding. Use your knowledge of this named place in this city for history, layout, and visitor practice.
- If a year, price, height, emperor, UNESCO date, or room name is not something you would state with confidence, omit it. Do not invent courtyard nicknames, lunch-lull clocks, or ticket prices.
- Do not copy Wikipedia tone or dump encyclopedia lists.
- Do not invent interior access if the place is known to be restricted.

STRUCTURE
Start with ## Overview as a compact fact block, then numbered ## sections.

## Overview
Official name:
Vietnamese: (if commonly used)
Location:
Type:
Recommended time: (match Typical visit length)
Current hours: (match Catalog hours; if hours are "Anytime" or "Check …", say so plainly)
Current visitor note: only if access, restoration, or safety rules matter right now (date the note September 2026)

Then numbered sections. Titles are short and concrete (First impression, Look at the …, How to visit it today). Use as many numbered sections as the word budget allows:
- wordTarget ~600: Overview + about 5–7 numbered sections
- wordTarget ~1200: Overview + about 10–14 numbered sections
- wordTarget >= 1800: Overview + 15 or more numbered sections, including what not to miss, photography, etiquette, and how long to spend
Each numbered section is 2–4 short paragraphs. Blank line between sections. Do not use the generic headings "The place / How the visit unfolds / What to notice".

cardSummary: exactly 2 sentences, 35–80 words, about the place itself.

Return JSON only:
{"sights":[{"id":"...","cardSummary":"...","guide":"..."}]}
"""


def word_target(hours: float) -> int:
    slots = max(1, int(float(hours) * 2 + 0.5))
    return min(5000, slots * 300)


def source_years(row: dict) -> set[str]:
    blob = " ".join(
        [
            str(row.get("name") or ""),
            str(row.get("about") or ""),
            str(row.get("hook") or ""),
            str(row.get("whyGo") or ""),
            str(row.get("wikiAnchor") or ""),
            " ".join(row.get("keywords") or []),
            str(row.get("hours") or ""),
            str(row.get("durationLabel") or ""),
        ]
    )
    return set(re.findall(r"\b(?:1[0-9]{3}|20[0-2][0-9])\b", blob))



def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        env[key.strip()] = val.strip().strip('"').strip("'")
    return env


def load_json(path: Path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def load_skip_ids() -> set[str]:
    ids: set[str] = set()
    for path in SKIP_FILES:
        data = load_json(path, [])
        if isinstance(data, list):
            for row in data:
                if isinstance(row, str) and row.strip():
                    ids.add(row.strip())
                elif isinstance(row, dict) and row.get("id"):
                    ids.add(str(row["id"]).strip())
        elif isinstance(data, dict):
            ids.update(str(k) for k in data.keys())
    return ids


def save_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(f".{os.getpid()}.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(path)


def publish_app_copy(data: dict) -> None:
    summaries = {
        sid: row.get("cardSummary", "")
        for sid, row in data.items()
        if isinstance(row, dict) and row.get("cardSummary")
    }
    save_json(SUMMARIES_PATH, summaries)
    save_json(APP_GUIDES_PATH, data)


def paragraph_count(text: str) -> int:
    parts = [p.strip() for p in re.split(r"\n\s*\n", text.strip()) if p.strip()]
    return len(parts)


def word_count(text: str) -> int:
    return len(re.findall(r"\S+", text))


def _post_json(url: str, body: dict, timeout: int) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    def call():
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))

    with ThreadPoolExecutor(max_workers=1) as pool:
        fut = pool.submit(call)
        try:
            return fut.result(timeout=timeout + 5)
        except TimeoutError as err:
            raise RuntimeError(f"timeout after {timeout}s") from err


def gemini_generate(
    api_key: str,
    model: str,
    prompt: str,
    timeout: int = 180,
    system: str | None = None,
    schema: dict | None = None,
) -> str:
    global _last_request
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        f"?key={api_key}"
    )
    body = {
        "systemInstruction": {"parts": [{"text": system or SYSTEM}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.35,
            "maxOutputTokens": 16384,
            "responseMimeType": "application/json",
            "responseSchema": schema
            or {
                "type": "OBJECT",
                "properties": {
                    "sights": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "id": {"type": "STRING"},
                                "cardSummary": {"type": "STRING"},
                                "guide": {"type": "STRING"},
                            },
                            "required": ["id", "cardSummary", "guide"],
                        },
                    }
                },
                "required": ["sights"],
            },
        },
    }
    with _request_lock:
        wait = REQUEST_GAP_SEC - (time.time() - _last_request)
        if wait > 0:
            time.sleep(wait)
        _last_request = time.time()
        print(f"    model {model}", flush=True)
        try:
            payload = _post_json(url, body, timeout)
        except urllib.error.HTTPError as err:
            detail = err.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"HTTP {err.code} {model}: {detail[:400]}") from err
    candidates = payload.get("candidates") or []
    if not candidates:
        raise RuntimeError(f"empty candidates: {str(payload)[:300]}")
    parts = (((candidates[0] or {}).get("content") or {}).get("parts")) or []
    text = "".join(p.get("text") or "" for p in parts).strip()
    if not text:
        raise RuntimeError("empty model text")
    return text


def parse_sights(raw: str) -> list[dict]:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.I).strip()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", raw)
        if not match:
            raise
        data = json.loads(match.group(0))
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get("sights"), list):
        return data["sights"]
    if isinstance(data, dict) and "id" in data:
        return [data]
    raise ValueError("unexpected JSON shape")


STYLE_LOCK = """
STYLE LOCK — match this shape, never copy this cathedral:

## Overview
Official name: Cathedral Basilica of the Immaculate Conception
Vietnamese: Nha tho Chinh toa Duc Ba Sai Gon
Location: Cong xa Paris, District 1, Ho Chi Minh City
Best approached as: a historical, architectural and religious landmark rather than simply a photo stop

Current visitor note — September 2026: state access or restoration honestly.

## 1. First impression
As you arrive, name what the eye hits first. Place the building in its street. Then give the visitor two ideas to hold at once.

## 2. Look carefully at the facade
Tell them where to stand. Name the parts. Do not rush to the next courtyard.

## 3. How to visit it today
Sequence: square, closer look, permitted sides, companion stop only if it prevents a wasted extra taxi.

Write THIS sight that way. Numbered look-at-this sections. Not five generic headings.
"""


def format_batch(rows: list[dict]) -> str:
    lines = [
        "Write visitor copy for each sight below. Keep ids unchanged.",
        "wordTarget is a hard MINIMUM. Undershoot is a failed guide.",
        STYLE_LOCK.strip(),
        "",
    ]
    for row in rows:
        hours = float(row.get("durationHours") or 1)
        target = word_target(hours)
        ask = min(5000, target + max(50, int(target * 0.18)))
        lines.append(
            "\n".join(
                [
                    f"id: {row['id']}",
                    f"Sight Name: {row['name']}",
                    f"Location: {row['location']}",
                    f"Duration hours: {hours}",
                    f"Typical visit length: {row.get('durationLabel') or 'unspecified'}",
                    f"wordTarget (MINIMUM): {target}",
                    f"Write about {ask} words so you do not undershoot.",
                    f"Catalog hours: {row.get('hours') or 'unspecified'}",
                    f"Category: {row['contentCategory']}",
                    f"Tier: {row['tier']}",
                    f"Heritage monument: {'yes' if row.get('heritage') else 'no'}",
                    f"Catalog hook: {row.get('hook') or ''}",
                    f"Catalog about: {row.get('about') or ''}",
                    f"Catalog whyGo: {row.get('whyGo') or ''}",
                    "---",
                ]
            )
        )
    return "\n".join(lines)


def word_floor(target: int) -> int:
    """Accept a near miss so 292/300 does not stall the overnight run."""
    slack = min(20, max(8, int(target * 0.03)))
    return max(1, target - slack)


def acceptable(row: dict, result: dict) -> str | None:
    guide = (result.get("guide") or "").strip()
    card = (result.get("cardSummary") or "").strip()
    if not guide or not card:
        return "missing fields"
    target = word_target(float(row.get("durationHours") or 1))
    got = word_count(guide)
    low, high = word_floor(target), min(5000, int(target * 1.20) if target < 5000 else 5000)
    if got < low:
        return f"words {got}<{low} (target {target})"
    if got > high:
        return f"words {got}>{high} (target {target})"
    low_text = f"{card}\n{guide}".lower()
    for phrase in BANNED:
        if phrase in low_text:
            return f"banned:{phrase}"
    return None


def timeout_for(rows: list[dict]) -> int:
    target = max(word_target(float(r.get("durationHours") or 1)) for r in rows)
    return min(360, 150 + target // 8)


def pack_item(row: dict, item: dict) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "tier": row["tier"],
        "contentCategory": row["contentCategory"],
        "cardSummary": item["cardSummary"].strip(),
        "guide": item["guide"].strip(),
    }


def generate_batch(api_key: str, rows: list[dict]) -> list[dict]:
    prompt = format_batch(rows)
    last_err = None
    timeout = timeout_for(rows)
    draft: dict | None = None
    last_got = -1
    stuck = 0
    for model in MODELS:
        for attempt in range(6):
            try:
                raw = gemini_generate(api_key, model, prompt, timeout=timeout)
                parsed = parse_sights(raw)
                by_id = {str(item.get("id")): item for item in parsed if item.get("id")}
                out = []
                for row in rows:
                    item = by_id.get(row["id"])
                    if not item and draft and str(draft.get("id")) == row["id"]:
                        item = draft
                    if not item:
                        raise RuntimeError(f"missing id {row['id']}")
                    problem = acceptable(row, item)
                    if problem and problem.startswith("words "):
                        got = word_count(item.get("guide") or "")
                        target = word_target(float(row.get("durationHours") or 1))
                        draft = item
                        if got <= last_got:
                            stuck += 1
                            if stuck >= 2:
                                raise RuntimeError(f"{row['id']}: {problem} (expand not growing)")
                        else:
                            stuck = 0
                        last_got = got
                        if got < target:
                            need = target - got
                            prompt = (
                                format_batch(rows)
                                + f"\n\nEXPAND. Current guide is {got} words. You must add at least {need} more words.\n"
                                f"Return the COMPLETE guide (not a patch), still JSON. Keep good sections. "
                                f"Add numbered look-at-this sections until word count is {target}–{min(5000, int(target * 1.2))}. "
                                "Do not invent dates or prices.\n\nCURRENT GUIDE:\n"
                                + (item.get("guide") or "")
                            )
                        else:
                            prompt = (
                                format_batch(rows)
                                + f"\n\nSHORTEN slightly. Current guide is {got} words; maximum is {min(5000, int(target * 1.2))}. "
                                "Trim padding only. Return the complete JSON guide.\n\nCURRENT GUIDE:\n"
                                + (item.get("guide") or "")
                            )
                        raise RuntimeError(f"{row['id']}: {problem}")
                    if problem:
                        raise RuntimeError(f"{row['id']}: {problem}")
                    out.append(pack_item(row, item))
                return out
            except Exception as err:  # noqa: BLE001 — retry/failover is the point
                last_err = err
                msg = str(err)
                print(f"    retry {model} #{attempt + 1}: {msg[:180]}", flush=True)
                if "expand not growing" in msg:
                    break
                if "HTTP 429" in msg or "RESOURCE_EXHAUSTED" in msg:
                    time.sleep(70)
                    continue
                if "HTTP 503" in msg or "high demand" in msg.lower():
                    time.sleep(25)
                    continue
                if "HTTP 404" in msg or "not found" in msg.lower() or "no longer available" in msg.lower():
                    break
                time.sleep(2 * (attempt + 1))
        continue
    raise RuntimeError(last_err)


def sentences(text: str) -> list[str]:
    raw = re.sub(r"\s+", " ", text or "").strip()
    if not raw:
        return []
    parts = re.findall(r"[^.!?]+[.!?]+(?:[\"”'])?|[^.!?]+$", raw)
    return [p.strip() for p in parts if len(p.split()) >= 5]


def etiquette_for(row: dict) -> str:
    cat = f"{row.get('contentCategory', '')} {row.get('name', '')}".lower()
    name = row["name"]
    hours = row.get("hours") or "the posted gate time"
    dur = row.get("durationLabel") or "the time on this card"
    if any(w in cat for w in ("sacred", "historic", "unesco", "museum", "memorial")):
        return (
            f"Plan {dur} at {name}. Hours are {hours}; confirm at the entrance the morning you go. "
            f"Cover shoulders and knees in halls, remove hats at altars, keep voices down, and do not touch statues, stelae, or offerings. "
            f"Photography rules change by room — follow posted signs rather than copying another visitor. "
            f"This visit is {name} in {row['location']}, not a second ticket for a different monument in the same city."
        )
    if any(w in cat for w in ("cave", "natural", "adventure")):
        return (
            f"{name} takes about {dur}, typically {hours}. Wear shoes with grip, carry water, and treat weather as part of the route — limestone and trails get slick after rain. "
            f"Stay on marked paths, wear a life jacket when one is offered, and pack every bottle out. "
            f"Start early for cooler air and fewer overlapping groups."
        )
    return (
        f"{name} is easiest across {dur}, with typical hours {hours}. Go early or late to avoid midday heat, carry water, and keep small cash for snacks or a taxi back. "
        f"Give residents and vendors room on the pavement, ask before close portraits, and leave when the listed time has been honest."
    )


def compose_offline(row: dict) -> dict:
    name = row["name"]
    loc = row["location"]
    about = (row.get("about") or "").strip()
    hook = (row.get("hook") or "").strip()
    wiki = (row.get("wikiAnchor") or "").strip()
    summary = (row.get("cardSummary") or "").strip()
    want = int(row.get("paragraphs") or 2)
    body_sents = sentences(wiki) or sentences(about) or sentences(hook) or sentences(summary)
    lead = " ".join(body_sents[:3]) if body_sents else f"{name} is a {row.get('appCategory', 'visit').lower()} stop in {loc}."
    if name.lower() not in lead.lower():
        lead = f"{name} in {loc}. {lead}"
    explore = " ".join(body_sents[3:6]) if len(body_sents) > 3 else (
        f"{about} {hook}".strip() or f"Give the grounds of {name} a full circuit rather than a single photograph at the gate."
    )
    culture = (
        f"{name} belongs to {loc} as a working {row.get('contentCategory', 'place').replace('_', ' ')}: the visit only makes sense if you stay with this pin. "
        f"Keywords that describe this stop — not a scavenger list for the province — include {', '.join((row.get('keywords') or [])[:4]) or row.get('appCategory')}."
    )
    practical = etiquette_for(row)
    if want >= 4:
        paras = [lead, explore, culture, practical]
    elif want == 3:
        paras = [lead, explore, practical]
    else:
        paras = [lead, practical]
    guide = "\n\n".join(p.replace("\n", " ").strip() for p in paras if p.strip())
    card_sents = sentences(summary) or sentences(about) or sentences(hook) or [lead]
    card = " ".join(card_sents[:2])
    if len(card.split()) < 18:
        card = f"{lead} {hook}".strip()
    card = re.sub(r"\s+", " ", card).strip()
    return {
        "id": row["id"],
        "name": name,
        "tier": row["tier"],
        "contentCategory": row["contentCategory"],
        "cardSummary": card,
        "guide": guide,
        "source": "offline",
    }


def item_from_model(row: dict, item: dict) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "tier": row["tier"],
        "contentCategory": row["contentCategory"],
        "cardSummary": item["cardSummary"].strip(),
        "guide": item["guide"].strip(),
        "source": "gemini",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--batch-size", type=int, default=1)
    parser.add_argument("--ids", type=str, default="")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--workers", type=int, default=1)
    parser.add_argument(
        "--out",
        type=str,
        default="",
        help="Write only this JSON file (no app publish). Used for quality samples.",
    )
    parser.add_argument("--offline", action="store_true", help="Fill remaining sights from catalog/wiki anchors (no API)")
    args = parser.parse_args()

    env = load_env(ENV_PATH)
    api_key = env.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY") or ""
    if not args.offline and not api_key:
        print("Missing GEMINI_API_KEY in frontend/.env.local", file=sys.stderr)
        return 1

    sights = load_json(INPUT_PATH, None)
    if not isinstance(sights, list) or not sights:
        print(f"Run export first: npx tsx scripts/export-sight-guide-inputs.ts", file=sys.stderr)
        return 1

    wanted = {s.strip() for s in args.ids.split(",") if s.strip()}
    if wanted:
        sights = [s for s in sights if s["id"] in wanted]
    skip_ids = set() if wanted else load_skip_ids()
    if skip_ids and not wanted:
        sights = [s for s in sights if s["id"] not in skip_ids]
        print(f"skipping {len(skip_ids)} curated/HCMC ids", flush=True)
    sights.sort(key=lambda row: float(row.get("durationHours") or 1))
    if args.limit:
        sights = sights[: args.limit]

    out_path = Path(args.out) if args.out else OUTPUT_PATH
    if args.out and not Path(args.out).is_absolute():
        out_path = ROOT / args.out
    sample_run = bool(args.out)
    existing = load_json(out_path, {}) if sample_run else load_json(OUTPUT_PATH, None)
    if not isinstance(existing, dict) or not existing:
        if sample_run:
            existing = {}
        else:
            existing = load_json(APP_GUIDES_PATH, {})
    if not isinstance(existing, dict):
        existing = {}

    todo = []
    for row in sights:
        if args.force or row["id"] not in existing:
            todo.append(row)
        elif acceptable(row, existing[row["id"]]):
            todo.append(row)

    print(f"{len(sights)} sights in run, {len(todo)} to generate, {len(existing)} already on disk")
    if not todo:
        return 0

    if args.offline:
        for row in todo:
            existing[row["id"]] = compose_offline(row)
        save_json(OUTPUT_PATH, existing)
        publish_app_copy(existing)
        print(f"Wrote {len(existing)} guides (offline fill) to {OUTPUT_PATH}")
        return 0

    size = max(1, args.batch_size)
    batches = [todo[i : i + size] for i in range(0, len(todo), size)]
    done = 0
    lock = Lock()

    def run_one(index: int, batch: list[dict]) -> tuple[int, list[dict], str | None]:
        labels = ", ".join(r["id"] for r in batch)
        print(f"[{index + 1}/{len(batches)}] {labels}", flush=True)
        try:
            return index, generate_batch(api_key, batch), None
        except Exception as err:  # noqa: BLE001
            if len(batch) == 1:
                return index, [], str(err)
            recovered = []
            last = str(err)
            for row in batch:
                try:
                    recovered.extend(generate_batch(api_key, [row]))
                except Exception as inner:  # noqa: BLE001
                    print(f"  FAIL {row['id']}: {inner}", file=sys.stderr, flush=True)
                    last = str(inner)
            return index, recovered, last if not recovered else None

    workers = max(1, min(args.workers, len(batches)))
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(run_one, i, batch) for i, batch in enumerate(batches)]
        for fut in as_completed(futures):
            _idx, results, err = fut.result()
            if err and not results:
                print(f"  FAIL: {err}", file=sys.stderr, flush=True)
            with lock:
                for item in results:
                    existing[item["id"]] = item
                    done += 1
                save_json(out_path, existing)
            print(f"  saved {done}/{len(todo)}", flush=True)

    save_json(out_path, existing)
    if not sample_run:
        publish_app_copy(existing)
    print(f"Wrote {len(existing)} guides ({done} new/updated) to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
