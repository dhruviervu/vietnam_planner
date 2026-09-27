"""Convert Desktop City descriptions.txt into a TS guide module."""
from __future__ import annotations

import json
import re
from pathlib import Path

SRC = Path(r"c:\Users\dhruv\OneDrive\Desktop\City descriptions.txt")
OUT_TS = Path(
    r"c:\Users\dhruv\OneDrive\Desktop\vietnam_planner\frontend\src\pages\PlanBuilder\data\experienceGuidesCityDescriptions.ts"
)
OUT_JSON = Path(
    r"c:\Users\dhruv\OneDrive\Desktop\vietnam_planner\frontend\scripts\sight_guides\cityDescriptions.parsed.json"
)

TITLE_TO_ID = [
    ("temple of literature", "temple-literature"),
    ("hanoi old quarter walk", "old-quarter"),
    ("hoan kiem lake", "hoan-kiem-lake"),
    ("thang long imperial citadel", "thang-long-citadel"),
    ("ho chi minh mausoleum complex", "ho-chi-minh-mausoleum"),
    ("stilt house and presedential gardens", "hcm-stilt-house"),
    ("stilt house and presidential gardens", "hcm-stilt-house"),
    ("st.joesphs cathedral", "st-joseph-cathedral"),
    ("st. josephs cathedral", "st-joseph-cathedral"),
    ("ngon son temple", "ngoc-son-temple"),
    ("ngoc son temple", "ngoc-son-temple"),
    ("one pillar pagoda", "one-pillar-pagoda"),
    ("hoa lao museum", "hoa-lo-prison"),
    ("hoa lo museum", "hoa-lo-prison"),
    ("fanspian mountains", "fansipan"),
    ("fansipan mountains", "fansipan"),
    ("cat cat village", "cat-cat-village"),
    ("ta van village", "ta-van-village"),
    ("muong hoa valley", "muong-hoa-valley"),
    ("lao chai village", "lao-chai-village"),
    ("sapa stone church", "sapa-stone-church"),
    ("grand buddha statue of fanspian", "fansipan-buddha"),
    ("grand buddha statue of fansipan", "fansipan-buddha"),
    ("ta phin village", "ta-phin-village"),
    ("hoi an ancient town (day time)", "hoi-an-ancient-town"),
    ("hoi an ancient town ( evening)", "hoi-an-lanterns"),
    ("hoi an ancient town (evening)", "hoi-an-lanterns"),
    ("fujian assembly hall", "fujian-assembly-hall"),
    ("quan cong temple", "quan-cong-temple"),
    ("cantonese assembly hall", "cantonese-assembly-hall"),
    ("thanh ha pottery village", "thanh-ha-pottery"),
    ("theochew assembly hall", "teochew-assembly-hall"),
    ("museum of folk culture", "folk-culture-museum"),
    ("chinese assembly hall of hoi an", "chinese-assembly-hall"),
    ("ba na hills and golden bridge", "ba-na-hills"),
    ("son tra (monkey mountain)", "son-tra"),
    ("my khe beach", "my-khe-beach"),
    ("hai van pass", "hai-van-pass"),
    ("da nang cathedral", "da-nang-cathedral"),
    ("museum of cham sculpture", "cham-sculpture-museum"),
    ("non nuoc stone carving village", "non-nuoc-stone-village"),
    ("linh ung pagoda", "linh-ung-pagoda"),
    ("marble mountains", "marble-mountains"),
    ("imperial city da noi", "hue-citadel"),
    ("tomb of khai dinh", "khai-dinh-tomb"),
    ("ngo mon gate", "ngo-mon-gate"),
    ("thien mu pagoda", "thien-mu-pagoda"),
    ("tomb of tu duc", "tu-duc-tomb"),
    ("tomb of minh mang", "minh-mang-tomb"),
    ("thai hoa palace", "thai-hoa-palace"),
    ("truong tien bridge", "truong-tien-bridge"),
    ("forbidden purple city", "forbidden-purple-city"),
    ("flag tower of hue", "hue-flag-tower"),
    ("ha long bay cruise", "halong-cruise"),
    ("su ng sot cave", "sung-sot-cave"),
    ("sung sot cave", "sung-sot-cave"),
    ("ti top island viewpoint", "ti-top-island"),
    ("dau go cave", "dau-go-cave"),
    ("cua van floating fishing village", "cua-van-village"),
    ("hon trong mai", "hon-trong-mai"),
    ("sun world halong complex", "sun-world-halong"),
    ("luon cave", "luon-cave"),
    ("ba tu long bay", "bai-tu-long-bay"),
    ("vung vieng", "vung-vieng-village"),
    ("trang an boat circuit", "trang-an-boats"),
    ("trang an boat ride", "trang-an-boats"),
    ("tam coc boat ride", "tam-coc-boats"),
    ("bai dinh pagoda complex", "bai-dinh"),
    ("bich dong pagoda", "bich-dong-pagoda"),
    ("phat diem stone cathedral", "phat-diem-cathedral"),
    ("chua bai dinh co", "bai-dinh-co"),
    ("cu phuong national park", "cuc-phuong"),
    ("mua cave point", "mua-cave"),
    ("den tran", "den-tran-hoa-lu"),
    ("hang nga crazy house", "crazy-house"),
    ("linh phuoc pagoda", "linh-phuoc-pagoda"),
    ("da lat railway station", "da-lat-railway-station"),
    ("datanla waterfall", "datanla-waterfall"),
    ("domaine de marie", "domaine-de-marie"),
    ("valley of love", "valley-of-love"),
    ("dalat cathedral", "da-lat-cathedral"),
    ("truc lam zen monastery", "truc-lam-monastery"),
    ("tuyen lam lake", "tuyen-lam-lake"),
    ("bai dai summer palace", "bao-dai-palace-iii"),
    ("po nagar cham towers", "po-nagar"),
    ("long son pagoda", "long-son-pagoda"),
    ("tran phu boulevard", "nha-trang-promenade"),
    ("nha trang beach", "nha-trang-beach"),
    ("vinwonders phu quoc theme park", "vinwonders-pq"),
    ("vinwonders nha trang", "vinwonders-nha-trang"),
    ("ba ho waterfalls", "ba-ho-waterfalls"),
    ("christ the king cathedral", "nha-trang-cathedral"),
    ("hon tre island", "hon-tre-island"),
    ("hon chong promontry", "hon-chong"),
    ("hon chong promontory", "hon-chong"),
    ("hon mun island", "hon-mun-island"),
    ("ho quoc pagoda", "ho-quoc-pagoda"),
    ("sao beach", "sao-beach"),
    ("dinh cau shrine", "dinh-cau"),
    ("hon thom cable car station", "hon-thom-cable"),
    ("hon thom island", "hon-thom-island"),
    ("long beach", "long-beach-pq"),
    ("starfish beach", "starfish-beach"),
    ("an thoi archipelago", "an-thoi-archipelago"),
    ("hon may rut island", "hon-may-rut"),
    ("phong nha ke bang national park", "phong-nha"),
    ("paradise cave phong nha", "paradise-cave"),
    ("son doong cave", "son-doong-cave"),
    ("phong nha cave", "phong-nha-cave-boat"),
    ("bong lai valley", "bong-lai-valley"),
    ("hang en", "hang-en"),
    ("mooc spring", "mooc-spring"),
    ("eight laides", "eight-ladies-cave"),
    ("eight ladies", "eight-ladies-cave"),
    ("chay river", "chay-river"),
    ("tu lan cave system", "tu-lan-caves"),
]

