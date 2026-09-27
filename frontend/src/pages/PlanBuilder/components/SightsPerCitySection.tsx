import { useMemo, useState } from 'react'
import { EXPERIENCES } from '../data/experiences'
import { CITY_ACTIVITIES, getActivityImages } from '../data/activities'
import { ExperienceCard } from './ExperienceCard'
import { ActivityCard } from './ActivityCard'
import { getExperienceImages } from '../lib/pricing'
import { experiencesCityUrl, experiencesUrl, openDetailHref } from '../lib/yourVietnam/links'
import { buildCityRankIndex } from '../services/cityCatalog'
import type { CitySightGroup, ScoredBagItem } from '../lib/yourVietnam/itineraryOptimize'
import { useItineraryTripStore } from '../../../store/itineraryTripStore'
import '../../../store/tripCatalogBoot'

export function BagItemCards({ items }: { items: ScoredBagItem[] }) {
  const rankById = useMemo(() => buildCityRankIndex(EXPERIENCES), [])

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => {
        if (it.kind === 'experience') {
          const exp = EXPERIENCES.find((e) => e.id === it.id)
          if (!exp) return null
          return (
            <ExperienceCard
              key={it.key}
              experience={exp}
              tripDate={null}
              dense
              cityRank={rankById.get(exp.id)}
            />
          )
        }
        const act = CITY_ACTIVITIES.find((a) => a.id === it.id)
        if (!act) return null
        return <ActivityCard key={it.key} activity={act} />
      })}
    </div>
  )
}

function itemThumb(it: ScoredBagItem): string | undefined {
  if (it.kind === 'experience') {
    const exp = EXPERIENCES.find((e) => e.id === it.id)
    return exp ? getExperienceImages(exp)[0] : undefined
  }
  const act = CITY_ACTIVITIES.find((a) => a.id === it.id)
  return act ? getActivityImages(act)[0] : undefined
}

function openItemDetail(it: ScoredBagItem) {
  const href =
    it.kind === 'experience'
      ? `/plan/builder/experience/${it.id}`
      : `/plan/builder/activity/${it.id}`
  openDetailHref(href)
}

function BagMiniSightCard({
  item,
  onRemove,
}: {
  item: ScoredBagItem
  onRemove: () => void
}) {
  const thumb = itemThumb(item)

  return (
    <div className="flex items-center gap-1 rounded-full border border-ink/8 bg-cream/60 py-1 pl-1 pr-1">
      <button
        type="button"
        onClick={() => openItemDetail(item)}
        className="flex min-w-0 items-center gap-2 text-left"
      >
        <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-sage/15">
          {thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" /> : null}
        </span>
        <span className="max-w-[10rem] truncate text-[0.78rem] font-bold text-ink">{item.name}</span>
      </button>
      <button
        type="button"
        aria-label={`Remove ${item.name}`}
        onClick={onRemove}
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.95rem] font-bold leading-none text-ink/45 hover:bg-ink hover:text-paper"
      >
        −
      </button>
    </div>
  )
}

export function SightsPerCitySection({ groups }: { groups: CitySightGroup[] }) {
  const useTripStore = useItineraryTripStore()
  const [openCity, setOpenCity] = useState<string | null>(groups[0]?.city ?? null)
  const removeExperience = useTripStore((s) => s.removeExperience)
  const removeActivity = useTripStore((s) => s.removeActivity)
  const dropPlaceFromItinerary = useTripStore((s) => s.dropPlaceFromItinerary)
  const open = groups.find((g) => g.city === openCity) ?? groups[0]

  if (!open || groups.length === 0) return null

  function removeFromBag(item: ScoredBagItem) {
    const group = groups.find((g) => g.items.some((row) => row.key === item.key))
    const lastInCity = Boolean(group && group.items.length === 1)
    if (item.kind === 'experience') removeExperience(item.id)
    else removeActivity(item.id)
    if (lastInCity && group?.placeId) dropPlaceFromItinerary(group.placeId)
  }

  function removeCity(group: CitySightGroup) {
    if (group.placeId) dropPlaceFromItinerary(group.placeId)
    else for (const item of group.items) removeFromBag(item)
    const next = groups.find((g) => g.city !== group.city)
    setOpenCity(next?.city ?? null)
  }

  const cityHref = open ? experiencesCityUrl(open.catalogCity || open.city) : experiencesUrl()

  return (
    <div className="mt-5 rounded-[16px] border border-ink/8 bg-paper px-4 py-4 shadow-soft" data-yv="sights-per-city">
      <div className="mt-1">
        <h2 className="font-serif text-[1.15rem] font-semibold text-ink">Your Added Sights</h2>
        <p className="mt-1 max-w-[62ch] text-[0.88rem] leading-relaxed text-muted">
          You can add or delete cities or add new sights inside cities anytime.
        </p>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[0.75rem] font-semibold text-ink">
          Cities in Which You Have Sights :
        </span>
        {groups.map((g) => {
          const on = open ? g.city === open.city : false
          return (
            <span
              key={g.placeId ?? g.city}
              className={`inline-flex items-center rounded-full ${
                on ? 'bg-ink text-paper' : 'bg-cream text-ink'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenCity(g.city)}
                className={`inline-flex items-center gap-1 py-1 pl-2.5 text-[0.75rem] font-semibold ${
                  on ? 'text-paper' : 'text-ink hover:opacity-80'
                }`}
              >
                {g.city}
                <span className={on ? 'text-paper/75' : 'text-muted'}>{g.items.length}</span>
              </button>
              <button
                type="button"
                aria-label={`Remove ${g.city} and its sights`}
                onClick={(e) => {
                  e.stopPropagation()
                  removeCity(g)
                }}
                className={`mr-0.5 grid h-6 w-6 place-items-center rounded-full text-[0.95rem] font-bold leading-none ${
                  on ? 'text-paper/80 hover:bg-paper/15' : 'text-ink/45 hover:bg-ink hover:text-paper'
                }`}
              >
                −
              </button>
            </span>
          )
        })}
        <a
          href={experiencesUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-terracotta px-4 py-2 text-[0.88rem] font-bold text-paper shadow-soft hover:bg-ink"
        >
          Add more
        </a>
      </div>
      {open ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {open.items.map((it) => (
            <BagMiniSightCard key={it.key} item={it} onRemove={() => removeFromBag(it)} />
          ))}
          <a
            href={cityHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-dashed border-terracotta/50 bg-terracotta/8 px-3.5 py-2 text-[0.82rem] font-bold text-terracotta hover:bg-terracotta hover:text-paper"
          >
            Add More Sights in {open.city}
          </a>
        </div>
      ) : null}
    </div>
  )
}
