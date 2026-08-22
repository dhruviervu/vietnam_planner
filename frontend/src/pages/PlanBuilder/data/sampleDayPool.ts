import { EXPERIENCES } from './experiences'
import { cityImages } from './cityImages'
import { EXPERIENCE_IMAGES } from './experienceImages'
import type { Experience, ExperienceCategory } from '../types'

export type DayMood = 'balanced' | 'culture' | 'food' | 'adventure' | 'slow'

export type SampleActivity = {
  id: string
  /** Trip Bag / detail id — real experience when available */
  experienceId: string
  cityId: string
  name: string
  category: ExperienceCategory | 'Scenic' | 'Local Life'
  categoryLabel: string
  image: string
  durationHours: number
  durationLabel: string
  openHour: number
  closeHour: number
  /** Relative km from a soft city center — for swap / travel gap mocks */
  distanceKm: number
  area: string
  moods: DayMood[]
  costLabel: string
  signalLabel: string
}

export type SampleDaySlotTemplate = {
  timeHour: number
  timeMinute: number
  activityId: string
}

function img(experienceId: string, fallbackCityId: string, index = 0) {
  const curated = EXPERIENCE_IMAGES[experienceId]
  if (curated?.[index]) return curated[index]
  if (curated?.[0]) return curated[0]
  const city = cityImages(fallbackCityId)
  return city[index % Math.max(1, city.length)] ?? city[0] ?? ''
}

function fromExperience(
  experienceId: string,
  cityId: string,
  patch: Partial<SampleActivity> & Pick<SampleActivity, 'distanceKm' | 'area' | 'moods' | 'openHour' | 'closeHour'>,
): SampleActivity | null {
  const e = EXPERIENCES.find((x) => x.id === experienceId)
  if (!e) return null
  return {
    id: `sa-${experienceId}`,
    experienceId: e.id,
    cityId,
    name: e.name,
    category: e.category,
    categoryLabel: e.category,
    image: img(experienceId, cityId),
    durationHours: e.durationHours,
    durationLabel: e.durationLabel,
    costLabel: e.costLabel,
    signalLabel: e.signalLabel,
    ...patch,
  }
}

function stub(
  id: string,
  cityId: string,
  experienceId: string,
  name: string,
  opts: {
    category: SampleActivity['category']
    categoryLabel: string
    durationHours: number
    durationLabel: string
    openHour: number
    closeHour: number
    distanceKm: number
    area: string
    moods: DayMood[]
    imageIndex?: number
    costLabel?: string
    signalLabel?: string
    imageExperienceId?: string
  },
): SampleActivity {
  const linked = EXPERIENCES.find((e) => e.id === experienceId)
  return {
    id,
    experienceId,
    cityId,
    name,
    category: opts.category,
    categoryLabel: opts.categoryLabel,
    image: img(opts.imageExperienceId ?? experienceId, cityId, opts.imageIndex ?? 0),
    durationHours: opts.durationHours,
    durationLabel: opts.durationLabel,
    openHour: opts.openHour,
    closeHour: opts.closeHour,
    distanceKm: opts.distanceKm,
    area: opts.area,
    moods: opts.moods,
    costLabel: opts.costLabel ?? linked?.costLabel ?? 'From $0',
    signalLabel: opts.signalLabel ?? linked?.signalLabel ?? 'LOCAL FAVORITE',
  }
}

function buildCityPool(activities: SampleActivity[]): SampleActivity[] {
  return activities.filter(Boolean)
}

const HANOI: SampleActivity[] = buildCityPool([
  fromExperience('temple-literature', 'hanoi', {
    openHour: 8, closeHour: 17, distanceKm: 2.1, area: 'Dong Da',
    moods: ['balanced', 'culture', 'slow'],
  })!,
  fromExperience('old-quarter', 'hanoi', {
    openHour: 8, closeHour: 22, distanceKm: 0.4, area: 'Old Quarter',
    moods: ['balanced', 'culture', 'food', 'slow'],
  })!,
  fromExperience('egg-coffee', 'hanoi', {
    openHour: 8, closeHour: 22, distanceKm: 0.6, area: 'Hoan Kiem',
    moods: ['food', 'slow', 'balanced'],
  })!,
  fromExperience('hanoi-food-tour', 'hanoi', {
    openHour: 9, closeHour: 21, distanceKm: 0.5, area: 'Old Quarter',
    moods: ['food', 'balanced'],
  })!,
  fromExperience('train-street', 'hanoi', {
    openHour: 9, closeHour: 21, distanceKm: 1.8, area: 'Train Street',
    moods: ['adventure', 'culture', 'balanced'],
  })!,
  fromExperience('bia-hoi', 'hanoi', {
    openHour: 16, closeHour: 23, distanceKm: 0.7, area: 'Old Quarter',
    moods: ['food', 'balanced'],
  })!,
  stub('sa-hanoi-hoan-kiem', 'hanoi', 'old-quarter', 'Hoan Kiem Lake Walk', {
    category: 'Scenic', categoryLabel: 'Scenic', durationHours: 1, durationLabel: '1 hr',
    openHour: 5, closeHour: 22, distanceKm: 0.3, area: 'Hoan Kiem',
    moods: ['slow', 'balanced', 'culture'], imageIndex: 0, signalLabel: 'SLOW & SCENIC',
    imageExperienceId: 'old-quarter',
  }),
  stub('sa-hanoi-museum', 'hanoi', 'temple-literature', 'Vietnam National Museum', {
    category: 'Culture', categoryLabel: 'Culture', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 8, closeHour: 17, distanceKm: 1.4, area: 'Ba Dinh',
    moods: ['culture', 'balanced'], imageIndex: 1, signalLabel: 'MUST DO',
    imageExperienceId: 'temple-literature',
  }),
  stub('sa-hanoi-craft', 'hanoi', 'old-quarter', 'Old Quarter Craft Hour', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 1, durationLabel: '1 hr',
    openHour: 9, closeHour: 20, distanceKm: 0.8, area: 'Old Quarter',
    moods: ['culture', 'slow', 'food'], imageIndex: 2, signalLabel: 'LOCAL LIFE',
  }),
  stub('sa-hanoi-coffee-ws', 'hanoi', 'egg-coffee', 'Vietnamese Coffee Workshop', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 9, closeHour: 18, distanceKm: 1.2, area: 'Hoan Kiem',
    moods: ['food', 'slow'], imageIndex: 1, signalLabel: 'LOCAL LIFE',
  }),
  stub('sa-hanoi-evening', 'hanoi', 'bia-hoi', 'Old Quarter Evening Stroll', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 2, durationLabel: '2 hrs',
    openHour: 17, closeHour: 23, distanceKm: 0.5, area: 'Old Quarter',
    moods: ['balanced', 'culture', 'food', 'slow'], imageIndex: 1, signalLabel: 'LOCAL LIFE',
  }),
  stub('sa-hanoi-west-lake', 'hanoi', 'old-quarter', 'West Lake Sunset', {
    category: 'Scenic', categoryLabel: 'Scenic', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 15, closeHour: 20, distanceKm: 4.2, area: 'Tay Ho',
    moods: ['slow', 'adventure'], imageIndex: 3, signalLabel: 'PICTURE PERFECT',
  }),
])

