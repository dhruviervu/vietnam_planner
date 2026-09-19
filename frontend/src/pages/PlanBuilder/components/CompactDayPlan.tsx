import { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useItineraryTripStore } from '../../../store/itineraryTripStore'
import type { ItineraryItem, PeriodId, YourVietnamDay } from '../lib/yourVietnam/types'
import { itineraryItemHref, openDetailHref } from '../lib/yourVietnam/links'
import { clockRangesForSights } from '../lib/yourVietnam/clockTimes'
import { isSight, layoutCompactDay, occupancyFromLaidPeriods } from '../lib/yourVietnam/layoutDay'
import { coordForItem } from '../lib/yourVietnam/sightOrder'
import { usePrefetchDurationMatrix } from '../lib/yourVietnam/osrmRoute'
import { planningProfile } from '../lib/yourVietnam/planningProfile'
import { parseDayEndHour } from '../lib/yourVietnam/dayWindows'
import { dailySpendBand, effectiveDailyUsd } from '../lib/yourVietnam/holidayKind'
import { itemHours, type TransferSlot } from '../lib/yourVietnam/dayCapacity'
import { tripIsoDate } from '../lib/yourVietnam/openingHours'
import { useLiveOpeningHours } from '../lib/yourVietnam/liveOpeningHours'
import { openCitySightsForItinerary } from '../lib/yourVietnam/itineraryAddTarget'
import { experienceCityForPlace } from '../lib/yourVietnam/cityPins'
import type { PlaceId } from '../../GettingAround/data/types'

const PERIODS: PeriodId[] = ['morning', 'afternoon', 'evening', 'night']
const PERIOD_LABEL: Record<PeriodId, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
}

function SightChip({
  item,
  period,
  range,
  highlighted,
  dayNumber,
  slotId,
  timeWarning,
  pendingRemove,
  onRemove,
  onUndo,
}: {
  item: ItineraryItem
  period: PeriodId
  range: string
  highlighted: boolean
  dayNumber: number
  slotId: string
  timeWarning?: string
  pendingRemove?: boolean
  onRemove: () => void
  onUndo?: () => void
}) {
  const id = `sight:${item.sourceId}`
  const sortable = useSortable({
    id,
    data: {
      type: 'sight',
      sourceId: item.sourceId,
      period,
      item,
      dayNumber,
      slotId,
    },
    disabled: !item.sourceId || pendingRemove,
    animateLayoutChanges: () => false,
  })
  const href = itineraryItemHref({
    kind: item.kind,
    sourceId: item.sourceId,
    mapsUrl: item.mapsUrl,
  })

  const style = {
    transform: sortable.isDragging ? undefined : CSS.Transform.toString(sortable.transform),
    transition: sortable.isDragging ? undefined : sortable.transition,
  }

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={`flex w-fit max-w-full flex-col gap-0.5 ${
        sortable.isDragging ? 'z-20 opacity-40' : ''
      }`}
    >
    <div className="flex w-fit max-w-full items-center gap-1">
      <button
        type="button"
        {...sortable.attributes}
        {...sortable.listeners}
        onClick={() => {
          if (pendingRemove || sortable.isDragging || !href) return
          openDetailHref(href)
        }}
        className={`inline-flex w-fit max-w-full cursor-grab items-center rounded-full px-2.5 py-1 text-left text-[0.75rem] font-semibold leading-snug shadow-soft transition active:cursor-grabbing ${
          pendingRemove
            ? 'bg-ink/8 text-ink/40 line-through'
            : highlighted
              ? 'bg-terracotta text-paper'
              : 'bg-cream text-ink hover:bg-ink/10'
        }`}
      >
        <span className={highlighted && !pendingRemove ? 'text-paper/70' : 'text-ink/55'}>
          {range}
        </span>
        <span className={`ml-1 ${highlighted && !pendingRemove ? 'text-paper' : 'text-ink'}`}>
          {item.name}
        </span>
        {item.includedStop ? (
          <span className={`ml-1 text-[0.62rem] font-bold uppercase tracking-wide ${
            highlighted && !pendingRemove ? 'text-paper/70' : 'text-sage'
          }`}>
            On tour
          </span>
        ) : null}
      </button>
      {pendingRemove ? (
        <>
          <span className="shrink-0 text-[0.72rem] font-semibold text-terracotta">Removed</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onUndo?.()
            }}
            className="shrink-0 rounded-full bg-cream px-2 py-1 text-[0.72rem] font-bold text-ink hover:bg-ink hover:text-paper"
          >
            Undo
          </button>
        </>
      ) : (
        <button
          type="button"
          aria-label={`Remove ${item.name}`}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cream text-[0.85rem] font-bold leading-none text-ink/55 hover:bg-ink hover:text-paper"
        >
          −
        </button>
      )}
    </div>
      {item.planningNote && !pendingRemove ? (
        <p className="max-w-[22rem] pl-2 text-[0.68rem] leading-snug text-muted">{item.planningNote}</p>
      ) : null}
      {timeWarning && !pendingRemove ? (
        <p className="pl-2 text-[0.7rem] font-semibold text-terracotta">⚠ {timeWarning}</p>
      ) : null}
    </div>
  )
}

