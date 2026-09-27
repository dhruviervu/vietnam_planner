import { restaurantImages } from './foodMedia'
import type {
  FoodCity,
  Restaurant,
  RestaurantFilter,
  RestaurantKind,
  RestaurantPriceLevel,
  RestaurantSort,
} from './types'

export const FOOD_CITIES: FoodCity[] = [
  'Hanoi',
  'Ninh Binh',
  'Hue',
  'Da Nang',
  'Hoi An',
  'Ho Chi Minh City',
  'Nha Trang',
  'Da Lat',
]

export const PRICE_CHIPS: { id: RestaurantPriceLevel; label: string; hint: string }[] = [
  { id: 1, label: '$ Street', hint: 'Stools, bowls, walk-away' },
  { id: 2, label: '$$ Casual', hint: 'A table, still everyday' },
  { id: 3, label: '$$$ Sit-down', hint: 'A proper restaurant' },
  { id: 4, label: '$$$$ Special', hint: 'Dress-up night' },
]

export const KIND_CHIPS: { id: RestaurantKind; label: string; hint: string }[] = [
  { id: 'tourist-favorite', label: 'Traveller classics', hint: 'Most reviewed by visitors' },
  { id: 'local-table', label: 'Local tables', hint: 'Places locals send guests' },
]

const REGION: Record<FoodCity, Restaurant['region']> = {
  Hanoi: 'North',
  'Ninh Binh': 'North',
  Hue: 'Central',
  'Da Nang': 'Central',
  'Hoi An': 'Central',
  'Ho Chi Minh City': 'South',
  'Nha Trang': 'Central',
  'Da Lat': 'Central',
}

function listingUrl(name: string, address: string, city: FoodCity) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${name}, ${address}, ${city}, Vietnam`,
  )}`
}

