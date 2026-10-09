import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { formatClock } from '../lib/yourVietnam/clockTimes'
import {
  DAY_LAST_SIGHT_END_CHOICES,
  DAY_START_CHOICES,
  parseDayEndHour,
  parseDayStart,
} from '../lib/yourVietnam/dayWindows'
import { tripIsoDate } from '../lib/yourVietnam/openingHours'
import { useAnchoredMenuStyle, type MenuPrefer } from '../lib/yourVietnam/placeFixedMenu'
import {
  TRANSIT_MODES,
  type HopTransportRule,
  type TransportModeId,
} from '../lib/yourVietnam/osrmRoute'

type SettingsPanel = 'start' | 'end' | 'dates' | 'transport' | null

function SettingsMenuPortal({
  open,
  onClose,
  buttonRef,
  prefer,
  panel,
  children,
}: {
  open: boolean
  onClose: () => void
  buttonRef: { current: HTMLElement | null }
  prefer: MenuPrefer
  panel: SettingsPanel
  children: ReactNode
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const style = useAnchoredMenuStyle(open, buttonRef, menuRef, prefer, panel ?? '')

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      const t = e.target as Node
      if (buttonRef.current?.contains(t) || menuRef.current?.contains(t)) return
      onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [buttonRef, onClose, open])

  if (!open) return null

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={style}
      className="fixed z-[90] w-[min(22rem,calc(100vw-1rem))] overflow-y-auto rounded-[16px] border border-ink/10 bg-paper py-2 shadow-hero"
    >
      {children}
    </div>,
    document.body,
  )
}

function TimeChoiceGrid({
  choices,
  value,
  onPick,
}: {
  choices: string[]
  value: string
  onPick: (hhmm: string) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5 px-3 pb-2">
      {choices.map((choice) => {
        const active = value === choice
        return (
          <button
            key={choice}
            type="button"
            onClick={() => onPick(choice)}
            className={`rounded-full px-2 py-1.5 text-[0.78rem] font-bold tabular-nums transition ${
              active
                ? 'bg-ink text-paper'
                : 'border border-ink/12 bg-cream text-ink hover:border-terracotta/40 hover:bg-terracotta/10'
            }`}
          >
            {choice}
          </button>
        )
      })}
    </div>
  )
}

function CustomTimeRow({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (hhmm: string) => void
  label: string
}) {
  return (
    <label className="mx-3 mb-2 flex items-center justify-between gap-2 rounded-[12px] border border-ink/10 bg-cream px-3 py-2">
      <span className="text-[0.72rem] font-bold text-muted">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="rounded-md border border-ink/10 bg-paper px-2 py-1 font-serif text-[0.88rem] font-semibold tabular-nums text-ink"
      />
    </label>
  )
}

const PILL =
  'rounded-full border border-dashed border-ink/20 bg-cream px-3.5 py-1.5 text-[0.78rem] font-bold text-ink hover:border-terracotta hover:text-terracotta'

const KM_CHOICES = [0.5, 1, 2, 3, 5, 8, 10]

