import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { MonthId } from '../data/months'
import { getMonthProfile, MONTH_PROFILES } from '../data/months'
import {
  eventActivityDots,
  getMonthEventProfile,
  getTopCitiesForMonth,
  highlightLabel,
  type MonthEventProfile,
} from '../data/monthEventProfiles'
import {
  filterHappenItems,
  timeStars,
  type HappenCity,
  type HappenItem,
} from '../data/monthEvents'
import {
  deriveLookFocus,
  feelTypeBadge,
  feelWhyLabel,
  filterHighlightsByLookFocus,
  getMonthFeel,
  getMonthHighlights,
  mapHappenToFeelType,
  type FeelHighlightType,
  type LookFocus,
  type MonthFeel,
} from '../data/monthFeel'

type Props = {
  selectedMonth: MonthId
  onSelectMonth: (month: MonthId) => void
  onOpenTemperatureMap?: () => void
}

const STANDOUTS_ID = 'month-standouts'

const FEEL_PILL: Record<FeelHighlightType, string> = {
  festival: 'bg-terracotta/15 text-terracotta',
  seasonal: 'bg-sage/15 text-sage',
  'vietnam-special': 'bg-ink/8 text-ink',
  regional: 'bg-cream text-ink ring-1 ring-ink/8',
  atmosphere: 'bg-sage/10 text-sage',
}