function padFromExperiences(cityId: string, region: string, extras: SampleActivity[]): SampleActivity[] {
  const fromRegion = EXPERIENCES.filter((e) => e.region === region).map((e, i) =>
    fromExperience(e.id, cityId, {
      openHour: 8,
      closeHour: e.category === 'Nightlife' || e.signal === 'local-life' ? 23 : 18,
      distanceKm: 0.8 + i * 0.7,
      area: e.city,
      moods: ['balanced', 'culture', 'adventure', 'food', 'slow'].slice(0, 3) as DayMood[],
    }),
  ).filter(Boolean) as SampleActivity[]
  const seen = new Set<string>()
  const merged: SampleActivity[] = []
  for (const a of [...extras, ...fromRegion]) {
    if (seen.has(a.id)) continue
    seen.add(a.id)
    merged.push(a)
  }
  return merged
}

const NINH_BINH = padFromExperiences('ninh-binh', 'Ninh Binh', [
  stub('sa-nb-boat', 'ninh-binh', 'ninh-binh', 'Trang An Boat Morning', {
    category: 'Nature', categoryLabel: 'Nature', durationHours: 3, durationLabel: '3 hrs',
    openHour: 7, closeHour: 17, distanceKm: 1, area: 'Trang An', moods: ['adventure', 'balanced', 'slow'],
  }),
  stub('sa-nb-lunch', 'ninh-binh', 'hoa-lu', 'Countryside Lunch', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1, durationLabel: '1 hr',
    openHour: 11, closeHour: 15, distanceKm: 2.2, area: 'Hoa Lu', moods: ['food', 'slow', 'balanced'],
  }),
  stub('sa-nb-bike', 'ninh-binh', 'mua-cave', 'Rice Field Bike Loop', {
    category: 'Adventure', categoryLabel: 'Adventure', durationHours: 2, durationLabel: '2 hrs',
    openHour: 7, closeHour: 17, distanceKm: 3, area: 'Tam Coc', moods: ['adventure', 'slow'],
  }),
  stub('sa-nb-sunset', 'ninh-binh', 'mua-cave', 'Hang Mua Golden Hour', {
    category: 'Scenic', categoryLabel: 'Scenic', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 15, closeHour: 19, distanceKm: 4, area: 'Hang Mua', moods: ['adventure', 'slow', 'balanced'],
  }),
  stub('sa-nb-temple', 'ninh-binh', 'hoa-lu', 'Ancient Capital Temples', {
    category: 'Culture', categoryLabel: 'Culture', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 8, closeHour: 17, distanceKm: 2.5, area: 'Hoa Lu', moods: ['culture', 'balanced'],
  }),
  stub('sa-nb-cafe', 'ninh-binh', 'ninh-binh', 'Valley Viewpoint Café', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1, durationLabel: '1 hr',
    openHour: 8, closeHour: 20, distanceKm: 1.5, area: 'Ninh Binh town', moods: ['slow', 'food'],
  }),
  stub('sa-nb-photo', 'ninh-binh', 'ninh-binh', 'Karst Photo Walk', {
    category: 'Scenic', categoryLabel: 'Scenic', durationHours: 2, durationLabel: '2 hrs',
    openHour: 6, closeHour: 18, distanceKm: 1.8, area: 'Tam Coc', moods: ['slow', 'adventure', 'culture'],
  }),
  stub('sa-nb-evening', 'ninh-binh', 'hoa-lu', 'Quiet Town Evening', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 17, closeHour: 22, distanceKm: 0.5, area: 'Town', moods: ['slow', 'food', 'balanced'],
  }),
])

