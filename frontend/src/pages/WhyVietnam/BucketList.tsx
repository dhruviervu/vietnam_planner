import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { AddToItineraryButton } from '../../components/shared/AddToItineraryButton'
import type { CartItem } from '../../store/cartStore'

type BucketItem = CartItem & {
  slug: string
  blurb: string
  imageSeeds: string[]
  /** Placeholder ratings pending real review data */
  rating: number
}

const BUCKET: BucketItem[] = [
  {
    id: 'halong-bay-cruise',
    slug: 'ha-long-bay-cruise',
    name: 'Ha Long Bay Cruise',
    category: 'Experience',
    imageUrl: 'https://picsum.photos/seed/bucket-halong-1/900/700',
    imageSeeds: ['bucket-halong-1', 'bucket-halong-2', 'bucket-halong-3', 'bucket-halong-4', 'bucket-halong-5'],
    rating: 4.9, // placeholder rating pending real review data
    blurb: 'Sleep among limestone towers where the sea goes quiet after sunset.',
  },
  {
    id: 'ha-giang-loop',
    slug: 'ha-giang-loop',
    name: 'Ha Giang Loop',
    category: 'Adventure',
    imageUrl: 'https://picsum.photos/seed/bucket-hagiang-1/900/700',
    imageSeeds: ['bucket-hagiang-1', 'bucket-hagiang-2', 'bucket-hagiang-3', 'bucket-hagiang-4', 'bucket-hagiang-5'],
    rating: 4.8, // placeholder rating pending real review data
    blurb: 'Hairpin passes, mountain markets, and the kind of road that resets your pace.',
  },
  {
    id: 'hoi-an-lanterns',
    slug: 'hoi-an-lantern-streets',
    name: 'Hoi An Lantern Streets',
    category: 'Culture',
    imageUrl: 'https://picsum.photos/seed/bucket-hoian-1/900/700',
    imageSeeds: ['bucket-hoian-1', 'bucket-hoian-2', 'bucket-hoian-3', 'bucket-hoian-4', 'bucket-hoian-5'],
    rating: 4.7, // placeholder rating pending real review data
    blurb: 'Wander silk lantern glow along the Thu Bon when the old town softens.',
  },
  {
    id: 'mekong-delta',
    slug: 'mekong-delta',
    name: 'Mekong Delta',
    category: 'Nature',
    imageUrl: 'https://picsum.photos/seed/bucket-mekong-1/900/700',
    imageSeeds: ['bucket-mekong-1', 'bucket-mekong-2', 'bucket-mekong-3', 'bucket-mekong-4', 'bucket-mekong-5'],
    rating: 4.6, // placeholder rating pending real review data
    blurb: 'Floating markets, orchard canals, and slow boats through green waterways.',
  },
  {
    id: 'pho-in-hanoi',
    slug: 'pho-in-hanoi',
    name: 'Pho in Hanoi',
    category: 'Food',
    imageUrl: 'https://picsum.photos/seed/bucket-pho-1/900/700',
    imageSeeds: ['bucket-pho-1', 'bucket-pho-2', 'bucket-pho-3', 'bucket-pho-4', 'bucket-pho-5'],
    rating: 4.9, // placeholder rating pending real review data
    blurb: 'A dawn bowl in the Old Quarter — steam, herbs, and city wake-up noise.',
  },
  {
    id: 'phu-quoc-beaches',
    slug: 'phu-quoc-beaches',
    name: 'Phu Quoc Beaches',
    category: 'Beach',
    imageUrl: 'https://picsum.photos/seed/bucket-phuquoc-1/900/700',
    imageSeeds: ['bucket-phuquoc-1', 'bucket-phuquoc-2', 'bucket-phuquoc-3', 'bucket-phuquoc-4', 'bucket-phuquoc-5'],
    rating: 4.5, // placeholder rating pending real review data
    blurb: 'Soft sand days and turquoise water when you need the trip to exhale.',
  },
]

const CAROUSEL_MS = 4000
const PAUSE_AFTER_MANUAL_MS = 6000

function BucketCard({ item }: { item: BucketItem }) {
  const [index, setIndex] = useState(0)
  const pauseUntilRef = useRef(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return
      setIndex((prev) => (prev + 1) % item.imageSeeds.length)
    }, CAROUSEL_MS)
    return () => window.clearInterval(id)
  }, [item.imageSeeds.length])

  function goTo(next: number, e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIndex(next)
    pauseUntilRef.current = Date.now() + PAUSE_AFTER_MANUAL_MS
  }

  const cartItem: CartItem = {
    id: item.id,
    name: item.name,
    category: item.category,
    imageUrl: item.imageUrl,
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-card bg-paper shadow-card">
      <Link to={`/experience/${item.slug}`} className="group block flex-1">
        <div className="relative aspect-[5/4] overflow-hidden">
          <img
            key={`${item.slug}-${index}`}
            src={`https://picsum.photos/seed/${item.imageSeeds[index]}/900/700`}
            alt=""
            className="h-full w-full object-cover animate-ken-burns"
            style={{ animationDuration: '4s' }}
          />

          <span className="absolute left-3 top-3 z-[1] inline-flex items-center gap-1 rounded-full bg-ink/55 px-2.5 py-1 text-[0.75rem] font-bold text-paper backdrop-blur-[2px]">
            <span aria-hidden="true">★</span>
            {item.rating.toFixed(1)}
          </span>

          <div className="absolute bottom-3 left-0 right-0 z-[1] flex justify-center gap-1.5">
            {item.imageSeeds.map((seed, i) => (
              <button
                key={seed}
                type="button"
                aria-label={`Show image ${i + 1}`}
                onClick={(e) => goTo(i, e)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-4 bg-paper' : 'w-1.5 bg-paper/45 hover:bg-paper/70'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-5 pb-3 pt-5">
          <h3 className="mb-2 font-serif text-[1.25rem] font-semibold text-ink transition-colors group-hover:text-terracotta-deep">
            {item.name}
          </h3>
          <p className="text-[0.95rem] leading-relaxed text-muted">{item.blurb}</p>
        </div>
      </Link>

      <div className="px-5 pb-5 pt-1">
        <AddToItineraryButton item={cartItem} variant="full" />
      </div>
    </article>
  )
}

export function BucketList() {
  return (
    <section className="bg-cream px-[clamp(1.1rem,4vw,2.5rem)] py-[clamp(3.5rem,7vw,5rem)]">
      <div className="mx-auto max-w-content">
        <p className="mb-3 text-center text-[0.75rem] font-bold uppercase tracking-[0.14em] text-sage">
          Bucket list
        </p>
        <h2 className="mb-3 text-center font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] font-semibold text-ink">
          Experiences worth carting
        </h2>
        <p className="mx-auto mb-10 max-w-[46ch] text-center text-muted">
          Tap to add any of these to your itinerary — you’ll see them collect on Build My Itinerary.
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BUCKET.map((item) => (
            <BucketCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