export function WhatsHappeningSection({
  selectedMonth,
  onSelectMonth,
  onOpenTemperatureMap,
}: Props) {
  const navigate = useNavigate()
  const monthMeta = getMonthProfile(selectedMonth)
  const eventProfile = useMemo(() => getMonthEventProfile(selectedMonth), [selectedMonth])
  const monthFeel = useMemo(() => getMonthFeel(selectedMonth), [selectedMonth])

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set())
  const [cityFilter, setCityFilter] = useState<HappenCity>('All Vietnam')
  const [lookFocus, setLookFocus] = useState<LookFocus | null>(null)
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setExpandedId(null)
    setCityFilter('All Vietnam')
    setLookFocus(null)
  }, [selectedMonth])

  const highlights = useMemo(() => {
    const items = getMonthHighlights(selectedMonth)
    const cityFiltered =
      cityFilter === 'All Vietnam' ? items : filterHappenItems(items, cityFilter, 'all')
    return filterHighlightsByLookFocus(cityFiltered, lookFocus)
  }, [selectedMonth, cityFilter, lookFocus])

  const topCities = useMemo(
    () => getTopCitiesForMonth(selectedMonth, 'All Vietnam'),
    [selectedMonth],
  )
  const quietMonth = eventProfile.eventActivity <= 2
  const feelProfiles = useMemo(
    () =>
      MONTH_PROFILES.map((m) => ({
        meta: m,
        feel: getMonthFeel(m.month),
        events: getMonthEventProfile(m.month),
      })),
    [],
  )

  function scrollRail(dir: -1 | 1) {
    const el = railRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.min(340, el.clientWidth * 0.75), behavior: 'smooth' })
  }

  function scrollToStandouts() {
    document.getElementById(STANDOUTS_ID)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  function handleLookFocus(focus: LookFocus) {
    setLookFocus((prev) => (prev === focus ? null : focus))
    if (focus === 'multi-city') setCityFilter('All Vietnam')
    requestAnimationFrame(() => scrollToStandouts())
  }

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openDetail(item: HappenItem) {
    if (item.experienceId) {
      navigate(`/plan/builder/experience/${item.experienceId}`)
      return
    }
    navigate(`/when-to-go/discover/happen/${item.id}`)
  }

  return (
    <section>
      {/* Month feel explorer — two-column workspace */}
      <h2 className="font-serif text-[clamp(1.2rem,2.4vw,1.45rem)] font-semibold text-ink">
        What Vietnam Feels Like This Month
      </h2>
      <p className="mt-0.5 max-w-[52ch] text-[0.84rem] text-muted">
        Choose a month, understand the feel, then explore what defines it.
      </p>

      <div className="mt-5 overflow-hidden rounded-[20px] bg-paper shadow-soft lg:grid lg:grid-cols-[minmax(11rem,0.32fr)_minmax(0,0.68fr)] lg:items-stretch">
        <MonthFeelRail
          items={feelProfiles}
          selected={selectedMonth}
          onSelect={onSelectMonth}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMonth}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="min-w-0 border-t border-ink/8 lg:border-l lg:border-t-0"
          >
            <MonthFeelPanel
              monthName={monthMeta.name}
              feel={monthFeel}
              why={eventProfile.whyItStandsOut}
              quiet={quietMonth}
              topCities={topCities}
              cityFilter={cityFilter}
              onSelectCity={setCityFilter}
              lookFocus={lookFocus}
              onLookFocus={handleLookFocus}
              onOpenTemperatureMap={onOpenTemperatureMap}
              highlights={highlights}
              expandedId={expandedId}
              onToggleWhy={(id) => setExpandedId((cur) => (cur === id ? null : id))}
              savedIds={savedIds}
              onSave={toggleSave}
              onSeeMore={openDetail}
              railRef={railRef}
              onScrollRail={scrollRail}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

function MonthFeelRail({
  items,
  selected,
  onSelect,
}: {
  items: {
    meta: (typeof MONTH_PROFILES)[number]
    feel: MonthFeel
    events: MonthEventProfile
  }[]
  selected: MonthId
  onSelect: (m: MonthId) => void
}) {
  return (
    <div className="flex flex-col border-b border-ink/8 p-3 lg:border-b-0 lg:p-4">
      <p className="mb-2 px-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-sage">
        Year navigator
      </p>
      <p className="mb-2 px-1 text-[0.62rem] text-muted">Event activity — not weather</p>

      <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
        {items.map(({ meta, feel, events }) => {
          const active = meta.month === selected
          return (
            <button
              key={meta.month}
              type="button"
              onClick={() => onSelect(meta.month)}
              className={`flex min-w-[4.6rem] shrink-0 flex-col items-start rounded-[12px] px-2.5 py-2 text-left transition lg:min-w-0 lg:w-full ${
                active
                  ? 'bg-ink text-paper shadow-soft'
                  : 'bg-cream/70 text-ink hover:bg-cream'
              }`}
            >
              <span className="text-[0.78rem] font-bold tracking-wide">{meta.short}</span>
              <span
                className={`mt-1 text-[0.62rem] tracking-tighter ${
                  active ? 'text-paper/80' : 'text-sage'
                }`}
              >
                {eventActivityDots(feel.eventActivity.level)}
              </span>
              <span
                className={`mt-0.5 text-[0.58rem] font-semibold ${
                  active ? 'text-paper/75' : 'text-muted'
                }`}
              >
                {feel.railDescriptor}
              </span>
              {events.highlight ? (
                <span
                  className={`mt-1 line-clamp-1 text-[0.5rem] font-bold ${
                    active ? 'text-[#E8C4B0]' : 'text-terracotta'
                  }`}
                >
                  {highlightLabel(events.highlight).replace('✦ ', '✦ ')}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MonthFeelPanel({
  monthName,
  feel,
  why,
  quiet,
  topCities,
  cityFilter,
  onSelectCity,
  lookFocus,
  onLookFocus,
  onOpenTemperatureMap,
  highlights,
  expandedId,
  onToggleWhy,
  savedIds,
  onSave,
  onSeeMore,
  railRef,
  onScrollRail,
}: {
  monthName: string
  feel: MonthFeel
  why: MonthEventProfile['whyItStandsOut']
  quiet: boolean
  topCities: ReturnType<typeof getTopCitiesForMonth>
  cityFilter: HappenCity
  onSelectCity: (c: HappenCity) => void
  lookFocus: LookFocus | null
  onLookFocus: (focus: LookFocus) => void
  onOpenTemperatureMap?: () => void
  highlights: HappenItem[]
  expandedId: string | null
  onToggleWhy: (id: string) => void
  savedIds: Set<string>
  onSave: (id: string) => void
  onSeeMore: (item: HappenItem) => void
  railRef: RefObject<HTMLDivElement | null>
  onScrollRail: (dir: -1 | 1) => void
}) {
  return (
    <div className="flex flex-col p-4 sm:p-5">
      <h4 className="font-serif text-[1.55rem] font-semibold uppercase tracking-wide text-ink sm:text-[1.7rem]">
        {monthName}
      </h4>
      <p className="mt-1 font-serif text-[1.02rem] font-semibold leading-snug text-ink">
        {feel.monthPersonality}
      </p>
      <p className="mt-1 text-[0.82rem] font-semibold text-ink/75">{feel.compactDescriptor}</p>

      {quiet ? (
        <p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-sage">
          Quieter event month
        </p>
      ) : null}

      {/* Month pulse */}
      <div className="mt-4 flex gap-0 overflow-x-auto rounded-[14px] bg-cream/60 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <PulseCell
          icon="🌡"
          label="Temperature"
          value={feel.temperature.range}
          detail={feel.temperature.travelerImplication}
          interactive
          title={`See ${monthName} conditions across Vietnam`}
          onClick={onOpenTemperatureMap}
          actionHint="View on climate map →"
        />
        <PulseCell
          icon="👥"
          label="Tourist activity"
          value={feel.touristActivity.label}
          detail={
            <>
              <span className="tracking-tighter text-sage">{feel.touristActivity.meter}</span>
              <span className="mt-0.5 block font-medium text-ink/75">
                {feel.touristActivity.travelerImplication}
              </span>
            </>
          }
        />
        <PulseCell
          icon="💰"
          label="Travel cost"
          value={`${feel.travelCost.symbol} · ${feel.travelCost.label}`}
          detail={
            <>
              <span className="tracking-tighter text-sage">{feel.travelCost.meter}</span>
              <span className="mt-0.5 block font-medium text-ink/75">
                {feel.travelCost.travelerImplication}
              </span>
            </>
          }
        />
        <PulseCell
          icon="🎉"
          label="Event activity"
          value={feel.eventActivity.label}
          detail={
            <>
              <span className="tracking-tighter text-sage">{feel.eventActivity.meter}</span>
              <span className="mt-0.5 block font-medium text-ink/75">
                {feel.eventActivity.travelerImplication}
              </span>
            </>
          }
        />
        <PulseCell
          icon="🌿"
          label="Seasonal character"
          value={feel.seasonalCharacter.label}
          detail={feel.seasonalCharacter.travelerImplication}
        />
      </div>

      <p className="mt-3 text-[0.88rem] font-semibold leading-snug text-ink">{feel.summary}</p>

      {/* What the month looks like — interactive */}
      <div className="mt-4 border-t border-ink/8 pt-3">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
          What {monthName} looks like
        </p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {why.slice(0, 4).map((item) => {
            const focus = deriveLookFocus(item.title)
            const active = lookFocus === focus
            return (
              <li key={item.title}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onLookFocus(focus)}
                  className={`flex w-full gap-2 rounded-[12px] px-2.5 py-2 text-left transition hover:-translate-y-0.5 hover:bg-cream ${
                    active ? 'bg-terracotta/10 ring-1 ring-terracotta/25' : 'bg-transparent'
                  }`}
                >
                  <span className="text-[0.9rem] leading-none" aria-hidden>
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.72rem] font-bold uppercase tracking-wide text-ink">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[0.78rem] font-medium leading-snug text-ink/80">
                      {item.description}
                    </p>
                    <p className="mt-1 text-[0.68rem] font-bold text-terracotta">
                      {active ? 'Showing related →' : 'Explore →'}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Cities */}
      {topCities.length > 0 ? (
        <div className="mt-4 border-t border-ink/8 pt-3">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
            Cities to check out in {monthName}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {topCities.map((c) => {
              const on = cityFilter === c.city
              return (
                <button
                  key={c.city}
                  type="button"
                  onClick={() => onSelectCity(on ? 'All Vietnam' : c.city)}
                  className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold transition ${
                    on ? 'bg-terracotta/15 text-terracotta' : 'bg-cream text-ink hover:text-terracotta'
                  }`}
                >
                  {c.city === 'Ho Chi Minh City' ? 'HCMC' : c.city}
                  <span className="text-muted"> · {c.count}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Standouts */}
      <div id={STANDOUTS_ID} className="mt-4 scroll-mt-4 border-t border-ink/8 pt-3">
        <div className="flex items-end justify-between gap-2">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
            This month&apos;s standouts
            {lookFocus ? (
              <span className="ml-2 normal-case tracking-normal text-terracotta">
                · filtered
                <button
                  type="button"
                  onClick={() => onLookFocus(lookFocus)}
                  className="ml-1.5 underline-offset-2 hover:underline"
                >
                  Clear
                </button>
              </span>
            ) : null}
          </p>
          <div className="hidden gap-1 sm:flex">
            <RailButton label="Previous" onClick={() => onScrollRail(-1)}>
              ←
            </RailButton>
            <RailButton label="Next" onClick={() => onScrollRail(1)}>
              →
            </RailButton>
          </div>
        </div>

        {highlights.length === 0 ? (
          <p className="mt-2 text-[0.8rem] text-muted">No items for this filter.</p>
        ) : (
          <div
            ref={railRef}
            className="mt-2.5 flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          >
            {highlights.map((item) => (
              <FeelHighlightCard
                key={item.id}
                item={item}
                expanded={expandedId === item.id}
                onToggleWhy={() => onToggleWhy(item.id)}
                saved={savedIds.has(item.id)}
                onSave={() => onSave(item.id)}
                onSeeMore={() => onSeeMore(item)}
              />
            ))}
            <div aria-hidden className="w-4 shrink-0 snap-start" />
          </div>
        )}
      </div>

      <p className="mt-4 text-[0.72rem] leading-snug text-muted">
        This is your starting picture — deeper places, stays and logistics come as you build your
        trip.
      </p>
    </div>
  )
}

function PulseCell({
  icon,
  label,
  value,
  detail,
  className = '',
  interactive = false,
  onClick,
  title,
  actionHint,
}: {
  icon: string
  label: string
  value: string
  detail?: ReactNode
  className?: string
  interactive?: boolean
  onClick?: () => void
  title?: string
  actionHint?: string
}) {
  const inner = (
    <>
      <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-muted">
        <span className="mr-1" aria-hidden>
          {icon}
        </span>
        {label}
      </p>
      <p className="mt-1 text-[0.92rem] font-bold leading-snug text-ink">{value}</p>
      {detail ? (
        <div className="mt-0.5 text-[0.7rem] font-semibold leading-snug text-ink/70">{detail}</div>
      ) : null}
      {interactive && actionHint ? (
        <p className="mt-1 text-[0.65rem] font-bold text-terracotta">{actionHint}</p>
      ) : null}
    </>
  )

  const shellClass = `min-w-[8.5rem] shrink-0 border-r border-ink/6 px-3 py-2.5 last:border-r-0 sm:min-w-0 sm:flex-1 ${className}`

  if (interactive && onClick) {
    return (
      <button
        type="button"
        title={title}
        onClick={onClick}
        className={`${shellClass} cursor-pointer text-left transition hover:bg-paper/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-terracotta`}
      >
        {inner}
      </button>
    )
  }

  return <div className={shellClass}>{inner}</div>
}

function FeelHighlightCard({
  item,
  expanded,
  onToggleWhy,
  saved,
  onSave,
  onSeeMore,
}: {
  item: HappenItem
  expanded: boolean
  onToggleWhy: () => void
  saved: boolean
  onSave: () => void
  onSeeMore: () => void
}) {
  const feelType = mapHappenToFeelType(item)
  return (
    <article className="flex w-[min(78vw,220px)] shrink-0 snap-start flex-col overflow-hidden rounded-[14px] bg-cream/50 ring-1 ring-ink/6 sm:w-[210px]">
      <div className="relative h-[96px] overflow-hidden">
        <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        <span
          className={`absolute left-2 top-2 rounded-full px-1.5 py-0.5 text-[0.52rem] font-bold uppercase tracking-wide ${FEEL_PILL[feelType]}`}
        >
          {feelTypeBadge(feelType)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <h5 className="font-serif text-[0.92rem] font-semibold leading-tight text-ink">
          {item.name}
        </h5>
        <p className="mt-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-terracotta">
          {item.city}
        </p>
        <p className="mt-1 text-[0.78rem] font-bold tabular-nums text-ink">{item.dateDisplay}</p>

        <p className="mt-1.5 text-[0.65rem] leading-snug text-ink/80">
          {item.duration}
          <span className="mx-1 text-ink/25">·</span>
          {item.crowdLevel}
          <span className="mx-1 text-ink/25">·</span>
          {item.cost}
          <span className="mx-1 text-ink/25">·</span>
          {item.bestTime}
        </p>

        <p className="mt-1.5 text-[0.7rem] font-semibold leading-snug text-ink">
          <span className="text-[0.52rem] font-bold uppercase tracking-wide text-muted">
            Why this month{' '}
          </span>
          {item.whyThisMonth}
        </p>

        <p className="mt-1 text-[0.62rem] font-bold text-ink">
          <span className="uppercase tracking-wide text-muted">Time </span>
          <span className="text-terracotta">{timeStars(item.timeValue)}</span>
        </p>

        <button
          type="button"
          onClick={onToggleWhy}
          className="mt-1 self-start text-[0.65rem] font-bold text-terracotta hover:underline"
        >
          {feelWhyLabel(feelType)} {expanded ? '↑' : '↓'}
        </button>

        <AnimatePresence>
          {expanded ? (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-1 overflow-hidden text-[0.68rem] leading-relaxed text-muted"
            >
              {item.whyItMatters}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onSeeMore}
            className="rounded-full bg-ink px-2.5 py-1.5 text-[0.68rem] font-bold text-paper"
          >
            Explore →
          </button>
          <button
            type="button"
            onClick={onSave}
            className={`text-[0.65rem] font-semibold ${saved ? 'text-sage' : 'text-muted hover:text-ink'}`}
          >
            {saved ? '✓ Saved' : '+ Save'}
          </button>
        </div>
      </div>
    </article>
  )
}

function RailButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 bg-paper text-[0.85rem] font-bold text-ink transition hover:border-ink/25"
    >
      {children}
    </button>
  )
}