const HA_LONG = padFromExperiences('ha-long', 'Quang Ninh', [
  stub('sa-hl-cruise-am', 'ha-long', 'halong-cruise', 'Bay Cruise Morning', {
    category: 'Nature', categoryLabel: 'Nature', durationHours: 4, durationLabel: '4 hrs',
    openHour: 8, closeHour: 18, distanceKm: 2, area: 'Ha Long Bay', moods: ['adventure', 'balanced', 'slow'],
  }),
  stub('sa-hl-kayak', 'ha-long', 'lan-ha', 'Kayak Among Karsts', {
    category: 'Adventure', categoryLabel: 'Adventure', durationHours: 2, durationLabel: '2 hrs',
    openHour: 8, closeHour: 17, distanceKm: 3, area: 'Lan Ha', moods: ['adventure'],
  }),
  stub('sa-hl-lunch', 'ha-long', 'halong-cruise', 'Onboard Seafood Lunch', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1, durationLabel: '1 hr',
    openHour: 11, closeHour: 15, distanceKm: 2.2, area: 'Bay', moods: ['food', 'balanced'],
  }),
  stub('sa-hl-cave', 'ha-long', 'cat-ba', 'Surprise Cave Visit', {
    category: 'Nature', categoryLabel: 'Nature', durationHours: 1, durationLabel: '1 hr',
    openHour: 9, closeHour: 16, distanceKm: 2.5, area: 'Bay caves', moods: ['culture', 'adventure', 'balanced'],
  }),
  stub('sa-hl-island', 'ha-long', 'cat-ba', 'Island Edge Swim', {
    category: 'Beaches', categoryLabel: 'Beach', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 10, closeHour: 17, distanceKm: 4, area: 'Cat Ba', moods: ['slow', 'adventure'],
  }),
  stub('sa-hl-sunset', 'ha-long', 'halong-cruise', 'Deck Sunset', {
    category: 'Scenic', categoryLabel: 'Scenic', durationHours: 1, durationLabel: '1 hr',
    openHour: 16, closeHour: 19, distanceKm: 2, area: 'Bay', moods: ['slow', 'balanced'],
  }),
  stub('sa-hl-dinner', 'ha-long', 'halong-cruise', 'Harbor Dinner', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 17, closeHour: 22, distanceKm: 1, area: 'Bai Chay', moods: ['food', 'balanced'],
  }),
  stub('sa-hl-town', 'ha-long', 'cat-ba', 'Night Market Stroll', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 18, closeHour: 23, distanceKm: 0.8, area: 'Town', moods: ['food', 'culture', 'slow'],
  }),
])

const HA_GIANG = padFromExperiences('ha-giang', 'Ha Giang', [
  stub('sa-hg-pass', 'ha-giang', 'ha-giang-loop', 'Ma Pi Leng Viewpoint', {
    category: 'Adventure', categoryLabel: 'Adventure', durationHours: 2, durationLabel: '2 hrs',
    openHour: 7, closeHour: 17, distanceKm: 12, area: 'Ma Pi Leng', moods: ['adventure', 'balanced'],
  }),
  stub('sa-hg-village', 'ha-giang', 'dong-van', 'Highland Village Stop', {
    category: 'Culture', categoryLabel: 'Culture', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 8, closeHour: 18, distanceKm: 8, area: 'Dong Van', moods: ['culture', 'slow'],
  }),
  stub('sa-hg-lunch', 'ha-giang', 'ha-giang-loop', 'Homestay Lunch', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1, durationLabel: '1 hr',
    openHour: 11, closeHour: 15, distanceKm: 6, area: 'Loop', moods: ['food', 'slow', 'balanced'],
  }),
  stub('sa-hg-road', 'ha-giang', 'ha-giang-loop', 'Mountain Road Stretch', {
    category: 'Adventure', categoryLabel: 'Adventure', durationHours: 3, durationLabel: '3 hrs',
    openHour: 7, closeHour: 17, distanceKm: 15, area: 'Loop', moods: ['adventure'],
  }),
  stub('sa-hg-photo', 'ha-giang', 'dong-van', 'Karst Plateau Photos', {
    category: 'Scenic', categoryLabel: 'Scenic', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 6, closeHour: 18, distanceKm: 5, area: 'Dong Van', moods: ['slow', 'adventure', 'culture'],
  }),
  stub('sa-hg-cafe', 'ha-giang', 'dong-van', 'Town Coffee Pause', {
    category: 'Food', categoryLabel: 'Food', durationHours: 0.75, durationLabel: '45 min',
    openHour: 7, closeHour: 20, distanceKm: 0.5, area: 'Ha Giang town', moods: ['slow', 'food'],
  }),
  stub('sa-hg-evening', 'ha-giang', 'ha-giang-loop', 'Quiet Homestay Evening', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 2, durationLabel: '2 hrs',
    openHour: 17, closeHour: 22, distanceKm: 3, area: 'Homestay', moods: ['slow', 'balanced'],
  }),
  stub('sa-hg-market', 'ha-giang', 'dong-van', 'Morning Market', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 6, closeHour: 11, distanceKm: 1, area: 'Dong Van', moods: ['culture', 'food', 'slow'],
  }),
])

const SAPA = padFromExperiences('sapa', 'Sapa', [
  stub('sa-sp-trek', 'sapa', 'sapa-trek', 'Valley Trek', {
    category: 'Adventure', categoryLabel: 'Adventure', durationHours: 4, durationLabel: '4 hrs',
    openHour: 7, closeHour: 16, distanceKm: 5, area: 'Muong Hoa', moods: ['adventure', 'balanced'],
  }),
  stub('sa-sp-village', 'sapa', 'sapa-trek', 'Village Homestay Visit', {
    category: 'Culture', categoryLabel: 'Culture', durationHours: 2, durationLabel: '2 hrs',
    openHour: 8, closeHour: 17, distanceKm: 6, area: 'Cat Cat', moods: ['culture', 'slow'],
  }),
  stub('sa-sp-lunch', 'sapa', 'sapa-trek', 'Mountain Lunch', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1, durationLabel: '1 hr',
    openHour: 11, closeHour: 15, distanceKm: 4, area: 'Valley', moods: ['food', 'balanced'],
  }),
  stub('sa-sp-fansipan', 'sapa', 'fansipan', 'Fansipan Cable Morning', {
    category: 'Adventure', categoryLabel: 'Adventure', durationHours: 3, durationLabel: '3 hrs',
    openHour: 7, closeHour: 16, distanceKm: 8, area: 'Fansipan', moods: ['adventure'],
  }),
  stub('sa-sp-cafe', 'sapa', 'sapa-trek', 'Sapa Town Café', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1, durationLabel: '1 hr',
    openHour: 8, closeHour: 21, distanceKm: 0.4, area: 'Town', moods: ['slow', 'food'],
  }),
  stub('sa-sp-terrace', 'sapa', 'sapa-trek', 'Terrace Photo Walk', {
    category: 'Scenic', categoryLabel: 'Scenic', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 6, closeHour: 18, distanceKm: 3, area: 'Terraces', moods: ['slow', 'culture', 'balanced'],
  }),
  stub('sa-sp-evening', 'sapa', 'sapa-trek', 'Cool Town Evening', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 17, closeHour: 22, distanceKm: 0.5, area: 'Town', moods: ['slow', 'food', 'balanced'],
  }),
  stub('sa-sp-market', 'sapa', 'sapa-trek', 'Highland Market', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 7, closeHour: 12, distanceKm: 0.8, area: 'Town', moods: ['culture', 'food'],
  }),
])

