import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import {
  getMonthProfile,
  type MonthId,
  type MonthProfile,
} from './data/months'
import { getMonthVisitInsight, type RainCategory } from './data/monthSnapshots'
import {
  classifyMonthChoices,
  EASIEST_NATIONWIDE_MONTHS,
  getMonthTileDescriptor,
} from './services/recommendation'
import { ClimateMapSection } from './components/ClimateMapSection'
import { WhatsHappeningSection } from './components/WhatsHappeningSection'
import { monthToSeason, seasonSectionId, type EventSeason } from './data/eventSeasons'

const CLIMATE_MAP_ID = 'climate-map'
const EVENT_CALENDAR_ID = 'event-calendar'

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function WhenToGoDiscoverPage({ embedded = false }: { embedded?: boolean }) {
  const choiceGroups = useMemo(() => classifyMonthChoices(), [])
  const [selectedMonth, setSelectedMonth] = useState<MonthId>(3)
  const [eventFocusSeason, setEventFocusSeason] = useState<EventSeason | null>(null)
  const [mapLayerRequest, setMapLayerRequest] = useState<{
    layer: 'temperature' | 'rainfall'
    key: number
  } | null>(null)

  const profile = getMonthProfile(selectedMonth)

  return (
    <>
      {!embedded && <Nav />}
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-9 pb-20">
        <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-[clamp(1.85rem,4vw,2.6rem)] font-semibold leading-[1.1] text-ink">
            When Should You Visit Vietnam?
          </h1>
          <p className="mt-2 max-w-[48ch] text-[0.95rem] text-muted">
            Every month brings a different side of Vietnam. Explore the seasons, festivals and
            experiences to discover when Vietnam feels right for you.
          </p>
        </motion.header>

        <section className="mt-7">
          <h2 className="font-serif text-[1.25rem] font-semibold text-ink">Browse the Months</h2>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-stretch">
            <div className="rounded-[20px] bg-paper shadow-soft ring-1 ring-ink/[0.06]">
              <MonthChoiceCalendar
                groups={choiceGroups}
                selected={selectedMonth}
                onSelect={setSelectedMonth}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMonth}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="min-w-0 rounded-[20px] bg-paper shadow-soft ring-1 ring-ink/[0.06]"
              >
                <SelectedMonthInsight
                  profile={profile}
                  onSeeEventCalendar={() => {
                    const season = monthToSeason(selectedMonth)
                    setEventFocusSeason(season)
                    scrollToSection(seasonSectionId(season))
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <div id={CLIMATE_MAP_ID} className="scroll-mt-24 mt-10">
          <ClimateMapSection
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            recommendedMonths={EASIEST_NATIONWIDE_MONTHS}
            requestedLayer={mapLayerRequest?.layer ?? null}
            layerRequestKey={mapLayerRequest?.key ?? 0}
          />
        </div>

        <div id={EVENT_CALENDAR_ID} className="scroll-mt-24 mt-10">
          <WhatsHappeningSection
            selectedMonth={selectedMonth}
            focusSeason={eventFocusSeason}
          />
        </div>
      </main>
      {!embedded && <Footer />}
    </>
  )
}

function MonthChoiceCalendar({
  groups,
  selected,
  onSelect,
}: {
  groups: ReturnType<typeof classifyMonthChoices>
  selected: MonthId
  onSelect: (m: MonthId) => void
}) {
  return (
    <div className="space-y-3 px-3.5 py-4 sm:px-4">
      {groups.map((group) => (
        <div key={group.id}>
          <p
            className={`text-[0.62rem] font-bold uppercase tracking-[0.14em] ${
              group.id === 'nationwide' ? 'text-terracotta' : 'text-muted'
            }`}
          >
            {group.id === 'nationwide' ? '✦ ' : ''}
            {group.label}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {group.months.map((monthId) => {
              const m = getMonthProfile(monthId)
              const active = selected === monthId
              const inNationwide = EASIEST_NATIONWIDE_MONTHS.includes(monthId)
              const descriptor = getMonthTileDescriptor(monthId)

              return (
                <button
                  key={monthId}
                  type="button"
                  onClick={() => onSelect(monthId)}
                  aria-pressed={active}
                  className={`min-w-[4.4rem] rounded-[12px] px-2.5 py-2 text-center transition ${
                    active
                      ? 'bg-ink text-paper shadow-soft'
                      : inNationwide
                        ? 'bg-terracotta/[0.1] text-ink ring-1 ring-terracotta/25 hover:bg-terracotta/15'
                        : 'bg-cream text-ink hover:bg-ink/5'
                  }`}
                >
                  <span className="block text-[0.78rem] font-bold tracking-wide">{m.short}</span>
                  <span
                    className={`mt-0.5 block text-[0.58rem] font-semibold leading-tight ${
                      active ? 'text-paper/70' : 'text-muted'
                    }`}
                  >
                    {descriptor}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function rainFillPercent(category: RainCategory): number {
  if (category === 'Low') return 28
  if (category === 'Moderate') return 58
  return 92
}

function rainAccent(category: RainCategory): string {
  if (category === 'Low') return '#6f8f6a'
  if (category === 'Moderate') return '#c17a4a'
  return '#9a3f32'
}

function SelectedMonthInsight({
  profile,
  onSeeEventCalendar,
}: {
  profile: MonthProfile
  onSeeEventCalendar: () => void
}) {
  const insight = getMonthVisitInsight(profile.month)
  const fill = rainFillPercent(insight.rainCategory)
  const accent = rainAccent(insight.rainCategory)

  return (
    <div className="relative flex h-full flex-col overflow-hidden px-5 py-5 sm:px-7 sm:py-7">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-terracotta/70 via-sage/50 to-terracotta/20"
      />

      <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-sage">This month</p>
      <h3 className="mt-1.5 font-serif text-[clamp(1.7rem,3vw,2.15rem)] font-semibold leading-[1.05] text-ink">
        {profile.name}
      </h3>

      <p className="mt-4 max-w-[46ch] text-[1.05rem] leading-[1.65] text-ink/88 sm:text-[1.12rem]">
        {insight.visitDescription}
      </p>

      <div className="mt-auto grid gap-3 pt-7 sm:grid-cols-2">
        <div className="rounded-[16px] bg-gradient-to-br from-cream to-cream/40 px-4 py-3.5 ring-1 ring-ink/[0.06]">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0e2c8] text-terracotta"
            >
              <WeatherSunIcon />
            </span>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">
              Weather
            </p>
          </div>
          <p className="mt-2.5 text-[1.2rem] font-semibold tracking-tight text-ink">
            {insight.temperatureRange}
          </p>
          <p className="mt-0.5 text-[0.75rem] text-muted">Typical daytime range</p>
        </div>

        <div className="rounded-[16px] bg-gradient-to-br from-cream to-cream/40 px-4 py-3.5 ring-1 ring-ink/[0.06]">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: `${accent}22`, color: accent }}
            >
              <RainDropIcon />
            </span>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted">Rain</p>
          </div>

          <div className="mt-2.5 flex items-end justify-between gap-2">
            <p className="text-[1.2rem] font-semibold tracking-tight text-ink">
              {insight.rainfallMm} mm
            </p>
            <p className="pb-0.5 text-[0.78rem] font-bold" style={{ color: accent }}>
              {insight.rainCategory}
            </p>
          </div>

          <div
            className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-ink/[0.07]"
            role="meter"
            aria-label={`Rainfall level: ${insight.rainCategory}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={fill}
          >
            <motion.div
              key={`${profile.month}-${insight.rainCategory}`}
              initial={{ width: 0 }}
              animate={{ width: `${fill}%` }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${accent}cc, ${accent})`,
              }}
            />
          </div>
          <p className="mt-1.5 text-[0.68rem] text-muted">Monthly rainfall feel</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSeeEventCalendar}
        className="group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-[0.82rem] font-bold text-paper shadow-soft transition hover:bg-terracotta"
      >
        See Event Calendar
        <span
          aria-hidden
          className="transition-transform group-hover:translate-x-0.5"
        >
          ↓
        </span>
      </button>
    </div>
  )
}

function WeatherSunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.05 5.05l1.55 1.55M17.4 17.4l1.55 1.55M18.95 5.05l-1.55 1.55M6.6 17.4l-1.55 1.55"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function RainDropIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5c0 0-6.5 7.2-6.5 11.2a6.5 6.5 0 1 0 13 0C18.5 10.7 12 3.5 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 14.8c.6 1.7 2 2.8 3.6 2.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