export function ItinerarySettingsControl({
  morningTime,
  lastSightEndTime,
  onMorningChange,
  onLastSightEndChange,
  onClearLastSightEnd,
  startDate,
  endDate,
  days,
  onTripDatesChange,
  hopTransportRule,
  onHopTransportRuleChange,
}: {
  morningTime: string
  lastSightEndTime: string | null
  onMorningChange: (hhmm: string) => void
  onLastSightEndChange: (hhmm: string) => void
  onClearLastSightEnd: () => void
  startDate: string
  endDate: string
  days: number
  onTripDatesChange: (startDate: string, endDate: string) => void
  hopTransportRule: HopTransportRule | null
  onHopTransportRuleChange: (rule: HopTransportRule | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState<SettingsPanel>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [draftStart, setDraftStart] = useState(morningTime)
  const [draftEnd, setDraftEnd] = useState(lastSightEndTime ?? '18:00')
  const [draftKm, setDraftKm] = useState(hopTransportRule?.overKm ?? 2)
  const [draftMode, setDraftMode] = useState<TransportModeId>(hopTransportRule?.mode ?? 'grab-car')

  useEffect(() => {
    if (!open) return
    setDraftStart(morningTime)
    setDraftEnd(lastSightEndTime ?? '18:00')
    setDraftKm(hopTransportRule?.overKm ?? 2)
    setDraftMode(hopTransportRule?.mode ?? 'grab-car')
    setPanel(null)
  }, [open, morningTime, lastSightEndTime, hopTransportRule])

  function closeMenu() {
    setOpen(false)
    setPanel(null)
  }

  function applyStart(hhmm: string) {
    if (!/^\d{1,2}:\d{2}$/.test(hhmm)) return
    const start = parseDayStart(hhmm)
    const end = parseDayEndHour(lastSightEndTime)
    if (end != null && start >= end - 0.5) return
    onMorningChange(hhmm)
    setDraftStart(hhmm)
  }

  function applyEnd(hhmm: string) {
    const end = parseDayEndHour(hhmm)
    if (end == null) return
    if (end <= parseDayStart(morningTime) + 0.5) return
    onLastSightEndChange(hhmm)
    setDraftEnd(hhmm)
  }

  const endActive = Boolean(lastSightEndTime)
  const endLabel = lastSightEndTime
    ? formatClock(parseDayEndHour(lastSightEndTime) ?? 18)
    : 'Off'

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={PILL}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Itinerary settings
      </button>
      <SettingsMenuPortal
        open={open}
        onClose={closeMenu}
        buttonRef={btnRef}
        prefer="below"
        panel={panel}
      >
        <p className="px-3 pb-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-sage">
          Itinerary settings
        </p>

        <button
          type="button"
          onClick={() => setPanel((p) => (p === 'dates' ? null : 'dates'))}
          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-cream"
        >
          <span className="font-serif text-[0.92rem] font-semibold text-ink">Trip dates</span>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[0.72rem] font-bold tabular-nums ${
              startDate ? 'bg-cream text-terracotta' : 'bg-ink/6 text-muted'
            }`}
          >
            {startDate || 'Off'}
          </span>
        </button>
        {panel === 'dates' ? (
          <div className="border-t border-ink/8 pb-2 pt-1">
            <p className="px-3 pb-2 text-[0.72rem] leading-relaxed text-muted">
              Opening hours, closed days and renovations follow these dates. Leave empty to keep
              every saved sight on the plan.
            </p>
            <label className="mx-3 mb-2 flex items-center justify-between gap-2 rounded-[12px] border border-ink/10 bg-cream px-3 py-2">
              <span className="text-[0.72rem] font-bold text-muted">Start</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  const nextStart = e.target.value
                  if (!nextStart) {
                    onTripDatesChange('', '')
                    return
                  }
                  const nextEnd =
                    endDate && endDate >= nextStart ? endDate : tripIsoDate(nextStart, days)
                  onTripDatesChange(nextStart, nextEnd)
                }}
                className="rounded-md border border-ink/10 bg-paper px-2 py-1 font-serif text-[0.88rem] font-semibold text-ink"
              />
            </label>
            <label className="mx-3 mb-2 flex items-center justify-between gap-2 rounded-[12px] border border-ink/10 bg-cream px-3 py-2">
              <span className="text-[0.72rem] font-bold text-muted">End</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => {
                  const nextEnd = e.target.value
                  if (!nextEnd) {
                    onTripDatesChange(startDate, '')
                    return
                  }
                  const nextStart = startDate && startDate <= nextEnd ? startDate : nextEnd
                  onTripDatesChange(nextStart, nextEnd)
                }}
                className="rounded-md border border-ink/10 bg-paper px-2 py-1 font-serif text-[0.88rem] font-semibold text-ink"
              />
            </label>
            {startDate ? (
              <button
                type="button"
                onClick={() => onTripDatesChange('', '')}
                className="mx-3 mt-1 mb-1 w-[calc(100%-1.5rem)] rounded-full border border-ink/12 py-1.5 text-[0.72rem] font-bold text-muted hover:border-ink/25 hover:text-ink"
              >
                Clear trip dates
              </button>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setPanel((p) => (p === 'start' ? null : 'start'))}
          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-cream"
        >
          <span className="font-serif text-[0.92rem] font-semibold text-ink">
            Fix Start Time of Day
          </span>
          <span className="rounded-md bg-cream px-1.5 py-0.5 text-[0.72rem] font-bold tabular-nums text-terracotta">
            {formatClock(parseDayStart(morningTime))}
          </span>
        </button>
        {panel === 'start' ? (
          <div className="border-t border-ink/8 pb-1 pt-1">
            <p className="px-3 pb-2 text-[0.72rem] leading-relaxed text-muted">
              Every day begins at this time.
            </p>
            <TimeChoiceGrid choices={DAY_START_CHOICES} value={draftStart} onPick={applyStart} />
            <CustomTimeRow label="Custom" value={draftStart} onChange={applyStart} />
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setPanel((p) => (p === 'end' ? null : 'end'))}
          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-cream"
        >
          <span className="font-serif text-[0.92rem] font-semibold text-ink">
            Fix End Time of Day
          </span>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[0.72rem] font-bold tabular-nums ${
              endActive ? 'bg-cream text-terracotta' : 'bg-ink/6 text-muted'
            }`}
          >
            {endLabel}
          </span>
        </button>
        {panel === 'end' ? (
          <div className="border-t border-ink/8 pb-1 pt-1">
            <p className="px-3 pb-2 text-[0.72rem] leading-relaxed text-muted">
              Last sight on every day ends by this time.
            </p>
            <TimeChoiceGrid
              choices={DAY_LAST_SIGHT_END_CHOICES}
              value={draftEnd}
              onPick={applyEnd}
            />
            <CustomTimeRow label="Custom" value={draftEnd} onChange={applyEnd} />
            {endActive ? (
              <button
                type="button"
                onClick={() => {
                  onClearLastSightEnd()
                  closeMenu()
                }}
                className="mx-3 mt-1 mb-1 w-[calc(100%-1.5rem)] rounded-full border border-ink/12 py-1.5 text-[0.72rem] font-bold text-muted hover:border-ink/25 hover:text-ink"
              >
                Turn off limit
              </button>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setPanel((p) => (p === 'transport' ? null : 'transport'))}
          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-cream"
        >
          <span className="font-serif text-[0.92rem] font-semibold text-ink">
            Set Transport Method
          </span>
          <span
            className={`max-w-[9.5rem] truncate rounded-md px-1.5 py-0.5 text-[0.72rem] font-bold tabular-nums ${
              hopTransportRule ? 'bg-cream text-terracotta' : 'bg-ink/6 text-muted'
            }`}
          >
            {hopTransportRule
              ? `>${hopTransportRule.overKm} km · ${TRANSIT_MODES.find((m) => m.mode === hopTransportRule.mode)?.label ?? hopTransportRule.mode}`
              : 'Auto'}
          </span>
        </button>
        {panel === 'transport' ? (
          <div className="border-t border-ink/8 pb-2 pt-1">
            <p className="px-3 pb-2 text-[0.72rem] leading-relaxed text-muted">
              If a hop is farther than this distance, use that transport. Shorter hops stay on walk
              or motorbike unless you change that hop on the day.
            </p>
            <p className="px-3 pb-1.5 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-sage">
              Distance more than
            </p>
            <div className="mb-2 grid grid-cols-4 gap-1.5 px-3">
              {KM_CHOICES.map((km) => {
                const active = draftKm === km
                return (
                  <button
                    key={km}
                    type="button"
                    onClick={() => {
                      setDraftKm(km)
                      onHopTransportRuleChange({ overKm: km, mode: draftMode })
                    }}
                    className={`rounded-full px-2 py-1.5 text-[0.78rem] font-bold tabular-nums transition ${
                      active
                        ? 'bg-ink text-paper'
                        : 'border border-ink/12 bg-cream text-ink hover:border-terracotta/40 hover:bg-terracotta/10'
                    }`}
                  >
                    {km} km
                  </button>
                )
              })}
            </div>
            <label className="mx-3 mb-3 flex items-center justify-between gap-2 rounded-[12px] border border-ink/10 bg-cream px-3 py-2">
              <span className="text-[0.72rem] font-bold text-muted">Custom km</span>
              <input
                type="number"
                min={0.2}
                max={80}
                step={0.5}
                value={draftKm}
                onChange={(e) => {
                  const km = Number(e.target.value)
                  if (!Number.isFinite(km) || km <= 0) return
                  setDraftKm(km)
                  onHopTransportRuleChange({ overKm: km, mode: draftMode })
                }}
                className="w-20 rounded-md border border-ink/10 bg-paper px-2 py-1 font-serif text-[0.88rem] font-semibold tabular-nums text-ink"
              />
            </label>
            <p className="px-3 pb-1.5 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-sage">
              Use this transport
            </p>
            <div className="grid grid-cols-2 gap-1.5 px-3 pb-2">
              {TRANSIT_MODES.map((row) => {
                const active = draftMode === row.mode
                return (
                  <button
                    key={row.mode}
                    type="button"
                    onClick={() => {
                      setDraftMode(row.mode)
                      onHopTransportRuleChange({ overKm: draftKm, mode: row.mode })
                    }}
                    className={`rounded-full px-2 py-1.5 text-[0.78rem] font-bold transition ${
                      active
                        ? 'bg-ink text-paper'
                        : 'border border-ink/12 bg-cream text-ink hover:border-terracotta/40 hover:bg-terracotta/10'
                    }`}
                  >
                    {row.label}
                  </button>
                )
              })}
            </div>
            {hopTransportRule ? (
              <button
                type="button"
                onClick={() => {
                  onHopTransportRuleChange(null)
                  closeMenu()
                }}
                className="mx-3 mt-1 mb-1 w-[calc(100%-1.5rem)] rounded-full border border-ink/12 py-1.5 text-[0.72rem] font-bold text-muted hover:border-ink/25 hover:text-ink"
              >
                Back to auto
              </button>
            ) : null}
          </div>
        ) : null}
      </SettingsMenuPortal>
    </>
  )
}