const HUE = padFromExperiences('hue', 'Hue', [
  stub('sa-hue-citadel-am', 'hue', 'hue-citadel', 'Citadel Morning', {
    category: 'History', categoryLabel: 'History', durationHours: 2.5, durationLabel: '2.5 hrs',
    openHour: 8, closeHour: 17, distanceKm: 1.2, area: 'Citadel', moods: ['culture', 'balanced'],
  }),
  stub('sa-hue-food', 'hue', 'perfume-river', 'Hue Royal Lunch', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 11, closeHour: 15, distanceKm: 1.5, area: 'City', moods: ['food', 'balanced'],
  }),
  stub('sa-hue-river', 'hue', 'perfume-river', 'Perfume River Cruise', {
    category: 'Scenic', categoryLabel: 'Scenic', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 8, closeHour: 18, distanceKm: 2, area: 'River', moods: ['slow', 'culture', 'balanced'],
  }),
  stub('sa-hue-tomb', 'hue', 'hue-citadel', 'Royal Tomb Visit', {
    category: 'History', categoryLabel: 'History', durationHours: 2, durationLabel: '2 hrs',
    openHour: 8, closeHour: 17, distanceKm: 8, area: 'Tombs', moods: ['culture', 'adventure'],
  }),
  stub('sa-hue-cafe', 'hue', 'perfume-river', 'Garden Café Pause', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1, durationLabel: '1 hr',
    openHour: 8, closeHour: 20, distanceKm: 1, area: 'City', moods: ['slow', 'food'],
  }),
  stub('sa-hue-evening', 'hue', 'perfume-river', 'Riverfront Evening', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 17, closeHour: 22, distanceKm: 1.2, area: 'River', moods: ['slow', 'food', 'balanced'],
  }),
  stub('sa-hue-market', 'hue', 'hue-citadel', 'Dong Ba Market', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 7, closeHour: 18, distanceKm: 1.8, area: 'Market', moods: ['food', 'culture'],
  }),
  stub('sa-hue-bike', 'hue', 'perfume-river', 'Quiet City Bike', {
    category: 'Adventure', categoryLabel: 'Adventure', durationHours: 2, durationLabel: '2 hrs',
    openHour: 7, closeHour: 18, distanceKm: 3, area: 'City', moods: ['adventure', 'slow'],
  }),
])

const HOI_AN = padFromExperiences('hoi-an', 'Hoi An', [
  stub('sa-ha-oldtown', 'hoi-an', 'hoi-an-lanterns', 'Ancient Town Morning', {
    category: 'Culture', categoryLabel: 'Culture', durationHours: 2, durationLabel: '2 hrs',
    openHour: 8, closeHour: 22, distanceKm: 0.3, area: 'Ancient Town', moods: ['culture', 'balanced', 'slow'],
  }),
  stub('sa-ha-food', 'hoi-an', 'cooking-class', 'Cao Lau & Market Bites', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 9, closeHour: 21, distanceKm: 0.4, area: 'Ancient Town', moods: ['food', 'balanced'],
  }),
  stub('sa-ha-cook', 'hoi-an', 'cooking-class', 'Cooking Class Afternoon', {
    category: 'Food', categoryLabel: 'Food', durationHours: 3, durationLabel: '3 hrs',
    openHour: 9, closeHour: 17, distanceKm: 2, area: 'Countryside', moods: ['food', 'culture'],
  }),
  stub('sa-ha-beach', 'hoi-an', 'an-bang', 'An Bang Beach Hours', {
    category: 'Beaches', categoryLabel: 'Beach', durationHours: 2.5, durationLabel: '2.5 hrs',
    openHour: 8, closeHour: 19, distanceKm: 5, area: 'An Bang', moods: ['slow', 'adventure', 'balanced'],
  }),
  stub('sa-ha-craft', 'hoi-an', 'hoi-an-lanterns', 'Tailor & Craft Visit', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 9, closeHour: 20, distanceKm: 0.6, area: 'Ancient Town', moods: ['culture', 'slow'],
  }),
  stub('sa-ha-lanterns', 'hoi-an', 'hoi-an-lanterns', 'Lantern Evening', {
    category: 'Culture', categoryLabel: 'Culture', durationHours: 2, durationLabel: '2 hrs',
    openHour: 17, closeHour: 23, distanceKm: 0.3, area: 'Ancient Town', moods: ['culture', 'food', 'balanced', 'slow'],
  }),
  stub('sa-ha-bike', 'hoi-an', 'an-bang', 'Rice Field Bike', {
    category: 'Adventure', categoryLabel: 'Adventure', durationHours: 2, durationLabel: '2 hrs',
    openHour: 7, closeHour: 17, distanceKm: 4, area: 'Countryside', moods: ['adventure', 'slow'],
  }),
  stub('sa-ha-cafe', 'hoi-an', 'cooking-class', 'River Café Pause', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1, durationLabel: '1 hr',
    openHour: 8, closeHour: 21, distanceKm: 0.5, area: 'Riverfront', moods: ['slow', 'food'],
  }),
  stub('sa-ha-myson', 'hoi-an', 'my-son', 'My Son Day Trip Slot', {
    category: 'History', categoryLabel: 'History', durationHours: 4, durationLabel: '4 hrs',
    openHour: 7, closeHour: 16, distanceKm: 40, area: 'My Son', moods: ['culture', 'adventure'],
  }),
])

