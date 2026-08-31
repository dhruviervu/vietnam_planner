import type { MonthId } from './months'
import type { ClimateRegionId } from './climateRegions'
import type { Level } from './months'

export type RegionMonthClimate = {
  temperatureRange: string
  averageTemperature: number
  rainfallLevel: Level
  rainfallLabel: string
  precipitationMm: number
  windSpeed: string
  windLabel: string
  humidityRange: string
  humidityLabel: string
  climateLabel: string
  crowdLevel: Level
  crowdLabel: string
  costLevel: Level
  costLabel: string
  bestFor: string[]
  travelNote: string
}

export type MonthClimateBundle = {
  month: MonthId
  countrySummary: string
  regions: Record<ClimateRegionId, RegionMonthClimate>
}

type Seed = [[number, number], Level, string, string, Level, Level, string[], string]

function derivePrecipitationMm(rain: Level, tempAvg: number): number {
  const bands: Record<Level, [number, number]> = {
    1: [18, 52],
    2: [42, 98],
    3: [105, 175],
    4: [185, 265],
    5: [255, 340],
  }
  const [lo, hi] = bands[rain]
  const warmth = Math.min(1, Math.max(0, (tempAvg - 16) / 16))
  return Math.round(lo + (hi - lo) * (0.3 + warmth * 0.7))
}

function deriveWind(rain: Level, tempAvg: number): { speed: string; label: string } {
  if (rain >= 5) return { speed: '20–32 km/h', label: 'Strong gusts' }
  if (rain >= 4) return { speed: '16–26 km/h', label: 'Moderate wind' }
  if (rain >= 3) return { speed: '12–20 km/h', label: 'Breezy' }
  if (tempAvg >= 30) return { speed: '10–16 km/h', label: 'Light coastal breeze' }
  return { speed: '6–12 km/h', label: 'Light' }
}

function deriveHumidity(rain: Level, tempAvg: number): { range: string; label: string } {
  if (rain >= 5) return { range: '84–94%', label: 'Very humid' }
  if (rain >= 4) return { range: '80–90%', label: 'Humid' }
  if (rain >= 3) return { range: '72–84%', label: 'Moderately humid' }
  if (tempAvg <= 20) return { range: '58–70%', label: 'Comfortable' }
  return { range: '65–76%', label: 'Moderate' }
}

function build(
  temp: [number, number],
  rain: Level,
  rainLabel: string,
  climate: string,
  crowd: Level,
  cost: Level,
  best: string[],
  note: string,
): RegionMonthClimate {
  const crowdLabel =
    crowd <= 2 ? 'Lighter' : crowd === 3 ? 'Moderate' : crowd === 4 ? 'Busy' : 'Peak'
  const costLabel =
    cost <= 2 ? 'Good value' : cost === 3 ? '$$' : cost === 4 ? 'Higher' : 'Peak $$'
  const averageTemperature = Math.round((temp[0] + temp[1]) / 2)
  const wind = deriveWind(rain, averageTemperature)
  const humidity = deriveHumidity(rain, averageTemperature)
  return {
    temperatureRange: `${temp[0]}–${temp[1]}°C`,
    averageTemperature,
    rainfallLevel: rain,
    rainfallLabel: rainLabel,
    precipitationMm: derivePrecipitationMm(rain, averageTemperature),
    windSpeed: wind.speed,
    windLabel: wind.label,
    humidityRange: humidity.range,
    humidityLabel: humidity.label,
    climateLabel: climate,
    crowdLevel: crowd,
    crowdLabel,
    costLevel: cost,
    costLabel,
    bestFor: best,
    travelNote: note,
  }
}

