import { useState } from 'react'
import type { ExperienceVideo } from '../../data/experienceMedia'

type Props = {
  videos: ExperienceVideo[]
  name: string
}

export function ExperienceVideoSection({ videos, name }: Props) {
  const [active, setActive] = useState(0)
  if (!videos.length) return null

  const index = Math.min(active, videos.length - 1)
  const video = videos[index]!

  return (
    <section className="mt-10">
      <h2 className="font-serif text-[1.45rem] font-semibold text-ink">Video</h2>
      {video.title ? (
        <p className="mt-1 text-[0.88rem] text-muted">{video.title}</p>
      ) : (
        <p className="mt-1 text-[0.88rem] text-muted">A closer look at {name}</p>
      )}

      <div className="mt-4 overflow-hidden rounded-[22px] bg-ink shadow-hero ring-1 ring-ink/10">
        <div className="relative aspect-video w-full">
          <iframe
            key={video.youtubeId}
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
            title={video.title || `${name} video ${index + 1}`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      {videos.length > 1 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {videos.map((item, i) => (
            <button
              key={item.youtubeId}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === index}
              className={`rounded-full px-3.5 py-1.5 text-[0.78rem] font-bold ring-1 transition ${
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
