import { useEffect, useMemo, useState } from 'react'
import type { Experience } from '../../types'
import { titleGuideParagraphs } from '../../lib/guideParagraphs'
import { imageForGuideSection } from '../../lib/guideSectionImage'
import { GuideSpeechPlayer } from './GuideSpeechPlayer'
import {
  loadedExperienceGuides,
  preloadExperienceGuides,
  type GuidesModule,
} from '../../data/loadExperienceGuides'

function useGuidesModule(): GuidesModule | null {
  const [mod, setMod] = useState(loadedExperienceGuides)
  useEffect(() => {
    if (mod) return
    let alive = true
    preloadExperienceGuides().then(
      (m) => alive && setMod(m),
      () => {},
    )
    return () => {
      alive = false
    }
  }, [mod])
  return mod
}

type Props = {
  experience: Experience
  className?: string
}

const PREVIEW_SECTIONS = 4

export function ExperienceGuide({ experience, className }: Props) {
  const [expanded, setExpanded] = useState(false)
  const guides = useGuidesModule()
  const guide = useMemo(
    () => (guides ? guides.getExperienceGuide(experience.id) : ''),
    [guides, experience.id],
  )
  const words = useMemo(() => (guides ? guides.wordCount(guide) : 0), [guides, guide])
  const sections = useMemo(
    () => titleGuideParagraphs(guide, experience.name),
    [guide, experience.name],
  )

  if (!guides) {
    return (
      <section
        id="visitor-guide"
        aria-busy="true"
        className={`scroll-mt-24 animate-pulse ${className ?? 'mt-10'}`}
      >
        <div className="h-3 w-24 rounded bg-ink/10" />
        <div className="mt-2 h-6 w-40 rounded bg-ink/10" />
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full rounded bg-ink/[0.07]" />
          <div className="h-4 w-11/12 rounded bg-ink/[0.07]" />
          <div className="h-4 w-4/5 rounded bg-ink/[0.07]" />
        </div>
      </section>
    )
  }

  if (!guide) return null

  const hasMore = sections.length > PREVIEW_SECTIONS
  const visible = expanded || !hasMore ? sections : sections.slice(0, PREVIEW_SECTIONS)

  return (
    <section id="visitor-guide" className={`scroll-mt-24 ${className ?? 'mt-10'}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            Visitor guide
          </p>
          <h2 className="mt-1 font-serif text-[1.45rem] font-semibold text-ink">The story</h2>
          <p className="mt-1 text-[0.82rem] text-muted">
            A full guide to {experience.name}
            {words >= 1000 ? ` · ${words.toLocaleString()} words` : ''}
          </p>
        </div>
      </div>

      <GuideSpeechPlayer sections={sections} label={experience.name} />

      <div className="mt-6 space-y-8">
        {visible.map((section, i) => {
          const src = imageForGuideSection(section.title, experience, i)
          return (
            <article
              key={`${section.title}-${i}`}
              className="border-t border-ink/8 pt-6 first:border-t-0 first:pt-0"
            >
              <h3 className="font-serif text-[1.2rem] font-semibold leading-snug text-ink">
                {section.title}
              </h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:items-start lg:gap-6">
                <div className="space-y-4">
                  {section.body.split(/\n\n+/).map((para, j) => (
                    <p
                      key={j}
                      className="whitespace-pre-line text-[0.98rem] leading-[1.75] text-ink/90 text-pretty"
                    >
                      {para}
                    </p>
                  ))}
                </div>
                {src ? (
                  <div className="overflow-hidden rounded-[16px] ring-1 ring-ink/[0.06]">
                    <img
                      src={src}
                      alt=""
                      className="aspect-[16/10] h-auto w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
      {hasMore ? (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full bg-ink px-5 py-2.5 text-[0.82rem] font-bold text-paper hover:bg-ink/90"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        </div>
      ) : null}
    </section>
  )
}
