import { useMemo, useState } from 'react'
import type { Experience } from '../../types'
import { getExperienceGuide, wordCount } from '../../data/experienceGuides'
import { titleGuideParagraphs } from '../../lib/guideParagraphs'
import { imageForGuideSection } from '../../lib/guideSectionImage'
import { GuideSpeechPlayer } from './GuideSpeechPlayer'

type Props = {
  experience: Experience
  className?: string
}

const PREVIEW_SECTIONS = 4

export function ExperienceGuide({ experience, className }: Props) {
  const [expanded, setExpanded] = useState(false)
  const guide = useMemo(() => getExperienceGuide(experience.id), [experience.id])
  const words = useMemo(() => wordCount(guide), [guide])
  const sections = useMemo(
    () => titleGuideParagraphs(guide, experience.name),
    [guide, experience.name],
  )

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
                <p className="text-[0.98rem] leading-[1.75] text-ink/90 text-pretty">
                  {section.body}
                </p>
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
