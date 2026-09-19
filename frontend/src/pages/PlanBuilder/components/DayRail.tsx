import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import type { YourVietnamDay } from '../lib/yourVietnam/types'
import { useAnchoredMenuStyle, type MenuPrefer } from '../lib/yourVietnam/placeFixedMenu'

const RAIL_PILL =
  'min-w-[4.6rem] rounded-full border border-dashed border-ink/20 bg-paper px-3 py-1.5 text-[0.72rem] font-bold text-ink shadow-sm transition hover:border-terracotta/50 hover:bg-terracotta/8 hover:text-terracotta'

function DayChip({
  day,
  active,
  variant,
  blocked,
  deleted,
  onSelect,
}: {
  day: YourVietnamDay
  active: boolean
  variant: 'top' | 'side'
  blocked: boolean
  deleted?: boolean
  onSelect: () => void
}) {
  const droppable = useDroppable({
    id: `drop-day:${day.slotId}`,
    disabled: Boolean(deleted),
    data: {
      type: 'day-drop',
      slotId: day.slotId,
      placeId: day.placeId,
      city: day.city,
      day: day.day,
    },
  })
  const side = variant === 'side'

  return (
    <motion.button
      layoutId={`yv-day-${day.slotId}`}
      layout
      transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.7 }}
      type="button"
      role="tab"
      aria-selected={active}
      ref={droppable.setNodeRef}
      onClick={onSelect}
      className={`relative shrink-0 text-left transition ${
        side
          ? 'w-full rounded-[14px] px-2 py-2'
          : 'min-w-[4.6rem] rounded-full px-3 py-1.5'
      } ${
        deleted
          ? 'bg-cream text-muted ring-1 ring-ink/10'
          : blocked
            ? 'bg-ink/8 text-muted ring-1 ring-ink/15'
            : active
              ? 'bg-ink text-paper shadow-soft'
              : droppable.isOver
                ? 'bg-sage/20 ring-1 ring-sage/40'
                : 'border border-ink/8 bg-paper text-ink hover:border-terracotta/30'
      }`}
    >
      <span
        className={`block text-[0.62rem] font-bold uppercase tracking-[0.12em] ${
          active && !blocked && !deleted ? 'text-paper/70' : 'text-terracotta'
        }`}
      >
        {deleted ? 'Deleted' : `Day ${String(day.day).padStart(2, '0')}`}
      </span>
      <span
        className={`block truncate font-serif text-[0.82rem] font-semibold leading-tight ${
          side ? 'mt-0.5' : ''
        }`}
      >
        {day.city}
      </span>
      {blocked ? (
        <span className="absolute inset-0 grid place-items-center text-[1.1rem]" aria-hidden="true">
          ❌
        </span>
      ) : null}
    </motion.button>
  )
}

function RailMenuPortal({
  open,
  onClose,
  buttonRef,
  prefer,
  children,
}: {
  open: boolean
  onClose: () => void
  buttonRef: { current: HTMLElement | null }
  prefer: MenuPrefer
  children: ReactNode
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const style = useAnchoredMenuStyle(open, buttonRef, menuRef, prefer)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      const t = e.target as Node
      if (buttonRef.current?.contains(t) || menuRef.current?.contains(t)) return
      onClose()
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [buttonRef, onClose, open])

  if (!open) return null

  return createPortal(
    <div
      ref={menuRef}
      style={style}
      className="fixed z-[80] min-w-[13.5rem] overflow-y-auto rounded-[16px] border border-ink/10 bg-paper py-2 shadow-hero"
    >
      {children}
    </div>,
    document.body,
  )
}

function AddDayControl({
  cities,
  onAdd,
  prefer,
}: {
  cities: { city: string; afterSlotId: string }[]
  onAdd: (afterSlotId: string) => void
  prefer: MenuPrefer
}) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <motion.div
        layout
        layoutId="yv-add-day"
        transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.7 }}
        className="shrink-0 self-start"
      >
        <button ref={btnRef} type="button" onClick={() => setOpen((v) => !v)} className={RAIL_PILL}>
          Add a day
        </button>
      </motion.div>
      <RailMenuPortal
        open={open}
        onClose={() => setOpen(false)}
        buttonRef={btnRef}
        prefer={prefer}
      >
        <p className="px-3 pb-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-sage">
          Add to this City
        </p>
        {cities.length === 0 ? (
          <p className="px-3 py-1 text-[0.75rem] text-muted">No cities with sights yet</p>
        ) : (
          cities.map((row) => (
            <button
              key={row.afterSlotId}
              type="button"
              onClick={() => {
                setOpen(false)
                onAdd(row.afterSlotId)
              }}
              className="flex w-full px-3 py-2 text-left font-serif text-[0.92rem] font-semibold text-ink hover:bg-cream"
              aria-label={`Add a day after ${row.city}`}
            >
              {row.city}
            </button>
          ))
        )}
      </RailMenuPortal>
    </>
  )
}

