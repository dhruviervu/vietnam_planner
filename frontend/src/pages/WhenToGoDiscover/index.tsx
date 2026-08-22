import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import {
  getMonthProfile,
  type MonthId,
  type MonthProfile,
} from './data/months'
import {
  classifyMonthChoices,
  computeTravelRecommendation,
  costDecisionLabel,
  crowdDecisionLabel,
  eventsDecisionLabel,
  getMonthTileDescriptor,
  isRecommendedMonth,
  rainDecisionLabel,
  weatherComfortLabel,
  type TravelRecommendation,
} from './services/recommendation'
import { ClimateMapSection } from './components/ClimateMapSection'
import { WhatsHappeningSection } from './components/WhatsHappeningSection'

const CLIMATE_MAP_ID = 'climate-map'
const EVENT_CALENDAR_ID = 'event-calendar'

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function WhenToGoDiscoverPage({ embedded = false }: { embedded?: boolean }) {
  const recommendation = useMemo(() => computeTravelRecommendation(), [])
  const choiceGroups = useMemo(() => classifyMonthChoices(recommendation), [recommendation])
  const [selectedMonth, setSelectedMonth] = useState<MonthId>(recommendation.primaryMonth)
  const [mapLayerRequest, setMapLayerRequest] = useState<{
    layer: 'temperature' | 'rainfall'
    key: number
  } | null>(null)

  const profile = getMonthProfile(selectedMonth)
  const inBestWindow = isRecommendedMonth(selectedMonth, recommendation)

  return (
    <>
      {!embedded && <Nav />}
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-9 pb-20">
        <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-sage">
            Experimental · When to go
          </p>
          <h1 className="mt-1.5 font-serif text-[clamp(1.85rem,4vw,2.6rem)] font-semibold leading-[1.1] text-ink">
            When Should You Experience Vietnam?
          </h1>
          <p className="mt-2 max-w-[46ch] text-[0.95rem] text-muted">
            Every month feels different. Explore weather, crowds, cost and events to find the travel
            window that suits you.
          </p>
        </motion.header>

        <section className="mt-7">
          <h2 className="font-serif text-[1.25rem] font-semibold text-ink">Browse the Year</h2>
          <p className="mt-0.5 text-[0.85rem] text-muted">
            Choose a month. We&apos;ll show you what makes it worth the trip.
          </p>

          <div className="mt-4 overflow-hidden rounded-[20px] bg-paper shadow-soft lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
            <MonthChoiceCalendar
              groups={choiceGroups}
              selected={selectedMonth}
              recommendation={recommendation}
              onSelect={setSelectedMonth}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMonth}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                className="min-w-0 border-t border-ink/8 lg:border-l lg:border-t-0"
              >
                <SelectedMonthInsight
                  profile={profile}
                  inBestWindow={inBestWindow}
                  recommendation={recommendation}
                  onExploreClimate={() => scrollToSection(CLIMATE_MAP_ID)}
                  onSeeEvents={() => scrollToSection(EVENT_CALENDAR_ID)}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <div id={CLIMATE_MAP_ID} className="scroll-mt-24 mt-10">
          <ClimateMapSection
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            recommendedMonths={recommendation.recommendedMonths}
            requestedLayer={mapLayerRequest?.layer ?? null}
            layerRequestKey={mapLayerRequest?.key ?? 0}
          />
        </div>

        <div id={EVENT_CALENDAR_ID} className="scroll-mt-24 mt-10">
          <WhatsHappeningSection
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onOpenTemperatureMap={() => {
              setMapLayerRequest({ layer: 'temperature', key: Date.now() })
              scrollToSection(CLIMATE_MAP_ID)
            }}
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
  recommendation,
  onSelect,
}: {
  groups: ReturnType<typeof classifyMonthChoices>
  selected: MonthId
  recommendation: TravelRecommendation
  onSelect: (m: MonthId) => void
}) {
  return (
    <div className="space-y-3 px-3.5 py-4 sm:px-4">
      {groups.map((group) => (
        <div key={group.id}>
          <p
            className={`text-[0.62rem] font-bold uppercase tracking-[0.14em] ${
              group.id === 'best' ? 'text-terracotta' : 'text-muted'
            }`}
          >
            {group.id === 'best' ? '✦ ' : ''}
            {group.label}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {group.months.map((monthId) => {
              const m = getMonthProfile(monthId)
              const active = selected === monthId
              const inBestWindow = isRecommendedMonth(monthId, recommendation)
              const descriptor = getMonthTileDescriptor(monthId, recommendation)

              return (
                <button
                  key={monthId}
                  type="button"
                  onClick={() => onSelect(monthId)}
                  aria-pressed={active}
                  className={`min-w-[4.4rem] rounded-[12px] px-2.5 py-2 text-center transition ${
                    active
                      ? 'bg-ink text-paper shadow-soft'
                      : inBestWindow
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

function SelectedMonthInsight({
  profile,
  inBestWindow,
  recommendation,
  onExploreClimate,
  onSeeEvents,
}: {
  profile: MonthProfile
  inBestWindow: boolean
  recommendation: TravelRecommendation
  onExploreClimate: () => void
  onSeeEvents: () => void
}) {
  // Keep only decision-useful reasons — drop generic "value" / "events calendar" fillers
  const standout = (
    inBestWindow ? recommendation.reasons : profile.whyItWorks
  )
    .filter(
      (item) =>
        !/strong value|event calendar|better balance of value/i.test(item.label),
    )
    .slice(0, 3)

  return (
    <div
      className={`px-4 py-4 sm:px-5 ${
        inBestWindow ? 'bg-gradient-to-b from-terracotta/[0.08] to-transparent' : ''
      }`}
    >
      {inBestWindow ? (
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-terracotta">
          ✦ Strongest overall window · {recommendation.windowRangeLabel}
        </p>
      ) : (
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-sage">
          {profile.name}
        </p>
      )}

      <h3 className="mt-1 font-serif text-[1.1rem] font-semibold text-ink">
        {inBestWindow ? 'Why it stands out' : 'What this month can offer'}
      </h3>

      <p className="mt-1 text-[0.85rem] font-semibold leading-snug text-ink">
        {profile.identity}
      </p>

      <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
        <InsightMetric
          label="Weather"
          value={`${profile.temperatureRange}`}
          note={weatherComfortLabel(profile)}
        />
        <InsightMetric label="Rain" value={rainDecisionLabel(profile)} />
        <InsightMetric label="Crowds" value={crowdDecisionLabel(profile)} />
        <InsightMetric label="Cost" value={costDecisionLabel(profile)} />
        <InsightMetric label="Events" value={eventsDecisionLabel(profile)} />
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {standout.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-[0.72rem] font-bold text-ink"
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </span>
        ))}
      </div>

      <p className="mt-2.5 text-[0.82rem] leading-snug text-ink/80">
        {inBestWindow ? recommendation.synthesis : profile.whatItOffers}
      </p>

      <p className="mt-1.5 text-[0.7rem] text-muted">
        Best for{' '}
        <span className="font-semibold text-ink">{profile.bestFor.slice(0, 3).join(' · ')}</span>
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onExploreClimate}
          className="flex-1 rounded-full bg-ink px-4 py-2.5 text-center text-[0.78rem] font-bold text-paper transition hover:bg-terracotta"
        >
          Explore this month&apos;s climate →
        </button>
        <button
          type="button"
          onClick={onSeeEvents}
          className="flex-1 rounded-full bg-terracotta/15 px-4 py-2.5 text-center text-[0.78rem] font-bold text-terracotta ring-1 ring-terracotta/25 transition hover:bg-terracotta hover:text-paper"
        >
          See what&apos;s happening →
        </button>
      </div>
    </div>
  )
}

function InsightMetric({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note?: string
}) {
  return (
    <div>
      <p className="text-[0.58rem] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-[0.82rem] font-semibold text-ink">{value}</p>
      {note ? <p className="text-[0.68rem] text-muted">{note}</p> : null}
    </div>
  )
}

