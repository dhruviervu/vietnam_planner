import { useMemo, useState } from 'react'
import { getExperienceGuide, wordCount } from '../../data/experienceGuides'
import { GuideSpeechPlayer } from './GuideSpeechPlayer'

type Props = {
  experienceId: string
  experienceName: string
}

const PREVIEW_WORDS = 160

export function ExperienceGuide({ experienceId, experienceName }: Props) {
  const [expanded, setExpanded] = useState(false)
  const guide = useMemo(() => getExperienceGuide(experienceId), [experienceId])
  const words = useMemo(() => wordCount(guide), [guide])

  if (!guide) return null

  const parts = guide.trim().split(/\s+/)
  const preview = parts.slice(0, PREVIEW_WORDS).join(' ')
  const hasMore = parts.length > PREVIEW_WORDS
  const visible = expanded || !hasMore ? guide : `${preview}…`

  return (
    <section className="mt-12 max-w-[720px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-terracotta">
            Visitor guide
          </p>
          <h2 className="mt-1 font-serif text-[1.45rem] font-semibold text-ink">The story</h2>
          <p className="mt-1 text-[0.82rem] text-muted">
            A full guide to {experienceName}
            {words >= 1000 ? ` · ${words.toLocaleString()} words` : ''}
          </p>
        </div>
      </div>

      <GuideSpeechPlayer text={guide} label={experienceName} />

      <div className="mt-4 rounded-[22px] border border-ink/8 bg-cream/60 px-5 py-5 sm:px-6 sm:py-6">
        <div className="space-y-4 text-[1.02rem] leading-[1.75] text-ink">
          {visible.split(/\n\n+/).map((para, i) => (
            <p key={i} className="text-pretty">
              {para.trim()}
            </p>
          ))}
        </div>
        {hasMore ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-5 rounded-full bg-ink px-4 py-2 text-[0.82rem] font-bold text-paper hover:bg-ink/90"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        ) : null}
      </div>
    </section>
  )
}