const DA_NANG = padFromExperiences('da-nang', 'Da Nang', [
  stub('sa-dn-beach', 'da-nang', 'da-nang-beach', 'My Khe Morning Swim', {
    category: 'Beaches', categoryLabel: 'Beach', durationHours: 2, durationLabel: '2 hrs',
    openHour: 6, closeHour: 19, distanceKm: 1, area: 'My Khe', moods: ['slow', 'adventure', 'balanced'],
  }),
  stub('sa-dn-seafood', 'da-nang', 'da-nang-beach', 'Beach Seafood Lunch', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 11, closeHour: 21, distanceKm: 1.2, area: 'My Khe', moods: ['food', 'balanced'],
  }),
  stub('sa-dn-marble', 'da-nang', 'marble-mountains', 'Marble Mountains Climb', {
    category: 'Adventure', categoryLabel: 'Adventure', durationHours: 2.5, durationLabel: '2.5 hrs',
    openHour: 7, closeHour: 17, distanceKm: 8, area: 'Marble Mountains', moods: ['adventure', 'culture'],
  }),
  stub('sa-dn-bridge', 'da-nang', 'da-nang-beach', 'Dragon Bridge Evening', {
    category: 'Cities', categoryLabel: 'City', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 17, closeHour: 23, distanceKm: 3, area: 'Han River', moods: ['balanced', 'culture', 'slow'],
  }),
  stub('sa-dn-cafe', 'da-nang', 'da-nang-beach', 'Coastal Café', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1, durationLabel: '1 hr',
    openHour: 8, closeHour: 21, distanceKm: 1.5, area: 'City', moods: ['slow', 'food'],
  }),
  stub('sa-dn-city', 'da-nang', 'marble-mountains', 'City Museum Hour', {
    category: 'Culture', categoryLabel: 'Culture', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 8, closeHour: 17, distanceKm: 4, area: 'City', moods: ['culture', 'balanced'],
  }),
  stub('sa-dn-sunset', 'da-nang', 'da-nang-beach', 'Beach Sunset', {
    category: 'Scenic', categoryLabel: 'Scenic', durationHours: 1, durationLabel: '1 hr',
    openHour: 16, closeHour: 19, distanceKm: 1, area: 'My Khe', moods: ['slow', 'balanced'],
  }),
  stub('sa-dn-night', 'da-nang', 'da-nang-beach', 'Night Market Bites', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 17, closeHour: 23, distanceKm: 2.5, area: 'Son Tra / city', moods: ['food', 'balanced'],
  }),
])

const PHONG_NHA = padFromExperiences('phong-nha', 'Phong Nha', [
  stub('sa-pn-paradise', 'phong-nha', 'phong-nha', 'Paradise Cave Morning', {
    category: 'Adventure', categoryLabel: 'Adventure', durationHours: 3, durationLabel: '3 hrs',
    openHour: 7, closeHour: 16, distanceKm: 5, area: 'Paradise Cave', moods: ['adventure', 'balanced'],
  }),
  stub('sa-pn-dark', 'phong-nha', 'dark-cave', 'Dark Cave Adventure', {
    category: 'Adventure', categoryLabel: 'Adventure', durationHours: 3, durationLabel: '3 hrs',
    openHour: 7, closeHour: 16, distanceKm: 7, area: 'Dark Cave', moods: ['adventure'],
  }),
  stub('sa-pn-lunch', 'phong-nha', 'phong-nha', 'Town Lunch', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1, durationLabel: '1 hr',
    openHour: 11, closeHour: 15, distanceKm: 0.5, area: 'Town', moods: ['food', 'balanced', 'slow'],
  }),
  stub('sa-pn-river', 'phong-nha', 'phong-nha', 'River Boat Hour', {
    category: 'Nature', categoryLabel: 'Nature', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 8, closeHour: 17, distanceKm: 1.5, area: 'River', moods: ['slow', 'adventure', 'balanced'],
  }),
  stub('sa-pn-jungle', 'phong-nha', 'dark-cave', 'Jungle Edge Walk', {
    category: 'Nature', categoryLabel: 'Nature', durationHours: 2, durationLabel: '2 hrs',
    openHour: 7, closeHour: 16, distanceKm: 4, area: 'Park', moods: ['adventure', 'slow'],
  }),
  stub('sa-pn-cafe', 'phong-nha', 'phong-nha', 'Slow Town Café', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1, durationLabel: '1 hr',
    openHour: 8, closeHour: 21, distanceKm: 0.3, area: 'Town', moods: ['slow', 'food'],
  }),
  stub('sa-pn-evening', 'phong-nha', 'phong-nha', 'Quiet Evening', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 17, closeHour: 22, distanceKm: 0.4, area: 'Town', moods: ['slow', 'balanced'],
  }),
  stub('sa-pn-photo', 'phong-nha', 'dark-cave', 'Karst Viewpoint', {
    category: 'Scenic', categoryLabel: 'Scenic', durationHours: 1, durationLabel: '1 hr',
    openHour: 6, closeHour: 18, distanceKm: 3, area: 'Viewpoints', moods: ['slow', 'adventure'],
  }),
])