function PeriodRow({
  period,
  items,
  highlightId,
  day,
  occupancy,
  clockById,
  timeWarnings,
  pendingIds,
  onRemove,
  onUndo,
  hideLabel = false,
}: {
  period: PeriodId
  items: ItineraryItem[]
  highlightId: string | null
  day: YourVietnamDay
  occupancy: ReturnType<typeof occupancyFromLaidPeriods>
  clockById: Record<string, string>
  timeWarnings: Record<string, string>
  pendingIds: Set<string>
  onRemove: (item: ItineraryItem, period: PeriodId) => void
  onUndo: (sourceId: string) => void
  hideLabel?: boolean
}) {
  const droppable = useDroppable({
    id: `period:${day.slotId}:${period}`,
    data: { type: 'period', period, slotId: day.slotId },
  })
  const sights = items.filter(isSight)
  const fallback = clockRangesForSights(sights, period, itemHours)
  const ids = sights.map((it) => `sight:${it.sourceId}`)
  const city = day.placeId
    ? experienceCityForPlace(day.placeId as PlaceId, day.city)
    : day.city

  function openAdd() {
    openCitySightsForItinerary(
      city,
      {
        day: day.day,
        slotId: day.slotId,
        period,
      },
      occupancy,
    )
  }

  return (
    <div
      className={
        hideLabel
          ? 'block'
          : 'grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-3 py-1.5'
      }
    >
      {hideLabel ? null : (
        <p className="pt-1 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">
          {PERIOD_LABEL[period]}
        </p>
      )}
      <div
        ref={droppable.setNodeRef}
        className={`flex min-h-[2.4rem] flex-col items-start gap-1.5 rounded-[12px] px-1 py-1 ${
          droppable.isOver ? 'bg-sage/15 ring-1 ring-sage/30' : ''
        }`}
      >
        {items
          .filter((it) => it.kind === 'meal' && !isSight(it))
          .map((it) => (
            <div
              key={it.id}
              className="inline-flex w-fit max-w-full items-center rounded-full bg-sage/15 px-2.5 py-1 text-[0.75rem] font-semibold text-ink"
            >
              <span className="text-ink/55">{it.timeLabel}</span>
              <span className="ml-1">{it.name}</span>
            </div>
          ))}
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {sights.map((it) =>
            it.sourceId ? (
              <SightChip
                key={`${period}:${it.sourceId}`}
                item={it}
                period={period}
                range={clockById[it.id] ?? fallback.get(it.id) ?? ''}
                highlighted={highlightId === it.id}
                dayNumber={day.day}
                slotId={day.slotId}
                timeWarning={timeWarnings[it.id]}
                pendingRemove={Boolean(it.sourceId && pendingIds.has(it.sourceId))}
                onRemove={() => onRemove(it, period)}
                onUndo={() => it.sourceId && onUndo(it.sourceId)}
              />
            ) : null,
          )}
        </SortableContext>
        {sights.length === 0 && items.every((it) => it.kind !== 'meal') ? (
          <button
            type="button"
            onClick={openAdd}
            className="rounded-[10px] border border-dashed border-ink/15 px-3 py-2 text-left text-[0.78rem] font-semibold text-muted hover:border-terracotta hover:text-terracotta"
          >
            Looking Empty - Add More sights
          </button>
        ) : (
          <button
            type="button"
            onClick={openAdd}
            aria-label={hideLabel ? 'Add a sight to this day' : `Add a sight to ${PERIOD_LABEL[period]}`}
            className="grid h-7 w-7 place-items-center rounded-full border border-dashed border-ink/20 text-[1.05rem] font-semibold leading-none text-ink/55 hover:border-terracotta hover:text-terracotta"
          >
            +
          </button>
        )}
      </div>
    </div>
  )
}