/** Realistic seasonal mock patterns — geometry stays separate in climateRegions.ts */
const MONTHLY: Record<MonthId, { summary: string; seeds: Record<ClimateRegionId, Seed> }> = {
  1: {
    summary:
      'Cool and misty in the northern mountains, dry and pleasant in the south, with clear beach weather along the central coast.',
    seeds: {
      'northern-mountains': [[10, 18], 2, 'Low–mist', 'Cool & crisp', 2, 3, ['Nature', 'Adventure'], 'Cold mornings — pack layers for highland loops.'],
      'northern-delta': [[14, 22], 1, 'Very low', 'Cool & dry', 4, 4, ['Culture', 'Food'], 'Hanoi feels wintery; great for cities and cafés.'],
      'north-central': [[18, 24], 2, 'Low', 'Mild & dry', 3, 3, ['Culture', 'History'], 'Hue and the coast stay workable with cooler nights.'],
      'south-central-coast': [[22, 28], 1, 'Very low', 'Dry & bright', 3, 3, ['Beaches', 'Culture'], 'Strong beach window for Da Nang and Hoi An.'],
      'central-highlands': [[16, 24], 1, 'Very low', 'Cool & dry', 2, 2, ['Nature', 'Adventure'], 'Cooler plateau days than the lowlands.'],
      southeast: [[24, 31], 1, 'Very low', 'Warm & dry', 4, 4, ['Cities', 'Food'], 'Ho Chi Minh City is warm and lively.'],
      'mekong-delta': [[24, 31], 1, 'Very low', 'Warm & dry', 3, 3, ['Nature', 'Food'], 'Excellent dry-season river days.'],
    },
  },
  2: {
    summary:
      'Festive nationwide energy around Tết, still largely dry in the south, with cool residual winter air in the north.',
    seeds: {
      'northern-mountains': [[12, 20], 2, 'Low', 'Cool', 3, 4, ['Culture', 'Nature'], 'Mountain towns fill for holiday travel.'],
      'northern-delta': [[15, 23], 1, 'Very low', 'Cool festive', 5, 5, ['Culture', 'Food'], 'Peak festive demand around Hanoi.'],
      'north-central': [[19, 25], 2, 'Low', 'Mild', 4, 4, ['Culture'], 'Book ahead around Tết closures.'],
      'south-central-coast': [[23, 29], 1, 'Very low', 'Dry coast', 4, 4, ['Beaches', 'Culture'], 'Dry beaches with holiday crowds.'],
      'central-highlands': [[17, 25], 1, 'Very low', 'Cool dry', 3, 3, ['Nature'], 'Quiet highlands between holiday peaks.'],
      southeast: [[25, 32], 1, 'Very low', 'Warm dry', 5, 5, ['Cities', 'Food'], 'City celebrations and peak pricing.'],
      'mekong-delta': [[25, 32], 1, 'Very low', 'Warm dry', 3, 4, ['Nature', 'Food'], 'Dry waterways; some services pause for Tết.'],
    },
  },
  3: {
    summary:
      'One of the most balanced months: comfortable temperatures nationwide, lower rain risk, and strong multi-region travel conditions.',
    seeds: {
      'northern-mountains': [[16, 24], 2, 'Low', 'Mild highland', 2, 3, ['Adventure', 'Nature'], 'Ideal for scenic loops without peak cold.'],
      'northern-delta': [[20, 26], 2, 'Low', 'Comfortable', 3, 3, ['Culture', 'Food'], 'Excellent sightseeing weather in Hanoi.'],
      'north-central': [[22, 28], 2, 'Low', 'Settled', 3, 3, ['Culture', 'History'], 'Strong for Hue and coastal drives.'],
      'south-central-coast': [[24, 30], 2, 'Low', 'Bright coast', 3, 3, ['Beaches', 'Culture'], 'Peak comfort for beach + old town days.'],
      'central-highlands': [[18, 26], 2, 'Low', 'Fresh & green', 2, 2, ['Nature', 'Adventure'], 'Cooler than surrounding lowlands.'],
      southeast: [[26, 32], 2, 'Low', 'Warm settled', 3, 3, ['Cities', 'Food'], 'Warm but manageable for city exploration.'],
      'mekong-delta': [[26, 32], 2, 'Low', 'Warm dry', 2, 2, ['Nature', 'Food'], 'Still a strong dry-season river window.'],
    },
  },
  4: {
    summary:
      'Warm and settled across most of Vietnam, with the south heating up and the coast remaining excellent for itineraries.',
    seeds: {
      'northern-mountains': [[18, 26], 2, 'Low', 'Warming', 2, 3, ['Adventure', 'Nature'], 'Pleasant highland days before heavier rains.'],
      'northern-delta': [[22, 28], 2, 'Low', 'Warm', 3, 3, ['Culture', 'Cities'], 'Comfortable city weather with rising heat.'],
      'north-central': [[24, 30], 2, 'Low', 'Warm coast', 3, 3, ['Culture', 'Beaches'], 'Still a strong central Vietnam window.'],
      'south-central-coast': [[25, 31], 2, 'Low', 'Beach-ready', 3, 3, ['Beaches', 'Adventure'], 'Reliable coastal conditions.'],
      'central-highlands': [[19, 27], 2, 'Low', 'Mild plateau', 2, 2, ['Nature', 'Photography'], 'Cooler retreat from southern heat.'],
      southeast: [[27, 33], 2, 'Low', 'Hot & dry', 3, 3, ['Cities', 'Food'], 'Hot afternoons — plan mornings outdoors.'],
      'mekong-delta': [[27, 33], 2, 'Low', 'Hot dry', 2, 2, ['Nature', 'Food'], 'Dry season continues; expect heat.'],
    },
  },
  5: {
    summary:
      'Heat builds in the lowlands while landscapes turn greener; showers increase in places, especially toward the north and highlands.',
    seeds: {
      'northern-mountains': [[20, 28], 3, 'Rising', 'Warm & greener', 2, 2, ['Nature', 'Adventure'], 'Lush scenery with afternoon shower risk.'],
      'northern-delta': [[25, 32], 3, 'Rising', 'Hot & humid', 2, 2, ['Food', 'Cities'], 'Hotter days; value improves vs winter.'],
      'north-central': [[26, 32], 3, 'Rising', 'Hotter', 2, 2, ['Culture'], 'Heat rises; mornings are best for sites.'],
      'south-central-coast': [[27, 33], 3, 'Moderate', 'Hot coast', 2, 2, ['Beaches'], 'Still beachable with warmer seas.'],
      'central-highlands': [[20, 28], 3, 'Rising', 'Fresh green', 2, 2, ['Nature', 'Adventure'], 'Greener and cooler than the coast.'],
      southeast: [[28, 34], 3, 'Moderate', 'Hot', 2, 2, ['Cities', 'Food'], 'Strong heat — lean into indoor/café pacing.'],
      'mekong-delta': [[28, 34], 3, 'Moderate', 'Hot humid', 2, 2, ['Nature', 'Food'], 'Humidity rises ahead of wetter months.'],
    },
  },
  6: {
    summary:
      'Summer heat dominates the lowlands, with more frequent showers and especially appealing highland escapes.',
    seeds: {
      'northern-mountains': [[21, 28], 3, 'Moderate', 'Lush highland', 2, 2, ['Adventure', 'Nature'], 'One of the best mountain months for greenery.'],
      'northern-delta': [[27, 33], 3, 'Moderate', 'Hot wet', 2, 2, ['Food', 'Cities'], 'Build flexible city days around showers.'],
      'north-central': [[27, 33], 4, 'Higher', 'Hot & wetter', 2, 2, ['Culture'], 'Rain risk rises along the coast.'],
      'south-central-coast': [[27, 33], 3, 'Moderate', 'Warm showers', 2, 2, ['Beaches', 'Food'], 'Showers possible; still usable beach days.'],
      'central-highlands': [[20, 27], 3, 'Moderate', 'Cooler green', 2, 2, ['Nature', 'Adventure'], 'Attractive alternative to hot lowlands.'],
      southeast: [[28, 34], 3, 'Moderate', 'Hot humid', 2, 2, ['Cities'], 'Expect sticky afternoons and brief storms.'],
      'mekong-delta': [[28, 34], 3, 'Moderate', 'Hot humid', 2, 2, ['Nature', 'Food'], 'Wet season begins to influence waterways.'],
    },
  },
  7: {
    summary:
      'Wetter patterns intensify — especially in central Vietnam — while the south stays hot and humid and the highlands remain greener.',
    seeds: {
      'northern-mountains': [[22, 28], 3, 'Moderate', 'Wet green', 2, 2, ['Nature'], 'Lush but trail days need flexibility.'],
      'northern-delta': [[27, 33], 3, 'Moderate', 'Hot wet', 2, 2, ['Food', 'Cities'], 'Rain often comes in bursts.'],
      'north-central': [[27, 33], 4, 'Higher', 'Stormier coast', 2, 2, ['Culture'], 'Central coast can see heavier systems.'],
      'south-central-coast': [[27, 33], 4, 'Higher', 'Wet coast', 2, 2, ['Food', 'Culture'], 'Plan indoor backups for beach time.'],
      'central-highlands': [[20, 26], 3, 'Moderate', 'Cool wet', 2, 2, ['Nature', 'Adventure'], 'Cooler and greener than the coast.'],
      southeast: [[27, 33], 3, 'Moderate', 'Hot wet', 2, 2, ['Cities', 'Food'], 'Typical wet-season city pacing.'],
      'mekong-delta': [[27, 33], 4, 'Higher', 'Wet delta', 2, 2, ['Nature'], 'Water levels rise; landscapes feel lush.'],
    },
  },
  8: {
    summary:
      'Peak green season with variable rain — central areas remain the most weather-sensitive while value stays strong nationwide.',
    seeds: {
      'northern-mountains': [[22, 28], 3, 'Moderate', 'Deep green', 2, 2, ['Nature', 'Photography'], 'Vivid landscapes after rains clear.'],
      'northern-delta': [[27, 33], 3, 'Moderate', 'Humid', 2, 2, ['Food', 'Culture'], 'Good museum and food pacing.'],
      'north-central': [[27, 32], 5, 'Heavy', 'Wettest risk', 2, 2, ['Culture'], 'Highest disruption risk on the central coast.'],
      'south-central-coast': [[27, 32], 4, 'Higher', 'Wet variable', 2, 2, ['Culture', 'Food'], 'Keep itineraries flexible.'],
      'central-highlands': [[19, 26], 3, 'Moderate', 'Cool lush', 2, 2, ['Nature', 'Adventure'], 'Still a cooler alternative.'],
      southeast: [[27, 33], 3, 'Moderate', 'Hot wet', 2, 2, ['Cities'], 'Urban travel remains practical.'],
      'mekong-delta': [[27, 33], 4, 'Higher', 'Wet & full', 2, 2, ['Nature', 'Food'], 'High water season atmosphere.'],
    },
  },
  9: {
    summary:
      'A transition month: rain eases in many areas, festive mid-autumn energy rises, and conditions gradually improve for travel.',
    seeds: {
      'northern-mountains': [[21, 27], 3, 'Easing', 'Clearing', 2, 2, ['Nature', 'Adventure'], 'Improving trail windows.'],
      'northern-delta': [[26, 31], 3, 'Easing', 'Warming dry', 2, 2, ['Culture', 'Food'], 'Comfortable evenings return.'],
      'north-central': [[26, 31], 4, 'Still higher', 'Improving', 3, 3, ['Culture'], 'Early September can still be unsettled.'],
      'south-central-coast': [[26, 31], 3, 'Easing', 'Better coast', 2, 2, ['Beaches', 'Culture'], 'Conditions trend better for beaches.'],
      'central-highlands': [[19, 26], 3, 'Moderate', 'Fresh', 2, 2, ['Nature', 'Photography'], 'Soft light and greener hills.'],
      southeast: [[27, 32], 3, 'Easing', 'Warm', 3, 3, ['Cities', 'Food'], 'City travel feels easier again.'],
      'mekong-delta': [[27, 32], 3, 'Easing', 'Lush', 2, 2, ['Nature', 'Food'], 'Waterways remain atmospheric.'],
    },
  },
  10: {
    summary:
      'Clearing skies nationwide — cooler in the north, warmer in the south, with wetter residual patterns fading across central Vietnam.',
    seeds: {
      'northern-mountains': [[18, 25], 2, 'Low', 'Crisp clear', 3, 3, ['Adventure', 'Photography'], 'Excellent visibility for mountain routes.'],
      'northern-delta': [[22, 28], 2, 'Low', 'Comfortable', 3, 3, ['Culture', 'Food'], 'Prime Hanoi sightseeing weather.'],
      'north-central': [[24, 30], 3, 'Moderate', 'Improving', 3, 3, ['Culture', 'History'], 'Central Vietnam often improves sharply.'],
      'south-central-coast': [[25, 30], 2, 'Low', 'Bright coast', 3, 3, ['Beaches', 'Culture'], 'Strong coastal window returns.'],
      'central-highlands': [[18, 26], 2, 'Low', 'Cool clear', 2, 2, ['Nature', 'Adventure'], 'Cooler than southern lowlands this month.'],
      southeast: [[26, 32], 2, 'Low', 'Warm settled', 3, 3, ['Cities', 'Food'], 'Warm, workable city conditions.'],
      'mekong-delta': [[26, 32], 2, 'Low', 'Warm', 2, 2, ['Nature', 'Food'], 'Comfortable dry-season transition.'],
    },
  },
  11: {
    summary:
      'A classic dry travel window: cooler air in the north, reliable beach weather centrally, and rising demand at popular destinations.',
    seeds: {
      'northern-mountains': [[15, 22], 1, 'Very low', 'Cool dry', 3, 4, ['Adventure', 'Nature'], 'Crisp days; book popular routes early.'],
      'northern-delta': [[19, 25], 1, 'Very low', 'Cool dry', 4, 4, ['Culture', 'Cities'], 'Peak comfort with busier sites.'],
      'north-central': [[22, 28], 2, 'Low', 'Settled', 3, 3, ['Culture', 'History'], 'Excellent for Hue and coast links.'],
      'south-central-coast': [[24, 29], 1, 'Very low', 'Dry beach', 4, 4, ['Beaches', 'Culture'], 'Prime Da Nang / Hoi An season.'],
      'central-highlands': [[17, 25], 1, 'Very low', 'Cool dry', 2, 3, ['Nature', 'Adventure'], 'Clear highland weather.'],
      southeast: [[25, 32], 1, 'Very low', 'Warm dry', 4, 4, ['Cities', 'Food'], 'Dry and busy in HCMC.'],
      'mekong-delta': [[25, 32], 1, 'Very low', 'Warm dry', 3, 3, ['Nature', 'Food'], 'Ideal dry-season delta travel.'],
    },
  },
  12: {
    summary:
      'Holiday-season conditions: cool north, dry and warm south, festive cities, and peak demand on beaches and islands.',
    seeds: {
      'northern-mountains': [[12, 20], 1, 'Very low', 'Cold clear', 3, 4, ['Nature'], 'Cold nights — dress warmly.'],
      'northern-delta': [[16, 23], 1, 'Very low', 'Cool festive', 5, 5, ['Culture', 'Food'], 'Festive Hanoi with peak pricing.'],
      'north-central': [[20, 26], 2, 'Low', 'Mild dry', 4, 4, ['Culture'], 'Comfortable heritage travel.'],
      'south-central-coast': [[23, 28], 1, 'Very low', 'Dry coast', 5, 5, ['Beaches', 'Culture'], 'Peak beach demand.'],
      'central-highlands': [[16, 24], 1, 'Very low', 'Cool dry', 3, 3, ['Nature'], 'Quiet cooler plateau days.'],
      southeast: [[24, 31], 1, 'Very low', 'Warm festive', 5, 5, ['Cities', 'Food'], 'Year-end city energy and crowds.'],
      'mekong-delta': [[24, 31], 1, 'Very low', 'Warm dry', 3, 4, ['Nature', 'Food'], 'Dry, photogenic waterways.'],
    },
  },
}

