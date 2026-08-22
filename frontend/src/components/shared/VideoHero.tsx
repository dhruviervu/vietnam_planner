import { useState } from 'react'

type Props = {
  videoSrc: string
  posterSrc: string
  headline: string
  subtext?: string
  creditText?: string
  creditUrl?: string
}

export function VideoHero({
  videoSrc,
  posterSrc,
  headline,
  subtext,
  creditText,
  creditUrl,
}: Props) {
  const [showVideo, setShowVideo] = useState(true)
  const [videoReady, setVideoReady] = useState(false)

  return (
    <section className="relative h-[100vh] min-h-[640px] w-full overflow-hidden bg-ink">
      {/* Poster only until the real video is ready — avoids a soft placeholder covering HD footage */}
      {!videoReady && (
        <img
          src={posterSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
      )}

      {showVideo && (
        <video
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{
            // Keep decoding on the GPU; avoid filters that soften the frame
            transform: 'translateZ(0)',
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={posterSrc}
          onLoadedData={() => setVideoReady(true)}
          onError={() => {
            setShowVideo(false)
            setVideoReady(false)
          }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Lighter mid-frame so footage stays vivid; darker only where type sits */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(28,22,18,0.55) 0%, rgba(28,22,18,0.28) 22%, rgba(28,22,18,0.08) 48%, rgba(28,22,18,0.2) 72%, rgba(28,22,18,0.55) 100%)',
        }}
      />

      {/* Headline sits in the upper band — captivating, with the film open below */}
      <div className="relative z-[2] flex h-full flex-col px-[clamp(1.25rem,5vw,3rem)] pt-[clamp(5.5rem,14vh,8.5rem)]">
        <div className="mx-auto w-full max-w-[920px] text-center">
          <p className="mb-4 text-[0.75rem] font-bold uppercase tracking-[0.22em] text-paper/70">
            Why Vietnam
          </p>
          <h1 className="font-serif text-[clamp(2.15rem,5.8vw,4.15rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-paper [text-shadow:0_2px_32px_rgba(0,0,0,0.4)]">
            {headline}
          </h1>
          {subtext && (
            <p className="mx-auto mt-5 max-w-[42ch] text-[clamp(0.95rem,1.45vw,1.1rem)] leading-relaxed text-paper/85 [text-shadow:0_1px_18px_rgba(0,0,0,0.35)]">
              {subtext}
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-col items-center pb-7">
          <div className="text-paper/65" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="animate-scroll-chevron"
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {creditText && (
        <p className="absolute bottom-5 right-[clamp(1.1rem,4vw,2.5rem)] z-[2] text-[0.68rem] tracking-wide text-paper/40">
          {creditUrl ? (
            <a href={creditUrl} target="_blank" rel="noreferrer" className="hover:text-paper/65">
              {creditText}
            </a>
          ) : (
            creditText
          )}
        </p>
      )}
    </section>
  )
}