function DeleteDayControl({
  days,
  onDelete,
  prefer,
}: {
  days: YourVietnamDay[]
  onDelete: (slotId: string) => void
  prefer: MenuPrefer
}) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <div className="shrink-0 self-start">
        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={RAIL_PILL}
        >
          Delete a day
        </button>
      </div>
      <RailMenuPortal
        open={open}
        onClose={() => setOpen(false)}
        buttonRef={btnRef}
        prefer={prefer}
      >
        <p className="px-3 pb-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-sage">
          Choose a day
        </p>
        {days.map((row) => (
          <button
            key={row.slotId}
            type="button"
            onClick={() => {
              setOpen(false)
              onDelete(row.slotId)
            }}
            className="flex w-full items-baseline gap-2 px-3 py-2 text-left hover:bg-cream"
            aria-label={`Delete day ${row.day}`}
          >
            <span className="font-serif text-[0.92rem] font-semibold text-ink">
              Day {String(row.day).padStart(2, '0')}
            </span>
            <span className="truncate text-[0.72rem] text-muted">{row.city}</span>
          </button>
        ))}
      </RailMenuPortal>
    </>
  )
}

export function DayRail({
  days,
  activeDay,
  activeSlotId,
  onSelect,
  variant,
  blockedSlotId,
  addDayCities = [],
  onAddEmptyDay,
  onDeleteDay,
  canDeleteDay = false,
  deletedSlotIds = [],
  onChangeDayOrder,
}: {
  days: YourVietnamDay[]
  activeDay: number
  activeSlotId?: string | null
  onSelect: (day: number, slotId: string) => void
  variant: 'top' | 'side'
  blockedSlotId: string | null
  addDayCities?: { city: string; afterSlotId: string }[]
  onAddEmptyDay?: (afterSlotId: string) => void
  onDeleteDay?: (slotId: string) => void
  canDeleteDay?: boolean
  deletedSlotIds?: string[]
  onChangeDayOrder?: () => void
}) {
  const prefer: MenuPrefer = variant === 'side' ? 'right' : 'below'
  const deleted = new Set(deletedSlotIds)
  const deletableDays = days.filter((d) => !deleted.has(d.slotId))
  const showDelete = Boolean(onDeleteDay) && canDeleteDay && deletableDays.length > 0
  const dayActions =
    onAddEmptyDay || showDelete || onChangeDayOrder ? (
      <div
        className={`flex shrink-0 items-start gap-2 ${
          variant === 'side' ? 'flex-col' : 'flex-row flex-wrap'
        }`}
      >
        {onAddEmptyDay ? (
          <AddDayControl cities={addDayCities} onAdd={onAddEmptyDay} prefer={prefer} />
        ) : null}
        {showDelete && onDeleteDay ? (
          <DeleteDayControl days={deletableDays} onDelete={onDeleteDay} prefer={prefer} />
        ) : null}
        {onChangeDayOrder ? (
          <button type="button" onClick={onChangeDayOrder} className={RAIL_PILL}>
            Change order of Days
          </button>
        ) : null}
      </div>
    ) : null

  const chips = days.map((d) => (
    <DayChip
      key={d.slotId}
      day={d}
      active={activeSlotId ? d.slotId === activeSlotId : d.day === activeDay}
      variant={variant}
      blocked={blockedSlotId === d.slotId}
      deleted={deleted.has(d.slotId)}
      onSelect={() => onSelect(d.day, d.slotId)}
    />
  ))

  if (variant === 'side') {
    return (
      <div
        role="tablist"
        aria-label="Trip days"
        className="flex flex-col gap-2 overflow-visible lg:sticky lg:top-24"
      >
        {chips}
        {dayActions}
      </div>
    )
  }

  return (
    <div role="tablist" aria-label="Trip days" className="flex items-start gap-2">
      <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
        {chips}
      </div>
      {dayActions}
    </div>
  )
}