export function getMonthClimate(month: MonthId): MonthClimateBundle {
  const entry = MONTHLY[month]
  const regions = {} as Record<ClimateRegionId, RegionMonthClimate>
  for (const [id, seed] of Object.entries(entry.seeds) as [ClimateRegionId, Seed][]) {
    regions[id] = build(
      seed[0],
      seed[1],
      seed[2],
      seed[3],
      seed[4],
      seed[5],
      seed[6],
      seed[7],
    )
  }
  return { month, countrySummary: entry.summary, regions }
}

export function getRegionClimate(month: MonthId, regionId: ClimateRegionId) {
  return getMonthClimate(month).regions[regionId]
}

/** Temperature scale bounds for legend coloring (°C averages) */
export const TEMP_SCALE = { min: 12, max: 34 }

/** Rainfall level 1–5 maps to color stops */
export function tempToColor(avgC: number): string {
  const t = Math.max(0, Math.min(1, (avgC - TEMP_SCALE.min) / (TEMP_SCALE.max - TEMP_SCALE.min)))
  // cooler blue → teal → green → yellow → orange → red
  const stops: [number, string][] = [
    [0, '#3b82a0'],
    [0.2, '#2f9e8f'],
    [0.4, '#6aaa5a'],
    [0.55, '#d4c04a'],
    [0.75, '#e08a3c'],
    [1, '#c45c3a'],
  ]
  return interpolateStops(t, stops)
}

export function rainToColor(level: Level): string {
  // drier green → yellow → orange → blue wetter
  const map: Record<Level, string> = {
    1: '#7a9e62',
    2: '#b5b85a',
    3: '#d4a84b',
    4: '#5b8fb8',
    5: '#3a6ea5',
  }
  return map[level]
}

function interpolateStops(t: number, stops: [number, string][]) {
  for (let i = 0; i < stops.length - 1; i++) {
    const [aT, aC] = stops[i]
    const [bT, bC] = stops[i + 1]
    if (t >= aT && t <= bT) {
      const u = (t - aT) / (bT - aT || 1)
      return mixHex(aC, bC, u)
    }
  }
  return stops[stops.length - 1][1]
}

function mixHex(a: string, b: string, u: number) {
  const pa = hexToRgb(a)
  const pb = hexToRgb(b)
  const r = Math.round(pa[0] + (pb[0] - pa[0]) * u)
  const g = Math.round(pa[1] + (pb[1] - pa[1]) * u)
  const bl = Math.round(pa[2] + (pb[2] - pa[2]) * u)
  return `rgb(${r},${g},${bl})`
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}