const HCMC = padFromExperiences('hcmc', 'Ho Chi Minh City', [
  stub('sa-hcmc-war', 'hcmc', 'war-remnants', 'War Remnants Museum', {
    category: 'History', categoryLabel: 'History', durationHours: 2, durationLabel: '2 hrs',
    openHour: 7.5, closeHour: 17, distanceKm: 2, area: 'D3', moods: ['culture', 'balanced'],
  }),
  stub('sa-hcmc-food', 'hcmc', 'ben-thanh', 'Street Food Circuit', {
    category: 'Food', categoryLabel: 'Food', durationHours: 2, durationLabel: '2 hrs',
    openHour: 9, closeHour: 22, distanceKm: 1, area: 'D1', moods: ['food', 'balanced'],
  }),
  stub('sa-hcmc-market', 'hcmc', 'ben-thanh', 'Ben Thanh Market Hour', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 8, closeHour: 18, distanceKm: 0.8, area: 'D1', moods: ['culture', 'food', 'balanced'],
  }),
  stub('sa-hcmc-palace', 'hcmc', 'war-remnants', 'Independence Palace', {
    category: 'History', categoryLabel: 'History', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 8, closeHour: 16, distanceKm: 1.5, area: 'D1', moods: ['culture'],
  }),
  stub('sa-hcmc-cafe', 'hcmc', 'ben-thanh', 'Apartment Café Pause', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1, durationLabel: '1 hr',
    openHour: 8, closeHour: 21, distanceKm: 1.2, area: 'D1', moods: ['slow', 'food'],
  }),
  stub('sa-hcmc-cuchi', 'hcmc', 'cu-chi', 'Cu Chi Half Day', {
    category: 'History', categoryLabel: 'History', durationHours: 4, durationLabel: '4 hrs',
    openHour: 7, closeHour: 16, distanceKm: 50, area: 'Cu Chi', moods: ['adventure', 'culture'],
  }),
  stub('sa-hcmc-skyline', 'hcmc', 'ben-thanh', 'Skyline Sunset', {
    category: 'Scenic', categoryLabel: 'Scenic', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 16, closeHour: 22, distanceKm: 2.5, area: 'Bitexco / D1', moods: ['slow', 'balanced'],
  }),
  stub('sa-hcmc-night', 'hcmc', 'ben-thanh', 'District 1 Nightlife', {
    category: 'Nightlife', categoryLabel: 'Nightlife', durationHours: 2, durationLabel: '2 hrs',
    openHour: 18, closeHour: 24, distanceKm: 1, area: 'D1', moods: ['food', 'balanced'],
  }),
  stub('sa-hcmc-walk', 'hcmc', 'war-remnants', 'Colonial Quarter Walk', {
    category: 'Culture', categoryLabel: 'Culture', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 8, closeHour: 20, distanceKm: 1.1, area: 'D1', moods: ['culture', 'slow'],
  }),
])

const MEKONG = padFromExperiences('mekong', 'Mekong', [
  stub('sa-mk-market', 'mekong', 'mekong-delta', 'Floating Market Morning', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 2.5, durationLabel: '2.5 hrs',
    openHour: 5, closeHour: 11, distanceKm: 2, area: 'Cai Rang', moods: ['culture', 'food', 'balanced'],
  }),
  stub('sa-mk-boat', 'mekong', 'mekong-delta', 'Canal Boat Ride', {
    category: 'Nature', categoryLabel: 'Nature', durationHours: 2, durationLabel: '2 hrs',
    openHour: 7, closeHour: 17, distanceKm: 3, area: 'Canals', moods: ['slow', 'adventure', 'balanced'],
  }),
  stub('sa-mk-lunch', 'mekong', 'mekong-delta', 'Garden Lunch', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 11, closeHour: 15, distanceKm: 4, area: 'Orchard', moods: ['food', 'slow'],
  }),
  stub('sa-mk-village', 'mekong', 'mekong-delta', 'Village Craft Stop', {
    category: 'Culture', categoryLabel: 'Culture', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 8, closeHour: 17, distanceKm: 5, area: 'Village', moods: ['culture', 'slow'],
  }),
  stub('sa-mk-fruit', 'mekong', 'mekong-delta', 'Fruit Orchard Walk', {
    category: 'Nature', categoryLabel: 'Nature', durationHours: 1, durationLabel: '1 hr',
    openHour: 8, closeHour: 17, distanceKm: 4.5, area: 'Orchard', moods: ['slow', 'food'],
  }),
  stub('sa-mk-cafe', 'mekong', 'mekong-delta', 'Riverside Coconut Break', {
    category: 'Food', categoryLabel: 'Food', durationHours: 0.75, durationLabel: '45 min',
    openHour: 8, closeHour: 18, distanceKm: 2.5, area: 'Riverside', moods: ['slow', 'food'],
  }),
  stub('sa-mk-evening', 'mekong', 'mekong-delta', 'Soft Evening Return', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 16, closeHour: 20, distanceKm: 1, area: 'Town', moods: ['slow', 'balanced'],
  }),
  stub('sa-mk-bike', 'mekong', 'mekong-delta', 'Island Bike Loop', {
    category: 'Adventure', categoryLabel: 'Adventure', durationHours: 2, durationLabel: '2 hrs',
    openHour: 7, closeHour: 17, distanceKm: 6, area: 'Island', moods: ['adventure', 'slow'],
  }),
])

