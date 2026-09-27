import { useEffect, useState } from 'react'
import type { ExperienceVideo } from '../../data/experienceMedia'

type Props = {
  videos: ExperienceVideo[]
  name: string
}

function embedSrc(youtubeId: string) {
  const id = encodeURIComponent(youtubeId)
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`
}

export function ExperienceVideoSection({ videos, name }: Props) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    setActive(0)
  }, [videos])

  if (!videos.length) return null

  const index = Math.min(Math.max(active, 0), videos.length - 1)
  const video = videos[index]!

  return (
    <section className="mt-10">
      <h2 className="font-serif text-[1.45rem] font-semibold text-ink">Video</h2>
      {video.title ? (
        <p className="mt-1 text-[0.88rem] text-muted">{video.title}</p>
      ) : (
        <p className="mt-1 text-[0.88rem] text-muted">
          {videos.length > 1
            ? `Video ${index + 1} of ${videos.length} — a closer look at ${name}`
            : `A closer look at ${name}`}
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-[22px] bg-ink shadow-hero ring-1 ring-ink/10">
        <div className="relative aspect-video w-full bg-black">
          <iframe
            key={video.youtubeId}
            src={embedSrc(video.youtubeId)}
            title={video.title || `${name} video ${index + 1}`}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
          />
        </div>
      </div>

      {videos.length > 1 ? (
        <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
          {videos.map((item, i) => (
            <button
              key={`${item.youtubeId}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === index}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[0.78rem] font-bold ring-1 transition ${
                i === index
                  ? 'bg-ink text-paper ring-ink'
                  : 'bg-paper text-ink ring-ink/12 hover:ring-terracotta/35'
              }`}
            >
              Video {i + 1}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