FIELD_NAMES = (
    "Official Name|Vietnamese Name|Location|Type|Recommended Time|Current Visitor Note|"
    "Year Established|Year Opened|Elevation|Geological Origin|Architectural Style|"
    "Key Hours|Main Transformation|Atmosphere|Designation|Construction Period|"
    "Official/common name|Common names|Entrance|Budget|Physical effort|Best approach"
)
FIELD_RE = re.compile(rf"({FIELD_NAMES})\s*:\s*", re.I)

TIME_MARK = r"\[\d{1,2}:\d{2}\s*[-–—−]\s*\d{1,2}:\d{2}\]"
TIME_HEAD = re.compile(TIME_MARK + r"\s*(.+?)(?:\s*:\s*)?\s*$")
NUM_HEAD = re.compile(r"^(\d+)\.\s+(.+)$")
MAPS_JUNK = re.compile(
    r"(?im)^\s*(?:Ngọc Sơn Temple|[\d.]+ stars rating[\d.]*|🛐.*|Place of worship|Open\s*$|· Closes.*|Open\s*·.*)\s*$"
)


def norm_title(s: str) -> str:
    s = s.lower().replace("(", " (")
    s = re.sub(r"[''`]", "", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip(" +")


def map_id(title: str) -> str | None:
    t = norm_title(title)
    for needle, sid in TITLE_TO_ID:
        if t == needle or t.startswith(needle):
            return sid
    for needle, sid in TITLE_TO_ID:
        if needle in t:
            return sid
    return None


def split_mashed_fields(text: str) -> str:
    text = re.sub(r"(?i)key information\s*", "Key Information\n", text, count=1)
    text = re.sub(r"(?i)in-depth visitor guide\s*", "\nIn-Depth Visitor Guide\n", text, count=1)
    return FIELD_RE.sub(lambda m: f"\n{m.group(1)}: ", text)


def split_mashed_numbers(text: str) -> str:
    return re.sub(r"(?<![\n\r\d])(20|[1-9]|1\d)\.\s+", r"\n\1. ", text)


def clean_body(text: str) -> str:
    text = text.replace("\xa0", " ").replace("\r\n", "\n").replace("\r", "\n")
    text = MAPS_JUNK.sub("", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def parse_overview(block: str) -> str:
    fields = {}
    for m in re.finditer(
        rf"({FIELD_NAMES}):\s*(.+?)(?=\n(?:{FIELD_NAMES}|In-Depth Visitor Guide|What Changes)\b|\Z)",
        block,
        re.S | re.I,
    ):
        key = m.group(1).strip()
        val = re.sub(r"\s+", " ", m.group(2)).strip()
        val = re.sub(r"\s*\(Target Output:.*?\)", "", val, flags=re.I).strip()
        fields[key] = val
    lines = ["## Overview", ""]
    order = [
        "Official Name",
        "Vietnamese Name",
        "Location",
        "Type",
        "Year Established",
        "Year Opened",
        "Elevation",
        "Geological Origin",
        "Architectural Style",
        "Recommended Time",
        "Current Visitor Note",
        "Designation",
        "Construction Period",
        "Key Hours",
        "Main Transformation",
        "Atmosphere",
        "Official/common name",
        "Common names",
        "Entrance",
        "Budget",
        "Physical effort",
        "Best approach",
    ]
    for key in order:
        if fields.get(key):
            lines.append(f"{key}: {fields[key]}")
    return "\n".join(lines).strip()


def restore_paragraphs(text: str) -> str:
    """Restore missing breaks; never split inside a sentence."""
    text = re.sub(r"(?<=[.!?]) {2,}", "\n\n", text)
    text = re.sub(r"\.([A-Z][a-z]{2,})", r".\n\n\1", text)
    return text


def short_title(para: str) -> str:
    words = re.sub(r"\s+", " ", para).split()
    chunk = " ".join(words[:8]).rstrip(",;:")
    chunk = re.sub(r"[.!?].*$", "", chunk)
    return chunk[:80].strip() or "Visitor notes"


def titled_unnumbered(paras: list[str], sight_id: str) -> list[str]:
    """Keep each paragraph whole; add a short heading."""
    out = []
    n = 1
    for p in paras:
        p = p.strip()
        if not p or len(p.split()) < 8:
            if p:
                out.append(p)
            continue
        out.append(f"## {n}. {short_title(p)}")
        out.append("")
        out.append(p)
        n += 1
    return out


def sectionize_guide(guide: str, sight_id: str) -> str:
    guide = guide.strip()
    if not guide:
        return ""
    # Time-interval heads
    if re.search(TIME_MARK, guide):
        parts: list[str] = []
        chunks = re.split(rf"(?={TIME_MARK})", guide)
        n = 1
        preamble = []
        for chunk in chunks:
            chunk = chunk.strip()
            if not chunk:
                continue
            m = TIME_HEAD.match(chunk.split("\n", 1)[0].strip())
            if not m:
                preamble.append(chunk)
                continue
            title = m.group(1).rstrip(":")
            rest = chunk.split("\n", 1)[1].strip() if "\n" in chunk else ""
            if preamble:
                parts.extend(titled_unnumbered(["\n\n".join(preamble)], sight_id))
                preamble = []
                n = len([x for x in parts if x.startswith("## ")]) + 1
            parts.append(f"## {n}. {title}")
            parts.append("")
            if rest:
                parts.append(restore_paragraphs(rest))
            n += 1
        return "\n".join(parts).strip()

    if re.search(r"(?m)^(?:[1-9]|1\d|20)\.\s+\S", guide):
        guide = split_mashed_numbers(guide)
        parts = []
        chunks = re.split(r"(?m)(?=^(?:[1-9]|1\d|20)\.\s+)", guide)
        n = 1
        for chunk in chunks:
            chunk = chunk.strip()
            if not chunk:
                continue
            m = NUM_HEAD.match(chunk.split("\n", 1)[0].strip())
            if not m:
                if chunk:
                    parts.extend(titled_unnumbered([chunk], sight_id))
                continue
            title = m.group(2).strip()
            rest = chunk.split("\n", 1)[1].strip() if "\n" in chunk else ""
            if not rest:
                mm = re.match(r"^(.*[a-z)])([A-Z][a-z].+)$", title)
                if mm:
                    title, rest = mm.group(1).strip(), mm.group(2).strip()
            rest = restore_paragraphs(rest) if rest else ""
            parts.append(f"## {n}. {title}")
            parts.append("")
            if rest:
                parts.append(rest)
            n += 1
        return "\n".join(parts).strip()

    guide = restore_paragraphs(guide)
    paras = [p.strip() for p in re.split(r"\n\s*\n", guide) if p.strip()]
    return "\n\n".join(titled_unnumbered(paras, sight_id))


def convert_block(raw: str, sight_id: str) -> str:
    raw = split_mashed_fields(raw)
    raw = clean_body(raw)
    if "In-Depth Visitor Guide" in raw:
        head, guide = raw.split("In-Depth Visitor Guide", 1)
    else:
        head = raw
        guide = re.sub(
            r"(?is)^.*?(?=\n\s*\d+\.\s+\S|\n\s*\[\d{1,2}:\d{2}|What Changes in the Evening)",
            "",
            raw,
            count=1,
        )
        guide = re.sub(r"(?i)^What Changes in the Evening: The Key Differences\s*", "", guide)
    overview = parse_overview(head)
    body = sectionize_guide(guide.strip(), sight_id)
    parts = [overview]
    if body:
        parts.append("")
        parts.append(body)
    text = "\n".join(parts).strip() + "\n"
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def main() -> None:
    src = SRC.read_text(encoding="utf-8")
    pieces = re.split(r"\+\+\+", src)
    # ['', 'title', 'body', 'title', 'body', ...]
    guides: dict[str, str] = {}
    unknown: list[str] = []
    i = 1
    while i < len(pieces) - 1:
        title = pieces[i].strip()
        body = pieces[i + 1]
        sid = map_id(title)
        if not sid:
            unknown.append(title)
            i += 2
            continue
        md = convert_block(body, sid)
        guides[sid] = md  # later duplicate titles overwrite (linh ung)
        i += 2

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps({"unknown": unknown, "ids": list(guides)}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    ts = (
        "/** Visitor guides imported from City descriptions.txt. Later layer; do not wrap paragraphs. */\n"
        "export const EXPERIENCE_GUIDES_CITY_DESCRIPTIONS: Record<string, string> = "
        + json.dumps(guides, ensure_ascii=False, indent=2)
        + "\n"
    )
    OUT_TS.write_text(ts, encoding="utf-8")
    print(f"wrote {len(guides)} guides, unknown={unknown}")


if __name__ == "__main__":
    main()
