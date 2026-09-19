import type { KeyboardEvent, MouseEvent } from 'react'
import { useState } from 'react'
import { addTemplateSlot, isSlotInBag, slotHasTarget } from '../lib/addTemplateItem'
import { slotItemHref, slotKindHref } from '../lib/itemHref'
import type { TemplateSlot, TemplateSlotKind } from '../lib/buildTemplateItinerary'
import { useTripStore } from '../../../store/tripStore'

const KIND_LABEL: Record<TemplateSlotKind, string> = {
  experience: 'Experience',
  activity: 'Thing to do',
  meal: 'Restaurant',
  stay: 'Stay',
  shopping: 'Shopping',
  'city-transfer': 'Travel',
  'local-move': 'In the city',
}

type Props = {
  slot: TemplateSlot
  compact?: boolean
}

export function TemplateItemRow({ slot, compact }: Props) {
  const inBag = useTripStore((s) => isSlotInBag(slot, s))
  const [justAdded, setJustAdded] = useState(false)
  const canAdd = slotHasTarget(slot)
  const transfer = slot.kind === 'city-transfer'
  const stay = slot.kind === 'stay'
  const local = slot.kind === 'local-move'
  const itemHref = slotItemHref(slot)
  const kindHref = slotKindHref(slot.kind, slot.city)
  const thumbSize = compact ? 'h-14 w-14' : 'h-[4.4rem] w-[4.4rem]'

  function handleAdd(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!canAdd || inBag || justAdded) return
    addTemplateSlot(slot)
    setJustAdded(true)
  }

  function openItem() {
    if (!itemHref) return
    window.open(itemHref, '_blank', 'noopener,noreferrer')
  }

  function openKind(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    window.open(kindHref, '_blank', 'noopener,noreferrer')
  }

  return (
    <article
      className={`flex gap-3 rounded-[14px] p-2.5 ring-1 ${
        transfer || local
          ? 'bg-cream ring-terracotta/30'
          : stay
            ? 'bg-paper ring-ink/10'
            : 'bg-paper ring-ink/8'
      } ${itemHref ? 'cursor-pointer transition hover:ring-terracotta/35' : ''}`}
      onClick={itemHref ? openItem : undefined}
      onKeyDown={
        itemHref
          ? (e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openItem()
              }
            }
          : undefined
      }
      role={itemHref ? 'link' : undefined}
      tabIndex={itemHref ? 0 : undefined}
    >
      {slot.thumb ? (
        <img src={slot.thumb} alt="" loading="lazy" decoding="async" className={`${thumbSize} shrink-0 rounded-[10px] object-cover`} />
      ) : (
        <div
          className={`flex ${thumbSize} shrink-0 items-center justify-center rounded-[10px] text-[1.25rem] ${
            transfer || local ? 'bg-terracotta/15' : 'bg-cream'
          }`}
        >
          {slot.icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <button
            type="button"
            onClick={openKind}
            className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-terracotta hover:underline"
          >
            {KIND_LABEL[slot.kind]}
          </button>
          <span className="rounded-full bg-paper px-2.5 py-0.5 text-[0.88rem] font-bold tabular-nums tracking-tight text-ink ring-1 ring-ink/12">
            {slot.timeLabel}
          </span>
          {slot.durationLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-0.5 text-[0.82rem] font-bold tabular-nums text-ink ring-1 ring-ink/12">
              {slot.durationLabel}
              {/\d/.test(slot.durationLabel) ? (
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-terracotta">
                  approx.
                </span>
              ) : null}
            </span>
          ) : null}
        </p>
        <h4 className="mt-0.5 font-serif text-[1rem] font-semibold leading-tight text-ink">{slot.name}</h4>
        <p className="mt-0.5 text-[0.7rem] font-medium text-ink/70">
          {slot.city}
          {slot.locationLabel ? <span className="text-muted"> · {slot.locationLabel}</span> : null}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[0.78rem] leading-relaxed text-ink/80">{slot.reason}</p>
        {canAdd ? (
          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
            {justAdded ? (
              <p className="text-[0.76rem] font-semibold text-sage">
                We&apos;ll add this to your final itinerary.
              </p>
            ) : inBag ? (
              <p className="text-[0.76rem] font-semibold text-ink/70">In your itinerary</p>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className="rounded-full bg-terracotta px-3 py-1 text-[0.72rem] font-bold text-paper transition hover:-translate-y-0.5"
              >
                Use in my itinerary
              </button>
            )}
          </div>
        ) : null}
      </div>
    </article>
  )
}
