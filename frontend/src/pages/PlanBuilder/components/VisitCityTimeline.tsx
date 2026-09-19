import { useEffect, useMemo, useRef, useState, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useItineraryTripStore } from '../../../store/itineraryTripStore'
import type { ItineraryBreak, ItineraryItem, PeriodId, YourVietnamDay } from '../lib/yourVietnam/types'
import { itineraryItemHref, openDetailHref } from '../lib/yourVietnam/links'
import { bucketFromStart, formatClock } from '../lib/yourVietnam/clockTimes'
import {
  catalogHoursForItem,
  displayTodayHours,
  mergeHours,
  weekdayFromIso,
  type PlaceHours,
} from '../lib/yourVietnam/openingHours'
import { EXPERIENCES } from '../data/experiences'
import { getActivityById, getActivityImages } from '../data/activities'
import { getExperienceImages } from '../lib/pricing'
import { isSight } from '../lib/yourVietnam/layoutDay'
import { insertSourceIdBetween } from '../lib/yourVietnam/sightOrder'
import { buildCompactTimeline } from '../lib/yourVietnam/dayTimeline'
import {
  applyHopTransportRule,
  applyTransportMode,
  TRANSIT_MODES,
  useOsrmLegs,
  type TransportModeId,
  type OsrmLeg,
} from '../lib/yourVietnam/osrmRoute'
import { useAnchoredMenuStyle } from '../lib/yourVietnam/placeFixedMenu'
import {
  openCitySightsForItinerary,
  openExperiencesForItinerary,
} from '../lib/yourVietnam/itineraryAddTarget'
import { experienceCityForPlace } from '../lib/yourVietnam/cityPins'
import type { PlaceId } from '../../GettingAround/data/types'
import { DAY_CLOSE, parseDayEndHour, parseDayStart } from '../lib/yourVietnam/dayWindows'
import {
  addGapFillToDay,
  gapFillCandidatesForCity,
  hasEnoughFreeTime,
  idleMinutesAfterTransit,
  pickNearbyGapFills,
  type GapFillSuggestion,
} from '../lib/yourVietnam/gapFillSuggestions'
import { clampHhmmToBounds, sightStartBounds } from '../lib/yourVietnam/sightStartBounds'
import { SightReorderSheet } from './SightReorderSheet'
import { openItineraryTemplatesTab } from '../../../store/itineraryPlans'

const ACTION_CHIP =
  'inline-flex cursor-pointer items-center gap-1 rounded-full border border-ink/15 bg-paper px-2.5 py-1.5 text-[0.72rem] font-bold text-ink shadow-sm transition hover:border-terracotta/55 hover:bg-terracotta/10 hover:text-terracotta'

function formatUnplacedNames(names: string[]) {
  const clean = names.map((n) => n.replace(/^(Lunch|Dinner|Check-in) · /, '')).filter(Boolean)
  if (clean.length === 0) return 'these sights'
  if (clean.length === 1) return clean[0]
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`
  return `${clean.slice(0, -1).join(', ')}, and ${clean[clean.length - 1]}`
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 8.2v4.2l2.6 1.6" />
    </svg>
  )
}

function StartTimingControl({
  startHour,
  minHour,
  maxHour,
  onStartChange,
}: {
  startHour: number
  minHour?: number
  maxHour?: number
  onStartChange: (hhmm: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const value = formatClock(startHour)
  const min = minHour != null ? formatClock(minHour) : undefined
  const max = maxHour != null ? formatClock(maxHour) : undefined

  function openPicker() {
    const el = inputRef.current
    if (!el) return
    el.focus()
    const picker = el as HTMLInputElement & { showPicker?: () => void }
    try {
      picker.showPicker?.()
    } catch {
      /* browser may ignore if not from a direct gesture */
    }
  }

  return (
    <label
      className={`${ACTION_CHIP} relative pr-3`}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <ClockIcon />
      <span>Start</span>
      <span className="rounded-md bg-cream px-1.5 py-0.5 font-serif text-[0.82rem] font-semibold tabular-nums text-ink underline decoration-terracotta/70 underline-offset-2">
        {value}
      </span>
      <input
        ref={inputRef}
        type="time"
        value={value}
        min={min}
        max={max}
        step={300}
        onChange={(e) => e.target.value && onStartChange(e.target.value)}
        onClick={openPicker}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Change start time"
      />
    </label>
  )
}

const BREAKFAST_PRESET = { label: 'Breakfast', durationMinutes: 45 } as const

const BREAK_PRESETS = [
  { label: 'Eat', durationMinutes: 45 },
  { label: 'Coffee', durationMinutes: 20 },
  { label: 'Rest', durationMinutes: 30 },
] as const

function DurationControl({
  minutes,
  onDurationChange,
}: {
  minutes: number
  onDurationChange: (minutes: number) => void
}) {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (minutes <= 119) {
    return (
      <label className={`${ACTION_CHIP} text-muted hover:text-terracotta`}>
        Duration
        <input
          type="number"
          min={15}
          max={480}
          step={15}
          value={minutes}
          onChange={(e) => onDurationChange(Number(e.target.value) || 15)}
          className="w-12 bg-transparent text-[0.72rem] font-bold text-ink outline-none"
        />
        min
      </label>
    )
  }
  return (
    <label className={`${ACTION_CHIP} text-muted hover:text-terracotta`}>
      Duration
      <input
        type="number"
        min={2}
        max={8}
        value={hours}
        onChange={(e) => {
          const nextHours = Math.max(2, Math.min(8, Number(e.target.value) || 2))
          onDurationChange(nextHours * 60 + remainder)
        }}
        className="w-10 bg-transparent text-[0.72rem] font-bold text-ink outline-none"
      />
      h
      <input
        type="number"
        min={0}
        max={59}
        step={15}
        value={remainder}
        onChange={(e) => {
          const nextMins = Math.max(0, Math.min(59, Number(e.target.value) || 0))
          onDurationChange(hours * 60 + nextMins)
        }}
        className="w-10 bg-transparent text-[0.72rem] font-bold text-ink outline-none"
      />
      min
    </label>
  )
}

function costLabelFor(item: ItineraryItem): string {
  if (item.kind === 'experience' && item.sourceId) {
    const exp = EXPERIENCES.find((e) => e.id === item.sourceId)
    if (exp?.costLabel) return exp.costLabel
  }
  if (!item.costUsd) return 'Free'
  return `From $${Math.round(item.costUsd)}`
}

function sightThumbSrc(item: ItineraryItem): string | undefined {
  if (item.thumb) return item.thumb
  if (item.kind === 'experience' && item.sourceId) {
    const exp = EXPERIENCES.find((e) => e.id === item.sourceId)
    if (exp) return getExperienceImages(exp)[0]
  }
  if (item.kind === 'activity' && item.sourceId) {
    const act = getActivityById(item.sourceId)
    if (act) return getActivityImages(act)[0]
  }
  return undefined
}

function newBreakId() {
  return `brk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function ModeIcon({ mode }: { mode: TransportModeId }) {
  const common = 'h-3.5 w-3.5 shrink-0'
  if (mode === 'walking') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="4.2" r="1.6" />
        <path d="M10.2 8.2 8 21M13.8 8.2 16.4 21M10.2 8.2h3.6L12 13.2 10.2 8.2Z" />
      </svg>
    )
  }
  if (mode === 'grab-bike' || mode === 'bicycle') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="6.5" cy="17" r="2.4" />
        <circle cx="17.5" cy="17" r="2.4" />
        <path d="M8.7 17h5.2l2.2-6.2H11L8.7 17ZM13.9 10.8 12.2 7H9.6" />
      </svg>
    )
  }
  if (mode === 'bus') {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="5" y="4" width="14" height="13" rx="2" />
        <path d="M5 11h14M8 17v2M16 17v2" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 14.5h16l-1.2-5.2A2 2 0 0 0 16.9 8H7.1a2 2 0 0 0-1.9 1.3L4 14.5Z" />
      <path d="M5 14.5v3.2h2.4V14.5M16.6 14.5v3.2H19V14.5" />
      <circle cx="8.2" cy="18.4" r="1.2" />
      <circle cx="15.8" cy="18.4" r="1.2" />
    </svg>
  )
}

