import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTripStore } from '../../../store/tripStore'
import { EXPERIENCES } from '../data/experiences'
import { CITY_ACTIVITIES, getActivityImages } from '../data/activities'
import { getExperienceImages } from '../lib/pricing'
import { onTripBagPop, registerTripBag } from '../lib/tripBagTarget'
import { TripBagEmptyState } from './TripBagEmptyState'
import { TripBagItem } from './TripBagItem'

type Props = {
  mobileOpen?: boolean
  onToggleMobile?: () => void
}

type BagEntry =
  | {
      kind: 'experience'
      id: string
      name: string
      city: string
      durationLabel: string
      image: string
    }
  | {
      kind: 'activity'
      id: string
      name: string
      city: string
      durationLabel: string
      image: string
    }

const expandEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function TripBag({ mobileOpen = false, onToggleMobile }: Props) {
  const selectedIds = useTripStore((s) => s.selectedExperienceIds)
  const selectedActivityIds = useTripStore((s) => s.selectedActivityIds)
  const removeExperience = useTripStore((s) => s.removeExperience)
  const removeActivity = useTripStore((s) => s.removeActivity)
  const [expanded, setExpanded] = useState(false)
  const [popping, setPopping] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)

  const bagItems = useMemo((): BagEntry[] => {
    const experiences: BagEntry[] = EXPERIENCES.filter((e) => selectedIds.includes(e.id)).map(
      (e) => ({
        kind: 'experience' as const,
        id: e.id,
        name: e.name,
        city: e.city,
        durationLabel: e.durationLabel,
        image: getExperienceImages(e)[0],
      }),
    )
    const activities: BagEntry[] = CITY_ACTIVITIES.filter((a) =>
      selectedActivityIds.includes(a.id),
    ).map((a) => ({
      kind: 'activity' as const,
      id: a.id,
      name: a.name,
      city: a.cityName,
      durationLabel: a.durationLabel,
      image: getActivityImages(a)[0],
    }))
    return [...experiences, ...activities]
  }, [selectedIds, selectedActivityIds])

  const totalCount = selectedIds.length + selectedActivityIds.length
  const regionSummary = [...new Set(bagItems.map((e) => e.city))].slice(0, 5).join(' · ')

  useEffect(() => {
    registerTripBag(anchorRef.current)
    return () => registerTripBag(null)
  }, [])

  useEffect(() => {
    return onTripBagPop(() => {
      setPopping(true)
      window.setTimeout(() => setPopping(false), 380)
    })
  }, [])

  function openItem(item: BagEntry) {
    const path =
      item.kind === 'activity'
        ? `/plan/builder/activity/${item.id}`
        : `/plan/builder/experience/${item.id}`
    window.open(path, '_blank', 'noopener,noreferrer')
  }

  function removeItem(item: BagEntry) {
    if (item.kind === 'activity') removeActivity(item.id)
    else removeExperience(item.id)
  }

  const body = (
    <BagBody
      items={bagItems}
      experienceCount={selectedIds.length}
      activityCount={selectedActivityIds.length}
      totalCount={totalCount}
      regionSummary={regionSummary}
      expanded={expanded}
      onToggleExpand={() => setExpanded((v) => !v)}
      onRemove={removeItem}
      onOpen={openItem}
      popping={popping}
      anchorRef={anchorRef}
    />
  )

  return (
    <>
      {/* Mobile */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 p-3 backdrop-blur-md xl:hidden">
        <button
          type="button"
          onClick={onToggleMobile}
          className="flex w-full items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3 text-left"
        >
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-sage">
              Your Trip Bag
            </p>
            <p className="font-serif text-[1.05rem] font-semibold text-ink">
              {totalCount} item{totalCount === 1 ? '' : 's'}
            </p>
          </div>
          <span className="text-muted">{mobileOpen ? '▾' : '▴'}</span>
        </button>
        <div
          className="grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            gridTemplateRows: mobileOpen ? '1fr' : '0fr',
            opacity: mobileOpen ? 1 : 0,
          }}
        >
          <div className="max-h-[55vh] overflow-hidden">
            <div className="overflow-y-auto pt-3">{body}</div>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <aside className="sticky top-[88px] hidden max-h-[calc(100vh-104px)] w-[290px] shrink-0 overflow-y-auto xl:block">
        <div className="rounded-[22px] border border-ink/6 bg-paper/85 p-4 shadow-soft backdrop-blur-sm">
          {body}
        </div>
      </aside>
    </>
  )
}

