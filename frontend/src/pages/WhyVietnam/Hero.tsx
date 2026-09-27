import { VideoHero } from '../../components/shared/VideoHero'

export function Hero() {
  return (
    <VideoHero
      videoSrc="/videos/why-vietnam-hero.mp4"
      mobileVideoSrc="/videos/why-vietnam-hero-mobile.mp4"
      posterSrc="/videos/why-vietnam-hero-poster.jpg"
      headline="Vietnam: The Perfect Blend of Adventure, Culture, Food, and Value"
      subtext="Explore ancient towns, breathtaking landscapes, world-famous cuisine, and unforgettable experiences—all without breaking the bank."
    />
  )
}
