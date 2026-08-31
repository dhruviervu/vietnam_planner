import { chromium } from 'playwright'
import fs from 'fs'

const seed = {
  state: {
    basics: {
      startDate: '2026-11-02',
      endDate: '2026-11-11',
      dateMode: 'exact',
      flexibleMonth: null,
      flexibleSeason: null,
      days: 10,
      durationKnown: true,
      budgetTarget: 1800,
      budgetKnown: true,
      budgetMode: 'per-person',
      budgetMin: 800,
      budgetMax: 2500,
      travelStyle: 'packed',
      paceKnown: true,
      interests: ['culture', 'food'],
      groupSize: 2,
      groupSizeKnown: true,
      holidayKind: 'action',
      holidayKindKnown: true,
      budgetFixedUsd: 2400,
      budgetDailyUsd: 50,
      budgetAllocationKnown: true,
    },
    selectedExperienceIds: [
      'ho-chi-minh-mausoleum',
      'old-quarter',
      'temple-literature',
      'egg-coffee',
      'hanoi-food-tour',
      'bia-hoi',
      'ninh-binh',
      'hoa-lu',
      'trang-an-boats',
      'mua-cave',
      'hoi-an-lanterns',
      'cooking-class',
      'my-son',
      'an-bang',
    ],
    experienceMeta: {},
    selectedActivityIds: ['hn-tai-chi-lake', 'nb-paddle-van-long', 'ha-tra-que-cook', 'ha-lantern-make'],
    selectedHotelIds: ['hanoi-silk', 'ninhbinh-tamcoc', 'hoian-anantara'],
    comparisonStayIds: [],
    chosenStayId: null,
    itineraryStayPropertyIds: [],
    customStayProperties: {},
    startingPointBaseId: null,
    preferredBaseId: null,
    stayStyle: null,
    selectedRestaurantIds: ['rest-bun-cha', 'rest-nb-goat', 'rest-morning-glory'],
    selectedShoppingIds: ['shop-hanoi-coffee', 'shop-hoian-lanterns'],
    transportChoices: {},
    logisticsAcknowledged: [],
    farthestStepIndex: 12,
    cityNightOverrides: { hanoi: 3, 'ninh-binh': 3, 'hoi-an': 4 },
  },
  version: 0,
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})

await page.addInitScript((payload) => {
  localStorage.setItem('vietnam-trip-builder', JSON.stringify(payload))
  sessionStorage.setItem('vn-itinerary-pipeline', '1')
}, seed)

await page.goto('http://127.0.0.1:5173/plan/builder/itinerary', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(2500)

const days = await page.locator('button', { hasText: /^Day \d+/ }).all()
const report = []
const dir = 'scripts/_yv-shots'
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const n = Math.max(days.length, 1)
for (let i = 0; i < n; i++) {
  if (days[i]) await days[i].click()
  await page.waitForTimeout(1800)
  const pinCount = await page.locator('.yv-day-pin').count()
  const stayPins = await page.locator('.yv-stay-pin').count()
  const caption = await page.locator('p', { hasText: /numbered pins match the agenda/ }).textContent().catch(() => '')
  const agendaNs = await page.evaluate(() => {
    const label = [...document.querySelectorAll('p')].find((p) => /Day \d+ Agenda/i.test(p.textContent || ''))
    const root = label?.parentElement
    if (!root) return []
    return [...root.querySelectorAll('span')]
      .map((s) => (s.textContent || '').trim())
      .filter((t) => /^\d+$/.test(t))
  })
  report.push({ i: i + 1, pinCount, stayPins, agendaNs, caption: (caption || '').trim(), overlay: await page.locator('vite-error-overlay').count() })
  const map = page.locator('.yv-city-map')
  await map.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await map.screenshot({ path: `${dir}/pins-day-${i + 1}.png` })
}

console.log(JSON.stringify({ errors: errors.slice(0, 12), overlay: await page.locator('vite-error-overlay').count(), dayButtons: days.length, report }, null, 2))
await browser.close()