const PHU_QUOC = padFromExperiences('phu-quoc', 'Phu Quoc', [
  stub('sa-pq-beach', 'phu-quoc', 'phu-quoc-sunset', 'Sao Beach Morning', {
    category: 'Beaches', categoryLabel: 'Beach', durationHours: 3, durationLabel: '3 hrs',
    openHour: 7, closeHour: 18, distanceKm: 8, area: 'Sao Beach', moods: ['slow', 'balanced'],
  }),
  stub('sa-pq-snorkel', 'phu-quoc', 'phu-quoc-snorkel', 'Snorkel Boat', {
    category: 'Adventure', categoryLabel: 'Adventure', durationHours: 4, durationLabel: '4 hrs',
    openHour: 8, closeHour: 16, distanceKm: 12, area: 'Islands', moods: ['adventure'],
  }),
  stub('sa-pq-lunch', 'phu-quoc', 'phu-quoc-sunset', 'Seafood Shack Lunch', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 11, closeHour: 21, distanceKm: 3, area: 'Coast', moods: ['food', 'balanced'],
  }),
  stub('sa-pq-sunset', 'phu-quoc', 'phu-quoc-sunset', 'Long Beach Sunset', {
    category: 'Scenic', categoryLabel: 'Scenic', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 16, closeHour: 19, distanceKm: 2, area: 'Long Beach', moods: ['slow', 'balanced'],
  }),
  stub('sa-pq-market', 'phu-quoc', 'phu-quoc-snorkel', 'Night Market Dinner', {
    category: 'Food', categoryLabel: 'Food', durationHours: 2, durationLabel: '2 hrs',
    openHour: 17, closeHour: 23, distanceKm: 1.5, area: 'Duong Dong', moods: ['food', 'balanced'],
  }),
  stub('sa-pq-cafe', 'phu-quoc', 'phu-quoc-sunset', 'Beach Café Pause', {
    category: 'Food', categoryLabel: 'Food', durationHours: 1, durationLabel: '1 hr',
    openHour: 8, closeHour: 20, distanceKm: 2.5, area: 'Beach', moods: ['slow', 'food'],
  }),
  stub('sa-pq-walk', 'phu-quoc', 'phu-quoc-sunset', 'Coastal Walk', {
    category: 'Scenic', categoryLabel: 'Scenic', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 6, closeHour: 19, distanceKm: 1, area: 'Coast', moods: ['slow', 'adventure'],
  }),
  stub('sa-pq-evening', 'phu-quoc', 'phu-quoc-snorkel', 'Quiet Island Evening', {
    category: 'Local Life', categoryLabel: 'Local Life', durationHours: 1.5, durationLabel: '1.5 hrs',
    openHour: 18, closeHour: 23, distanceKm: 2, area: 'Town', moods: ['slow', 'food'],
  }),
])

export const SAMPLE_ACTIVITY_POOL: Record<string, SampleActivity[]> = {
  hanoi: HANOI,
  'ninh-binh': NINH_BINH,
  'ha-long': HA_LONG,
  'ha-giang': HA_GIANG,
  sapa: SAPA,
  hue: HUE,
  'hoi-an': HOI_AN,
  'da-nang': DA_NANG,
  'phong-nha': PHONG_NHA,
  hcmc: HCMC,
  mekong: MEKONG,
  'phu-quoc': PHU_QUOC,
}

/** Mood → ordered activity ids per day index (0-based) */
export const SAMPLE_DAY_TEMPLATES: Record<
  string,
  Record<DayMood, SampleDaySlotTemplate[][]>
> = {
  hanoi: {
    balanced: [
      [
        { timeHour: 9, timeMinute: 0, activityId: 'sa-temple-literature' },
        { timeHour: 12, timeMinute: 0, activityId: 'sa-hanoi-food-tour' },
        { timeHour: 15, timeMinute: 0, activityId: 'sa-hanoi-hoan-kiem' },
        { timeHour: 18, timeMinute: 30, activityId: 'sa-hanoi-evening' },
      ],
      [
        { timeHour: 9, timeMinute: 0, activityId: 'sa-egg-coffee' },
        { timeHour: 11, timeMinute: 0, activityId: 'sa-hanoi-museum' },
        { timeHour: 14, timeMinute: 0, activityId: 'sa-old-quarter' },
        { timeHour: 19, timeMinute: 0, activityId: 'sa-bia-hoi' },
      ],
      [
        { timeHour: 8, timeMinute: 30, activityId: 'sa-train-street' },
        { timeHour: 12, timeMinute: 0, activityId: 'sa-hanoi-food-tour' },
        { timeHour: 16, timeMinute: 0, activityId: 'sa-hanoi-west-lake' },
        { timeHour: 19, timeMinute: 30, activityId: 'sa-hanoi-evening' },
      ],
    ],
    culture: [
      [
        { timeHour: 9, timeMinute: 0, activityId: 'sa-temple-literature' },
        { timeHour: 11, timeMinute: 30, activityId: 'sa-hanoi-museum' },
        { timeHour: 14, timeMinute: 30, activityId: 'sa-old-quarter' },
        { timeHour: 18, timeMinute: 0, activityId: 'sa-hanoi-evening' },
      ],
      [
        { timeHour: 9, timeMinute: 0, activityId: 'sa-hanoi-craft' },
        { timeHour: 11, timeMinute: 0, activityId: 'sa-temple-literature' },
        { timeHour: 15, timeMinute: 0, activityId: 'sa-train-street' },
        { timeHour: 19, timeMinute: 0, activityId: 'sa-bia-hoi' },
      ],
      [
        { timeHour: 9, timeMinute: 0, activityId: 'sa-hanoi-museum' },
        { timeHour: 12, timeMinute: 0, activityId: 'sa-old-quarter' },
        { timeHour: 15, timeMinute: 0, activityId: 'sa-hanoi-hoan-kiem' },
        { timeHour: 18, timeMinute: 30, activityId: 'sa-hanoi-evening' },
      ],
    ],
    food: [
      [
        { timeHour: 9, timeMinute: 0, activityId: 'sa-egg-coffee' },
        { timeHour: 11, timeMinute: 0, activityId: 'sa-hanoi-food-tour' },
        { timeHour: 14, timeMinute: 0, activityId: 'sa-hanoi-coffee-ws' },
        { timeHour: 17, timeMinute: 0, activityId: 'sa-old-quarter' },
        { timeHour: 19, timeMinute: 30, activityId: 'sa-bia-hoi' },
      ],
      [
        { timeHour: 9, timeMinute: 30, activityId: 'sa-egg-coffee' },
        { timeHour: 12, timeMinute: 0, activityId: 'sa-hanoi-food-tour' },
        { timeHour: 16, timeMinute: 0, activityId: 'sa-hanoi-craft' },
        { timeHour: 19, timeMinute: 0, activityId: 'sa-bia-hoi' },
      ],
      [
        { timeHour: 10, timeMinute: 0, activityId: 'sa-hanoi-coffee-ws' },
        { timeHour: 13, timeMinute: 0, activityId: 'sa-hanoi-food-tour' },
        { timeHour: 17, timeMinute: 0, activityId: 'sa-old-quarter' },
        { timeHour: 20, timeMinute: 0, activityId: 'sa-hanoi-evening' },
      ],
    ],
    adventure: [
      [
        { timeHour: 8, timeMinute: 0, activityId: 'sa-train-street' },
        { timeHour: 12, timeMinute: 0, activityId: 'sa-hanoi-food-tour' },
        { timeHour: 14, timeMinute: 30, activityId: 'sa-hanoi-west-lake' },
        { timeHour: 18, timeMinute: 30, activityId: 'sa-hanoi-evening' },
      ],
      [
        { timeHour: 8, timeMinute: 30, activityId: 'sa-old-quarter' },
        { timeHour: 12, timeMinute: 0, activityId: 'sa-hanoi-food-tour' },
        { timeHour: 15, timeMinute: 0, activityId: 'sa-train-street' },
        { timeHour: 19, timeMinute: 0, activityId: 'sa-bia-hoi' },
      ],
      [
        { timeHour: 9, timeMinute: 0, activityId: 'sa-hanoi-west-lake' },
        { timeHour: 12, timeMinute: 30, activityId: 'sa-hanoi-food-tour' },
        { timeHour: 16, timeMinute: 0, activityId: 'sa-hanoi-hoan-kiem' },
        { timeHour: 19, timeMinute: 0, activityId: 'sa-hanoi-evening' },
      ],
    ],
    slow: [
      [
        { timeHour: 10, timeMinute: 0, activityId: 'sa-egg-coffee' },
        { timeHour: 12, timeMinute: 0, activityId: 'sa-hanoi-hoan-kiem' },
        { timeHour: 15, timeMinute: 0, activityId: 'sa-hanoi-craft' },
        { timeHour: 18, timeMinute: 0, activityId: 'sa-hanoi-evening' },
      ],
      [
        { timeHour: 10, timeMinute: 0, activityId: 'sa-egg-coffee' },
        { timeHour: 13, timeMinute: 0, activityId: 'sa-old-quarter' },
        { timeHour: 16, timeMinute: 30, activityId: 'sa-hanoi-west-lake' },
        { timeHour: 20, timeMinute: 0, activityId: 'sa-bia-hoi' },
      ],
      [
        { timeHour: 10, timeMinute: 30, activityId: 'sa-hanoi-hoan-kiem' },
        { timeHour: 13, timeMinute: 0, activityId: 'sa-hanoi-coffee-ws' },
        { timeHour: 16, timeMinute: 0, activityId: 'sa-hanoi-craft' },
        { timeHour: 19, timeMinute: 0, activityId: 'sa-hanoi-evening' },
      ],
    ],
  },
}