function BagBody({
  items,
  experienceCount,
  activityCount,
  totalCount,
  regionSummary,
  expanded,
  onToggleExpand,
  onRemove,
  onOpen,
  popping,
  anchorRef,
}: {
  items: BagEntry[]
  experienceCount: number
  activityCount: number
  totalCount: number
  regionSummary: string
  expanded: boolean
  onToggleExpand: () => void
  onRemove: (item: BagEntry) => void
  onOpen: (item: BagEntry) => void
  popping: boolean
  anchorRef: React.RefObject<HTMLDivElement | null>
}) {
  const countLabel = [
    experienceCount > 0
      ? `${experienceCount} experience${experienceCount === 1 ? '' : 's'}`
      : null,
    activityCount > 0
      ? `${activityCount} activit${activityCount === 1 ? 'y' : 'ies'}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-sage">
            Your Trip Bag
          </p>
          {totalCount > 0 && (
            <p className="mt-1 text-[0.78rem] font-bold uppercase tracking-wide text-muted">
              {countLabel || `${totalCount} saved`}
            </p>
          )}
        </div>
        <div
          ref={anchorRef}
          className={`grid h-11 w-11 place-items-center rounded-2xl bg-cream transition-transform ${
            popping ? 'scale-110' : ''
          }`}
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c45c3a" strokeWidth="1.7">
            <rect x="4" y="8" width="16" height="12" rx="2.5" />
            <path d="M8 8V6.5C8 4.57 9.57 3 11.5 3h1C14.43 3 16 4.57 16 6.5V8" />
          </svg>
        </div>
      </div>

      {totalCount === 0 ? (
        <TripBagEmptyState />
      ) : (
        <>
          <button
            type="button"
            onClick={onToggleExpand}
            aria-expanded={expanded}
            className="mt-4 w-full rounded-2xl border border-ink/8 bg-cream/70 px-3 py-3 text-left transition-colors hover:bg-cream"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-serif text-[1.15rem] font-semibold text-ink">
                Your Trip Bag · {totalCount}
              </p>
              <span
                className={`text-muted transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  expanded ? 'rotate-90' : ''
                }`}
              >
                ▸
              </span>
            </div>
            {regionSummary && (
              <p className="mt-2 text-[0.78rem] leading-snug text-muted">{regionSummary}</p>
            )}
            <p className="mt-1 text-[0.72rem] font-bold text-terracotta">
              {expanded ? 'Hide saved items' : 'Show saved items'}
            </p>
          </button>

          <div
            className="grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              gridTemplateRows: expanded ? '1fr' : '0fr',
              opacity: expanded ? 1 : 0,
            }}
          >
            <div className="overflow-hidden">
              <div className="mt-4 border-t border-ink/8 pt-3">
                <p className="text-[0.72rem] font-bold uppercase tracking-wide text-sage">
                  Not scheduled yet
                </p>
                <p className="mt-1 text-[0.78rem] text-muted">
                  Experiences and activities will be organized into days later. Activities slot
                  in as flexible join-in moments.
                </p>
                <ul className="mt-3 space-y-2">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <TripBagItem
                        key={`${item.kind}-${item.id}`}
                        item={item}
                        onRemove={() => onRemove(item)}
                        onOpen={() => onOpen(item)}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            </div>
          </div>

          <motion.p
            layout
            className="mt-4 text-[0.82rem] text-ink"
            transition={{ duration: 0.45, ease: expandEase }}
          >
            Your trip is taking shape.
          </motion.p>
        </>
      )}
    </div>
  )
}
