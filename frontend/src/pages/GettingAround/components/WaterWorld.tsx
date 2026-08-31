import { useEffect } from 'react'
import { WATER_MODES } from '../data/modes'
import { WATER_OVERVIEW } from '../data/modeGuides'
import { ModeJumpNav } from './ModeJumpNav'
import { ModeSection } from './ModeSection'
import { ComparisonStrip } from './ComparisonStrip'

const WATER_ATLAS = WATER_MODES

const BACKDROP =
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1400&q=80'

type Props = {
  activeModeId: string | null
  onActiveMode: (id: string) => void
  selectedOptionId: string | null
  onSelectOption: (id: string) => void
}

export function WaterWorld({
  activeModeId,
  onActiveMode,
  selectedOptionId,
  onSelectOption,
}: Props) {
  useEffect(() => {
    const ids = WATER_ATLAS.map((m) => `mode-water-${m.id}`)
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        onActiveMode(visible.target.id.replace('mode-water-', ''))
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.15, 0.35] },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [onActiveMode])

  return (
    <section id="world-water" className="scroll-mt-28">
      <div className="relative mb-6 overflow-hidden rounded-[20px]">
        <img src={BACKDROP} alt="" className="h-36 w-full object-cover sm:h-44" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-terracotta">03</p>
          <h2 className="mt-1 font-serif text-[clamp(1.5rem,3vw,2rem)] font-semibold text-paper">
            🌊 Water Transportation
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {WATER_OVERVIEW.map((block) => (
          <article
            key={block.title}
            className="overflow-hidden rounded-[18px] border border-ink/8 bg-cream/55"
          >
            <div className="grid gap-0 sm:grid-cols-[minmax(0,1fr)_10rem]">
              <div className="px-5 py-4">
                <h3 className="font-serif text-[1.15rem] font-semibold text-ink">{block.title}</h3>
                <p className="mt-2 text-[0.92rem] leading-[1.75] text-ink/90">{block.body}</p>
              </div>
              {block.image ? (
                <div className="relative hidden aspect-square sm:block">
                  <img src={block.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
              ) : null}
            </div>
            {block.image ? (
              <div className="relative aspect-[16/7] sm:hidden">
                <img src={block.image} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="mt-10">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-muted">Water modes</p>
        <ModeJumpNav
          modes={WATER_ATLAS}
          activeId={activeModeId}
          onActive={onActiveMode}
          idPrefix="mode-water"
        />

        <div className="mt-6 space-y-12">
          {WATER_ATLAS.map((m) => (
            <ModeSection
              key={m.id}
              mode={m}
              idPrefix="mode-water"
              highlighted={activeModeId === m.id}
              selectedOptionId={selectedOptionId}
              onSelectOption={onSelectOption}
            />
          ))}
        </div>

        <ComparisonStrip modes={WATER_ATLAS} kind="water" />
      </div>
    </section>
  )
}
