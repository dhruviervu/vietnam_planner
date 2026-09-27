import { ContentImage } from '../../../components/shared/ContentImage'
import { cityImages } from '../data/cityImages'
import { popularCitiesPresent } from '../data/popularTouristCities'
import { cityToSlug } from '../services/citySlug'

type Props = {
  availableCities: string[]
  hrefForCity: (city: string) => string
}

export function PopularCitiesStrip({ availableCities, hrefForCity }: Props) {
  const cities = popularCitiesPresent(availableCities)
  if (cities.length === 0) return null

  return (
    <section className="mt-10">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-terracotta">
        Start with a city
      </p>
      <h2 className="mt-1 font-serif text-[clamp(1.45rem,2.6vw,1.9rem)] font-semibold text-ink">
        Popular cities
      </h2>
      <p className="mt-1 max-w-[62ch] text-[0.9rem] leading-relaxed text-muted">
        Hanoi, Ho Chi Minh City, Hoi An and the other places most travellers actually plan around.
        Open a city for every ranked sight or activity there.
      </p>
      <div className="mt-5 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {cities.map((city) => {
          const slug = cityToSlug(city)
          const photo =
            cityImages(slug)[0] ??
            cityImages(city === 'Ho Chi Minh City' ? 'hcmc' : slug)[0]
          return (
            <a
              key={city}
              href={hrefForCity(city)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative h-[9.5rem] w-[11.5rem] shrink-0 overflow-hidden rounded-[20px] bg-ink shadow-soft ring-1 ring-ink/10"
            >
              {photo ? (
                <ContentImage
                  src={photo}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="absolute inset-0 bg-ink/80" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
              <span className="absolute inset-x-3 bottom-3 font-serif text-[1.12rem] font-semibold leading-tight text-white">
                {city === 'Ho Chi Minh City' ? 'Ho Chi Minh City' : city}
              </span>
            </a>
          )
        })}
      </div>
    </section>
  )
}
