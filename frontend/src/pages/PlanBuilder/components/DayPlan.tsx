import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Experience } from '../types'
import type {
  ItineraryItem,
  PeriodId,
  YourVietnamDay,
} from '../lib/yourVietnam/types'
import { experiencesCitySectionTo, experiencesCityUrl, gettingAroundUrl, itineraryItemHref, openDetailHref } from '../lib/yourVietnam/links'
import { experienceCityForPlace } from '../lib/yourVietnam/cityPins'
import type { PlaceId } from '../../GettingAround/data/types'
import type { ExperienceSelectionMeta } from '../types'
import { EXPERIENCES } from '../data/experiences'
import { CITY_ACTIVITIES, getActivityImages } from '../data/activities'
import { getExperienceImages } from '../lib/pricing'
import { SightSwapOverlay } from './SightSwapOverlay'

export function DayPlan({
  day,
  highlightId,
  itinerarySourceIds,
  onRemoveItem,
  onRestoreItem,
  onAddSuggestion,
  onSkipSuggestion,
  onMoveExperience,
  onSwapItem,
}: {
  day: YourVietnamDay
  highlightId: string | null
  itinerarySourceIds: string[]
  onRemoveItem: (item: ItineraryItem) => void
  onRestoreItem: (item: ItineraryItem) => void
  onAddSuggestion: (id: string, kind?: 'experience' | 'activity' | 'restaurant') => void
  onSkipSuggestion: (sourceId: string) => void
  onMoveExperience: (experienceId: string, slot: ExperienceSelectionMeta['preferredSlot']) => void
  onSwapItem: (from: ItineraryItem, to: Experience) => void
}) {
  const [swapItem, setSwapItem] = useState<ItineraryItem | null>(null)
  const [swapOriginals, setSwapOriginals] = useState<Record<string, ItineraryItem>>({})
  const [ghosts, setGhosts] = useState<{ day: number; item: ItineraryItem }[]>([])
  const taken = new Set(itinerarySourceIds)

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            Day {String(day.day).padStart(2, '0')} · {day.dateLabel}
          </p>
          <h2 className="mt-1 font-serif text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-tight text-ink">
            {day.theme}
          </h2>
          <p className="mt-1 max-w-[48ch] text-[0.92rem] text-muted">{day.blurb}</p>
          <p className="mt-2 text-[0.78rem] font-semibold text-muted">
            {day.experienceCount} selected · {day.foodCount} food
            {day.hotelName ? ` · ${day.hotelName}` : ''}
            {' · '}est. ${day.costs.total}
          </p>
        </div>
        {day.bannerImage && (
          <img
            src={day.bannerImage}
            alt=""
            loading="lazy"
            className="h-20 w-28 rounded-2xl object-cover shadow-soft sm:h-24 sm:w-36"
          />
        )}
      </div>

      <div className="mt-6 space-y-8">
        {day.periods.map((period) => (
          <PeriodBlock
            key={period.id}
            periodId={period.id}
            label={period.label}
            windowLabel={period.windowLabel}
            items={period.items}
            ghosts={ghosts.filter((g) => g.day === day.day && g.item.period === period.id).map((g) => g.item)}
            city={day.city}
            catalogCity={
              day.placeId
                ? experienceCityForPlace(day.placeId as PlaceId, day.city)
                : day.city
            }
            highlightId={highlightId}
            swapOriginals={swapOriginals}
            onRemoveItem={onRemoveItem}
            onRestoreItem={onRestoreItem}
            onSkipSuggestion={onSkipSuggestion}
            onAddSuggestion={onAddSuggestion}
            onMoveExperience={onMoveExperience}
            onOpenSwap={setSwapItem}
            onGhost={(item) =>
              setGhosts((prev) => [...prev.filter((g) => g.item.id !== item.id), { day: day.day, item }])
            }
            onClearGhost={(id) => setGhosts((prev) => prev.filter((g) => g.item.id !== id))}
            onUndoSwap={(current) => {
              const original = current.sourceId ? swapOriginals[current.sourceId] : undefined
              if (!original) return
              onRemoveItem(current)
              onRestoreItem(original)
              setSwapOriginals((prev) => {
                const next = { ...prev }
                if (current.sourceId) delete next[current.sourceId]
                return next
              })
            }}
          />
        ))}
      </div>

      {day.cityTransferOut && (
        <div className="mt-8 overflow-hidden rounded-[24px] border border-amber-700/25 bg-gradient-to-br from-amber-50 to-cream px-5 py-5 sm:px-6">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-800">
            City transfer
          </p>
          <h3 className="mt-1 font-serif text-[1.5rem] font-semibold text-ink">
            {day.city} → {day.cityTransferOut.toCity}
          </h3>
          <p className="mt-1 text-[0.9rem] text-muted">
            {day.cityTransferOut.icon} {day.cityTransferOut.modeLabel} ·{' '}
            {day.cityTransferOut.durationLabel}
          </p>
          <p className="mt-2 max-w-[48ch] text-[0.88rem] italic text-ink/80">
            {day.cityTransferOut.reason}
          </p>
          {day.cityTransferOut.externalUrl && (
            <Link
              to={day.cityTransferOut.externalUrl}
              className="mt-3 inline-block text-[0.84rem] font-bold text-amber-800 hover:underline"
            >
              View transport options ↗
            </Link>
          )}
        </div>
      )}

      <div className="mt-6 border-t border-ink/8 pt-4">
        <p className="text-[0.68rem] font-bold uppercase tracking-wide text-sage">Day cost</p>
        <p className="mt-1 font-serif text-[1.2rem] font-semibold text-ink">
          ≈ ${day.costs.total}{' '}
          <span className="text-[0.75rem] font-sans font-medium text-muted">
            Stay ${day.costs.stay} · Food ${day.costs.food} · Transit ${day.costs.transport} ·
            Experiences ${day.costs.experiences}
          </span>
        </p>
      </div>

      {swapItem && (
        <SightSwapOverlay
          item={swapItem}
          itinerarySourceIds={taken}
          sameDaySourceIds={
            new Set(
              day.periods
                .flatMap((p) => p.items)
                .flatMap((it) =>
                  (it.kind === 'experience' || it.kind === 'activity') && it.sourceId ? [it.sourceId] : [],
                ),
            )
          }
          onClose={() => setSwapItem(null)}
          onSwap={(candidate) => {
            onSwapItem(swapItem, candidate)
            if (candidate.id) {
              setSwapOriginals((prev) => ({ ...prev, [candidate.id]: swapItem }))
            }
            setSwapItem(null)
          }}
        />
      )}
    </section>
  )
}

