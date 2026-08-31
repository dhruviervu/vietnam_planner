import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Nav } from '../../components/landing/Nav'
import { Footer } from '../../components/landing/Footer'
import { getFeaturedItems, getItemById } from './data/items'
import { ShoppingHero } from './components/ShoppingHero'
import { ItemDiscovery } from './components/ItemDiscovery'
import { ShopExplorer } from './components/ShopExplorer'

const SHOPS_ID = 'where-to-shop'

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function BringHomePage({ embedded = false }: { embedded?: boolean }) {
  const items = useMemo(() => getFeaturedItems(), [])
  const [params, setParams] = useSearchParams()
  const itemFromUrl = params.get('item')
  const [selectedItemId, setSelectedItemId] = useState(
    itemFromUrl && items.some((i) => i.id === itemFromUrl)
      ? itemFromUrl
      : (items[0]?.id ?? 'vietnamese-coffee'),
  )
  const [shopItemId, setShopItemId] = useState<string | 'All'>(
    itemFromUrl && items.some((i) => i.id === itemFromUrl) ? itemFromUrl : 'All',
  )

  const selectedItem = getItemById(selectedItemId) ?? items[0]

  useEffect(() => {
    if (itemFromUrl && items.some((i) => i.id === itemFromUrl)) {
      setSelectedItemId(itemFromUrl)
      setShopItemId(itemFromUrl)
    }
  }, [itemFromUrl, items])

  useEffect(() => {
    if (window.location.hash === `#${SHOPS_ID}`) {
      requestAnimationFrame(() => scrollToSection(SHOPS_ID))
    }
  }, [])

  function handleShowShops(id: string) {
    setSelectedItemId(id)
    setShopItemId(id)
    setParams({ item: id }, { replace: true })
    requestAnimationFrame(() => scrollToSection(SHOPS_ID))
  }

  function handleShopItem(id: string | 'All') {
    setShopItemId(id)
    if (id !== 'All') {
      setSelectedItemId(id)
      setParams({ item: id }, { replace: true })
    } else {
      setParams({}, { replace: true })
    }
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
            selectedItemId={selectedItemId}
            onShowShops={handleShowShops}
          />
        </div>

        <div className="mt-12">
          <ShopExplorer
            items={items}
            selectedItemId={shopItemId}
            onSelectItem={handleShopItem}
          />
        </div>
      </main>
      {!embedded && <Footer />}
    </>
  )
}