export function CompactDayPlan({
  day,
  cityDays,
  prevDay,
  highlightId,
  onRemoveSight,
  onUndoSight,
  pendingRemovedIds = [],
  ghostItems = [],
  fillPool = [],
  stackOverride,
}: {
  day: YourVietnamDay
  cityDays: YourVietnamDay[]
  prevDay?: YourVietnamDay
  highlightId: string | null
  onRemoveSight: (item: ItineraryItem, period: PeriodId) => void
  onUndoSight?: (sourceId: string) => void
  pendingRemovedIds?: string[]
  ghostItems?: ItineraryItem[]
  fillPool?: ItineraryItem[]
  stackOverride?: Partial<Record<PeriodId, ItineraryItem[]>>
}) {
  const useTripStore = useItineraryTripStore()
  const itinerarySlotOverrides = useTripStore((s) => s.itinerarySlotOverrides)
  const itineraryDayOverrides = useTripStore((s) => s.itineraryDayOverrides)
  const itineraryDaySlotOverrides = useTripStore((s) => s.itineraryDaySlotOverrides)
  const itinerarySightOrder = useTripStore((s) => s.itinerarySightOrder)
  const cityTransferSlot = useTripStore((s) => s.cityTransferSlot)
  const vietnamArrivalSlot = useTripStore((s) => s.vietnamArrivalSlot)
  const startDate = useTripStore((s) => s.basics.startDate)
  const userStartTime = useTripStore((s) => s.userStartTime)
  const userLastSightEndTime = useTripStore((s) => s.userLastSightEndTime)
  const basics = useTripStore((s) => s.basics)
  const itineraryUserPinnedIds = useTripStore((s) => s.itineraryUserPinnedIds)
  const userPinnedSet = useMemo(
    () => new Set(itineraryUserPinnedIds),
    [itineraryUserPinnedIds],
  )
  const profile = useMemo(() => {
    const dailyUsd = effectiveDailyUsd({
      budgetAllocationKnown: basics.budgetAllocationKnown,
      budgetDailyUsd: basics.budgetDailyUsd,
      budgetKnown: basics.budgetKnown,
      budgetTarget: basics.budgetTarget,
      budgetMode: basics.budgetMode,
      days: basics.days,
      groupSize: basics.groupSize,
    })
    return planningProfile({
      pace: basics.travelStyle,
      userStartTime,
      band: dailySpendBand(dailyUsd),
      groupSize: basics.groupSize,
      dayEnd: parseDayEndHour(userLastSightEndTime) ?? undefined,
    })
  }, [basics, userStartTime, userLastSightEndTime])

  const bagSights = useMemo(
    () => cityDays.flatMap((d) => d.periods.flatMap((p) => p.items.filter(isSight))),
    [cityDays],
  )
  const osrmTick = usePrefetchDurationMatrix(bagSights.map(coordForItem))
  const isoDate = tripIsoDate(startDate, day.day)
  const hoursBySourceId = useLiveOpeningHours(bagSights, isoDate)

  const transferSlot: TransferSlot | null =
    day.cityTransferOut && day.placeId ? (cityTransferSlot[day.placeId] ?? 'evening') : null
  const prevTransferSlot: TransferSlot | null =
    prevDay?.cityTransferOut && prevDay.placeId
      ? (cityTransferSlot[prevDay.placeId] ?? 'evening')
      : null

  const laid = useMemo(
    () =>
      layoutCompactDay({
        day,
        cityDays,
        slotOverrides: itinerarySlotOverrides,
        dayOverrides: itineraryDayOverrides,
        daySlotOverrides: itineraryDaySlotOverrides,
        sightOrder: itinerarySightOrder,
        transferSlot,
        prevTransferSlot: prevDay?.cityTransferOut ? prevTransferSlot : null,
        arrivalSlot: vietnamArrivalSlot,
        hoursBySourceId,
        isoDate,
        startDate,
        userPinnedIds: userPinnedSet,
        profile,
        fillPool,
      }),
    [
      cityDays,
      day,
      profile,
      hoursBySourceId,
      isoDate,
      startDate,
      itineraryDayOverrides,
      itineraryDaySlotOverrides,
      itinerarySightOrder,
      itinerarySlotOverrides,
      prevDay?.cityTransferOut,
      prevTransferSlot,
      transferSlot,
      userPinnedSet,
      vietnamArrivalSlot,
      fillPool,
      osrmTick,
    ],
  )

  const hop = day.cityTransferOut
  const byPeriod = new Map(laid.periods.map((p) => [p.id, p]))
  const occupancy = occupancyFromLaidPeriods(laid.periods, laid.remaining)
  const pendingIds = useMemo(() => new Set(pendingRemovedIds), [pendingRemovedIds])

  return (
    <section className="mt-5 rounded-[16px] border border-ink/8 bg-paper px-4 py-4">
      {day.cityNote ? (
        <p className="mb-2 text-[0.78rem] leading-snug text-muted">{day.cityNote}</p>
      ) : null}
      {hop ? (
        <p className="mb-2 text-[0.78rem] text-muted">
          Travel {day.city} → {hop.toCity} · {hop.modeLabel}
        </p>
      ) : !day.cityNote && day.day === 1 ? (
        <p className="mb-2 text-[0.78rem] text-muted">Arrival day · sights fit around landing</p>
      ) : null}
      <div className="pt-1">
        {(() => {
          const seen = new Set<string>()
          const stacked: { item: ItineraryItem; period: PeriodId }[] = []
          for (const period of PERIODS) {
            const base = stackOverride?.[period] ?? byPeriod.get(period)?.items ?? []
            const extra = ghostItems.filter(
              (g) =>
                g.period === period &&
                g.sourceId &&
                !base.some((it) => it.sourceId === g.sourceId),
            )
            for (const item of [...base, ...extra]) {
              const key = item.sourceId ?? item.id
              if (seen.has(key)) continue
              seen.add(key)
              stacked.push({ item, period: item.period ?? period })
            }
          }
          stacked.sort((a, b) => {
            const aClock = laid.clockById[a.item.id] ?? ''
            const bClock = laid.clockById[b.item.id] ?? ''
            const aStart = Number((/^(\d{1,2}):(\d{2})/.exec(aClock) ?? [])[1] ?? 99)
            const aMin = Number((/^(\d{1,2}):(\d{2})/.exec(aClock) ?? [])[2] ?? 0)
            const bStart = Number((/^(\d{1,2}):(\d{2})/.exec(bClock) ?? [])[1] ?? 99)
            const bMin = Number((/^(\d{1,2}):(\d{2})/.exec(bClock) ?? [])[2] ?? 0)
            return aStart + aMin / 60 - (bStart + bMin / 60)
          })
          return (
            <PeriodRow
              period="morning"
              items={stacked.map((row) => row.item)}
              highlightId={highlightId}
              day={day}
              occupancy={occupancy}
              clockById={laid.clockById}
              timeWarnings={laid.timeWarnings}
              pendingIds={pendingIds}
              onRemove={onRemoveSight}
              onUndo={(id) => onUndoSight?.(id)}
              hideLabel
            />
          )
        })()}
      </div>
    </section>
  )
}

export function SightChipPreview({ item, range }: { item: ItineraryItem; range?: string }) {
  return (
    <div className="inline-flex w-fit max-w-[18rem] rounded-full bg-ink px-2.5 py-1 text-[0.75rem] font-semibold text-paper shadow-hero">
      {range ? <span className="text-paper/65">{range} </span> : null}
      {item.name}
    </div>
  )
}