function PeriodBlock({
  periodId,
  label,
  windowLabel,
  items,
  ghosts,
  city,
  catalogCity,
  highlightId,
  swapOriginals,
  onRemoveItem,
  onRestoreItem,
  onSkipSuggestion,
  onAddSuggestion,
  onMoveExperience,
  onOpenSwap,
  onGhost,
  onClearGhost,
  onUndoSwap,
}: {
  periodId: PeriodId
  label: string
  windowLabel: string
  items: ItineraryItem[]
  ghosts: ItineraryItem[]
  city: string
  catalogCity: string
  highlightId: string | null
  swapOriginals: Record<string, ItineraryItem>
  onRemoveItem: (item: ItineraryItem) => void
  onRestoreItem: (item: ItineraryItem) => void
  onSkipSuggestion: (sourceId: string) => void
  onAddSuggestion: (id: string, kind?: 'experience' | 'activity' | 'restaurant') => void
  onMoveExperience: (experienceId: string, slot: ExperienceSelectionMeta['preferredSlot']) => void
  onOpenSwap: (item: ItineraryItem) => void
  onGhost: (item: ItineraryItem) => void
  onClearGhost: (id: string) => void
  onUndoSwap: (item: ItineraryItem) => void
}) {
  void onAddSuggestion
  void onSkipSuggestion
  const sights = items.filter((it) => it.kind === 'experience' || it.kind === 'activity')
  const packed = sights.length >= 3
  const sparse = sights.length <= 1
  const cityTo = experiencesCitySectionTo(catalogCity)

  if (periodId === 'night') {
    return (
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/8 pb-2">
          <div className="flex flex-wrap items-baseline gap-3">
            <h3 className="font-serif text-[1.15rem] font-semibold text-ink">{label}</h3>
            <span className="text-[0.78rem] text-muted">{windowLabel}</span>
          </div>
        </div>
        <ul className="mt-3 space-y-0">
          {items.map((item) => (
            <li key={item.id} id={`yv-item-${item.id}`}>
              <ItemRow
                item={item}
                highlighted={highlightId === item.id}
                swappedFrom={item.sourceId ? swapOriginals[item.sourceId] : undefined}
                onRemove={() => onRemoveItem(item)}
                onOpenSwap={() => onOpenSwap(item)}
                onUndoSwap={() => onUndoSwap(item)}
                onMoveExperience={onMoveExperience}
              />
              {item.transferAfter && <TransferConnector transfer={item.transferAfter} />}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/8 pb-2">
        <div className="flex flex-wrap items-baseline gap-3">
          <h3 className="font-serif text-[1.15rem] font-semibold text-ink">{label}</h3>
          <span className="text-[0.78rem] text-muted">{windowLabel}</span>
        </div>
      </div>

      {items.length === 0 && ghosts.length === 0 ? (
        <p className="mt-3 text-[0.9rem] text-muted">
          No sights — keep it free?{' '}
          <Link
            to={cityTo}
            title={experiencesCityUrl(catalogCity)}
            className="font-bold text-terracotta hover:underline"
          >
            or add sights!
          </Link>
        </p>
      ) : (
        <ul className="mt-3 space-y-0">
          {items.map((item) => (
            <li key={item.id} id={`yv-item-${item.id}`}>
              <ItemRow
                item={item}
                highlighted={highlightId === item.id}
                swappedFrom={item.sourceId ? swapOriginals[item.sourceId] : undefined}
                onRemove={() => {
                  onGhost(item)
                  onRemoveItem(item)
                }}
                onOpenSwap={() => onOpenSwap(item)}
                onUndoSwap={() => onUndoSwap(item)}
                onMoveExperience={onMoveExperience}
              />
              {item.transferAfter && <TransferConnector transfer={item.transferAfter} />}
            </li>
          ))}
          {ghosts.map((item) => (
            <li key={`ghost-${item.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/5 py-3">
                <p className="text-[0.88rem] text-muted">
                  Removed <span className="font-semibold text-ink">{item.name}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onRestoreItem(item)
                    onClearGhost(item.id)
                  }}
                  className="rounded-full bg-cream px-3 py-1 text-[0.78rem] font-bold text-ink hover:bg-ink hover:text-paper"
                >
                  Undo
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[0.84rem] text-muted">
        <Link to={cityTo} className="font-bold text-terracotta hover:underline">
          Add more sights
        </Link>
        {packed ? (
          <span className="ml-2">— looking packed already</span>
        ) : sparse ? (
          <span className="ml-2">
            — looking empty? keep free? or{' '}
            <Link to={cityTo} className="font-semibold text-terracotta hover:underline">
              add more
            </Link>
          </span>
        ) : null}
      </p>
    </div>
  )
}

function transferAccentClasses(accent?: ItineraryItem['transferAccent']) {
  if (accent === 'arrival') {
    return {
      shell: 'rounded-[16px] border border-sage/40 bg-sage/10 px-3 py-3 sm:px-4',
      reason: 'text-sage',
      link: 'text-sage hover:underline',
    }
  }
  if (accent === 'departure') {
    return {
      shell: 'rounded-[16px] border border-[#d4727d]/45 bg-[#f8e8ea] px-3 py-3 sm:px-4',
      reason: 'text-[#b84a58]',
      link: 'text-[#b84a58] hover:underline',
    }
  }
  if (accent === 'city-hop') {
    return {
      shell: 'rounded-[16px] border border-amber-700/25 bg-amber-50/90 px-3 py-3 sm:px-4',
      reason: 'text-amber-900/80',
      link: 'text-amber-800 hover:underline',
    }
  }
  return null
}

function itemPhotos(item: ItineraryItem): string[] {
  if (item.kind === 'experience' && item.sourceId) {
    const exp = EXPERIENCES.find((e) => e.id === item.sourceId)
    if (exp) return getExperienceImages(exp).slice(0, 3)
  }
  if (item.kind === 'activity' && item.sourceId) {
    const act = CITY_ACTIVITIES.find((a) => a.id === item.sourceId)
    if (act) return getActivityImages(act).slice(0, 3)
  }
  return item.thumb ? [item.thumb] : []
}

function ItemRow({
  item,
  highlighted,
  swappedFrom,
  onRemove,
  onOpenSwap,
  onUndoSwap,
  onMoveExperience,
}: {
  item: ItineraryItem
  highlighted: boolean
  swappedFrom?: ItineraryItem
  onRemove: () => void
  onOpenSwap: () => void
  onUndoSwap: () => void
  onMoveExperience: (experienceId: string, slot: ExperienceSelectionMeta['preferredSlot']) => void
}) {
  const [confirmRemove, setConfirmRemove] = useState(false)
  const accent = transferAccentClasses(item.transferAccent)
  const photos = itemPhotos(item)
  const isSight = item.kind === 'experience' || item.kind === 'activity'
  const detailHref =
    item.kind === 'experience' || item.kind === 'activity' || item.kind === 'meal' || item.kind === 'shopping'
      ? itineraryItemHref({ kind: item.kind, sourceId: item.sourceId, mapsUrl: item.mapsUrl })
      : undefined

  return (
    <article
      className={`group border-b border-ink/5 py-4 ${accent ? accent.shell : ''} ${
        highlighted ? 'rounded-[16px] bg-terracotta/8 ring-1 ring-terracotta/25' : ''
      }`}
    >
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-2">
            <span className="mt-0.5 text-[1.25rem]" aria-hidden="true">
              {item.icon}
            </span>
            {detailHref ? (
              <h4 className="font-serif text-[1.15rem] font-semibold leading-snug">
                <a
                  href={detailHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => openDetailHref(detailHref, e)}
                  className="text-ink underline-offset-2 hover:underline"
                >
                  {item.name}
                </a>
              </h4>
            ) : (
              <h4 className="font-serif text-[1.15rem] font-semibold leading-snug text-ink">{item.name}</h4>
            )}
            {isSight && (
              <div className="ml-auto flex flex-wrap gap-1.5">
                {swappedFrom ? (
                  <button
                    type="button"
                    onClick={onUndoSwap}
                    className="rounded-full bg-cream px-2.5 py-1 text-[0.72rem] font-bold text-ink hover:bg-ink hover:text-paper"
                  >
                    Undo
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenSwap}
                    className="rounded-full bg-cream px-2.5 py-1 text-[0.72rem] font-bold text-ink hover:bg-ink hover:text-paper"
                  >
                    Swap
                  </button>
                )}
                {confirmRemove ? (
                  <span className="flex flex-wrap items-center gap-1.5 text-[0.72rem]">
                    <span className="text-muted">Remove this sight?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmRemove(false)
                        onRemove()
                      }}
                      className="rounded-full bg-terracotta/15 px-2 py-1 font-bold text-terracotta"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(false)}
                      className="rounded-full px-2 py-1 font-bold text-muted hover:text-ink"
                    >
                      Keep
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(true)}
                    className="rounded-full px-2.5 py-1 text-[0.72rem] font-bold text-muted hover:text-ink"
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="mt-0.5 text-[0.82rem] text-muted">
            {item.timeLabel}
            {item.durationLabel ? ` · ${item.durationLabel}` : ''}
            {item.locationLabel ? ` · ${item.locationLabel}` : ''}
          </p>
          {item.description && (
            <p className="mt-1.5 max-w-[52ch] text-[0.88rem] leading-relaxed text-ink/80">
              {item.description}
            </p>
          )}
          {item.reason && item.transferAccent && (
            <p className={`mt-1 text-[0.82rem] italic ${accent?.reason ?? 'text-sage'}`}>{item.reason}</p>
          )}
          <p className="mt-2 text-[0.78rem] text-muted">
            {item.costUsd > 0 ? `≈ $${item.costUsd}` : 'Included / free'}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
            {item.mapsUrl && (
              <a
                href={item.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[0.8rem] font-bold ${accent?.link ?? 'text-terracotta hover:underline'}`}
              >
                Open in Google Maps ↗
              </a>
            )}
            {item.kind === 'experience' && item.sourceId && (
              <label className="text-[0.78rem] font-bold text-muted">
                Move{' '}
                <select
                  className="ml-1 rounded-md border border-ink/10 bg-cream px-1 py-0.5 text-[0.75rem] text-ink"
                  value={item.period === 'night' ? 'evening' : item.period}
                  onChange={(e) =>
                    onMoveExperience(
                      item.sourceId!,
                      e.target.value as ExperienceSelectionMeta['preferredSlot'],
                    )
                  }
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </label>
            )}
          </div>
        </div>
        {photos.length > 0 && (
          <div
            className="grid min-h-[8.5rem] gap-1.5 self-stretch"
            style={{
              gridTemplateColumns: `repeat(${Math.min(photos.length, 3)}, minmax(0, 1fr))`,
            }}
          >
            {photos.slice(0, 3).map((src) => (
              <div key={src} className="relative min-h-[8.5rem] overflow-hidden rounded-[14px] bg-cream shadow-soft">
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

function TransferConnector({
  transfer,
}: {
  transfer: NonNullable<ItineraryItem['transferAfter']>
}) {
  const isHop = transfer.accent === 'city-hop'
  return (
    <div
      className={`ml-2 border-l py-2.5 pl-5 ${
        isHop
          ? 'border-amber-700/35 bg-amber-50/50 rounded-r-[12px]'
          : 'border-sage/35 bg-sage/[0.06] rounded-r-[12px]'
      }`}
    >
      <p className={`text-[0.8rem] font-semibold ${isHop ? 'text-amber-900' : 'text-sage'}`}>
        <span aria-hidden="true">{transfer.icon} </span>
        {transfer.mode} · {transfer.durationLabel}
      </p>
      <p className="mt-0.5 text-[0.78rem] text-muted">{transfer.reason}</p>
      {transfer.externalUrl && (
        <Link
          to={transfer.externalUrl || gettingAroundUrl()}
          className={`mt-1 inline-block text-[0.75rem] font-bold hover:underline ${
            isHop ? 'text-amber-800' : 'text-sage'
          }`}
        >
          View transport options ↗
        </Link>
      )}
    </div>
  )
}
