/**
 * Build a compact sight → name/city/coords/fallback-photos index.
 * Place IDs are filled later by the photo proxy (or match-google-place-ids.mjs).
 *
 *   node scripts/build-google-place-index.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA = path.join(ROOT, 'src', 'pages', 'PlanBuilder', 'data')
const PIN_FILE = path.join(ROOT, 'src', 'pages', 'PlanBuilder', 'lib', 'yourVietnam', 'itineraryPinCatalog.ts')
const MEDIA_JSON = path.join(DATA, 'experienceMedia.json')
const IMAGES_TS = path.join(DATA, 'experienceImages.ts')
const OUT = path.join(DATA, 'googlePlaceIndex.json')

const EXPERIENCE_FILES = [
  'experiences.ts',
  'experiencesExtra.ts',
  'experiencesHoiAn.ts',
  'experiencesNinhBinh.ts',
  'experiencesDaLat.ts',
  'experiencesHue.ts',
  'experiencesSapa.ts',
  'experiencesPhuQuoc.ts',
  'experiencesHaLong.ts',
  'experiencesPhongNha.ts',
  'experiencesNhaTrang.ts',
  'experiencesCanTho.ts',
  'experiencesHaGiang.ts',
  'experiencesCatBa.ts',
  'experiencesDongVan.ts',
]

function parsePins() {
  const text = fs.readFileSync(PIN_FILE, 'utf8')
  const out = {}
  const re = /'([^']+)': c\(([-\d.]+),\s*([-\d.]+)\)/g
  let m
  while ((m = re.exec(text))) {
    out[m[1]] = { lat: Number(m[2]), lng: Number(m[3]) }
  }
  return out
}

function parseExperiences() {
  const list = []
  for (const file of EXPERIENCE_FILES) {
    const fp = path.join(DATA, file)
    if (!fs.existsSync(fp)) continue
    const text = fs.readFileSync(fp, 'utf8')
    const cityConst = text.match(/city: '([^']+)' as const/)
    const regionConst = text.match(/region: '([^']+)' as const/)
    const re =
      /id: '([^']+)',\s*\n\s*name: '([^']+)',(?:\s*\n\s*region: '([^']+)',\s*\n\s*city: '([^']+)')?/g
    let m
    while ((m = re.exec(text))) {
      list.push({
        id: m[1],
        name: m[2],
        city: m[4] ?? cityConst?.[1] ?? m[3] ?? regionConst?.[1] ?? '',
      })
    }
  }
  return list
}

function parseExperienceImages() {
  const text = fs.readFileSync(IMAGES_TS, 'utf8')
  const out = {}
  const block = /'([^']+)': \[([^\]]*)\]/g
  let m
  while ((m = block.exec(text))) {
    const urls = [...m[2].matchAll(/https?:[^'"\s]+/g)].map((x) => x[0])
    if (urls.length) out[m[1]] = urls
  }
  return out
}

function main() {
  const pins = parsePins()
  const media = JSON.parse(fs.readFileSync(MEDIA_JSON, 'utf8'))
  const curated = parseExperienceImages()
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {}
  const index = {}
  for (const exp of parseExperiences()) {
    const fallbacks = []
    const seen = new Set()
    for (const url of [...(media[exp.id]?.photos ?? []), ...(curated[exp.id] ?? [])]) {
      if (!url || seen.has(url)) continue
      seen.add(url)
      fallbacks.push(url)
      if (fallbacks.length >= 10) break
    }
    const pin = pins[exp.id]
    index[exp.id] = {
      name: exp.name,
      city: exp.city,
      lat: pin?.lat ?? null,
      lng: pin?.lng ?? null,
      placeId: prev[exp.id]?.placeId ?? null,
      fallbacks,
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(index, null, 2) + '\n')
  console.log(`Wrote ${Object.keys(index).length} sights → ${path.relative(ROOT, OUT)}`)
}

main()
