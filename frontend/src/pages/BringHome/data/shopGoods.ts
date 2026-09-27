import type { ShopGoodsCategory } from './types'

/** Places that actually sell these goods — not every market on the map. */
const APPAREL = new Set([
  'dong-xuan',
  'hang-gai-silk',
  'van-phuc',
  'hoian-tailor',
  'hoian-silk-village',
  'hoian-central-market',
  'hoian-night-market',
  'ben-thanh',
  'saigon-square',
  'hanoi-night-market',
  'trang-tien-plaza',
  'lotte-center-hanoi',
  'vincom-da-nang',
  'vincom-dong-khoi',
  'takashimaya-saigon',
  'danang-han-market',
  'con-market',
  'hue-dong-ba',
  'dam-nha-trang',
  'dalat-night-market',
  'dalat-market',
  'sapa-night-market',
  'sapa-central-market',
  'bac-ha-market',
  'nhatrang-night-market',
  'son-tra-night-market',
  'phu-quoc-night-market',
  'can-tho-night-market',
  'ha-long-night-market',
  'cat-ba-night-market',
  'cat-ba-market',
  'phu-cam-hats',
  'xq-nha-trang',
  'xq-da-lat',
  'van-lam-embroidery',
  'bai-chay-commercial',
  'hon-gai-market',
  'duong-dong-market',
  'dong-van-market',
  'dong-van-ancient-market',
  'ha-giang-central-market',
  'meo-vac-sunday-market',
  'tam-coc-night-market',
  'cho-rong-market',
  'binh-tay',
  'phong-nha-main-street',
])

const BAGS = new Set([
  'dong-xuan',
  'hang-gai-silk',
  'ben-thanh',
  'saigon-square',
  'hanoi-night-market',
  'trang-tien-plaza',
  'lotte-center-hanoi',
  'vincom-da-nang',
  'vincom-dong-khoi',
  'takashimaya-saigon',
  'danang-han-market',
  'con-market',
  'hue-dong-ba',
  'dam-nha-trang',
  'dalat-night-market',
  'sapa-night-market',
  'sapa-central-market',
  'bac-ha-market',
  'nhatrang-night-market',
  'son-tra-night-market',
  'phu-quoc-night-market',
  'can-tho-night-market',
  'ha-long-night-market',
  'cat-ba-night-market',
  'bai-chay-commercial',
  'hon-gai-market',
  'duong-dong-market',
  'binh-tay',
  'hoian-central-market',
  'hoian-night-market',
  'hoian-leather',
])

const FOOTWEAR = new Set([
  'dong-xuan',
  'ben-thanh',
  'saigon-square',
  'hanoi-night-market',
  'lotte-center-hanoi',
  'trang-tien-plaza',
  'vincom-da-nang',
  'vincom-dong-khoi',
  'takashimaya-saigon',
  'danang-han-market',
  'con-market',
  'hue-dong-ba',
  'dam-nha-trang',
  'nhatrang-night-market',
  'dalat-night-market',
  'dalat-market',
  'son-tra-night-market',
  'binh-tay',
  'hoian-central-market',
  'bai-chay-commercial',
  'hon-gai-market',
  'duong-dong-market',
])

/** Malls with electronics floors, plus dedicated appliance / computer stores — not snack markets. */
const ELECTRONICS = new Set([
  'lotte-center-hanoi',
  'vincom-da-nang',
  'vincom-dong-khoi',
  'takashimaya-saigon',
  'bai-chay-commercial',
  'dong-xuan',
  'pico-hanoi',
  'phong-vu-hcmc',
  'nguyen-kim-hcmc',
])

export const SHOP_GOODS_FILTERS: { id: ShopGoodsCategory; label: string }[] = [
  { id: 'apparel', label: 'Clothes / apparel' },
  { id: 'bags', label: 'Bags' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'electronics', label: 'Electronics' },
]

export const SHOP_GOODS_LABELS: Record<ShopGoodsCategory, string> = {
  apparel: 'Apparel',
  bags: 'Bags',
  footwear: 'Footwear',
  electronics: 'Electronics',
}

export function goodsCategoriesForShop(id: string): ShopGoodsCategory[] {
  const out: ShopGoodsCategory[] = []
  if (APPAREL.has(id)) out.push('apparel')
  if (BAGS.has(id)) out.push('bags')
  if (FOOTWEAR.has(id)) out.push('footwear')
  if (ELECTRONICS.has(id)) out.push('electronics')
  return out
}
