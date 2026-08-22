import { useEffect, useMemo, useState, type DragEvent, type MouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTripStore } from '../../../store/tripStore'
import { flyToTripBag } from '../lib/flyToTripBag'
import type { DayMood, SampleActivity } from '../data/sampleDayPool'
import {
  DAY_MOODS,
  TIME_PRESETS,
  buildDaySlots,
  computeTravelGaps,
  defaultMoodFromPace,
  explainOrder,
  formatTime,
  getSlotContext,
  getSwapOptions,
  reorderSlots,
  representativeDayCount,
  type SampleSlot,
  type SwapOption,
} from '../services/sampleDayEngine'

type Props = {
  cityId: string
  cityName: string
  recommendedStay: string
  sketchDayCount: number
}

export function SampleDaySandbox({
  cityId,
  cityName,
  recommendedStay,
  sketchDayCount,
}: Props) {
  const pace = useTripStore((s) => s.basics.travelStyle)
  const paceKnown = useTripStore((s) => s.basics.paceKnown)
  const selectedIds = useTripStore((s) => s.selectedExperienceIds)
  const addExperience = useTripStore((s) => s.addExperience)

  const dayCount = representativeDayCount(recommendedStay, sketchDayCount)
  const [mood, setMood] = useState<DayMood>(() =>
    defaultMoodFromPace(paceKnown ? pace : 'balanced'),
  )
  const [dayIndex, setDayIndex] = useState(0)
  const [slots, setSlots] = useState<SampleSlot[]>(() => buildDaySlots(cityId, mood, 0))
  const [swapIndex, setSwapIndex] = useState<number | null>(null)
  const [timeEditIndex, setTimeEditIndex] = useState<number | null>(null)
  const [whyOpen, setWhyOpen] = useState(false)
  const [addedFlash, setAddedFlash] = useState<string | null>(null)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setSlots(buildDaySlots(cityId, mood, dayIndex))
    setSwapIndex(null)
    setTimeEditIndex(null)
  }, [cityId, mood, dayIndex])

  const gaps = useMemo(() => computeTravelGaps(slots), [slots])
  const whyCopy = useMemo(() => explainOrder(slots), [slots])
  const swapOptions = swapIndex != null ? getSwapOptions(cityId, slots, swapIndex) : []

  const moodMeta = useMemo(() => {
    const map: Record<DayMood, { short: string; focused: string }> = {
      balanced: { short: 'Balanced', focused: 'Balanced' },
      culture: { short: 'Culture', focused: 'Culture-focused' },
      food: { short: 'Food', focused: 'Food-focused' },
      adventure: { short: 'Adventure', focused: 'Adventure-focused' },
      slow: { short: 'Slow', focused: 'Slow-paced' },
    }
    return map[mood]
  }, [mood])

  const categorySummary = useMemo(() => {
    const labels = [...new Set(slots.map((s) => s.activity.categoryLabel))]
    return labels.slice(0, 4)
  }, [slots])

  const inviteLine =
    mood === 'balanced'
      ? `Explore a possible ${dayCount}-day rhythm for ${cityName}.`
      : `Explore a possible ${dayCount}-day ${moodMeta.focused.toLowerCase()} rhythm for ${cityName}.`

  function toggleExpanded() {
    setExpanded((v) => {
      if (v) {
        setSwapIndex(null)
        setTimeEditIndex(null)
        setWhyOpen(false)
      }
      return !v
    })
  }

  function onAdd(e: MouseEvent, activity: SampleActivity) {
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    const card = target.closest('[data-sample-card]')
    const img = card?.querySelector('img')
    const rect = (img ?? target).getBoundingClientRect()
    flyToTripBag(rect, activity.image)
    addExperience(activity.experienceId, 'later')
    setAddedFlash(activity.id)
    window.setTimeout(() => setAddedFlash(null), 2000)
  }

  function applySwap(option: SwapOption) {
    if (swapIndex == null) return
    setSlots((prev) => {
      const next = [...prev]
      const cur = next[swapIndex]
      next[swapIndex] = {
        ...cur,
        key: `${option.activity.id}-${cur.timeHour}-${cur.timeMinute}-${swapIndex}`,
        activity: option.activity,
        ...(option.suggestTime && option.fit === 'tight'
          ? {}
          : {}),
      }
      return next
    })
    setSwapIndex(null)
  }

  function applySwapWithSuggestedTime(option: SwapOption) {
    if (swapIndex == null || !option.suggestTime) {
      applySwap(option)
      return
    }
    setSlots((prev) => {
      const next = [...prev]
      const cur = next[swapIndex]
      next[swapIndex] = {
        ...cur,
        key: `${option.activity.id}-${option.suggestTime!.hour}-${option.suggestTime!.minute}-${swapIndex}`,
        timeHour: option.suggestTime!.hour,
        timeMinute: option.suggestTime!.minute,
        activity: option.activity,
      }
      return next.sort(
        (a, b) => a.timeHour * 60 + a.timeMinute - (b.timeHour * 60 + b.timeMinute),
      )
    })
    setSwapIndex(null)
  }

  function setSlotTime(index: number, hour: number, minute: number) {
    setSlots((prev) => {
      const next = prev.map((s, i) =>
        i === index
          ? {
              ...s,
              timeHour: hour,
              timeMinute: minute,
              key: `${s.activity.id}-${hour}-${minute}-${i}`,
            }
          : s,
      )
      return next.sort(
        (a, b) => a.timeHour * 60 + a.timeMinute - (b.timeHour * 60 + b.timeMinute),
      )
    })
    setTimeEditIndex(null)
  }

  function onDragStart(index: number) {
    setDragFrom(index)
  }

  function onDrop(index: number) {
    if (dragFrom == null) return
    setSlots((prev) => reorderSlots(prev, dragFrom, index))
    setDragFrom(null)
  }

  return (
    <section className="mt-8">
      <div className="overflow-hidden rounded-[22px] border border-sage/20 bg-sage/[0.08] shadow-soft">
        <div className="px-4 py-4 sm:px-5 sm:py-4">
          <span className="inline-flex items-center rounded-full bg-paper/90 px-3 py-1 text-[0.7rem] font-bold tracking-[0.1em] text-sage shadow-soft">
            ✦ EXAMPLE ONLY
          </span>

          <h3 className="mt-2.5 font-serif text-[clamp(1.25rem,2.5vw,1.65rem)] font-semibold leading-[1.15] text-ink">
            See What a Day in {cityName} Could Feel Like
          </h3>

          <p className="mt-1.5 max-w-[48ch] text-[0.9rem] text-muted">
            {expanded
              ? `Swap experiences, change the pace, and explore different ways to spend a day in ${cityName}.`
              : 'Try a sample day, swap experiences, and see how a day here could flow.'}
          </p>

          <p className="mt-2.5 text-[0.84rem] font-semibold text-ink/85">{inviteLine}</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8rem] font-semibold text-ink/70">
            <span>
              {dayCount} day{dayCount === 1 ? '' : 's'} · {moodMeta.focused}
            </span>
            <span className="text-ink/25" aria-hidden>
              ·
            </span>
            <span>
              {slots.length} example experience{slots.length === 1 ? '' : 's'}
            </span>
          </div>

          {categorySummary.length > 0 && (
            <p className="mt-1.5 text-[0.78rem] font-semibold text-muted">
              {categorySummary.join(' · ')}
            </p>
          )}

          {!expanded && (
            <p className="mt-2.5 text-[0.78rem] text-muted">
              Just an example — your finalized itinerary is built later.
            </p>
          )}

          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-controls={`sample-day-panel-${cityId}`}
            className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-terracotta px-4 py-2.5 text-[0.88rem] font-bold text-paper shadow-soft transition hover:bg-terracotta/90"
          >
            {expanded ? 'Hide Sample Day ↑' : 'Explore the Sample Day ↓'}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id={`sample-day-panel-${cityId}`}
              key="sample-day-expanded"
              role="region"
              aria-label={`Sample day for ${cityName}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.28, ease: 'easeInOut', delay: 0.06 },
              }}
              className="overflow-hidden border-t border-sage/15"
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.28, delay: 0.08, ease: 'easeOut' }}
                className="bg-cream/40 px-4 pb-5 pt-4 sm:px-5"
              >
                <p className="text-[0.88rem] font-semibold text-ink/80">
                  This is a flexible sample, not your final itinerary.
                </p>
                <p className="mt-1 max-w-[56ch] text-[0.85rem] text-muted">
                  Save the experiences you like — your finalized day-by-day trip will be built for
                  you at the end.
                </p>

                <div className="mt-3 rounded-[16px] bg-paper/80 px-3.5 py-3 shadow-soft sm:px-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-terracotta">
                    Your final itinerary comes later
                  </p>
                  <p className="mt-1 max-w-[52ch] text-[0.82rem] leading-relaxed text-muted">
                    As you explore, we&apos;ll use your choices, timing, stays, food, transport and
                    budget to build the finalized trip.
                  </p>
                </div>

                {/* Day tabs */}
                {dayCount > 1 && (
                  <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                    {Array.from({ length: dayCount }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setDayIndex(i)}
                        className={`shrink-0 rounded-full px-3.5 py-2 text-[0.8rem] font-bold transition ${
                          dayIndex === i
                            ? 'bg-ink text-paper'
                            : 'bg-paper text-muted shadow-soft hover:text-ink'
                        }`}
                      >
                        Day {i + 1}
                      </button>
                    ))}
                  </div>
                )}

                {/* Mood */}
                <div className="mt-4">
                  <p className="mb-2 text-[0.72rem] font-bold uppercase tracking-wide text-muted">
                    Shape the day
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {DAY_MOODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMood(m.id)}
                        className={`shrink-0 rounded-full px-3.5 py-2 text-[0.8rem] font-bold transition ${
                          mood === m.id
                            ? 'bg-terracotta text-paper'
                            : 'bg-paper text-muted shadow-soft hover:text-ink'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <p className="text-[0.78rem] font-bold uppercase tracking-[0.1em] text-ink/70">
                    Day {dayIndex + 1} · {cityName}
                  </p>
                  <span className="rounded-full bg-sage/15 px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wide text-sage">
                    Example
                  </span>
                </div>

                {/* Timeline */}
                <div className="relative mt-4 space-y-0 pl-1">
                  <div
                    className="absolute bottom-6 left-[1.35rem] top-6 w-px bg-ink/12"
                    aria-hidden
                  />
                  <AnimatePresence mode="popLayout">
                    {slots.map((slot, index) => {
                      const ctx = getSlotContext(slot.activity, slot.timeHour, slot.timeMinute)
                      const gap = gaps.find((g) => g.fromKey === slot.key)
                      const inBag = selectedIds.includes(slot.activity.experienceId)
                      const justAdded = addedFlash === slot.activity.id

                      return (
                        <div key={slot.key}>
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.28 }}
                            draggable
                            onDragStart={() => onDragStart(index)}
                            onDragOver={(e: DragEvent) => e.preventDefault()}
                            onDrop={() => onDrop(index)}
                            data-sample-card
                            className="relative mb-3 grid grid-cols-[3.2rem_1fr] gap-3 sm:grid-cols-[4rem_1fr]"
                          >
                            <div className="relative z-[1] pt-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setTimeEditIndex(timeEditIndex === index ? null : index)
                                }
                                className="rounded-lg bg-paper px-1.5 py-1 font-mono text-[0.78rem] font-bold text-terracotta shadow-soft hover:bg-cream"
                              >
                                {formatTime(slot.timeHour, slot.timeMinute)}
                              </button>
                              <span className="absolute -right-1.5 top-5 h-2.5 w-2.5 rounded-full border-2 border-cream bg-terracotta" />
                            </div>

                            <div className="overflow-hidden rounded-[18px] bg-paper shadow-soft">
                              <div className="flex gap-3 p-3 sm:gap-4 sm:p-3.5">
                                <img
                                  src={slot.activity.image}
                                  alt=""
                                  className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-xl object-cover sm:h-24 sm:w-28"
                                  draggable={false}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="truncate font-serif text-[1.05rem] font-semibold text-ink">
                                        {slot.activity.name}
                                      </p>
                                      <p className="mt-0.5 text-[0.78rem] font-semibold text-muted">
                                        {slot.activity.categoryLabel} · {slot.activity.durationLabel}
                                      </p>
                                    </div>
                                    <span
                                      className="cursor-grab text-[0.85rem] text-ink/25 active:cursor-grabbing"
                                      title="Drag to reorder"
                                      aria-hidden
                                    >
                                      ⠿
                                    </span>
                                  </div>

                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    <SignalChip>● {ctx.crowdLabel}</SignalChip>
                                    <SignalChip>☀ {ctx.conditionsLabel}</SignalChip>
                                    <SignalChip>✧ {ctx.lightLabel}</SignalChip>
                                    {ctx.openingStatus !== 'open' && (
                                      <SignalChip tone="warn">{ctx.openingLabel}</SignalChip>
                                    )}
                                  </div>

                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSwapIndex(swapIndex === index ? null : index)
                                      }
                                      className="rounded-full border border-ink/10 bg-cream px-3 py-1.5 text-[0.75rem] font-bold text-ink hover:border-ink/25"
                                    >
                                      Swap
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => onAdd(e, slot.activity)}
                                      disabled={inBag}
                                      className={`rounded-full px-3 py-1.5 text-[0.75rem] font-bold ${
                                        inBag || justAdded
                                          ? 'bg-sage/20 text-sage'
                                          : 'bg-ink text-paper hover:bg-ink/90'
                                      }`}
                                    >
                                      {inBag || justAdded
                                        ? 'Added to your trip ✓'
                                        : '+ Add to Trip'}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <AnimatePresence>
                                {timeEditIndex === index && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-ink/8"
                                  >
                                    <div className="flex flex-wrap gap-1.5 p-3">
                                      {TIME_PRESETS.map((t) => (
                                        <button
                                          key={`${t.hour}-${t.minute}`}
                                          type="button"
                                          onClick={() => setSlotTime(index, t.hour, t.minute)}
                                          className="rounded-full bg-cream px-2.5 py-1 font-mono text-[0.72rem] font-bold text-ink hover:bg-terracotta/15"
                                        >
                                          {formatTime(t.hour, t.minute)}
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <AnimatePresence>
                                {swapIndex === index && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-ink/8 bg-cream/50"
                                  >
                                    <div className="p-3">
                                      <p className="text-[0.72rem] font-bold uppercase tracking-wide text-muted">
                                        Swap with something that fits this slot
                                      </p>
                                      <div className="mt-2 space-y-2">
                                        {swapOptions.length === 0 ? (
                                          <p className="text-[0.85rem] text-muted">
                                            No strong alternatives right now — try another mood.
                                          </p>
                                        ) : (
                                          swapOptions.map((opt) => (
                                            <div
                                              key={opt.activity.id}
                                              className="flex gap-3 rounded-2xl bg-paper p-2.5 shadow-soft"
                                            >
                                              <img
                                                src={opt.activity.image}
                                                alt=""
                                                className="h-14 w-16 shrink-0 rounded-xl object-cover"
                                              />
                                              <div className="min-w-0 flex-1">
                                                <p className="truncate text-[0.9rem] font-semibold text-ink">
                                                  {opt.activity.name}
                                                </p>
                                                <p className="text-[0.72rem] text-muted">
                                                  {opt.activity.durationLabel} ·{' '}
                                                  {opt.activity.categoryLabel} · {opt.distanceLabel}
                                                </p>
                                                <p
                                                  className={`mt-1 text-[0.72rem] font-semibold ${
                                                    opt.fit === 'tight'
                                                      ? 'text-terracotta'
                                                      : opt.fit === 'ok'
                                                        ? 'text-ink/70'
                                                        : 'text-sage'
                                                  }`}
                                                >
                                                  {opt.note}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                  <button
                                                    type="button"
                                                    onClick={() => applySwap(opt)}
                                                    className="rounded-full bg-ink px-3 py-1 text-[0.72rem] font-bold text-paper"
                                                  >
                                                    Use this
                                                  </button>
                                                  {opt.suggestTime && (
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        applySwapWithSuggestedTime(opt)
                                                      }
                                                      className="rounded-full border border-ink/12 px-3 py-1 text-[0.72rem] font-bold text-ink"
                                                    >
                                                      {opt.suggestTime.label}
                                                    </button>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setSwapIndex(null)}
                                        className="mt-2 text-[0.75rem] font-bold text-muted hover:text-ink"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>

                          {gap?.warning && (
                            <p className="mb-2 ml-[3.5rem] text-[0.72rem] font-bold text-terracotta sm:ml-[4.5rem]">
                              ⚠ {gap.label}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </AnimatePresence>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setWhyOpen((v) => !v)}
                    aria-expanded={whyOpen}
                    className="inline-flex items-center gap-2 rounded-full bg-terracotta/12 px-4 py-2.5 text-[0.88rem] font-bold text-terracotta transition hover:bg-terracotta/18 hover:shadow-soft"
                  >
                    Why we planned it this way {whyOpen ? '↑' : '→'}
                  </button>
                  <AnimatePresence initial={false}>
                    {whyOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 max-w-[56ch] rounded-[16px] bg-paper/80 px-4 py-3.5 shadow-soft">
                          <p className="text-[0.95rem] font-semibold leading-snug text-ink">
                            {whyCopy.flow}
                          </p>
                          <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
                            {whyCopy.note}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-7 rounded-[20px] border border-ink/6 bg-paper/70 px-4 py-4 shadow-soft sm:px-5">
                  <p className="font-serif text-[1.15rem] font-semibold text-ink">
                    Like this kind of day?
                  </p>
                  <p className="mt-1 max-w-[48ch] text-[0.88rem] text-muted">
                    Save the experiences you want. We&apos;ll take care of the detailed planning
                    later.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      '⏱ Timing',
                      '🗺 Travel time',
                      '🍜 Food',
                      '🛏 Stay',
                      '🚌 Transport',
                      '💰 Budget',
                    ].map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full bg-cream px-3 py-1.5 text-[0.75rem] font-bold text-ink/80"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function SignalChip({
  children,
  tone = 'default',
}: {
  children: React.ReactNode
  tone?: 'default' | 'warn'
}) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[0.68rem] font-bold ${
        tone === 'warn' ? 'bg-terracotta/15 text-terracotta' : 'bg-cream text-ink/75'
      }`}
    >
      {children}
    </span>
  )
}
