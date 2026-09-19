import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AnimatePresence, motion } from 'framer-motion'
import type { YourVietnamDay } from '../lib/yourVietnam/types'

function GripIcon({ className = 'h-4 w-4 text-ink/35' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden>
      <circle cx="7" cy="5" r="1.35" />
      <circle cx="13" cy="5" r="1.35" />
      <circle cx="7" cy="10" r="1.35" />
      <circle cx="13" cy="10" r="1.35" />
      <circle cx="7" cy="15" r="1.35" />
      <circle cx="13" cy="15" r="1.35" />
    </svg>
  )
}

function ReorderRow({
  day,
  index,
}: {
  day: YourVietnamDay
  index: number
}) {
  const id = `day-reorder:${day.slotId}`
  const sortable = useSortable({
    id,
    data: { type: 'day-reorder', slotId: day.slotId },
    animateLayoutChanges: () => false,
  })
  const style = sortable.isDragging
    ? undefined
    : {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
      }

  return (
    <li
      ref={sortable.setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 ${
        sortable.isDragging ? 'z-20 opacity-30' : 'bg-cream'
      }`}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paper text-[0.72rem] font-bold tabular-nums text-ink">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-serif text-[0.98rem] font-semibold text-ink">{day.city}</p>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted">
          Day {String(index + 1).padStart(2, '0')}
        </p>
      </div>
      <button
        type="button"
        aria-label={`Drag ${day.city}`}
        className="grid h-9 w-9 shrink-0 cursor-grab place-items-center rounded-full bg-paper text-ink touch-none active:cursor-grabbing"
        {...sortable.attributes}
        {...sortable.listeners}
      >
        <GripIcon />
      </button>
    </li>
  )
}

export function DayReorderSheet({
  open,
  days,
  onClose,
  onReorder,
}: {
  open: boolean
  days: YourVietnamDay[]
  onClose: () => void
  onReorder: (orderedSlotIds: string[]) => void
}) {
  const slotIds = useMemo(() => days.map((d) => d.slotId), [days])
  const slotKey = slotIds.join('|')
  const [draft, setDraft] = useState<string[]>(slotIds)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (open) setDraft(slotIds)
  }, [open, slotIds, slotKey])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const byId = useMemo(() => {
    const map = new Map<string, YourVietnamDay>()
    for (const d of days) map.set(d.slotId, d)
    return map
  }, [days])

  const rows = draft.map((id) => byId.get(id)).filter((d): d is YourVietnamDay => Boolean(d))
  const sortableIds = rows.map((d) => `day-reorder:${d.slotId}`)
  const activeDay = activeId ? byId.get(activeId) : undefined
  const activeIndex = activeId ? draft.indexOf(activeId) : -1

  function commitMove(event: DragEndEvent) {
    const from = String(event.active.id).replace(/^day-reorder:/, '')
    const to = event.over ? String(event.over.id).replace(/^day-reorder:/, '') : ''
    setActiveId(null)
    if (!to || from === to) return
    const oldIndex = draft.indexOf(from)
    const newIndex = draft.indexOf(to)
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return
    const next = arrayMove(draft, oldIndex, newIndex)
    setDraft(next)
    onReorder(next)
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="drag-days-title"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative z-[81] flex max-h-[86vh] w-full max-w-[28rem] flex-col rounded-t-[24px] bg-paper shadow-hero sm:rounded-[24px]"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
              <div>
                <p id="drag-days-title" className="font-serif text-[1.45rem] font-semibold leading-tight text-ink">
                  Change order of Days
                </p>
                <p className="mt-1 text-[0.78rem] text-muted">
                  Hold a row and drop it where that day should go.
                </p>
              </div>
              <button
                type="button"
                aria-label="Done"
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream text-[1.05rem] font-bold text-ink/60 hover:bg-ink hover:text-paper"
              >
                ×
              </button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(event: DragStartEvent) => {
                setActiveId(String(event.active.id).replace(/^day-reorder:/, ''))
              }}
              onDragEnd={commitMove}
              onDragCancel={() => setActiveId(null)}
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
                <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                  <ol className="space-y-2">
                    {rows.map((day, index) => (
                      <ReorderRow key={day.slotId} day={day} index={index} />
                    ))}
                  </ol>
                </SortableContext>
              </div>
              <DragOverlay dropAnimation={null}>
                {activeDay ? (
                  <div className="flex items-center gap-3 rounded-[14px] bg-ink px-3 py-2.5 shadow-hero">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-paper/15 text-[0.72rem] font-bold tabular-nums text-paper">
                      {activeIndex + 1}
                    </span>
                    <p className="min-w-0 flex-1 truncate font-serif text-[0.98rem] font-semibold text-paper">
                      {activeDay.city}
                    </p>
                    <GripIcon className="h-4 w-4 text-paper/55" />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
            <div className="px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full bg-terracotta py-3 text-[0.88rem] font-bold text-paper"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