function slug(name: string, city: FoodCity, dish: string) {
  return `${dish}-${city}-${name}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

type Seed = {
  name: string
  city: FoodCity
  neighborhood: string
  address: string
  dishes: string[]
  rating: number
  reviews: number
  price: RestaurantPriceLevel
  kind: RestaurantKind
  alcohol: boolean
  smoking: boolean
  outdoor: boolean
  km: number
  hours: string
  blurb: string
}

function toRestaurant(seed: Seed): Restaurant {
  const dish = seed.dishes[0] ?? 'pho'
  const url = listingUrl(seed.name, seed.address, seed.city)
  return {
    id: slug(seed.name, seed.city, dish),
    name: seed.name,
    city: seed.city,
    region: REGION[seed.city],
    neighborhood: seed.neighborhood,
    address: seed.address,
    images: restaurantImages(dish),
    specialityDishIds: seed.dishes,
    rating: seed.rating,
    reviewCount: seed.reviews,
    priceLevel: seed.price,
    kind: seed.kind,
    openNow: true,
    openingHours: seed.hours,
    outdoorSeating: seed.outdoor,
    servesAlcohol: seed.alcohol,
    allowsSmoking: seed.smoking,
    distanceKm: seed.km,
    mapUrl: url,
    listingUrl: url,
    menuOrReviews: seed.blurb,
    featured: seed.reviews > 4000,
  }
}

/**
 * Shortlist of places travellers actually plan around: Google/TripAdvisor volume,
 * Michelin/guide mentions, or rooms locals send guests to that still work for visitors.
 * No invented alley stalls to pad a dish × city grid.
 */
const SEEDS: Seed[] = [
  // —— Hanoi
  { name: 'Phở 10 Lý Quốc Sư', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '10 Lý Quốc Sư, Hoàn Kiếm', dishes: ['pho'], rating: 4.5, reviews: 22100, price: 2, kind: 'tourist-favorite', alcohol: false, smoking: false, outdoor: false, km: 0.9, hours: '6:00–22:00', blurb: 'The bowl most visitors photograph. Ask for the original shop at number 10; tái gầu is the usual first order.' },
  { name: 'Phở Gia Truyền Bát Đàn', city: 'Hanoi', neighborhood: 'Old Quarter', address: '49 Bát Đàn, Hoàn Kiếm', dishes: ['pho'], rating: 4.6, reviews: 18420, price: 1, kind: 'tourist-favorite', alcohol: false, smoking: true, outdoor: false, km: 1.1, hours: '6:00–14:00', blurb: 'Dawn queue, clear northern broth, stools. Go for tái nạm and skip the extras — this is the classic Hanoi cup.' },
  { name: 'Phở Thìn Lò Đúc', city: 'Hanoi', neighborhood: 'Hai Bà Trưng', address: '13 Lò Đúc, Hai Bà Trưng', dishes: ['pho'], rating: 4.5, reviews: 15200, price: 1, kind: 'tourist-favorite', alcohol: false, smoking: true, outdoor: false, km: 1.8, hours: '6:00–20:00', blurb: 'Flash-seared beef tossed in the bowl. The smoky edge is the point, not the décor.' },
  { name: 'Bún Chả Hương Liên', city: 'Hanoi', neighborhood: 'Hai Bà Trưng', address: '24 Lê Văn Hưu, Hai Bà Trưng', dishes: ['bun-cha'], rating: 4.4, reviews: 12600, price: 2, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: false, km: 1.6, hours: '8:00–20:00', blurb: 'The Obama table is still there. Order the combo — grilled pork, nem, Hanoi beer — and expect cameras.' },
  { name: 'Bánh Mì 25', city: 'Hanoi', neighborhood: 'Old Quarter', address: '25 Hàng Cá, Hoàn Kiếm', dishes: ['banh-mi'], rating: 4.6, reviews: 9800, price: 1, kind: 'tourist-favorite', alcohol: false, smoking: false, outdoor: false, km: 0.8, hours: '7:00–21:00', blurb: 'Old Quarter loaf with a real crackle. Pork and pickle is the safe order; the queue moves.' },
  { name: 'Café Giang', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '39 Nguyễn Hữu Huân, Hoàn Kiếm', dishes: ['ca-phe-trung'], rating: 4.5, reviews: 18400, price: 2, kind: 'tourist-favorite', alcohol: false, smoking: false, outdoor: false, km: 0.9, hours: '7:00–22:00', blurb: 'Where egg coffee started. Spoon the foam, then stir. Upstairs is quieter than the door.' },
  { name: 'Café Đinh', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '13 Đinh Liệt, Hoàn Kiếm', dishes: ['ca-phe-trung'], rating: 4.6, reviews: 3600, price: 2, kind: 'tourist-favorite', alcohol: false, smoking: false, outdoor: false, km: 1.0, hours: '8:00–23:00', blurb: 'Hidden rooms, thicker egg cream, rooftop light. A traveller café that still tastes like Hanoi.' },
  { name: 'Quán Ăn Ngon', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '18 Phan Bội Châu, Hoàn Kiếm', dishes: ['pho', 'bun-cha', 'goi-cuon', 'banh-mi', 'bun-bo-hue'], rating: 4.4, reviews: 8900, price: 2, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.2, hours: '7:00–22:00', blurb: 'Street-stall classics under one roof — useful when the group wants different bowls without a scavenger hunt.' },
  { name: 'Bún Chả Tạ', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '21 Nguyễn Hữu Huân, Hoàn Kiếm', dishes: ['bun-cha'], rating: 4.6, reviews: 3200, price: 1, kind: 'local-table', alcohol: false, smoking: false, outdoor: false, km: 0.9, hours: '10:00–14:00, 17:00–20:00', blurb: 'Michelin-noted charcoal pork. Locals send guests here when Hương Liên feels like a photoshoot.' },
  { name: 'Bún Chả Đắc Kim', city: 'Hanoi', neighborhood: 'Old Quarter', address: '1 Hàng Mành, Hoàn Kiếm', dishes: ['bun-cha'], rating: 4.5, reviews: 4100, price: 1, kind: 'local-table', alcohol: false, smoking: true, outdoor: false, km: 1.0, hours: '10:00–14:00, 17:00–20:00', blurb: 'Old Quarter lunch rooms, real smoke on the patties, papaya on the side. A Hanoi weekday plate.' },
  { name: 'KOTO Văn Miếu', city: 'Hanoi', neighborhood: 'Ba Đình', address: '59 Văn Miếu, Đống Đa', dishes: ['goi-cuon', 'pho', 'bun-cha'], rating: 4.5, reviews: 5400, price: 3, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: false, km: 2.0, hours: '11:00–22:00', blurb: 'Training restaurant beside the Temple of Literature. Clean Vietnamese plates, English menus, a table you can linger at.' },
  { name: 'New Day Restaurant', city: 'Hanoi', neighborhood: 'Old Quarter', address: '72 Hàng Bé, Hoàn Kiếm', dishes: ['pho', 'bun-cha', 'goi-cuon'], rating: 4.6, reviews: 7200, price: 2, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: false, km: 0.8, hours: '8:00–23:00', blurb: 'Old Quarter rooms built for visitors who still want Vietnamese food — set menus, cold beer, no mystery bill.' },
  { name: 'Home Hanoi Restaurant', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '34 Châu Long, Ba Đình', dishes: ['goi-cuon', 'bun-cha'], rating: 4.6, reviews: 2800, price: 3, kind: 'local-table', alcohol: true, smoking: false, outdoor: false, km: 2.2, hours: '11:00–22:00', blurb: 'Townhouse cooking, herb-heavy plates. A local table that still works if you want a quieter dinner.' },
  { name: 'Madame Hien', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '15 Châu Long, Ba Đình', dishes: ['goi-cuon', 'pho'], rating: 4.6, reviews: 2100, price: 4, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 2.1, hours: '11:30–14:00, 18:00–22:00', blurb: 'Sofitel garden villa. Vietnamese cooking in a colonial house — book if you want a dress-up Hanoi night.' },
  { name: 'La Badiane', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '10 Nam Ngư, Hoàn Kiếm', dishes: ['goi-cuon'], rating: 4.7, reviews: 2600, price: 4, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.4, hours: '11:30–14:00, 18:00–22:00', blurb: 'French-Vietnamese courtyard. Not a pho shop — the special-night table visitors save for the last evening.' },

  // —— Ho Chi Minh City
  { name: 'Phở Hòa Pasteur', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: '260 Pasteur, District 3', dishes: ['pho'], rating: 4.5, reviews: 19800, price: 2, kind: 'tourist-favorite', alcohol: false, smoking: false, outdoor: false, km: 1.6, hours: '6:00–23:00', blurb: 'Saigon’s most-cited bowl. Herb plate, hoisin, sweeter southern broth — tái nam is the usual order.' },
  { name: 'Phở 2000', city: 'Ho Chi Minh City', neighborhood: 'Bến Thành', address: '1-3 Phan Chu Trinh, District 1', dishes: ['pho'], rating: 4.2, reviews: 8900, price: 2, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: false, km: 0.9, hours: '6:00–23:00', blurb: 'Beside Bến Thành, air-con rooms, Clinton-era fame. A reliable tái after the market — not a hidden gem.' },
  { name: 'Bánh Mì Huỳnh Hoa', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '26 Lê Thị Riêng, District 1', dishes: ['banh-mi'], rating: 4.6, reviews: 16400, price: 1, kind: 'tourist-favorite', alcohol: false, smoking: false, outdoor: true, km: 1.1, hours: '14:30–23:00', blurb: 'The overloaded Saigon loaf. Afternoon queue, cold cuts, chilli. Go hungry; it is a meal.' },
  { name: 'Bánh Mì Hòa Mã', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: '53 Hòa Mã, District 3', dishes: ['banh-mi'], rating: 4.5, reviews: 4200, price: 1, kind: 'local-table', alcohol: false, smoking: true, outdoor: true, km: 1.8, hours: '6:00–13:00', blurb: 'Breakfast institution. Lighter, older-Saigon sandwich than Huỳnh Hoa — locals still send first-timers here.' },
  { name: 'Cơm Tấm Bà Ghiền', city: 'Ho Chi Minh City', neighborhood: 'Phú Nhuận', address: '84 Đặng Văn Ngữ, Phú Nhuận', dishes: ['com-tam'], rating: 4.6, reviews: 9800, price: 2, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: false, km: 2.4, hours: '10:00–22:00', blurb: 'Charcoal pork chop over broken rice. The grill crust is why travellers cab out of District 1.' },
  { name: 'Cơm Tấm Cali Nguyễn Trãi', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: 'Nguyễn Trãi, District 1', dishes: ['com-tam'], rating: 4.3, reviews: 4200, price: 2, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: false, km: 1.6, hours: '10:00–22:00', blurb: 'Air-con chain with a serious chop. Late hours, English menu, no scavenger hunt for a plate.' },
  { name: 'Bún Chả 44', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: '44 Nguyễn Thị Minh Khai, District 3', dishes: ['bun-cha'], rating: 4.3, reviews: 1100, price: 2, kind: 'local-table', alcohol: true, smoking: false, outdoor: false, km: 1.5, hours: '11:00–21:00', blurb: 'Hanoi-style grilled pork in Saigon. The dipping broth is the point — a local table, not a novelty.' },
  { name: 'Bún Bò Huế Nam Giao', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: '221 Võ Thị Sáu, District 3', dishes: ['bun-bo-hue'], rating: 4.5, reviews: 2400, price: 2, kind: 'local-table', alcohol: false, smoking: false, outdoor: false, km: 1.9, hours: '6:00–14:00, 17:00–21:00', blurb: 'Serious Huế broth in Saigon. Shrimp paste, thick noodles — a local table that still welcomes visitors.' },
  { name: 'Ngon Restaurant', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '160 Pasteur, District 1', dishes: ['goi-cuon', 'pho', 'com-tam', 'banh-mi'], rating: 4.3, reviews: 6100, price: 2, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.0, hours: '8:00–22:00', blurb: 'Colonial villa, street-food stalls in the garden. Easy first night in D1 when nobody wants to pick one dish.' },
  { name: 'Cuc Gach Quan', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '10 Đặng Tất, District 1', dishes: ['goi-cuon', 'com-tam'], rating: 4.5, reviews: 4800, price: 3, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.4, hours: '9:00–22:00', blurb: 'House restaurant, homestyle southern plates. Book for a sit-down that still tastes like Saigon.' },
  { name: 'Secret Garden', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '158 Pasteur, District 1', dishes: ['goi-cuon'], rating: 4.4, reviews: 3500, price: 3, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.1, hours: '11:00–22:00', blurb: 'Rooftop Vietnamese above D1. Rolls, clay pots, a view — a traveller dinner that is not a hotel buffet.' },
  { name: 'Hum Vegetarian', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '32 Võ Văn Tần, District 3', dishes: ['goi-cuon'], rating: 4.6, reviews: 4100, price: 3, kind: 'local-table', alcohol: true, smoking: false, outdoor: false, km: 1.7, hours: '10:00–22:00', blurb: 'Garden rooms, herb-forward Vietnamese. Locals and visitors both use it when meat is off the table.' },
  { name: 'Anan Saigon', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '89 Tôn Thất Đạm, District 1', dishes: ['goi-cuon', 'pho'], rating: 4.6, reviews: 1900, price: 4, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: false, km: 0.9, hours: '18:00–23:00', blurb: 'Tasting-menu Vietnamese above Bến Thành. Book ahead — this is the special-night Saigon table.' },
  { name: 'The Refinery', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '74 Hai Bà Trưng, District 1', dishes: ['goi-cuon'], rating: 4.4, reviews: 3200, price: 4, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.2, hours: '11:00–23:00', blurb: 'Opéra House terrace, French-Saigon cooking. A dress-up lunch after the colonial walk.' },

  // —— Hue
  { name: 'Bún Bò Huế Hạnh', city: 'Hue', neighborhood: 'Hue Center', address: '11 Lê Lợi, Hue', dishes: ['bun-bo-hue'], rating: 4.6, reviews: 2800, price: 1, kind: 'tourist-favorite', alcohol: false, smoking: false, outdoor: false, km: 1.1, hours: '6:00–13:00', blurb: 'Citadel-side bowl visitors actually find. Lemongrass, shrimp paste, heat you can ask to tone down.' },
  { name: 'Huyền Anh', city: 'Hue', neighborhood: 'Hue Center', address: '1 Nguyễn Công Trứ, Hue', dishes: ['bun-bo-hue'], rating: 4.5, reviews: 1900, price: 1, kind: 'local-table', alcohol: false, smoking: false, outdoor: false, km: 1.4, hours: '6:00–13:00', blurb: 'Family shop Huế people still use. Funky mắm ruốc, thick noodles — go before it sells down.' },
  { name: 'Quán Hạnh', city: 'Hue', neighborhood: 'Dong Ba', address: '11 Lê Thánh Tôn, Hue', dishes: ['bun-bo-hue', 'banh-mi'], rating: 4.4, reviews: 1600, price: 1, kind: 'local-table', alcohol: false, smoking: true, outdoor: true, km: 0.9, hours: '6:00–14:00', blurb: 'Market-side intensity. Hock, chilli oil, a loaf if you want something to walk with.' },
  { name: 'Nina’s Café', city: 'Hue', neighborhood: 'Hue Center', address: '16/34 Nguyễn Tri Phương, Hue', dishes: ['goi-cuon', 'bun-bo-hue'], rating: 4.7, reviews: 4200, price: 2, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.3, hours: '9:00–21:00', blurb: 'Garden café with a Vietnamese kitchen visitors trust — rolls, imperial small plates, English menus.' },
  { name: 'Hôm Care', city: 'Hue', neighborhood: 'Hue Center', address: '11 Nguyễn Công Trứ, Hue', dishes: ['goi-cuon', 'bun-bo-hue'], rating: 4.6, reviews: 1800, price: 2, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: false, km: 1.4, hours: '10:00–21:00', blurb: 'Social-enterprise kitchen. Clean Hue cooking, a table you can sit at after the citadel.' },
  { name: 'Les Jardins De La Carambole', city: 'Hue', neighborhood: 'Hue Citadel', address: '32 Đặng Trần Côn, Hue', dishes: ['goi-cuon'], rating: 4.5, reviews: 2400, price: 3, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.0, hours: '11:00–22:00', blurb: 'French-Vietnamese inside the citadel walls. The sit-down dinner after tomb days.' },
  { name: 'Ancient Hue Restaurant', city: 'Hue', neighborhood: 'Hue Center', address: '4/8/13 Đội Cung, Hue', dishes: ['goi-cuon', 'bun-bo-hue'], rating: 4.5, reviews: 1500, price: 4, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.6, hours: '11:00–14:00, 18:00–22:00', blurb: 'Garden compound, imperial-style service. Book for a Hue night that is not a street stool.' },
  { name: 'Tinh Gia Vien', city: 'Hue', neighborhood: 'Hue Center', address: '20/3 Nguyễn Công Trứ, Hue', dishes: ['goi-cuon'], rating: 4.4, reviews: 980, price: 4, kind: 'local-table', alcohol: true, smoking: false, outdoor: true, km: 1.5, hours: '10:00–22:00', blurb: 'Royal-garden cooking. Locals celebrate here; visitors who want Hue beyond bun bo book a table.' },

  // —— Da Nang
  { name: 'Bún Bò Huế Bà Dưỡng', city: 'Da Nang', neighborhood: 'Hải Châu', address: 'K280/17 Hoàng Diệu, Hải Châu', dishes: ['bun-bo-hue'], rating: 4.7, reviews: 8900, price: 1, kind: 'tourist-favorite', alcohol: false, smoking: false, outdoor: false, km: 2.0, hours: '5:30–13:00', blurb: 'Da Nang’s most famous Huế bowl. Arrive before 10am. Lemongrass is the whole point.' },
  { name: 'Bánh Mì Bà Lan', city: 'Da Nang', neighborhood: 'Hải Châu', address: '4 Ông Ích Khiêm, Hải Châu', dishes: ['banh-mi'], rating: 4.6, reviews: 4300, price: 1, kind: 'tourist-favorite', alcohol: false, smoking: false, outdoor: false, km: 1.3, hours: '6:00–20:00', blurb: 'The loaf visitors are sent to. Pâté, airy baguette, a queue that still moves.' },
  { name: 'Bánh Mì Tuyết', city: 'Da Nang', neighborhood: 'Hải Châu', address: '159 Lê Duẩn, Hải Châu', dishes: ['banh-mi'], rating: 4.5, reviews: 2100, price: 1, kind: 'local-table', alcohol: false, smoking: true, outdoor: true, km: 1.6, hours: '6:00–21:00', blurb: 'Local counter with a chilli that bites. Grilled pork — a Da Nang loaf without the guidebook crush.' },
  { name: 'Bếp Lai', city: 'Da Nang', neighborhood: 'Hải Châu', address: '15 Nguyễn Văn Linh, Hải Châu', dishes: ['goi-cuon', 'pho', 'com-tam'], rating: 4.5, reviews: 1600, price: 2, kind: 'local-table', alcohol: true, smoking: false, outdoor: false, km: 1.5, hours: '10:00–22:00', blurb: 'Vietnamese kitchen river-side visitors use when they want a table, not a stool.' },
  { name: 'Madame Lan', city: 'Da Nang', neighborhood: 'Hải Châu', address: '4 Bạch Đằng, Hải Châu', dishes: ['goi-cuon', 'cao-lau'], rating: 4.4, reviews: 2800, price: 3, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.1, hours: '10:00–22:00', blurb: 'Riverfront Vietnamese, cao lầu if you missed Hội An, rolls if you want something lighter.' },
  { name: 'Waterfront', city: 'Da Nang', neighborhood: 'Hải Châu', address: '150 Bạch Đằng, Hải Châu', dishes: ['goi-cuon'], rating: 4.4, reviews: 3100, price: 3, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.0, hours: '10:00–23:00', blurb: 'Han River terrace. Vietnamese and Western plates — the sit-down after Mỹ Khê.' },
  { name: 'Bé Mặn Hải Sản', city: 'Da Nang', neighborhood: 'Sơn Trà', address: '218 Nguyễn Văn Thoại, Sơn Trà', dishes: ['goi-cuon'], rating: 4.5, reviews: 2200, price: 3, kind: 'local-table', alcohol: true, smoking: false, outdoor: true, km: 3.2, hours: '10:00–22:00', blurb: 'Seafood house east of the river. Confirm weight prices — this is the local table visitors still enjoy.' },
  { name: 'Fatfish', city: 'Da Nang', neighborhood: 'Sơn Trà', address: '439 Trần Hưng Đạo, Sơn Trà', dishes: ['goi-cuon'], rating: 4.5, reviews: 1800, price: 4, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 2.8, hours: '11:00–23:00', blurb: 'River-mouth terrace, cocktail list, Vietnamese-leaning plates. A Da Nang special night without a hotel dining room.' },

  // —— Hoi An
  { name: 'Bánh Mì Phượng', city: 'Hoi An', neighborhood: 'Old Town', address: '2B Phan Chu Trinh, Hoi An', dishes: ['banh-mi'], rating: 4.4, reviews: 18900, price: 1, kind: 'tourist-favorite', alcohol: false, smoking: false, outdoor: true, km: 0.8, hours: '7:00–21:00', blurb: 'Bourdain-famous. The loaf is still the reason; go early. Pork and chilli is the usual order.' },
  { name: 'Madam Khánh Bánh Mì', city: 'Hoi An', neighborhood: 'Old Town', address: '115 Trần Cao Vân, Hoi An', dishes: ['banh-mi'], rating: 4.7, reviews: 6400, price: 1, kind: 'local-table', alcohol: false, smoking: false, outdoor: true, km: 1.2, hours: '7:00–19:00', blurb: 'Bánh Mì Queen. She builds heat and herbs in front of you — the local loaf travellers prefer once they find it.' },
  { name: 'Cao Lầu Thanh', city: 'Hoi An', neighborhood: 'Old Town', address: '48 Trần Hưng Đạo, Hoi An', dishes: ['cao-lau'], rating: 4.5, reviews: 2800, price: 1, kind: 'tourist-favorite', alcohol: false, smoking: false, outdoor: true, km: 1.1, hours: '9:00–21:00', blurb: 'Chewy noodles, roast pork, crackling. The Hội An bowl to try before a restaurant menu version.' },
  { name: 'Quán Cao Lầu Bà Bé', city: 'Hoi An', neighborhood: 'Old Town', address: '8 Trần Hưng Đạo, Hoi An', dishes: ['cao-lau'], rating: 4.6, reviews: 1600, price: 1, kind: 'local-table', alcohol: false, smoking: true, outdoor: false, km: 1.0, hours: '9:00–20:00', blurb: 'No-frills specialist. The noodle bounce is why locals still point at this door.' },
  { name: 'Bale Well', city: 'Hoi An', neighborhood: 'Old Town', address: '45 Trần Cao Vân, Hoi An', dishes: ['goi-cuon'], rating: 4.5, reviews: 7200, price: 2, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.0, hours: '10:00–21:00', blurb: 'Grilled pork, rice paper, herbs — you wrap at the table. A visitor ritual that is still a good meal.' },
  { name: 'Morning Glory', city: 'Hoi An', neighborhood: 'Old Town', address: '106 Nguyễn Thái Học, Hoi An', dishes: ['cao-lau', 'goi-cuon', 'pho'], rating: 4.4, reviews: 9200, price: 3, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: false, km: 0.9, hours: '10:00–21:30', blurb: 'Ms Vy’s restaurant kitchen. Cao lầu, rolls, a table with a menu — book or queue.' },
  { name: 'Cargo Club', city: 'Hoi An', neighborhood: 'Old Town', address: '107 Nguyễn Thái Học, Hoi An', dishes: ['goi-cuon', 'cao-lau'], rating: 4.5, reviews: 4800, price: 3, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 0.9, hours: '8:00–23:00', blurb: 'River rooms, Vietnamese and bakery. The sit-down after the lantern walk.' },
  { name: 'Green Mango', city: 'Hoi An', neighborhood: 'Old Town', address: '54 Nguyễn Thái Học, Hoi An', dishes: ['goi-cuon', 'cao-lau'], rating: 4.4, reviews: 2100, price: 4, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 0.8, hours: '11:00–23:00', blurb: 'Old-house fine dining on the river. Special-night Hội An — book the balcony if you can.' },
  { name: 'Streets Restaurant', city: 'Hoi An', neighborhood: 'Old Town', address: '17 Lê Lợi, Hoi An', dishes: ['cao-lau', 'goi-cuon'], rating: 4.6, reviews: 1900, price: 3, kind: 'local-table', alcohol: true, smoking: false, outdoor: false, km: 1.0, hours: '11:00–22:00', blurb: 'Training kitchen with a proper cao lầu. A local table that is built for guests.' },

  // —— Ninh Binh
  { name: 'Trung Tuyet Restaurant', city: 'Ninh Binh', neighborhood: 'Town center', address: '14 Hoàng Hoa Thám, Ninh Bình', dishes: ['pho', 'goi-cuon', 'com-tam'], rating: 4.4, reviews: 2100, price: 2, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: false, km: 1.2, hours: '8:00–22:00', blurb: 'Town-centre Vietnamese visitors use between Tràng An days. English menu, goat if you want the regional plate.' },
  { name: 'Chookie’s', city: 'Ninh Binh', neighborhood: 'Town center', address: '17 Phạm Ngũ Lão, Ninh Bình', dishes: ['banh-mi', 'goi-cuon', 'ca-phe-trung'], rating: 4.5, reviews: 1800, price: 2, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.1, hours: '7:00–22:00', blurb: 'Cafe-restaurant on the tourist strip. Loaf, rolls, egg coffee — the easy table before a boat.' },
  { name: 'Phở Thanh', city: 'Ninh Binh', neighborhood: 'Town center', address: 'Trần Hưng Đạo, Ninh Bình', dishes: ['pho'], rating: 4.4, reviews: 860, price: 1, kind: 'local-table', alcohol: false, smoking: false, outdoor: false, km: 1.4, hours: '6:00–14:00', blurb: 'Morning bowl the town actually uses. Honest northern-leaning pho before the limestone day.' },
  { name: 'Bánh Mì 24 Ninh Bình', city: 'Ninh Binh', neighborhood: 'Town center', address: 'Trần Hưng Đạo, Ninh Bình', dishes: ['banh-mi'], rating: 4.4, reviews: 720, price: 1, kind: 'local-table', alcohol: false, smoking: true, outdoor: true, km: 1.3, hours: '6:30–20:00', blurb: 'Walk-away loaf with pâté that still snaps. Fuel for Tam Cốc, not a destination dining room.' },
  { name: 'Nhà Hàng Dê Núi Ninh Bình', city: 'Ninh Binh', neighborhood: 'Hoa Lư', address: 'Trường Yên, Hoa Lư', dishes: ['com-tam', 'goi-cuon'], rating: 4.5, reviews: 1400, price: 3, kind: 'local-table', alcohol: true, smoking: false, outdoor: true, km: 4.8, hours: '10:00–21:00', blurb: 'Goat and herb house near Hoa Lư. The regional sit-down — confirm the grill, not a mystery set menu.' },
  { name: 'Tam Coc Garden Restaurant', city: 'Ninh Binh', neighborhood: 'Tam Cốc', address: 'Hải Nham, Ninh Hải, Hoa Lư', dishes: ['goi-cuon'], rating: 4.6, reviews: 980, price: 4, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 5.2, hours: '11:00–14:00, 18:00–21:30', blurb: 'Resort kitchen in the paddies. Book the garden table for a Ninh Binh night that is not a roadside grill.' },

  // —— Nha Trang
  { name: 'Lạc Cảnh', city: 'Nha Trang', neighborhood: 'Center', address: '44 Nguyễn Bỉnh Khiêm, Nha Trang', dishes: ['com-tam', 'goi-cuon'], rating: 4.4, reviews: 5400, price: 2, kind: 'local-table', alcohol: true, smoking: true, outdoor: false, km: 1.6, hours: '15:00–22:00', blurb: 'Tabletop charcoal beef. Locals and visitors share the smoke — this is the Nha Trang grill worth the cab inland.' },
  { name: 'Lanterns', city: 'Nha Trang', neighborhood: 'Center', address: '72 Nguyễn Thiện Thuật, Nha Trang', dishes: ['goi-cuon', 'pho', 'bun-bo-hue'], rating: 4.5, reviews: 3200, price: 2, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: false, km: 1.4, hours: '11:00–22:00', blurb: 'Vietnamese kitchen off the beach strip. Rolls, pho, Huế noodles — skip the Trần Phú tourist seafood gauntlet.' },
  { name: 'Bánh Mì Xíu Mại Nha Trang', city: 'Nha Trang', neighborhood: 'Center', address: 'Hoàng Hoa Thám, Nha Trang', dishes: ['banh-mi'], rating: 4.5, reviews: 1100, price: 1, kind: 'local-table', alcohol: false, smoking: true, outdoor: true, km: 1.7, hours: '6:00–20:00', blurb: 'Meatball loaf the town eats. A better sandwich than the beachfront carts.' },
  { name: 'Phở 79 Trần Phú', city: 'Nha Trang', neighborhood: 'Beachfront', address: '79 Trần Phú, Nha Trang', dishes: ['pho'], rating: 4.4, reviews: 2100, price: 1, kind: 'tourist-favorite', alcohol: false, smoking: false, outdoor: true, km: 0.9, hours: '6:00–21:00', blurb: 'Sea-road bowl with enough reviews to trust. Sweeter than Hanoi — a solid cup after the water.' },
  { name: 'Omar’s Nha Trang', city: 'Nha Trang', neighborhood: 'Beachfront', address: '96A/8 Trần Phú, Nha Trang', dishes: ['goi-cuon'], rating: 4.4, reviews: 1600, price: 3, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.0, hours: '11:00–23:00', blurb: 'Rooftop Vietnamese-leaning plates above the strip. A sit-down that is not a tank-seafood trap.' },
  { name: 'Sailing Club', city: 'Nha Trang', neighborhood: 'Beachfront', address: '72–74 Trần Phú, Nha Trang', dishes: ['goi-cuon'], rating: 4.3, reviews: 4100, price: 4, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 0.8, hours: '7:00–late', blurb: 'Beach club kitchen. Special-night Nha Trang — sunset table, not a street bowl.' },
  { name: 'Louisiane Brewhouse', city: 'Nha Trang', neighborhood: 'Beachfront', address: 'Lot 29 Trần Phú, Nha Trang', dishes: ['goi-cuon'], rating: 4.3, reviews: 2800, price: 3, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: true, km: 1.8, hours: '7:00–23:00', blurb: 'Pool-and-beach restaurant south of the centre. Vietnamese and grill plates with a swim after.' },

  // —— Da Lat
  { name: 'Bánh Mì Xíu Mại Đà Lạt', city: 'Da Lat', neighborhood: 'Market', address: 'Chợ Đà Lạt, Da Lat', dishes: ['banh-mi'], rating: 4.6, reviews: 2100, price: 1, kind: 'local-table', alcohol: false, smoking: true, outdoor: true, km: 1.0, hours: '6:00–19:00', blurb: 'Meatball loaf at the market. The highland sandwich travellers actually hunt for.' },
  { name: 'Nem Nướng Bà Hùng', city: 'Da Lat', neighborhood: 'Center', address: '81 Bùi Thị Xuân, Da Lat', dishes: ['goi-cuon'], rating: 4.5, reviews: 1800, price: 1, kind: 'local-table', alcohol: false, smoking: false, outdoor: false, km: 1.2, hours: '10:00–21:00', blurb: 'Grilled pork sausage you wrap in rice paper. A Da Lat local table that visitors still enjoy.' },
  { name: 'Phở 3 Tháng 2', city: 'Da Lat', neighborhood: 'Hòa Bình', address: '3 Tháng 2, Da Lat', dishes: ['pho'], rating: 4.4, reviews: 1200, price: 1, kind: 'tourist-favorite', alcohol: false, smoking: true, outdoor: true, km: 1.1, hours: '6:00–14:00', blurb: 'Highland morning bowl near the square. Steam in cool air, a clear spice.' },
  { name: 'Long Sông', city: 'Da Lat', neighborhood: 'Center', address: '173 Phan Đình Phùng, Da Lat', dishes: ['goi-cuon', 'com-tam'], rating: 4.5, reviews: 1600, price: 2, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: false, km: 1.3, hours: '10:00–22:00', blurb: 'Vietnamese kitchen visitors use for a proper plate — rice, rolls, a jumper on the chair.' },
  { name: 'Trong Dong', city: 'Da Lat', neighborhood: 'Center', address: '220 Phan Đình Phùng, Da Lat', dishes: ['goi-cuon', 'pho'], rating: 4.5, reviews: 1400, price: 3, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: false, km: 1.4, hours: '10:00–22:00', blurb: 'Sit-down Vietnamese, English menus, a fire in the room. The dinner after a waterfall day.' },
  { name: 'An Cafe', city: 'Da Lat', neighborhood: 'Center', address: 'Center, Da Lat', dishes: ['ca-phe-trung'], rating: 4.4, reviews: 980, price: 2, kind: 'tourist-favorite', alcohol: false, smoking: false, outdoor: true, km: 1.2, hours: '8:00–22:00', blurb: 'Highland terrace egg coffee. Cooler air, a sweeter cream — the cafe stop that is not a viewpoint gimmick.' },
  { name: 'Le Rabelais', city: 'Da Lat', neighborhood: 'Hòa Bình', address: '12 Trần Phú, Da Lat Palace', dishes: ['goi-cuon'], rating: 4.6, reviews: 860, price: 4, kind: 'tourist-favorite', alcohol: true, smoking: false, outdoor: false, km: 1.0, hours: '18:00–22:00', blurb: 'Dalat Palace dining room. French-Vietnamese, jacket weather — the highland special night.' },
]

export const RESTAURANTS: Restaurant[] = SEEDS.map(toRestaurant)

export function priceSymbols(level: RestaurantPriceLevel): string {
  return '$'.repeat(level)
}

function nearbyScore(r: Restaurant) {
  const km = r.distanceKm
  if (km == null) return 0
  if (km >= 0.75 && km <= 5.2) return 12 - Math.abs(2.4 - km)
  if (km < 0.75) return 5
  return Math.max(0, 7 - km)
}

function interleaveByCity(list: Restaurant[]) {
  const buckets = new Map<FoodCity, Restaurant[]>()
  for (const r of list) {
    const arr = buckets.get(r.city) ?? []
    arr.push(r)
    buckets.set(r.city, arr)
  }
  const cities = [...buckets.keys()]
  const out: Restaurant[] = []
  let i = 0
  let added = true
  while (added) {
    added = false
    for (const city of cities) {
      const next = buckets.get(city)?.[i]
      if (next) {
        out.push(next)
        added = true
      }
    }
    i += 1
  }
  return out
}

function sortList(list: Restaurant[], sort: RestaurantSort, preferNearby: boolean) {
  const ranked = [...list].sort((a, b) => {
    if (preferNearby) {
      const d = nearbyScore(b) - nearbyScore(a)
      if (Math.abs(d) > 0.2) return d
    }
    if (sort === 'best-value') {
      const va = (5 - a.priceLevel) * 18 + a.rating * 8 + Math.min(a.reviewCount / 400, 12)
      const vb = (5 - b.priceLevel) * 18 + b.rating * 8 + Math.min(b.reviewCount / 400, 12)
      return vb - va
    }
    if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount
    return b.rating - a.rating
  })
  return ranked
}

export function matchesRestaurantFilters(
  r: Restaurant,
  dishId: string | 'All',
  city: FoodCity | 'All',
  filters: RestaurantFilter,
  tripCities: FoodCity[] = [],
): boolean {
  if (dishId !== 'All' && !r.specialityDishIds.includes(dishId)) return false
  if (city !== 'All' && r.city !== city) return false
  if (city === 'All' && tripCities.length > 0 && !tripCities.includes(r.city)) return false
  if (filters.kind && r.kind !== filters.kind) return false
  if (filters.priceLevels && filters.priceLevels.length > 0 && !filters.priceLevels.includes(r.priceLevel)) {
    return false
  }
  if (filters.servesAlcohol && !r.servesAlcohol) return false
  if (filters.allowsSmoking && !r.allowsSmoking) return false
  return true
}

export function getRestaurantsForDish(
  dishId: string | 'All',
  city: FoodCity | 'All',
  sort: RestaurantSort,
  filters: RestaurantFilter,
  tripCities: FoodCity[] = [],
  options?: { skipInterleave?: boolean; preferNearby?: boolean },
): Restaurant[] {
  const list = RESTAURANTS.filter((r) =>
    matchesRestaurantFilters(r, dishId, city, filters, tripCities),
  )
  const preferNearby =
    options?.preferNearby ?? (tripCities.length > 0 && city === 'All' && !options?.skipInterleave)
  const sorted = sortList(list, sort, preferNearby)

  if (options?.skipInterleave) return sorted
  if (city === 'All' && tripCities.length === 0) return interleaveByCity(sorted)
  return sorted
}

export function citiesForDish(
  dishId: string | 'All',
  filters: RestaurantFilter = {},
  tripCities: FoodCity[] = [],
): FoodCity[] {
  const source = RESTAURANTS.filter((r) =>
    matchesRestaurantFilters(r, dishId, 'All', { ...filters }, tripCities),
  )
  const set = new Set(source.map((r) => r.city))
  return FOOD_CITIES.filter((c) => set.has(c))
}

export function restaurantCityCounts(
  dishId: string | 'All',
  filters: RestaurantFilter = {},
  tripCities: FoodCity[] = [],
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const r of RESTAURANTS) {
    if (!matchesRestaurantFilters(r, dishId, 'All', filters, tripCities)) continue
    counts[r.city] = (counts[r.city] ?? 0) + 1
  }
  return counts
}

export function restaurantDishCounts(
  city: FoodCity | 'All' = 'All',
  filters: RestaurantFilter = {},
  tripCities: FoodCity[] = [],
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const r of RESTAURANTS) {
    if (!matchesRestaurantFilters(r, 'All', city, filters, tripCities)) continue
    for (const id of r.specialityDishIds) {
      counts[id] = (counts[id] ?? 0) + 1
    }
  }
  return counts
}

export function restaurantPriceCounts(
  dishId: string | 'All',
  city: FoodCity | 'All',
  filters: RestaurantFilter,
  tripCities: FoodCity[] = [],
): Record<RestaurantPriceLevel, number> {
  const withoutPrice: RestaurantFilter = { ...filters, priceLevels: [] }
  const counts: Record<RestaurantPriceLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
  for (const r of RESTAURANTS) {
    if (!matchesRestaurantFilters(r, dishId, city, withoutPrice, tripCities)) continue
    counts[r.priceLevel] += 1
  }
  return counts
}

export function restaurantKindCounts(
  dishId: string | 'All',
  city: FoodCity | 'All',
  filters: RestaurantFilter,
  tripCities: FoodCity[] = [],
): Record<RestaurantKind, number> {
  const withoutKind: RestaurantFilter = { ...filters, kind: undefined }
  const counts: Record<RestaurantKind, number> = {
    'tourist-favorite': 0,
    'local-table': 0,
  }
  for (const r of RESTAURANTS) {
    if (!matchesRestaurantFilters(r, dishId, city, withoutKind, tripCities)) continue
    counts[r.kind] += 1
  }
  return counts
}