function TransitRow({
  pairKey,
  leg,
  onAddBreak,
}: {
  pairKey: string
  leg: OsrmLeg | undefined
  onAddBreak: (preset: { label: string; durationMinutes: number }) => void
}) {
  const useTripStore = useItineraryTripStore()
  const setTransitMode = useTripStore((s) => s.setItineraryTransitMode)
  const [breakOpen, setBreakOpen] = useState(false)
  const [modeOpen, setModeOpen] = useState(false)
  const modeBtnRef = useRef<HTMLButtonElement>(null)
  const modeMenuRef = useRef<HTMLDivElement>(null)
  const modeStyle = useAnchoredMenuStyle(modeOpen, modeBtnRef, modeMenuRef, 'below')
  const km = leg?.km ?? 0
  const mins = leg?.mins ?? 8
  const label = leg?.label ?? 'Walk'
  const mode = leg?.mode ?? 'walking'

  useEffect(() => {
    if (!modeOpen) return
    function onDoc(e: MouseEvent) {
      const t = e.target as Node
      if (modeBtnRef.current?.contains(t) || modeMenuRef.current?.contains(t)) return
      setModeOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [modeOpen])

  return (
    <div className="relative grid grid-cols-[3.4rem_minmax(0,1fr)] items-center gap-2 py-0.5">
      <div className="flex justify-end pr-1">
        <span className="h-8 w-px bg-ink/12" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <button
          ref={modeBtnRef}
          type="button"
          onClick={() => setModeOpen((v) => !v)}
          className={`${ACTION_CHIP} text-[0.7rem]`}
          aria-haspopup="listbox"
          aria-expanded={modeOpen}
          aria-label={`Change transport. Currently ${label}, ${mins} minutes`}
        >
          <ModeIcon mode={mode} />
          <span>
            {km.toFixed(1)} km · {mins} min · {label}
          </span>
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 shrink-0 opacity-60" aria-hidden>
            <path d="M2 4.2 6 8l4-3.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
        {modeOpen
          ? createPortal(
              <div
                ref={modeMenuRef}
                style={modeStyle}
                role="listbox"
                className="fixed z-[80] min-w-[12.5rem] overflow-y-auto rounded-[16px] border border-ink/10 bg-paper py-1.5 shadow-hero"
              >
                <p className="px-3 pb-1 pt-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-sage">
                  How you get there
                </p>
                {TRANSIT_MODES.map((row) => {
                  const preview = applyTransportMode(
                    { km, mins, mode, label },
                    row.mode,
                  )
                  return (
                    <button
                      key={row.mode}
                      type="button"
                      role="option"
                      aria-selected={row.mode === mode}
                      onClick={() => {
                        setTransitMode(pairKey, row.mode)
                        setModeOpen(false)
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-cream ${
                        row.mode === mode ? 'bg-cream/80' : ''
                      }`}
                    >
                      <ModeIcon mode={row.mode} />
                      <span className="font-serif text-[0.88rem] font-semibold text-ink">
                        {row.label}
                      </span>
                      <span className="ml-auto text-[0.7rem] text-muted">{preview.mins} min</span>
                    </button>
                  )
                })}
              </div>,
              document.body,
            )
          : null}
        <button
          type="button"
          onClick={() => setBreakOpen((v) => !v)}
          className={ACTION_CHIP}
        >
          Add a Break
        </button>
        {breakOpen ? (
          <div className="flex flex-wrap gap-1">
            {BREAK_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  onAddBreak(preset)
                  setBreakOpen(false)
                }}
                className="rounded-full bg-paper px-2 py-0.5 text-[0.68rem] font-semibold text-ink ring-1 ring-ink/10 hover:ring-terracotta"
              >
                {preset.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function GapFillRow({
  idleMinutes,
  nextName,
  suggestions,
  onAdd,
  onDismiss,
  canAdd = true,
}: {
  idleMinutes: number
  nextName: string
  suggestions: GapFillSuggestion[]
  onAdd: (row: GapFillSuggestion) => void
  onDismiss: () => void
  canAdd?: boolean
}) {
  const hours = Math.round((idleMinutes / 60) * 10) / 10
  const windowLabel =
    hours >= 2
      ? `${hours} hours before ${nextName}`
      : `${idleMinutes} min before ${nextName}`
  return (
    <div className="relative grid grid-cols-[3.4rem_minmax(0,1fr)] items-start gap-2 py-1">
      <div className="flex justify-end pr-1 pt-2">
        <span className="h-10 w-px bg-terracotta/25" aria-hidden />
      </div>
      <div className="rounded-[14px] border border-dashed border-terracotta/35 bg-terracotta/8 px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-serif text-[0.92rem] font-semibold leading-snug text-ink">
              {suggestions.length
                ? 'Looks like you have free time — want to check these places?'
                : 'A few empty hours on purpose'}
            </p>
            <p className="mt-0.5 text-[0.72rem] font-medium text-muted">
              {windowLabel}.{' '}
              {suggestions.length
                ? 'Nearby and open in this window.'
                : 'Café, lunch, or a short walk nearby — the next sight is timed for opening hours.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink/40 hover:bg-ink hover:text-paper"
            aria-label="Hide suggestions"
          >
            ×
          </button>
        </div>
        {suggestions.length ? (
          <ul className="mt-2 space-y-1.5">
            {suggestions.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-2 rounded-[12px] bg-paper/90 px-2.5 py-1.5 ring-1 ring-ink/8"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-[0.88rem] font-semibold text-ink">{row.name}</p>
                  <p className="text-[0.68rem] font-medium text-muted">
                    {row.kind === 'shopping' ? 'Shopping' : 'Sight'} · {row.kmFrom.toFixed(1)} km · ~
                    {row.durationMinutes} min
                  </p>
                </div>
                {canAdd ? (
                  <button
                    type="button"
                    onClick={() => onAdd(row)}
                    className="rounded-full bg-terracotta px-2.5 py-1 text-[0.7rem] font-bold text-paper hover:bg-ink"
                  >
                    Add
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

function BreakCard({
  range,
  startHour,
  row,
  onChange,
  onRemove,
}: {
  range: string
  startHour: number
  row: ItineraryBreak
  onChange: (patch: Partial<ItineraryBreak>) => void
  onRemove: () => void
}) {
  return (
    <div className="grid grid-cols-[3.4rem_minmax(0,1fr)] items-start gap-2 py-1">
      <p className="pt-2 text-right font-serif text-[0.92rem] font-semibold tabular-nums text-sage">
        {formatClock(startHour)}
      </p>
      <div className="rounded-[14px] border border-dashed border-sage/40 bg-sage/10 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-sage">Break</span>
          <input
            type="text"
            value={row.label}
            onChange={(e) => onChange({ label: e.target.value })}
            className="min-w-[7rem] flex-1 rounded-full bg-paper px-2.5 py-1 text-[0.8rem] font-semibold text-ink outline-none ring-1 ring-ink/10 focus:ring-sage"
          />
          <label className="flex items-center gap-1 text-[0.72rem] font-semibold text-muted">
            <input
              type="number"
              min={10}
              max={180}
              step={5}
              value={row.durationMinutes}
              onChange={(e) =>
                onChange({ durationMinutes: Math.max(10, Math.min(180, Number(e.target.value) || 20)) })
              }
              className="w-14 rounded-full bg-paper px-2 py-1 text-[0.78rem] font-semibold text-ink outline-none ring-1 ring-ink/10"
            />
            min
          </label>
          <span className="text-[0.72rem] text-muted">{range}</span>
          <button
            type="button"
            aria-label="Remove break"
            onClick={onRemove}
            className="ml-auto grid h-6 w-6 place-items-center rounded-full text-ink/45 hover:bg-ink hover:text-paper"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

function SightCard({
  item,
  period,
  startHour,
  durationHours,
  hoursLabel,
  closedToday = false,
  closedAtTime = false,
  untimed = false,
  costLabel,
  note,
  highlighted,
  dayNumber,
  slotId,
  cityDays,
  deletedSlotIds = [],
  pendingRemove,
  pendingMovedToDay = null,
  hideUndo = false,
  onHighlight,
  onRemove,
  onUndo,
  onStartChange,
  onDurationChange,
  onNoteChange,
  onMoveDay,
  onMoveToNewDay,
  onMoveSight,
  dragLocked = false,
  canReorder = true,
  readOnly = false,
  minStartHour,
  maxStartHour,
}: {
  item: ItineraryItem
  period: PeriodId
  startHour: number
  durationHours: number
  hoursLabel: string
  closedToday?: boolean
  closedAtTime?: boolean
  untimed?: boolean
  costLabel: string
  note: string
  highlighted: boolean
  dayNumber: number
  slotId: string
  cityDays: YourVietnamDay[]
  deletedSlotIds?: string[]
  pendingRemove: boolean
  pendingMovedToDay?: number | null
  hideUndo?: boolean
  onHighlight: () => void
  onRemove: () => void
  onUndo: () => void
  onStartChange: (hhmm: string) => void
  onDurationChange: (minutes: number) => void
  onNoteChange: (note: string) => void
  onMoveDay: (day: number, slotId: string) => void
  onMoveToNewDay: () => void
  onMoveSight: () => void
  dragLocked?: boolean
  canReorder?: boolean
  readOnly?: boolean
  minStartHour?: number
  maxStartHour?: number
}) {
  const parked = pendingRemove || pendingMovedToDay != null
  const showUndo = parked && !hideUndo
  const [notesOpen, setNotesOpen] = useState(Boolean(note))
  const [dayMenuOpen, setDayMenuOpen] = useState(false)
  const dayMenuRef = useRef<HTMLDivElement>(null)
  const thumb = sightThumbSrc(item)
  const otherDays = cityDays.filter((d) => d.slotId !== slotId && !deletedSlotIds.includes(d.slotId))

  useEffect(() => {
    if (!dayMenuOpen) return
    function onDoc(e: MouseEvent) {
      if (!dayMenuRef.current?.contains(e.target as Node)) setDayMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [dayMenuOpen])
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
    disabled: !item.sourceId || parked || dragLocked,
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
  const minutes = Math.max(15, Math.round(durationHours * 60))

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={`grid grid-cols-[3.4rem_minmax(0,1fr)] items-start gap-2 py-1 ${
        sortable.isDragging ? 'z-20 opacity-40' : ''
      }`}
    >
      <button
        type="button"
        {...sortable.attributes}
        {...sortable.listeners}
        className="cursor-grab pt-2 text-right font-serif text-[0.95rem] font-semibold tabular-nums text-ink active:cursor-grabbing"
        aria-label={`Drag ${item.name}`}
      >
        {untimed ? '—' : formatClock(startHour)}
      </button>
      <article
        className={`rounded-[16px] border px-3 py-2.5 shadow-soft ${
          parked
            ? 'border-ink/8 bg-cream/60'
            : highlighted
              ? 'border-terracotta/40 bg-terracotta/8'
              : 'border-ink/8 bg-paper'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 text-left">
            <div className="flex flex-wrap items-center gap-1.5">
              {href && !parked ? (
                <button
                  type="button"
                  onClick={() => {
                    onHighlight()
                    openDetailHref(href)
                  }}
                  className="font-serif text-[1.02rem] font-semibold leading-snug text-ink hover:underline"
                >
                  {item.name}
                </button>
              ) : (
                <p className="font-serif text-[1.02rem] font-semibold leading-snug text-ink">
                  {item.name}
                </p>
              )}
              {closedToday && !parked ? (
                <span className="text-[0.72rem] font-semibold leading-snug text-terracotta">
                  Closed this day — not on the timed plan.
                </span>
              ) : closedAtTime && !parked ? (
                <span className="text-[0.72rem] font-semibold leading-snug text-terracotta">
                  Sight is closed at this time.
                </span>
              ) : null}
            </div>
            {parked ? (
              <p className="mt-1 text-[0.78rem] font-bold text-terracotta">
                {pendingRemove ? 'Removed' : `Moved to Day ${pendingMovedToDay}`}
              </p>
            ) : (
              <>
                <p className="mt-0.5 text-[0.72rem] font-medium text-muted">Cost: {costLabel}</p>
                <p className="text-[0.72rem] font-medium text-muted">Opening Times: {hoursLabel}</p>
              </>
            )}
          </div>
          {thumb ? (
            <img
              src={thumb}
              alt=""
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
              className="h-[4.6rem] w-[4.6rem] shrink-0 rounded-[12px] object-cover ring-1 ring-ink/10"
            />
          ) : null}
        </div>
        {showUndo ? (
          <div className="mt-2.5">
            <button
              type="button"
              onClick={onUndo}
              className="rounded-full bg-ink px-3 py-1.5 text-[0.72rem] font-bold text-paper hover:bg-terracotta"
            >
              Undo
            </button>
          </div>
        ) : parked || readOnly ? null : (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {untimed ? null : (
              <StartTimingControl
                startHour={startHour}
                minHour={minStartHour}
                maxHour={maxStartHour}
                onStartChange={onStartChange}
              />
            )}
            <DurationControl minutes={minutes} onDurationChange={onDurationChange} />
            <div className="relative" ref={dayMenuRef}>
              <button
                type="button"
                onClick={() => setDayMenuOpen((v) => !v)}
                className={ACTION_CHIP}
              >
                Move to another day
              </button>
              {dayMenuOpen ? (
                <div className="absolute left-0 z-30 mt-1.5 min-w-[11.5rem] overflow-hidden rounded-[14px] border border-ink/10 bg-paper py-1.5 shadow-hero">
                  {otherDays.length === 0 ? (
                    <p className="px-3 py-1 text-[0.68rem] font-medium text-muted">
                      No other day in this city yet
                    </p>
                  ) : (
                    otherDays.map((d) => (
                      <button
                        key={d.slotId}
                        type="button"
                        onClick={() => {
                          setDayMenuOpen(false)
                          onMoveDay(d.day, d.slotId)
                        }}
                        className="flex w-full px-3 py-1.5 text-left text-[0.78rem] font-semibold text-ink hover:bg-cream"
                      >
                        Day {d.day}
                      </button>
                    ))
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setDayMenuOpen(false)
                      onMoveToNewDay()
                    }}
                    className="mt-0.5 flex w-full border-t border-ink/8 px-3 py-1.5 text-left text-[0.78rem] font-bold text-terracotta hover:bg-terracotta/8"
                  >
                    Add to a new day
                  </button>
                </div>
              ) : null}
            </div>
            {canReorder ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onMoveSight()
              }}
              className={ACTION_CHIP}
            >
              Change Order
            </button>
            ) : null}
            <button
              type="button"
              onClick={onRemove}
              className={ACTION_CHIP}
            >
              Remove sight
            </button>
            <button
              type="button"
              onClick={() => setNotesOpen((v) => !v)}
              className={ACTION_CHIP}
            >
              Notes
            </button>
          </div>
        )}
        {notesOpen && !parked ? (
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Private note for this stop"
            rows={2}
            className="mt-2 w-full resize-none rounded-[10px] bg-cream px-2.5 py-2 text-[0.78rem] text-ink outline-none ring-1 ring-ink/8 focus:ring-terracotta/40"
          />
        ) : note && !notesOpen && !parked ? (
          <p className="mt-1.5 text-[0.72rem] leading-snug text-muted">{note}</p>
        ) : null}
      </article>
    </div>
  )
}

export function VisitCityCardPreview({ item, range }: { item: ItineraryItem; range?: string }) {
  return (
    <div className="w-[18rem] rounded-[16px] bg-ink px-3 py-2 text-paper shadow-hero">
      {range ? <p className="text-[0.7rem] text-paper/65">{range}</p> : null}
      <p className="font-serif text-[0.95rem] font-semibold">{item.name}</p>
    </div>
  )
}

export function VisitCityTimeline({
  day,
  cityDays,
  sights,
  closedSights = [],
  tourOrder = [],
  hoursBySourceId,
  isoDate,
  highlightId,
  onHighlight,
  onRemoveSight,
  onUndoSight,
  pendingRemovedIds = [],
  pendingMovedToDay = {},
  ghostItems = [],
  onReorder,
  onMoveToDay,
  onMoveToNewDay,
  onMoveUnplacedToNewDay,
  dayDeleted = false,
  onUndoDeletedDay,
  deletedSlotIds = [],
  displayDayNumber,
  seeVietnamItineraries = false,
  readOnly = false,
}: {
  day: YourVietnamDay
  cityDays: YourVietnamDay[]
  sights: ItineraryItem[]
  closedSights?: ItineraryItem[]
  tourOrder?: string[]
  hoursBySourceId: Record<string, PlaceHours>
  isoDate: string
  highlightId: string | null
  onHighlight: (id: string) => void
  onRemoveSight: (item: ItineraryItem, period: PeriodId) => void
  onUndoSight?: (sourceId: string) => void
  pendingRemovedIds?: string[]
  pendingMovedToDay?: Record<string, number>
  ghostItems?: ItineraryItem[]
  onReorder: (orderedIds: string[]) => void
  onMoveToDay: (sourceId: string, toDay: YourVietnamDay, item: ItineraryItem) => void
  onMoveToNewDay: (sourceId: string, item: ItineraryItem) => void
  onMoveUnplacedToNewDay?: (items: ItineraryItem[]) => void
  dayDeleted?: boolean
  onUndoDeletedDay?: () => void
  deletedSlotIds?: string[]
  displayDayNumber?: number
  seeVietnamItineraries?: boolean
  readOnly?: boolean
}) {
  const useTripStore = useItineraryTripStore()
  const userStartTime = useTripStore((s) => s.userStartTime)
  const userLastSightEndTime = useTripStore((s) => s.userLastSightEndTime)
  const durationOverrides = useTripStore((s) => s.itineraryDurationOverrides)
  const startOverrides = useTripStore((s) => s.itineraryStartOverrides)
  const notes = useTripStore((s) => s.itineraryNotes)
  const breaksBySlot = useTripStore((s) => s.itineraryBreaks)
  const setDuration = useTripStore((s) => s.setItineraryDurationOverride)
  const setStart = useTripStore((s) => s.setItineraryStartOverride)
  const setNote = useTripStore((s) => s.setItineraryNote)
  const addBreak = useTripStore((s) => s.addItineraryBreak)
  const updateBreak = useTripStore((s) => s.updateItineraryBreak)
  const removeBreak = useTripStore((s) => s.removeItineraryBreak)
  const transitModes = useTripStore((s) => s.itineraryTransitModes)
  const hopTransportRule = useTripStore((s) => s.hopTransportRule)
  const selectedExperienceIds = useTripStore((s) => s.selectedExperienceIds)
  const selectedShoppingIds = useTripStore((s) => s.selectedShoppingIds)
  const [reorderSourceId, setReorderSourceId] = useState<string | null>(null)
  const [hiddenGaps, setHiddenGaps] = useState<Set<string>>(() => new Set())

  const weekday = weekdayFromIso(isoDate)
  const pendingIds = useMemo(() => new Set(pendingRemovedIds), [pendingRemovedIds])
  const liveSights = sights.filter(
    (it) => it.sourceId && isSight(it) && it.selectionState !== 'recommended',
  )
  const extra = ghostItems.filter(
    (g) => g.sourceId && !liveSights.some((it) => it.sourceId === g.sourceId),
  )
  const displaySights = useMemo(() => {
    const out: ItineraryItem[] = []
    const seen = new Set<string>()
    for (const it of [...liveSights, ...extra]) {
      if (!it.sourceId || seen.has(it.sourceId)) continue
      out.push(it)
      seen.add(it.sourceId)
    }
    return out
  }, [extra, liveSights])
  const clockSights = useMemo(
    () => displaySights.filter((it) => !it.sourceId || !pendingIds.has(it.sourceId)),
    [displaySights, pendingIds],
  )
  const parkedSights = useMemo(
    () => displaySights.filter((it) => it.sourceId && pendingIds.has(it.sourceId)),
    [displaySights, pendingIds],
  )
  const dayBreaks = breaksBySlot[day.slotId] ?? []

  const hoursOf = (item: ItineraryItem) =>
    mergeHours(
      item.sourceId ? hoursBySourceId[item.sourceId] : undefined,
      catalogHoursForItem(item, weekday, isoDate),
    )

  const pairSeed = useMemo(
    () =>
      buildCompactTimeline({
        sights: clockSights,
        breaks: dayBreaks,
        dayStart: userStartTime,
        lastSightEndBy: userLastSightEndTime,
        durationOverrides,
        startOverrides,
        legs: {},
        hoursOf,
        isoDate,
      }).pairs,
    [dayBreaks, clockSights, durationOverrides, hoursBySourceId, isoDate, startOverrides, userStartTime, userLastSightEndTime, weekday],
  )
  const routedLegs = useOsrmLegs(pairSeed)
  const legs = useMemo(() => {
    const next: Record<string, OsrmLeg> = {}
    for (const [key, leg] of Object.entries(routedLegs)) {
      next[key] = applyHopTransportRule(leg, hopTransportRule, transitModes[key])
    }
    return next
  }, [hopTransportRule, routedLegs, transitModes])
  const { blocks, lastSightOverrun, unplaced } = useMemo(
    () =>
      buildCompactTimeline({
        sights: clockSights,
        breaks: dayBreaks,
        dayStart: userStartTime,
        lastSightEndBy: userLastSightEndTime,
        durationOverrides,
        startOverrides,
        legs,
        hoursOf,
        isoDate,
      }),
    [dayBreaks, clockSights, durationOverrides, hoursBySourceId, isoDate, startOverrides, legs, userStartTime, userLastSightEndTime, weekday],
  )

  const orderedIds = clockSights
    .map((it) => it.sourceId)
    .filter((id): id is string => Boolean(id))
  const sortableIds = orderedIds.map((id) => `sight:${id}`)
  const droppable = useDroppable({
    id: `period:${day.slotId}:morning`,
    data: { type: 'period', period: 'morning' as PeriodId, slotId: day.slotId },
  })

  const city = day.placeId
    ? experienceCityForPlace(day.placeId as PlaceId, day.city)
    : day.city
  const hop = day.cityTransferOut
  const baggedIds = useMemo(() => {
    const ids = new Set<string>([...selectedExperienceIds, ...selectedShoppingIds])
    for (const it of displaySights) {
      if (it.sourceId) ids.add(it.sourceId)
    }
    return ids
  }, [displaySights, selectedExperienceIds, selectedShoppingIds])
  const hasIdleGap = useMemo(() => {
    for (let i = 0; i < blocks.length; i++) {
      const row = blocks[i]
      if (row.type !== 'transit') continue
      const next = blocks.find(
        (b, j) => j > i && b.type === 'sight' && b.item.sourceId === row.toSourceId,
      )
      if (next?.type === 'sight' && hasEnoughFreeTime(row.endHour, next.startHour)) return true
    }
    return false
  }, [blocks])
  const fillCandidates = useMemo(() => {
    if (!hasIdleGap) return []
    try {
      return gapFillCandidatesForCity(city, weekday, isoDate, baggedIds)
    } catch {
      return []
    }
  }, [baggedIds, city, hasIdleGap, isoDate, weekday])

  function hoursLabelFor(item: ItineraryItem): string {
    return displayTodayHours(hoursOf(item))
  }

  function startBoundsFor(item: ItineraryItem, startHour: number, durationHours: number) {
    const sourceId = item.sourceId
    const dayStartHour = parseDayStart(userStartTime)
    const dayEndHour = parseDayEndHour(userLastSightEndTime) ?? DAY_CLOSE
    const lastSight = [...blocks].reverse().find((b) => b.type === 'sight')
    const lastEnd = lastSight && lastSight.type === 'sight' ? lastSight.endHour : startHour + durationHours
    let arriveHour = dayStartHour
    if (sourceId) {
      const idx = blocks.findIndex((b) => b.type === 'sight' && b.item.sourceId === sourceId)
      for (let i = idx - 1; i >= 0; i--) {
        const prev = blocks[i]
        if (prev.type === 'transit' && prev.toSourceId === sourceId) {
          arriveHour = prev.endHour
          break
        }
        if (prev.type === 'sight' || prev.type === 'break') {
          arriveHour = prev.endHour
          if (prev.type === 'sight') break
        }
      }
    }
    return sightStartBounds({
      currentStartHour: startHour,
      durationHours,
      hours: hoursOf(item),
      arriveHour,
      dayStartHour,
      dayEndHour,
      lastSightEndHour: lastEnd,
    })
  }

  function insertBreak(afterSourceId: string | null, preset: { label: string; durationMinutes: number }) {
    addBreak(day.slotId, {
      id: newBreakId(),
      afterSourceId,
      label: preset.label,
      durationMinutes: preset.durationMinutes,
    })
  }

  const lastEndHour = blocks.reduce((latest, block) => Math.max(latest, block.endHour), 0)
  const dayEndsBeforeSix = lastEndHour < 18
  const dayIsEmpty = clockSights.length === 0 && parkedSights.length === 0 && dayBreaks.length === 0 && !dayDeleted

  function addSightsToThisDay() {
    const target = { day: day.day, slotId: day.slotId }
    if (dayIsEmpty) openExperiencesForItinerary(target)
    else openCitySightsForItinerary(city, target)
  }

  return (
    <section className="mt-5 rounded-[16px] border border-ink/8 bg-paper px-4 py-4">
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <p className="font-serif text-[1.12rem] font-semibold text-ink">
          {dayDeleted ? 'Deleted day' : `Day ${displayDayNumber ?? day.day} plan`}
        </p>
        {dayDeleted ? (
          <button
            type="button"
            onClick={onUndoDeletedDay}
            className="rounded-full bg-ink px-3 py-1.5 text-[0.72rem] font-bold text-paper hover:bg-terracotta"
          >
            Undo
          </button>
        ) : (
          <>
            {readOnly ? null : (
              <button
                type="button"
                onClick={addSightsToThisDay}
                className="rounded-full bg-terracotta px-3 py-1.5 text-[0.72rem] font-bold text-paper shadow-sm hover:bg-ink"
              >
                Add a sight
              </button>
            )}
            {seeVietnamItineraries ? (
              <button
                type="button"
                onClick={openItineraryTemplatesTab}
                className="rounded-full bg-terracotta px-3 py-1.5 text-[0.72rem] font-bold text-paper shadow-sm hover:bg-ink"
              >
                See Itineraries for Vietnam
              </button>
            ) : null}
          </>
        )}
      </div>
      {dayDeleted ? (
        <p className="mb-3 text-[0.78rem] font-semibold text-terracotta">
          This day was deleted. Undo to restore it and its sights.
        </p>
      ) : null}
      {unplaced.length > 0 && !dayDeleted ? (
        <p className="mb-3 text-[0.78rem] font-semibold leading-relaxed text-terracotta">
          You can adjust the duration of your visit to some sights in order to make time for{' '}
          {formatUnplacedNames(unplaced.map((it) => it.name))}
          {readOnly ? (
            ', or add a new day and add these sights there.'
          ) : (
            <>
              , or{' '}
              <button
                type="button"
                onClick={() => onMoveUnplacedToNewDay?.(unplaced)}
                className="font-bold underline decoration-terracotta/40 underline-offset-2 hover:text-ink"
              >
                Add a New Day
              </button>{' '}
              and add these sights there.
            </>
          )}
        </p>
      ) : null}
      {hop ? (
        <p className="mb-3 text-[0.75rem] text-muted">
          Travel {day.city} → {hop.toCity} · {hop.modeLabel}
        </p>
      ) : day.day === 1 ? (
        <p className="mb-3 text-[0.75rem] text-muted">Arrival day · sights pack from your start time</p>
      ) : day.cityNote ? (
        <p className="mb-3 text-[0.75rem] text-muted">{day.cityNote}</p>
      ) : null}

      {readOnly ||
      dayDeleted ||
      dayBreaks.some((row) => row.afterSourceId == null && /breakfast/i.test(row.label)) ? null : (
        <div className="mb-2 flex justify-start pl-[3.4rem]">
          <button
            type="button"
            onClick={() => insertBreak(null, BREAKFAST_PRESET)}
            className="rounded-full bg-cream px-3 py-1.5 text-[0.72rem] font-bold text-ink hover:bg-sage/15 hover:text-sage"
          >
            + Add breakfast
          </button>
        </div>
      )}

      <div
        ref={droppable.setNodeRef}
        className={droppable.isOver ? 'rounded-[12px] bg-sage/10 ring-1 ring-sage/25' : ''}
      >
        {dayIsEmpty ? (
          readOnly ? (
            <p className="rounded-[12px] border border-dashed border-ink/15 px-3 py-6 text-center text-[0.82rem] font-semibold text-muted">
              No sights packed on this day.
            </p>
          ) : (
          <button
            type="button"
            onClick={addSightsToThisDay}
            className="w-full rounded-[12px] border border-dashed border-ink/15 px-3 py-6 text-center text-[0.82rem] font-semibold text-muted hover:border-terracotta hover:text-terracotta"
          >
            No sights packed yet — add one to start the day
          </button>
          )
        ) : (
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            {blocks.map((block, index) => {
              if (block.type === 'transit') {
                const next = blocks.find(
                  (row, j) =>
                    j > index && row.type === 'sight' && row.item.sourceId === block.toSourceId,
                )
                const gapKey = `${block.fromSourceId}->${block.toSourceId}`
                const idle =
                  next?.type === 'sight'
                    ? idleMinutesAfterTransit(block.endHour, next.startHour)
                    : 0
                const showGap =
                  next?.type === 'sight' &&
                  !hiddenGaps.has(gapKey) &&
                  hasEnoughFreeTime(block.endHour, next.startHour)
                const suggestions = showGap
                  ? (() => {
                      try {
                        return pickNearbyGapFills({
                          from: block.from,
                          to: block.to,
                          gapStartHour: block.endHour,
                          gapEndHour: next.startHour,
                          candidates: fillCandidates,
                          weekday,
                          isoDate,
                        })
                      } catch {
                        return []
                      }
                    })()
                  : []
                return (
                  <Fragment key={`t:${block.fromSourceId}:${block.toSourceId}`}>
                    <TransitRow
                      pairKey={block.pairKey}
                      leg={legs[block.pairKey]}
                      onAddBreak={(preset) => insertBreak(block.fromSourceId, preset)}
                    />
                    {showGap ? (
                      <GapFillRow
                        idleMinutes={idle}
                        nextName={next && next.type === 'sight' ? next.item.name : 'the next sight'}
                        suggestions={suggestions}
                        canAdd={!readOnly}
                        onDismiss={() =>
                          setHiddenGaps((prev) => new Set(prev).add(gapKey))
                        }
                        onAdd={(row) => {
                          if (readOnly) return
                          addGapFillToDay({
                            sourceId: row.id,
                            kind: row.kind,
                            fromSourceId: block.fromSourceId,
                            toSourceId: block.toSourceId,
                            slotId: day.slotId,
                            dayNumber: day.day,
                            orderedIds,
                            startHour: block.endHour,
                          })
                          onReorder(
                            insertSourceIdBetween(
                              orderedIds,
                              block.fromSourceId,
                              block.toSourceId,
                              row.id,
                            ),
                          )
                        }}
                      />
                    ) : null}
                  </Fragment>
                )
              }
              if (block.type === 'break') {
                return (
                  <BreakCard
                    key={block.row.id}
                    range={block.range}
                    startHour={block.startHour}
                    row={block.row}
                    onChange={(patch) => updateBreak(day.slotId, block.row.id, patch)}
                    onRemove={() => removeBreak(day.slotId, block.row.id)}
                  />
                )
              }
              const sourceId = block.item.sourceId
              if (!sourceId) return null
              const startBounds = startBoundsFor(block.item, block.startHour, block.durationHours)
              return (
                <SightCard
                  key={sourceId}
                  item={block.item}
                  period={bucketFromStart(block.startHour)}
                  startHour={block.startHour}
                  durationHours={block.durationHours}
                  minStartHour={startBounds.minHour}
                  maxStartHour={startBounds.maxHour}
                  hoursLabel={hoursLabelFor(block.item)}
                  closedToday={Boolean(block.closedToday)}
                  closedAtTime={Boolean(block.closedAtTime)}
                  untimed={Boolean(block.untimed)}
                  costLabel={costLabelFor(block.item)}
                  note={notes[sourceId] ?? block.item.planningNote ?? ''}
                  highlighted={highlightId === block.item.id}
                  dayNumber={day.day}
                  slotId={day.slotId}
                  cityDays={cityDays}
                  deletedSlotIds={deletedSlotIds}
                  pendingRemove={dayDeleted || pendingIds.has(sourceId)}
                  pendingMovedToDay={pendingMovedToDay[sourceId] ?? null}
                  hideUndo={dayDeleted}
                  dragLocked={Boolean(reorderSourceId) || readOnly}
                  onHighlight={() => onHighlight(block.item.id)}
                  onRemove={() => onRemoveSight(block.item, bucketFromStart(block.startHour))}
                  onUndo={() => onUndoSight?.(sourceId)}
                  onStartChange={(hhmm) => {
                    const bounds = startBoundsFor(block.item, block.startHour, block.durationHours)
                    setStart(sourceId, clampHhmmToBounds(hhmm, bounds.minHour, bounds.maxHour))
                    onReorder(orderedIds)
                  }}
                  onDurationChange={(mins) => {
                    setDuration(sourceId, mins / 60)
                    onReorder(orderedIds)
                  }}
                  onNoteChange={(value) => setNote(sourceId, value)}
                  onMoveDay={(nextDay, nextSlot) => {
                    if (deletedSlotIds.includes(nextSlot)) return
                    const to = cityDays.find((d) => d.slotId === nextSlot && d.day === nextDay)
                    if (to) onMoveToDay(sourceId, to, block.item)
                  }}
                  onMoveToNewDay={() => onMoveToNewDay(sourceId, block.item)}
                  onMoveSight={() => setReorderSourceId(sourceId)}
                  canReorder={orderedIds.length > 1}
                  readOnly={readOnly}
                />
              )
            })}
            {unplaced.map((item) => {
              const sourceId = item.sourceId
              if (!sourceId) return null
              return (
                <SightCard
                  key={`unplaced:${sourceId}`}
                  item={item}
                  period="morning"
                  startHour={8}
                  durationHours={1}
                  hoursLabel={hoursLabelFor(item)}
                  closedToday={false}
                  closedAtTime={false}
                  untimed
                  costLabel={costLabelFor(item)}
                  note={notes[sourceId] ?? item.planningNote ?? ''}
                  highlighted={highlightId === item.id}
                  dayNumber={day.day}
                  slotId={day.slotId}
                  cityDays={cityDays}
                  deletedSlotIds={deletedSlotIds}
                  pendingRemove={dayDeleted || pendingIds.has(sourceId)}
                  pendingMovedToDay={pendingMovedToDay[sourceId] ?? null}
                  hideUndo={dayDeleted}
                  dragLocked
                  onHighlight={() => onHighlight(item.id)}
                  onRemove={() => onRemoveSight(item, 'morning')}
                  onUndo={() => onUndoSight?.(sourceId)}
                  onStartChange={(hhmm) => setStart(sourceId, hhmm)}
                  onDurationChange={(mins) => setDuration(sourceId, mins / 60)}
                  onNoteChange={(value) => setNote(sourceId, value)}
                  onMoveDay={(nextDay, nextSlot) => {
                    if (deletedSlotIds.includes(nextSlot)) return
                    const to = cityDays.find((d) => d.slotId === nextSlot && d.day === nextDay)
                    if (to) onMoveToDay(sourceId, to, item)
                  }}
                  onMoveToNewDay={() => onMoveToNewDay(sourceId, item)}
                  onMoveSight={() => setReorderSourceId(sourceId)}
                  canReorder={false}
                  readOnly={readOnly}
                />
              )
            })}
            {parkedSights.map((item) => {
              const sourceId = item.sourceId
              if (!sourceId) return null
              return (
                <SightCard
                  key={`parked:${sourceId}`}
                  item={item}
                  period="morning"
                  startHour={8}
                  durationHours={1}
                  hoursLabel={hoursLabelFor(item)}
                  closedToday={false}
                  closedAtTime={false}
                  untimed
                  costLabel={costLabelFor(item)}
                  note={notes[sourceId] ?? item.planningNote ?? ''}
                  highlighted={highlightId === item.id}
                  dayNumber={day.day}
                  slotId={day.slotId}
                  cityDays={cityDays}
                  deletedSlotIds={deletedSlotIds}
                  pendingRemove
                  pendingMovedToDay={null}
                  hideUndo={dayDeleted}
                  dragLocked
                  onHighlight={() => onHighlight(item.id)}
                  onRemove={() => onRemoveSight(item, 'morning')}
                  onUndo={() => onUndoSight?.(sourceId)}
                  onStartChange={() => undefined}
                  onDurationChange={() => undefined}
                  onNoteChange={(value) => setNote(sourceId, value)}
                  onMoveDay={() => undefined}
                  onMoveToNewDay={() => undefined}
                  onMoveSight={() => undefined}
                  canReorder={false}
                  readOnly={readOnly}
                />
              )
            })}
          </SortableContext>
        )}
      </div>
      {lastSightOverrun && userLastSightEndTime ? (
        <p className="mt-2 text-[0.72rem] font-semibold text-terracotta">
          This day still runs past {userLastSightEndTime} — shorten a stop or move a sight.
        </p>
      ) : blocks.some((b) => b.type === 'sight' && b.endHour > 22) ? (
        <p className="mt-2 text-[0.72rem] font-semibold text-terracotta">
          This day now runs past 22:00 — shorten a stop or move a sight.
        </p>
      ) : null}
      {dayEndsBeforeSix && !dayDeleted && !readOnly ? (
        <div className="mt-3 flex justify-start pl-[3.4rem]">
          <button
            type="button"
            onClick={addSightsToThisDay}
            className="rounded-full bg-terracotta px-3.5 py-1.5 text-[0.78rem] font-bold text-paper hover:bg-ink"
          >
            Add More sights
          </button>
        </div>
      ) : null}
      {closedSights.length > 0 ? (
        <div className="mt-4 rounded-[14px] border border-ink/10 bg-cream px-3.5 py-3">
          <p className="font-serif text-[0.98rem] font-semibold text-ink">
            Closed this day
          </p>
          <p className="mt-1 text-[0.78rem] leading-relaxed text-muted">
            These sights stay in your trip bag. They are left off this day’s plan because they
            are closed on this date. Set trip dates in Itinerary settings so weekend and holiday
            closures match your travel days.
          </p>
          <ul className="mt-2.5 space-y-2">
            {closedSights.map((item) => (
              <li key={item.sourceId ?? item.id} className="text-[0.82rem] leading-snug text-ink">
                <span className="font-semibold">{item.name}</span>
                <span className="mt-0.5 block text-[0.75rem] text-muted">
                  {displayTodayHours(hoursOf(item))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <SightReorderSheet
        open={Boolean(reorderSourceId)}
        sights={displaySights.filter(
          (it) =>
            it.sourceId &&
            !pendingIds.has(it.sourceId) &&
            pendingMovedToDay[it.sourceId] == null,
        )}
        focusSourceId={reorderSourceId}
        onClose={() => setReorderSourceId(null)}
        onReorder={onReorder}
      />
    </section>
  )
}
