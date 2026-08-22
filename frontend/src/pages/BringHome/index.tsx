import { useMemo, useState } from 'react'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { getFeaturedItems, getItemById } from './data/items'
import { ShoppingHero } from './components/ShoppingHero'
import { ItemDiscovery } from './components/ItemDiscovery'
import { ItemDetailSection } from './components/ItemDetailSection'
import { FamousMarketsSection } from './components/FamousMarketsSection'
import { ShopExplorer } from './components/ShopExplorer'

const DETAIL_ID = 'understand-the-item'
const SHOPS_ID = 'where-to-shop'

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function BringHomePage({ embedded = false }: { embedded?: boolean }) {
  const items = useMemo(() => getFeaturedItems(), [])
  const [selectedShoppingItem, setSelectedShoppingItem] = useState(
    items[0]?.id ?? 'vietnamese-coffee',
  )

  const selectedItem = getItemById(selectedShoppingItem) ?? items[0]

  function handleSeeMore(id: string) {
    setSelectedShoppingItem(id)
    requestAnimationFrame(() => scrollToSection(DETAIL_ID))
  }

  function handleShowShops(id: string) {
    setSelectedShoppingItem(id)
    requestAnimationFrame(() => scrollToSection(SHOPS_ID))
  }

  if (!selectedItem) return null

  return (
    <>
      {!embedded && <Nav />}
      <main className="mx-auto max-w-[1180px] px-[clamp(1.1rem,4vw,2rem)] py-8 pb-20">
        <ShoppingHero />

        <div className="mt-10">
          <ItemDiscovery
            items={items}
            selectedItemId={selectedShoppingItem}
            onSeeMore={handleSeeMore}
            onShowShops={handleShowShops}
          />
        </div>

        <div className="mt-12">
          <ItemDetailSection item={selectedItem} />
        </div>

        <div className="mt-12">
          <FamousMarketsSection />
        </div>

        <div className="mt-12">
          <ShopExplorer item={selectedItem} />
        </div>
      </main>
      {!embedded && <Footer />}
    </>
  )
}