function autoTemplates(cityId: string, pool: SampleActivity[]): Record<DayMood, SampleDaySlotTemplate[][]> {
  const byMood = (mood: DayMood, times: { h: number; m: number }[]) => {
    const picks = pool.filter((a) => a.moods.includes(mood))
    const list = picks.length ? picks : pool
    return times.map((t, i) => ({
      timeHour: t.h,
      timeMinute: t.m,
      activityId: list[i % list.length].id,
    }))
  }
  const dayA = [
    { h: 9, m: 0 },
    { h: 12, m: 0 },
    { h: 15, m: 0 },
    { h: 18, m: 30 },
  ]
  const dayB = [
    { h: 9, m: 30 },
    { h: 12, m: 30 },
    { h: 16, m: 0 },
    { h: 19, m: 0 },
  ]
  const dayC = [
    { h: 8, m: 30 },
    { h: 12, m: 0 },
    { h: 15, m: 30 },
    { h: 19, m: 0 },
  ]
  const foodTimes = [
    { h: 9, m: 0 },
    { h: 11, m: 0 },
    { h: 13, m: 0 },
    { h: 16, m: 0 },
    { h: 19, m: 0 },
  ]
  const slowTimes = [
    { h: 10, m: 0 },
    { h: 12, m: 0 },
    { h: 15, m: 0 },
    { h: 18, m: 0 },
  ]
  const advTimes = [
    { h: 8, m: 0 },
    { h: 12, m: 0 },
    { h: 14, m: 0 },
    { h: 18, m: 0 },
  ]
  void cityId
  return {
    balanced: [byMood('balanced', dayA), byMood('balanced', dayB), byMood('balanced', dayC)],
    culture: [byMood('culture', dayA), byMood('culture', dayB), byMood('culture', dayC)],
    food: [byMood('food', foodTimes), byMood('food', dayB), byMood('food', dayC)],
    adventure: [byMood('adventure', advTimes), byMood('adventure', dayB), byMood('adventure', dayC)],
    slow: [byMood('slow', slowTimes), byMood('slow', dayB), byMood('slow', dayC)],
  }
}

export function getSamplePool(cityId: string): SampleActivity[] {
  return SAMPLE_ACTIVITY_POOL[cityId] ?? []
}

export function getActivityById(cityId: string, activityId: string) {
  return getSamplePool(cityId).find((a) => a.id === activityId)
}

export function getDayTemplates(cityId: string) {
  if (SAMPLE_DAY_TEMPLATES[cityId]) return SAMPLE_DAY_TEMPLATES[cityId]
  return autoTemplates(cityId, getSamplePool(cityId))
}

/** Minimal Experience stubs so Trip Bag can resolve sandbox-linked ids that are real experience ids */
export function experienceFromSampleActivity(a: SampleActivity): Experience | undefined {
  const real = EXPERIENCES.find((e) => e.id === a.experienceId)
  return real
}
