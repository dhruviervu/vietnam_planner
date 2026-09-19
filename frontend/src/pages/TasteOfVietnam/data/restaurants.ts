import { restaurantImages } from './foodMedia'
import type { FoodCity, Restaurant, RestaurantFilter, RestaurantSort } from './types'

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
  dish: string
  rating: number
  reviews: number
  price: 1 | 2 | 3 | 4
  alcohol: boolean
  smoking: boolean
  outdoor: boolean
  km: number
  hours: string
  blurb: string
}

function toRestaurant(seed: Seed): Restaurant {
  const url = listingUrl(seed.name, seed.address, seed.city)
  const photos = restaurantImages(seed.dish)
  return {
    id: slug(seed.name, seed.city, seed.dish),
    name: seed.name,
    city: seed.city,
    region: REGION[seed.city],
    neighborhood: seed.neighborhood,
    address: seed.address,
    images: photos,
    specialityDishIds: [seed.dish],
    rating: seed.rating,
    reviewCount: seed.reviews,
    priceLevel: seed.price,
    openNow: true,
    openingHours: seed.hours,
    outdoorSeating: seed.outdoor,
    servesAlcohol: seed.alcohol,
    allowsSmoking: seed.smoking,
    distanceKm: seed.km,
    mapUrl: url,
    listingUrl: url,
    menuOrReviews: seed.blurb,
    featured: seed.reviews > 5000,
  }
}

const SEEDS: Seed[] = [
  // —— Phở · Hanoi (10)
  { name: 'Phở Gia Truyền Bát Đàn', city: 'Hanoi', neighborhood: 'Old Quarter', address: '49 Bát Đàn, Hoàn Kiếm', dish: 'pho', rating: 4.6, reviews: 18420, price: 1, alcohol: false, smoking: true, outdoor: false, km: 1.1, hours: '6:00–14:00', blurb: 'Reviewers keep coming back for a clear northern broth and the 49 Bát Đàn queue — order tái nạm and skip the extras.' },
  { name: 'Phở Thìn Lò Đúc', city: 'Hanoi', neighborhood: 'Hai Bà Trưng', address: '13 Lò Đúc, Hai Bà Trưng', dish: 'pho', rating: 4.5, reviews: 15200, price: 1, alcohol: false, smoking: true, outdoor: false, km: 1.8, hours: '6:00–20:00', blurb: 'Famous for flash-seared beef tossed in the bowl; diners mention the smoky edge more than the décor.' },
  { name: 'Phở 10 Lý Quốc Sư', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '10 Lý Quốc Sư, Hoàn Kiếm', dish: 'pho', rating: 4.5, reviews: 22100, price: 2, alcohol: false, smoking: false, outdoor: false, km: 0.9, hours: '6:00–22:00', blurb: 'Busy multi-floor shop. Regulars tell first-timers to ask for the original branch at number 10 and a bowl of tái gầu.' },
  { name: 'Phở Sướng', city: 'Hanoi', neighborhood: 'Đống Đa', address: '24B Ngõ Trung Yên, Đống Đa', dish: 'pho', rating: 4.7, reviews: 4100, price: 1, alcohol: false, smoking: false, outdoor: false, km: 2.6, hours: '6:30–14:00', blurb: 'Smaller local room; reviews praise a sweeter, slower broth and generous tendon.' },
  { name: 'Phở Bà Vân', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '7 Ngõ Trung Yên, Hoàn Kiếm', dish: 'pho', rating: 4.6, reviews: 2800, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.4, hours: '6:00–13:30', blurb: 'Quiet alley stall. Guests highlight the clean spice and the fact it sells out before early afternoon.' },
  { name: 'Phở Cồ', city: 'Hanoi', neighborhood: 'Old Quarter', address: '10 Ngõ Gạch, Hoàn Kiếm', dish: 'pho', rating: 4.4, reviews: 3600, price: 1, alcohol: false, smoking: true, outdoor: false, km: 1.0, hours: '6:00–21:00', blurb: 'Old-school stools and a slightly saltier Hanoi cup; reviewers like the late opening versus dawn-only shops.' },
  { name: 'Phở Gia Truyền Nguyễn Thái Học', city: 'Hanoi', neighborhood: 'Ba Đình', address: '17 Nguyễn Thái Học, Ba Đình', dish: 'pho', rating: 4.5, reviews: 1900, price: 1, alcohol: false, smoking: false, outdoor: false, km: 2.1, hours: '6:00–14:00', blurb: 'West-of-the-lake regulars come for a gentler broth and a less touristy line than Bát Đàn.' },
  { name: 'Phở Thìn Bờ Hồ', city: 'Hanoi', neighborhood: 'Hoàn Kiếm Lake', address: '61 Đinh Tiên Hoàng, Hoàn Kiếm', dish: 'pho', rating: 4.3, reviews: 5400, price: 2, alcohol: false, smoking: false, outdoor: false, km: 0.8, hours: '6:00–22:00', blurb: 'Handy lake-edge location. Reviews split on crowds but agree the seared-beef style is the reason to go.' },
  { name: 'Phở Gà Nguyệt', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '5B Phủ Doãn, Hoàn Kiếm', dish: 'pho', rating: 4.6, reviews: 2100, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.2, hours: '7:00–21:00', blurb: 'Chicken-pho specialists. Diners mention silky gà and a lighter broth if beef feels too heavy at lunch.' },
  { name: 'Phở 86 Trấn Vũ', city: 'Hanoi', neighborhood: 'Tây Hồ', address: '86 Trấn Vũ, Ba Đình', dish: 'pho', rating: 4.5, reviews: 1700, price: 1, alcohol: false, smoking: true, outdoor: true, km: 3.8, hours: '6:00–14:00', blurb: 'West Lake favourite for phở gà ngan; outdoor stools and a short cab from the Old Quarter.' },

  // —— Phở · HCMC (10)
  { name: 'Phở Hòa Pasteur', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: '260 Pasteur, District 3', dish: 'pho', rating: 4.5, reviews: 19800, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.6, hours: '6:00–23:00', blurb: 'Saigon classic. Reviews talk up the herb plate, hoisin and a sweeter southern broth — go for tái nam.' },
  { name: 'Phở Dậu', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '35 Nguyễn Đình Chiểu, District 1', dish: 'pho', rating: 4.6, reviews: 6200, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.3, hours: '6:00–22:00', blurb: 'Locals rate the clear-ish Saigon cup and brisket. Often mentioned as a less chaotic alternative to Pasteur.' },
  { name: 'Phở Lê', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '413-415 Nguyễn Trãi, District 1', dish: 'pho', rating: 4.4, reviews: 4800, price: 1, alcohol: false, smoking: true, outdoor: false, km: 2.4, hours: '5:30–21:00', blurb: 'Early-morning crowd. Guests praise generous meat and a no-frills counter that still feels neighbourhood.' },
  { name: 'Phở 2000', city: 'Ho Chi Minh City', neighborhood: 'Bến Thành', address: '1-3 Phan Chu Trinh, District 1', dish: 'pho', rating: 4.2, reviews: 8900, price: 2, alcohol: true, smoking: false, outdoor: false, km: 0.9, hours: '6:00–23:00', blurb: 'Beside Bến Thành. Reviews mention Clinton-era fame, air-con rooms and a reliable tái bowl after the market.' },
  { name: 'Phở Quỳnh', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '711 Trần Hưng Đạo, District 1', dish: 'pho', rating: 4.5, reviews: 3100, price: 1, alcohol: false, smoking: false, outdoor: false, km: 2.0, hours: '6:00–22:00', blurb: 'Night-owl phở. Regulars order rare beef late; the broth stays clean rather than syrupy.' },
  { name: 'Phở Lệ', city: 'Ho Chi Minh City', neighborhood: 'District 5', address: '413 Nguyễn Trãi, District 5', dish: 'pho', rating: 4.4, reviews: 2700, price: 1, alcohol: false, smoking: true, outdoor: false, km: 3.6, hours: '6:00–21:00', blurb: 'Cholon-adjacent bowls. Reviews highlight tendon, tripe and a Chinese-Vietnamese spice leaning.' },
  { name: 'Phở Bắc Hải', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: '31 Hải Thượng Lãn Ông, District 3', dish: 'pho', rating: 4.3, reviews: 1600, price: 1, alcohol: false, smoking: false, outdoor: false, km: 2.8, hours: '6:00–14:00', blurb: 'Lunch-only northern-leaning shop in D3; diners like the anise and the quieter room.' },
  { name: 'Phở Tàu Bay', city: 'Ho Chi Minh City', neighborhood: 'Tân Bình', address: '24 Hoàng Việt, Tân Bình', dish: 'pho', rating: 4.5, reviews: 5400, price: 2, alcohol: false, smoking: false, outdoor: false, km: 4.7, hours: '6:00–22:00', blurb: 'Airport-side legend. Reviews call out the rich beef and that it is worth a short cab from District 1.' },
  { name: 'Phở Hiếu', city: 'Ho Chi Minh City', neighborhood: 'Phú Nhuận', address: '15 Phan Xích Long, Phú Nhuận', dish: 'pho', rating: 4.4, reviews: 1200, price: 1, alcohol: false, smoking: false, outdoor: true, km: 3.2, hours: '6:00–21:00', blurb: 'Neighbourhood counter with sidewalk seats. Guests mention a light broth and fair prices.' },
  { name: 'Phở Hồng', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: '241 Nguyễn Thiện Thuật, District 3', dish: 'pho', rating: 4.3, reviews: 980, price: 1, alcohol: false, smoking: true, outdoor: false, km: 2.2, hours: '6:00–14:00', blurb: 'Morning specialist. Reviews like the fatty brisket and that it still feels like a local breakfast stop.' },

  // —— Phở · Da Nang / Hue / Ninh Binh
  { name: 'Phở Bà Dưỡng', city: 'Da Nang', neighborhood: 'Hải Châu', address: 'K280/17 Hoàng Diệu, Hải Châu', dish: 'pho', rating: 4.4, reviews: 2100, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.7, hours: '6:00–13:00', blurb: 'Da Nang lunch favourite. Diners mention a cleaner central broth and fast turnover.' },
  { name: 'Phở 99 Trần Phú', city: 'Da Nang', neighborhood: 'Hải Châu', address: '99 Trần Phú, Hải Châu', dish: 'pho', rating: 4.3, reviews: 1600, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.2, hours: '6:00–21:00', blurb: 'River-road convenience. Reviews are kinder about location than about drama — a solid everyday bowl.' },
  { name: 'Phở Vĩ Dạ', city: 'Da Nang', neighborhood: 'Sơn Trà', address: '118 Ngô Quyền, Sơn Trà', dish: 'pho', rating: 4.5, reviews: 980, price: 1, alcohol: false, smoking: false, outdoor: false, km: 3.4, hours: '6:00–14:00', blurb: 'East-of-the-river pick. Guests like the beef tendon and that it is a short cab from Mỹ Khê.' },
  { name: 'Phở Gà Nam Ô', city: 'Da Nang', neighborhood: 'Liên Chiểu', address: 'Nam Ô, Liên Chiểu', dish: 'pho', rating: 4.6, reviews: 740, price: 1, alcohol: false, smoking: true, outdoor: true, km: 4.9, hours: '6:00–13:00', blurb: 'Chicken pho with a village feel; reviewers treat it as a short ride rather than a beach-front stop.' },
  { name: 'Phở Bò Huế Đông Ba', city: 'Hue', neighborhood: 'Hue Citadel', address: 'Chợ Đông Ba, Hue', dish: 'pho', rating: 4.3, reviews: 890, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.0, hours: '6:00–14:00', blurb: 'Market-side beef noodles. Reviews note Huế saltiness — ask if you want it less fierce.' },
  { name: 'Phở 12 Nguyễn Tri Phương', city: 'Hue', neighborhood: 'Hue Center', address: '12 Nguyễn Tri Phương, Hue', dish: 'pho', rating: 4.4, reviews: 1100, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.5, hours: '6:00–21:00', blurb: 'Simple citadel-adjacent shop. Diners come for a quieter bowl between tomb days.' },
  { name: 'Phở Đồng', city: 'Ninh Binh', neighborhood: 'Town center', address: 'Trần Hưng Đạo, Ninh Bình', dish: 'pho', rating: 4.3, reviews: 640, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.4, hours: '6:00–14:00', blurb: 'Practical morning bowl before Tràng An. Reviews call it honest, not theatrical.' },
  { name: 'Phở Bà Tý', city: 'Ninh Binh', neighborhood: 'Ninh Bình town', address: 'Lê Hồng Phong, Ninh Bình', dish: 'pho', rating: 4.4, reviews: 420, price: 1, alcohol: false, smoking: true, outdoor: true, km: 2.1, hours: '6:00–13:00', blurb: 'Local breakfast stop. Guests mention a lighter broth useful before a humid day on the river.' },

  // —— Bánh mì · Hanoi (10)
  { name: 'Bánh Mì 25', city: 'Hanoi', neighborhood: 'Old Quarter', address: '25 Hàng Cá, Hoàn Kiếm', dish: 'banh-mi', rating: 4.6, reviews: 9800, price: 1, alcohol: false, smoking: false, outdoor: false, km: 0.8, hours: '7:00–21:00', blurb: 'Queue shop. Reviews rave about the crackle and pâté-to-pickle balance — pork is the safe order.' },
  { name: 'Bánh Mì Pate Ông Cuông', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '6 Hàng Gà, Hoàn Kiếm', dish: 'banh-mi', rating: 4.5, reviews: 2100, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.0, hours: '6:30–20:00', blurb: 'Pâté-forward Hanoi loaf. Diners like the sidewalk stools and a less sweet filling than Saigon styles.' },
  { name: 'Bánh Mì Hàng Bông', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '48 Hàng Bông, Hoàn Kiếm', dish: 'banh-mi', rating: 4.4, reviews: 1600, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.3, hours: '7:00–21:00', blurb: 'Walkable from the lake. Reviews mention a lighter pickle and a baguette that stays crisp in humidity.' },
  { name: 'Bánh Mì Minh Nhật', city: 'Hanoi', neighborhood: 'Ba Đình', address: '34 Cửa Nam, Hoàn Kiếm', dish: 'banh-mi', rating: 4.5, reviews: 1200, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.6, hours: '7:00–20:00', blurb: 'Near the citadel gate. Guests praise grilled pork and a generous herb stuffing.' },
  { name: 'Bánh Mì Hồng Hoa', city: 'Hanoi', neighborhood: 'Đống Đa', address: '12 Tôn Đức Thắng, Đống Đa', dish: 'banh-mi', rating: 4.4, reviews: 860, price: 1, alcohol: false, smoking: true, outdoor: true, km: 2.7, hours: '6:30–19:00', blurb: 'Office-lunch favourite. Reviews like the price and a spicy chilli oil you can skip.' },
  { name: 'Bánh Mì Chảo 34', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '34 Cửa Nam, Hoàn Kiếm', dish: 'banh-mi', rating: 4.3, reviews: 1900, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.5, hours: '7:00–21:00', blurb: 'Skillet bánh mì — egg, pâté, beef. Reviewers treat it as a sit-down sandwich rather than a walk-away loaf.' },
  { name: 'Bánh Mì Pate Bò Kho', city: 'Hanoi', neighborhood: 'Old Quarter', address: '17 Hàng Buồm, Hoàn Kiếm', dish: 'banh-mi', rating: 4.2, reviews: 740, price: 1, alcohol: false, smoking: true, outdoor: true, km: 0.9, hours: '7:00–22:00', blurb: 'Night-friendly cart energy. Guests dunk bread in bò kho gravy — messy, popular in reviews.' },
  { name: 'Bánh Mì Việt Quang', city: 'Hanoi', neighborhood: 'Hai Bà Trưng', address: '22 Bà Triệu, Hai Bà Trưng', dish: 'banh-mi', rating: 4.4, reviews: 980, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.9, hours: '7:00–20:00', blurb: 'Neater shop. Reviews highlight chicken bánh mì and a mayo that is not cloying.' },
  { name: 'Bánh Mì Hà Nội 12', city: 'Hanoi', neighborhood: 'Tây Hồ', address: '12 Xuân Diệu, Tây Hồ', dish: 'banh-mi', rating: 4.3, reviews: 560, price: 2, alcohol: false, smoking: false, outdoor: true, km: 4.1, hours: '8:00–21:00', blurb: 'West Lake pit stop. Diners mention a short cab from the centre and a calmer terrace.' },
  { name: 'Bánh Mì Pew Pew', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '24 Mã Mây, Hoàn Kiếm', dish: 'banh-mi', rating: 4.4, reviews: 3100, price: 2, alcohol: true, smoking: false, outdoor: false, km: 0.7, hours: '10:00–23:00', blurb: 'Modern fillings plus beer. Reviews like the baguette still being Vietnamese-crackly despite the cocktail menu.' },

  // —— Bánh mì · HCMC (10)
  { name: 'Bánh Mì Huỳnh Hoa', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '26 Lê Thị Riêng, District 1', dish: 'banh-mi', rating: 4.6, reviews: 16400, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.1, hours: '14:30–23:00', blurb: 'The overloaded Saigon loaf. Reviews warn about the afternoon queue and the sheer volume of cold cuts and chilli.' },
  { name: 'Bánh Mì Hòa Mã', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: '53 Hòa Mã, District 3', dish: 'banh-mi', rating: 4.5, reviews: 4200, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.8, hours: '6:00–13:00', blurb: 'Breakfast institution. Guests praise a lighter, older-Saigon sandwich than Huỳnh Hoa.' },
  { name: 'Bánh Mì Như Lan', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '15 Nguyễn Trãi, District 1', dish: 'banh-mi', rating: 4.4, reviews: 7800, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.4, hours: '6:00–21:00', blurb: 'Legacy brand. Reviews like the pâté and that you can still walk away with a classic D1 loaf.' },
  { name: 'Bánh Mì Bảy Hổ', city: 'Ho Chi Minh City', neighborhood: 'District 5', address: '92 Nguyễn Trãi, District 5', dish: 'banh-mi', rating: 4.5, reviews: 2100, price: 1, alcohol: false, smoking: true, outdoor: true, km: 3.4, hours: '6:00–20:00', blurb: 'Cholon favourite. Diners mention a Chinese-Vietnamese roast-pork filling and sidewalk stools.' },
  { name: 'Bánh Mì Kiều', city: 'Ho Chi Minh City', neighborhood: 'Phú Nhuận', address: '27 Phan Xích Long, Phú Nhuận', dish: 'banh-mi', rating: 4.4, reviews: 1500, price: 1, alcohol: false, smoking: false, outdoor: false, km: 3.0, hours: '6:30–21:00', blurb: 'Neighbourhood loaf with a cult following; reviews call out the grilled pork and pickles.' },
  { name: 'Bánh Mì Chảo Cô Ba', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '8 Hồ Hảo Hớn, District 1', dish: 'banh-mi', rating: 4.3, reviews: 1900, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.0, hours: '7:00–22:00', blurb: 'Skillet sandwich near Bùi Viện. Guests order the egg-and-beef chảo and eat it in the shop.' },
  { name: 'Bánh Mì Cô Giang', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: 'Cô Giang, District 1', dish: 'banh-mi', rating: 4.3, reviews: 860, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.5, hours: '6:00–20:00', blurb: 'Local street cart energy. Reviews like the price and a sharp pickle.' },
  { name: 'Bánh Mì 37 Nguyễn Trãi', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '37 Nguyễn Trãi, District 1', dish: 'banh-mi', rating: 4.2, reviews: 1200, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.7, hours: '6:00–21:00', blurb: 'Simple D1 stop. Diners mention a reliable pork loaf when the famous queues feel too long.' },
  { name: 'Bánh Mì Nướng Nam Vang', city: 'Ho Chi Minh City', neighborhood: 'District 5', address: '138 Trần Hưng Đạo, District 5', dish: 'banh-mi', rating: 4.4, reviews: 980, price: 1, alcohol: false, smoking: true, outdoor: true, km: 3.1, hours: '16:00–23:00', blurb: 'Evening grilled-Cambodian-style loaf. Reviews talk about the charcoal smell and melted cheese-pork mix.' },
  { name: 'Bánh Mì Huỳnh Hoa 2', city: 'Ho Chi Minh City', neighborhood: 'Phú Nhuận', address: '174 Phan Đăng Lưu, Phú Nhuận', dish: 'banh-mi', rating: 4.4, reviews: 2300, price: 1, alcohol: false, smoking: false, outdoor: true, km: 3.5, hours: '14:30–22:00', blurb: 'Same overloaded style, shorter wait than Lê Thị Riêng according to many reviews.' },

  { name: 'Bánh Mì Bà Lan', city: 'Da Nang', neighborhood: 'Hải Châu', address: '4 Ông Ích Khiêm, Hải Châu', dish: 'banh-mi', rating: 4.6, reviews: 4300, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.3, hours: '6:00–20:00', blurb: 'Da Nang’s most-cited loaf. Reviews love the pâté and a baguette that stays airy in coastal air.' },
  { name: 'Bánh Mì Tuyết', city: 'Da Nang', neighborhood: 'Hải Châu', address: '159 Lê Duẩn, Hải Châu', dish: 'banh-mi', rating: 4.5, reviews: 2100, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.6, hours: '6:00–21:00', blurb: 'Local counter. Guests mention grilled pork and a chilli that actually bites.' },
  { name: 'Bánh Mì Phượng', city: 'Hoi An', neighborhood: 'Old Town', address: '2B Phan Chu Trinh, Hoi An', dish: 'banh-mi', rating: 4.4, reviews: 18900, price: 1, alcohol: false, smoking: false, outdoor: true, km: 0.8, hours: '7:00–21:00', blurb: 'Bourdain-famous. Reviews still praise the loaf; go early or accept the line — pork and chilli are the usual order.' },
  { name: 'Madam Khánh Bánh Mì', city: 'Hoi An', neighborhood: 'Old Town', address: '115 Trần Cao Vân, Hoi An', dish: 'banh-mi', rating: 4.7, reviews: 6400, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.2, hours: '7:00–19:00', blurb: 'Bánh Mì Queen. Reviewers rave about her customising heat and herbs in front of you.' },
  { name: 'Bánh Mì A Da', city: 'Hoi An', neighborhood: 'An Hội', address: 'Trần Hưng Đạo, Hoi An', dish: 'banh-mi', rating: 4.5, reviews: 1100, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.6, hours: '6:30–20:00', blurb: 'Less photographed than Phượng. Locals in reviews send you here for a quieter, still-crisp sandwich.' },

  // —— Bún chả · Hanoi (10)
  { name: 'Bún Chả Hương Liên', city: 'Hanoi', neighborhood: 'Hai Bà Trưng', address: '24 Lê Văn Hưu, Hai Bà Trưng', dish: 'bun-cha', rating: 4.4, reviews: 12600, price: 2, alcohol: true, smoking: false, outdoor: false, km: 1.6, hours: '8:00–20:00', blurb: 'The Obama table is still there. Order the combo — grilled pork, nem, Hanoi beer — and expect a queue of cameras.' },
  { name: 'Bún Chả Tạ', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '21 Nguyễn Hữu Huân, Hoàn Kiếm', dish: 'bun-cha', rating: 4.6, reviews: 3200, price: 1, alcohol: false, smoking: false, outdoor: false, km: 0.9, hours: '10:00–14:00, 17:00–20:00', blurb: 'Michelin-noted. Reviews praise smoky patties and a dipping sauce that is balanced, not sugary.' },
  { name: 'Bún Chả Đắc Kim', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '1 Hàng Mành, Hoàn Kiếm', dish: 'bun-cha', rating: 4.5, reviews: 4100, price: 1, alcohol: false, smoking: true, outdoor: false, km: 1.0, hours: '10:00–14:00, 17:00–20:00', blurb: 'Old Quarter lunch rooms. Diners mention charcoal on the pork and a classic papaya garnish.' },
  { name: 'Bún Chả Sinh Từ', city: 'Hanoi', neighborhood: 'Đống Đa', address: 'Sinh Từ, Đống Đa', dish: 'bun-cha', rating: 4.6, reviews: 1800, price: 1, alcohol: false, smoking: false, outdoor: false, km: 2.4, hours: '10:00–14:00', blurb: 'Neighbourhood favourite. Reviews say this is closer to how Hanoians eat it on a weekday.' },
  { name: 'Bún Chả Hàng Quạt', city: 'Hanoi', neighborhood: 'Old Quarter', address: 'Hàng Quạt, Hoàn Kiếm', dish: 'bun-cha', rating: 4.4, reviews: 960, price: 1, alcohol: false, smoking: true, outdoor: true, km: 0.8, hours: '10:30–14:00', blurb: 'Alley stools. Guests like the smoke in the air and a sharp dipping broth.' },
  { name: 'Bún Chả 44 Hàng Bồ', city: 'Hanoi', neighborhood: 'Old Quarter', address: '44 Hàng Bồ, Hoàn Kiếm', dish: 'bun-cha', rating: 4.3, reviews: 1400, price: 1, alcohol: true, smoking: false, outdoor: false, km: 1.1, hours: '10:00–21:00', blurb: 'Beer-friendly room. Reviews mention nem rán on the side and slightly longer hours.' },
  { name: 'Bún Chả Hàng Mành 2', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '9 Hàng Mành, Hoàn Kiếm', dish: 'bun-cha', rating: 4.4, reviews: 720, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.0, hours: '10:00–14:00', blurb: 'Overflow from Đắc Kim. Diners still get proper charcoal pork without the same crush.' },
  { name: 'Bún Chả Nàng Tấm', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '20 Hàng Hành, Hoàn Kiếm', dish: 'bun-cha', rating: 4.5, reviews: 2100, price: 2, alcohol: true, smoking: false, outdoor: false, km: 2.2, hours: '11:00–21:00', blurb: 'Sit-down version with herbs piled high. Reviews like the dipping sauce and that you can linger.' },
  { name: 'Bún Chả Ô Mai', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '16 Ô Mai, Hoàn Kiếm', dish: 'bun-cha', rating: 4.3, reviews: 540, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.5, hours: '10:00–14:00', blurb: 'Tiny lunch room. Guests mention fatty belly slices and a sour-sweet sauce.' },
  { name: 'Bún Chả Hoài Cổ', city: 'Hanoi', neighborhood: 'Tây Hồ', address: 'Xuan Dieu, Tây Hồ', dish: 'bun-cha', rating: 4.4, reviews: 680, price: 2, alcohol: true, smoking: false, outdoor: true, km: 4.2, hours: '11:00–21:00', blurb: 'Lake-side grill. Reviews treat it as a short cab treat with a breezier room than the Old Quarter.' },
  { name: 'Bún Chả 44 Nguyễn Thị Minh Khai', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: '44 Nguyễn Thị Minh Khai, District 3', dish: 'bun-cha', rating: 4.3, reviews: 1100, price: 2, alcohol: true, smoking: false, outdoor: false, km: 1.5, hours: '11:00–21:00', blurb: 'Hanoi-style in Saigon. Reviews say the smoke is milder but the dipping broth is still the point.' },

  // —— Bún bò Huế
  { name: 'Bún Bò Huế Hạnh', city: 'Hue', neighborhood: 'Hue Center', address: '11 Lê Lợi, Hue', dish: 'bun-bo-hue', rating: 4.6, reviews: 2800, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.1, hours: '6:00–13:00', blurb: 'Citadel-side bowl. Reviewers praise lemongrass, shrimp paste and a heat you can ask to tone down.' },
  { name: 'Bún Bò Huế Bà Hoa', city: 'Hue', neighborhood: 'Dong Ba', address: 'Chợ Đông Ba, Hue', dish: 'bun-bo-hue', rating: 4.5, reviews: 1900, price: 1, alcohol: false, smoking: true, outdoor: true, km: 0.9, hours: '6:00–13:00', blurb: 'Market intensity. Guests mention thick noodles, hock and a broth that smells of chilli oil.' },
  { name: 'Bún Bò Huế O Xuân', city: 'Hue', neighborhood: 'Hue Center', address: '17 Nguyễn Công Trứ, Hue', dish: 'bun-bo-hue', rating: 4.5, reviews: 1400, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.4, hours: '6:00–14:00', blurb: 'Family shop. Reviews like the balanced mắm ruốc — funky, not overwhelming.' },
  { name: 'Bún Bò Huế 17 Lý Thường Kiệt', city: 'Hue', neighborhood: 'Hue Center', address: '17 Lý Thường Kiệt, Hue', dish: 'bun-bo-hue', rating: 4.4, reviews: 980, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.6, hours: '6:00–13:30', blurb: 'Quiet room. Diners order extra chilli paste on the side and cubicle pork loaf if available.' },
  { name: 'Bún Bò Huế Bà Tý', city: 'Hue', neighborhood: 'Phú Cát', address: 'Phú Cát, Hue', dish: 'bun-bo-hue', rating: 4.6, reviews: 720, price: 1, alcohol: false, smoking: true, outdoor: true, km: 2.3, hours: '6:00–11:00', blurb: 'Sells out early. Reviews call it the bowl Huế people actually queue for.' },
  { name: 'Bún Bò Huế Đông Ba 2', city: 'Hue', neighborhood: 'Hue Center', address: '2 Trần Hưng Đạo, Hue', dish: 'bun-bo-hue', rating: 4.3, reviews: 860, price: 1, alcohol: true, smoking: false, outdoor: false, km: 1.2, hours: '6:00–20:00', blurb: 'Longer hours than most. Guests mention beer and a slightly milder evening broth.' },
  { name: 'Bún Bò Huế Hương Sen', city: 'Hue', neighborhood: 'Hue Center', address: '30 Bến Nghé, Hue', dish: 'bun-bo-hue', rating: 4.4, reviews: 540, price: 2, alcohol: true, smoking: false, outdoor: true, km: 1.8, hours: '10:00–21:00', blurb: 'Sit-down riverside. Reviews trade some grit for herbs and a calmer table.' },
  { name: 'Bún Bò Bà Dưỡng', city: 'Da Nang', neighborhood: 'Sơn Trà', address: 'K280/17 Hoàng Diệu, Hải Châu', dish: 'bun-bo-hue', rating: 4.7, reviews: 8900, price: 1, alcohol: false, smoking: false, outdoor: false, km: 2.0, hours: '5:30–13:00', blurb: 'Da Nang’s most famous Huế bowl. Reviews say arrive before 10am; the lemongrass is the whole point.' },
  { name: 'Bún Bò Huế 72 Trần Quốc Toản', city: 'Da Nang', neighborhood: 'Hải Châu', address: '72 Trần Quốc Toản, Hải Châu', dish: 'bun-bo-hue', rating: 4.5, reviews: 1600, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.4, hours: '6:00–13:00', blurb: 'Closer to staying districts. Guests like a slightly gentler spice than Bà Dưỡng.' },
  { name: 'Bún Bò Huế Cô Ba', city: 'Da Nang', neighborhood: 'Ngũ Hành Sơn', address: 'Lê Văn Duyệt, Ngũ Hành Sơn', dish: 'bun-bo-hue', rating: 4.4, reviews: 780, price: 1, alcohol: false, smoking: false, outdoor: false, km: 3.9, hours: '6:00–13:00', blurb: 'Beach-adjacent lunch. Reviews mention a short cab from Mỹ Khê and a proper central broth.' },
  { name: 'Bún Bò Huế Nam Giao', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: '221 Võ Thị Sáu, District 3', dish: 'bun-bo-hue', rating: 4.5, reviews: 2400, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.9, hours: '6:00–14:00, 17:00–21:00', blurb: 'Serious Saigon Huế. Reviewers praise shrimp paste depth and thick noodles.' },
  { name: 'Bún Bò Huế 40A', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '40A Bùi Thị Xuân, District 1', dish: 'bun-bo-hue', rating: 4.4, reviews: 1800, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.2, hours: '6:00–22:00', blurb: 'Central D1 convenience. Reviews like late hours more than pilgrimage-level broth — still a strong bowl.' },

  // —— Cao lầu · Hoi An (10)
  { name: 'Cao Lầu Trung Bắc', city: 'Hoi An', neighborhood: 'Old Town', address: '22 Trần Phú, Hoi An', dish: 'cao-lau', rating: 4.5, reviews: 2100, price: 2, alcohol: true, smoking: false, outdoor: true, km: 0.8, hours: '10:00–21:00', blurb: 'Old Town tables. Reviews mention chewy noodles, roast pork and a light broth splash — sit upstairs if crowded.' },
  { name: 'Quán Cao Lầu Bà Bé', city: 'Hoi An', neighborhood: 'Trần Phú', address: '8 Trần Hưng Đạo, Hoi An', dish: 'cao-lau', rating: 4.6, reviews: 1600, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.0, hours: '9:00–20:00', blurb: 'No-frills specialist. Guests rave about the springy noodle bite and crackling on top.' },
  { name: 'Cao Lầu Thanh', city: 'Hoi An', neighborhood: 'Old Town', address: '48 Trần Hưng Đạo, Hoi An', dish: 'cao-lau', rating: 4.5, reviews: 2800, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.1, hours: '9:00–21:00', blurb: 'Often listed among the town’s best. Reviews praise pork, greens and noodles that actually bounce.' },
  { name: 'Morning Glory', city: 'Hoi An', neighborhood: 'Old Town', address: '106 Nguyễn Thái Học, Hoi An', dish: 'cao-lau', rating: 4.4, reviews: 9200, price: 3, alcohol: true, smoking: false, outdoor: false, km: 0.9, hours: '10:00–21:30', blurb: 'Restaurant setting with a proper cao lầu on the menu. Reviews like comfort and a well-made bowl, at a higher price.' },
  { name: 'Cao Lầu Bà Lễ', city: 'Hoi An', neighborhood: 'Old Town', address: '31 Phan Bội Châu, Hoi An', dish: 'cao-lau', rating: 4.4, reviews: 740, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.3, hours: '9:00–20:00', blurb: 'Local counter. Diners mention a slightly smokier pork and fewer tour groups.' },
  { name: 'Cao Lầu Hồng', city: 'Hoi An', neighborhood: 'An Hội', address: 'An Hội, Hoi An', dish: 'cao-lau', rating: 4.5, reviews: 520, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.7, hours: '10:00–20:00', blurb: 'Across the river. Reviews treat it as a short walk from the lantern core with the same chewy noodles.' },
  { name: 'Cao Lầu Cô Yến', city: 'Hoi An', neighborhood: 'Old Town', address: '17 Thái Phiên, Hoi An', dish: 'cao-lau', rating: 4.3, reviews: 410, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.2, hours: '10:00–21:00', blurb: 'Family room. Guests like the crackling-to-noodle ratio and a mild chilli-lime.' },
  { name: 'Cao Lầu Quảng Đông', city: 'Hoi An', neighborhood: 'Old Town', address: 'Quảng Đông, Hoi An', dish: 'cao-lau', rating: 4.4, reviews: 680, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.4, hours: '9:00–19:00', blurb: 'Daytime specialist. Reviews mention selling out of the best pork by mid-afternoon.' },
  { name: 'Faifo Café Cao Lầu', city: 'Hoi An', neighborhood: 'Old Town', address: '104 Trần Phú, Hoi An', dish: 'cao-lau', rating: 4.2, reviews: 1500, price: 2, alcohol: true, smoking: false, outdoor: true, km: 0.9, hours: '8:00–22:00', blurb: 'Café-restaurant hybrid. Reviewers come for the view and a respectable cao lầu with a drink.' },
  { name: 'Cao Lầu Bà Dịu', city: 'Hoi An', neighborhood: 'Cam Nam', address: 'Cẩm Nam, Hoi An', dish: 'cao-lau', rating: 4.6, reviews: 390, price: 1, alcohol: false, smoking: false, outdoor: true, km: 2.4, hours: '9:00–18:00', blurb: 'Island-side bowl. A short cab or long walk; reviews say the noodles feel even more local.' },

  // —— Cà phê trứng · Hanoi (10)
  { name: 'Café Giang', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '39 Nguyễn Hữu Huân, Hoàn Kiếm', dish: 'ca-phe-trung', rating: 4.5, reviews: 18400, price: 2, alcohol: false, smoking: false, outdoor: false, km: 0.9, hours: '7:00–22:00', blurb: 'The original egg-coffee house. Reviews tell you to spoon the foam first, then stir — upstairs is quieter.' },
  { name: 'Giảng Café 2', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: 'Giang Café, Nguyễn Hữu Huân', dish: 'ca-phe-trung', rating: 4.4, reviews: 2100, price: 2, alcohol: false, smoking: false, outdoor: false, km: 0.9, hours: '7:00–22:00', blurb: 'Same family recipe, slightly easier seats. Guests mention the hot-water bath under the cup.' },
  { name: 'Café Đinh', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '13 Đinh Liệt, Hoàn Kiếm', dish: 'ca-phe-trung', rating: 4.6, reviews: 3600, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.0, hours: '8:00–23:00', blurb: 'Hidden-room atmosphere. Reviews praise a thicker egg cream and a view over the rooftops.' },
  { name: 'Loading T Café', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '8 Chân Cầm, Hoàn Kiếm', dish: 'ca-phe-trung', rating: 4.5, reviews: 2800, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.1, hours: '8:00–23:00', blurb: 'Tiny, photogenic. Diners like iced egg coffee and that you can actually talk.' },
  { name: 'Café Duy Trì', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '10 Nguyễn Hữu Huân, Hoàn Kiếm', dish: 'ca-phe-trung', rating: 4.4, reviews: 1200, price: 1, alcohol: false, smoking: true, outdoor: false, km: 1.2, hours: '7:00–21:00', blurb: 'Old Hanoi café bones. Reviews mention robusta bitterness under a less-sweet foam.' },
  { name: 'The Note Coffee', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '64 Lương Văn Can, Hoàn Kiếm', dish: 'ca-phe-trung', rating: 4.3, reviews: 5400, price: 2, alcohol: false, smoking: false, outdoor: true, km: 0.8, hours: '8:00–23:00', blurb: 'Sticky-note walls plus a decent egg coffee. Reviews come for the room; the drink still holds up.' },
  { name: 'Cộng Cà Phê Đinh Tiên Hoàng', city: 'Hanoi', neighborhood: 'Hoàn Kiếm Lake', address: '27 Đinh Tiên Hoàng, Hoàn Kiếm', dish: 'ca-phe-trung', rating: 4.3, reviews: 4100, price: 2, alcohol: false, smoking: false, outdoor: false, km: 0.8, hours: '7:00–23:00', blurb: 'Retro chain with egg coffee on the menu. Handy lake location; reviews call it consistent rather than historic.' },
  { name: 'Café Trứng Hanoi', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '11 Hàng Gai, Hoàn Kiếm', dish: 'ca-phe-trung', rating: 4.4, reviews: 860, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.0, hours: '8:00–22:00', blurb: 'Silk-street stop. Guests mention a cocoa-dusted foam and air-con after shopping.' },
  { name: 'Tranquil Books & Coffee', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '5 Nguyễn Quang Bích, Hoàn Kiếm', dish: 'ca-phe-trung', rating: 4.5, reviews: 1900, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.3, hours: '8:00–22:00', blurb: 'Slow room, strong egg cream. Reviews like lingering with a book more than a two-minute photo stop.' },
  { name: 'An Cafe Đà Lạt', city: 'Da Lat', neighborhood: 'Center', address: 'Center, Da Lat', dish: 'ca-phe-trung', rating: 4.4, reviews: 720, price: 2, alcohol: false, smoking: false, outdoor: true, km: 1.2, hours: '8:00–22:00', blurb: 'Highland terrace take. Reviewers mention cooler air and a sweeter cream that fits the climate.' },
  { name: 'Café Trứng Sài Gòn', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '14 Tôn Thất Đạm, District 1', dish: 'ca-phe-trung', rating: 4.3, reviews: 980, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.1, hours: '8:00–22:00', blurb: 'Hanoi drink in D1. Reviews say the foam is close; robusta still leads.' },

  // —— Gỏi cuốn
  { name: 'Gỏi Cuốn Cô Ba', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: 'District 1, HCMC', dish: 'goi-cuon', rating: 4.4, reviews: 1100, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.0, hours: '10:00–21:00', blurb: 'Herb-heavy rolls and a peanut dip reviewers keep mentioning. Easy central stop.' },
  { name: 'Cuốn Nóng Sài Gòn', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: 'Võ Văn Tần, District 3', dish: 'goi-cuon', rating: 4.5, reviews: 860, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.7, hours: '10:00–21:00', blurb: 'Warm-and-fresh rolls. Guests like prawn-pork balance and a less-sweet sauce.' },
  { name: 'Bò Lá Lốt & Cuốn', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: 'Hồ Tùng Mậu, District 1', dish: 'goi-cuon', rating: 4.3, reviews: 1400, price: 2, alcohol: true, smoking: false, outdoor: false, km: 1.2, hours: '11:00–22:00', blurb: 'Share table. Reviews order cuốn plus grilled beef — peanut sauce is the star.' },
  { name: 'Gỏi Cuốn 14 Lý Tự Trọng', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '14 Lý Tự Trọng, District 1', dish: 'goi-cuon', rating: 4.4, reviews: 720, price: 1, alcohol: false, smoking: false, outdoor: false, km: 0.9, hours: '10:00–21:00', blurb: 'Office-lunch rolls. Diners mention rice paper that is not gummy and a sharp herb mix.' },
  { name: 'Gỏi Cuốn Cô Giang', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: 'Cô Giang, District 1', dish: 'goi-cuon', rating: 4.2, reviews: 540, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.5, hours: '10:00–20:00', blurb: 'Street prices. Reviews like mint-forward rolls you eat standing.' },
  { name: 'White Rose & Roll House', city: 'Hoi An', neighborhood: 'Old Town', address: 'Old Town, Hoi An', dish: 'goi-cuon', rating: 4.3, reviews: 860, price: 2, alcohol: true, smoking: false, outdoor: true, km: 0.8, hours: '10:00–22:00', blurb: 'Riverside rolls after wandering. Guests mention a peanut dip and a beer if you want it.' },
  { name: 'Fresh Roll Nha Trang', city: 'Nha Trang', neighborhood: 'Beachfront', address: 'Trần Phú, Nha Trang', dish: 'goi-cuon', rating: 4.2, reviews: 540, price: 2, alcohol: true, smoking: false, outdoor: true, km: 1.1, hours: '11:00–22:00', blurb: 'Herb-forward rolls with sea-breeze seating. Reviews treat it as a light lunch after the beach.' },
  { name: 'Gỏi Cuốn Hàng Buồm', city: 'Hanoi', neighborhood: 'Old Quarter', address: 'Hàng Buồm, Hoàn Kiếm', dish: 'goi-cuon', rating: 4.3, reviews: 680, price: 1, alcohol: false, smoking: false, outdoor: false, km: 0.9, hours: '10:00–21:00', blurb: 'Northern dip leaning fish sauce. Reviewers like the cooler filling on humid Hanoi days.' },

  // —— Cơm tấm · HCMC (10)
  { name: 'Cơm Tấm Bà Ghiền', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: '84 Đặng Văn Ngữ, Phú Nhuận', dish: 'com-tam', rating: 4.6, reviews: 9800, price: 2, alcohol: true, smoking: false, outdoor: false, km: 2.4, hours: '10:00–22:00', blurb: 'Charcoal pork chop over broken rice. Reviews rave about the grill crust and classic pickles.' },
  { name: 'Cơm Tấm Nguyễn Văn Cừ', city: 'Ho Chi Minh City', neighborhood: 'District 5', address: 'Nguyễn Văn Cừ, District 5', dish: 'com-tam', rating: 4.4, reviews: 1900, price: 1, alcohol: false, smoking: true, outdoor: true, km: 3.1, hours: '9:00–21:00', blurb: 'Local pricing, outdoor stools, generous grill. Guests mention sườn and bì as the move.' },
  { name: 'Cơm Tấm Cali Nguyễn Trãi', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: 'Nguyễn Trãi, District 1', dish: 'com-tam', rating: 4.3, reviews: 4200, price: 2, alcohol: true, smoking: false, outdoor: false, km: 1.6, hours: '10:00–22:00', blurb: 'Air-con chain with a serious chop. Reviews like consistency and late hours more than romance.' },
  { name: 'Cơm Tấm Thuận Kiều', city: 'Ho Chi Minh City', neighborhood: 'District 5', address: 'Thuận Kiều, District 5', dish: 'com-tam', rating: 4.5, reviews: 1600, price: 1, alcohol: false, smoking: true, outdoor: true, km: 3.8, hours: '10:00–21:00', blurb: 'Cholon plate. Diners praise broken rice soaked in scallion oil and a sweet-salty mắm.' },
  { name: 'Cơm Tấm Mộc', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: 'Lê Thánh Tôn, District 1', dish: 'com-tam', rating: 4.4, reviews: 2100, price: 2, alcohol: true, smoking: false, outdoor: false, km: 1.1, hours: '10:00–22:00', blurb: 'Neater D1 room. Reviews mention a cleaner grill and an egg that is actually runny.' },
  { name: 'Cơm Tấm Ngon', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: 'Võ Văn Tần, District 3', dish: 'com-tam', rating: 4.3, reviews: 980, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.8, hours: '10:00–21:00', blurb: 'Weekday lunch favourite. Guests like the pork skin and that the rice is not dry.' },
  { name: 'Cơm Tấm Kiều Giang', city: 'Ho Chi Minh City', neighborhood: 'Phú Nhuận', address: 'Phan Xích Long, Phú Nhuận', dish: 'com-tam', rating: 4.4, reviews: 1200, price: 1, alcohol: false, smoking: false, outdoor: true, km: 2.9, hours: '10:00–21:00', blurb: 'Neighbourhood grill. Reviews send you for sườn bì chả and iced tea.' },
  { name: 'Cơm Tấm Ba Ghiền 2', city: 'Ho Chi Minh City', neighborhood: 'Phú Nhuận', address: 'Đặng Văn Ngữ, Phú Nhuận', dish: 'com-tam', rating: 4.5, reviews: 3400, price: 2, alcohol: true, smoking: false, outdoor: false, km: 2.5, hours: '10:00–22:00', blurb: 'Sister room to the original. Same charcoal chop; slightly easier seats according to reviews.' },
  { name: 'Cơm Tấm Nguyễn Phi Khanh', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: 'Nguyễn Phi Khanh, District 1', dish: 'com-tam', rating: 4.2, reviews: 760, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.4, hours: '9:00–21:00', blurb: 'Stool-and-grill energy near Tân Định. Reviews like the smoke more than the furniture.' },
  { name: 'Cơm Tấm Cô Tấm', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: 'Nam Kỳ Khởi Nghĩa, District 3', dish: 'com-tam', rating: 4.3, reviews: 640, price: 1, alcohol: false, smoking: false, outdoor: false, km: 2.0, hours: '10:00–21:00', blurb: 'Quiet D3 plate. Diners mention a balanced nước mắm and a chop that is not over-sugared.' },
  { name: 'Cơm Tấm Đà Nẵng', city: 'Da Nang', neighborhood: 'Hải Châu', address: 'Lê Duẩn, Hải Châu', dish: 'com-tam', rating: 4.3, reviews: 520, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.5, hours: '10:00–21:00', blurb: 'Southern plate on the coast. Reviews treat it as a short cab from the river and a proper grilled chop.' },

  { name: 'Bún Bò Huế Bà Tý', city: 'Hue', neighborhood: 'Phú Cát', address: 'Phú Cát, Hue', dish: 'bun-bo-hue', rating: 4.6, reviews: 720, price: 1, alcohol: false, smoking: true, outdoor: true, km: 2.3, hours: '6:00–11:00', blurb: 'Sells out early. Reviews call it the bowl Huế people actually queue for.' },
  { name: 'Bún Bò Huế Hương Sen', city: 'Hue', neighborhood: 'Hue Center', address: '30 Bến Nghé, Hue', dish: 'bun-bo-hue', rating: 4.4, reviews: 540, price: 2, alcohol: true, smoking: false, outdoor: true, km: 1.8, hours: '10:00–21:00', blurb: 'Sit-down riverside. Reviews trade some grit for herbs and a calmer table.' },
  { name: 'Bún Bò Huế 26 Nguyễn Công Trứ', city: 'Hue', neighborhood: 'Hue Center', address: '26 Nguyễn Công Trứ, Hue', dish: 'bun-bo-hue', rating: 4.4, reviews: 610, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.3, hours: '6:00–13:00', blurb: 'Quiet morning shop. Guests mention hock, thick noodles and a lemongrass finish.' },
  { name: 'Bún Bò Huế Cô Ba', city: 'Da Nang', neighborhood: 'Ngũ Hành Sơn', address: 'Lê Văn Duyệt, Ngũ Hành Sơn', dish: 'bun-bo-hue', rating: 4.4, reviews: 780, price: 1, alcohol: false, smoking: false, outdoor: false, km: 3.9, hours: '6:00–13:00', blurb: 'Beach-adjacent lunch. Reviews mention a short cab from Mỹ Khê and a proper central broth.' },
  { name: 'Bún Bò Huế 19 Ông Ích Khiêm', city: 'Da Nang', neighborhood: 'Hải Châu', address: '19 Ông Ích Khiêm, Hải Châu', dish: 'bun-bo-hue', rating: 4.3, reviews: 640, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.6, hours: '6:00–14:00', blurb: 'City-centre stools. Diners like a slightly milder spice than Bà Dưỡng.' },
  { name: 'Bún Bò Huế 91 Trần Cao Vân', city: 'Da Nang', neighborhood: 'Hải Châu', address: '91 Trần Cao Vân, Hải Châu', dish: 'bun-bo-hue', rating: 4.5, reviews: 890, price: 1, alcohol: false, smoking: false, outdoor: false, km: 2.1, hours: '6:00–13:00', blurb: 'Neighbourhood bowl. Reviews praise the shrimp-paste depth without the early-morning crush.' },
  { name: 'Phở 42 Nguyễn Văn Linh', city: 'Da Nang', neighborhood: 'Hải Châu', address: '42 Nguyễn Văn Linh, Hải Châu', dish: 'pho', rating: 4.3, reviews: 880, price: 1, alcohol: false, smoking: false, outdoor: false, km: 2.2, hours: '6:00–14:00', blurb: 'River-adjacent morning bowl. Guests mention a clean broth and a short walk from the Dragon Bridge.' },
  { name: 'Phở Gà Bà Tám', city: 'Da Nang', neighborhood: 'Thanh Khê', address: 'Lê Đình Dương, Thanh Khê', dish: 'pho', rating: 4.4, reviews: 710, price: 1, alcohol: false, smoking: true, outdoor: true, km: 2.8, hours: '6:00–13:00', blurb: 'Chicken pho specialists. Reviews like the lighter cup before a beach afternoon.' },
  { name: 'Phở Bò 28 Hải Phòng', city: 'Da Nang', neighborhood: 'Hải Châu', address: '28 Hải Phòng, Hải Châu', dish: 'pho', rating: 4.3, reviews: 540, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.9, hours: '6:00–21:00', blurb: 'Longer hours than most. Diners treat it as an easy evening bowl after the beach.' },
  { name: 'Bánh Mì 109 Lê Duẩn', city: 'Da Nang', neighborhood: 'Hải Châu', address: '109 Lê Duẩn, Hải Châu', dish: 'banh-mi', rating: 4.4, reviews: 960, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.4, hours: '6:00–20:00', blurb: 'Crisp coastal loaf. Reviews mention pâté and pickles without the Bà Lan queue.' },
  { name: 'Bánh Mì Cô Xuân', city: 'Da Nang', neighborhood: 'Sơn Trà', address: 'Võ Nguyên Giáp, Sơn Trà', dish: 'banh-mi', rating: 4.3, reviews: 620, price: 1, alcohol: false, smoking: true, outdoor: true, km: 3.6, hours: '6:30–19:00', blurb: 'Beach-road sandwich. Guests like a short cab from Mỹ Khê and a chilli that actually bites.' },
  { name: 'Bánh Mì Bà Hòa', city: 'Hoi An', neighborhood: 'Old Town', address: 'Phan Châu Trinh, Hoi An', dish: 'banh-mi', rating: 4.5, reviews: 840, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.1, hours: '7:00–19:00', blurb: 'Quieter than Phượng. Reviews praise a lighter filling and a baguette that stays loud.' },
  { name: 'Bánh Mì Ông Hai', city: 'Hoi An', neighborhood: 'An Hội', address: 'Nguyễn Phúc Chu, Hoi An', dish: 'banh-mi', rating: 4.4, reviews: 510, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.5, hours: '7:00–20:00', blurb: 'Across the river. Guests mention grilled pork and fewer tour groups.' },
  { name: 'Café Trứng Hàng Gai', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '11 Hàng Gai, Hoàn Kiếm', dish: 'ca-phe-trung', rating: 4.4, reviews: 860, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.0, hours: '8:00–22:00', blurb: 'Silk-street stop. Guests mention a cocoa-dusted foam and air-con after shopping.' },
  { name: 'Gỏi Cuốn Bà Năm', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: 'Nguyễn Thị Minh Khai, District 3', dish: 'goi-cuon', rating: 4.4, reviews: 640, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.8, hours: '10:00–21:00', blurb: 'Herb-heavy D3 rolls. Reviews like the peanut dip and prawns that still snap.' },
  { name: 'Gỏi Cuốn 22 Võ Văn Tần', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: '22 Võ Văn Tần, District 3', dish: 'goi-cuon', rating: 4.3, reviews: 480, price: 1, alcohol: false, smoking: false, outdoor: true, km: 2.0, hours: '10:00–21:00', blurb: 'Pavement stools. Diners mention a fish-sauce dip option if peanut feels too sweet.' },
  { name: 'Gỏi Cuốn Cô Tư', city: 'Ho Chi Minh City', neighborhood: 'Phú Nhuận', address: 'Phan Xích Long, Phú Nhuận', dish: 'goi-cuon', rating: 4.4, reviews: 560, price: 1, alcohol: false, smoking: true, outdoor: true, km: 3.0, hours: '10:00–21:00', blurb: 'Neighbourhood rolls. Reviews send you for the herb pile and a light lunch between museums.' },
  { name: 'Gỏi Cuốn Hoa Đăng', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: 'Pasteur, District 1', dish: 'goi-cuon', rating: 4.3, reviews: 710, price: 2, alcohol: true, smoking: false, outdoor: false, km: 1.3, hours: '11:00–22:00', blurb: 'Sit-down rolls with a drink. Guests like the cooler room and a proper peanut sauce.' },
  { name: 'Gỏi Cuốn 8 Nguyễn Thiệp', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '8 Nguyễn Thiệp, District 1', dish: 'goi-cuon', rating: 4.2, reviews: 390, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.1, hours: '10:00–20:00', blurb: 'Near Bến Thành. Reviews treat it as a reliable herb roll when you do not want a heavy soup.' },

  // —— Fill every dish × city gap (every food city serves every dish)
  { name: 'Phở Bà Bé', city: 'Hoi An', neighborhood: 'Old Town', address: '45 Trần Hưng Đạo, Hoi An', dish: 'pho', rating: 4.4, reviews: 980, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.0, hours: '6:00–14:00', blurb: 'Morning bowl in the old town. Reviews mention a clean broth useful before a lantern-walk day.' },
  { name: 'Phở Hội An 12', city: 'Hoi An', neighborhood: 'An Hội', address: '12 Nguyễn Phúc Chu, Hoi An', dish: 'pho', rating: 4.3, reviews: 640, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.4, hours: '6:00–13:00', blurb: 'Across the river. Guests like chicken pho and a quieter room than the lantern core.' },
  { name: 'Phở 79 Trần Phú', city: 'Nha Trang', neighborhood: 'Beachfront', address: '79 Trần Phú, Nha Trang', dish: 'pho', rating: 4.4, reviews: 2100, price: 1, alcohol: false, smoking: false, outdoor: true, km: 0.9, hours: '6:00–21:00', blurb: 'Sea-road convenience. Reviews call the broth a touch sweeter — a solid bowl after the beach.' },
  { name: 'Phở Gà Nha Trang', city: 'Nha Trang', neighborhood: 'Center', address: '28 Thái Nguyên, Nha Trang', dish: 'pho', rating: 4.5, reviews: 860, price: 1, alcohol: false, smoking: true, outdoor: false, km: 1.6, hours: '6:00–14:00', blurb: 'Chicken-pho specialists inland of the strip. Diners mention a lighter cup before a humid afternoon.' },
  { name: 'Phở Bò Đà Lạt', city: 'Da Lat', neighborhood: 'Center', address: '12 Nguyễn Thị Minh Khai, Da Lat', dish: 'pho', rating: 4.4, reviews: 1200, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.1, hours: '6:00–14:00', blurb: 'Highland morning bowl. Reviews like the steam in cool air and a clear spice.' },
  { name: 'Phở 3 Tháng 2', city: 'Da Lat', neighborhood: 'Hòa Bình', address: '3 Tháng 2, Da Lat', dish: 'pho', rating: 4.3, reviews: 720, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.5, hours: '6:00–13:00', blurb: 'Market-adjacent stools. Guests treat it as the honest breakfast before a lake walk.' },

  { name: 'Bánh Mì Ninh Bình', city: 'Ninh Binh', neighborhood: 'Town center', address: 'Trần Hưng Đạo, Ninh Bình', dish: 'banh-mi', rating: 4.4, reviews: 680, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.2, hours: '6:30–19:00', blurb: 'Walk-away loaf before Tràng An. Reviews praise pâté and a pickle that still snaps.' },
  { name: 'Bánh Mì Cô Lan', city: 'Ninh Binh', neighborhood: 'Ninh Bình town', address: 'Lê Hồng Phong, Ninh Bình', dish: 'banh-mi', rating: 4.3, reviews: 410, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.8, hours: '6:30–20:00', blurb: 'Quieter town loaf. Guests mention grilled pork and a baguette that survives humidity.' },
  { name: 'Bánh Mì Huế 17', city: 'Hue', neighborhood: 'Hue Center', address: '17 Trần Hưng Đạo, Hue', dish: 'banh-mi', rating: 4.5, reviews: 1400, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.2, hours: '6:00–20:00', blurb: 'Citadel-side sandwich. Reviews like a spicier chilli oil than Hanoi loaves.' },
  { name: 'Bánh Mì Đông Ba', city: 'Hue', neighborhood: 'Dong Ba', address: 'Chợ Đông Ba, Hue', dish: 'banh-mi', rating: 4.4, reviews: 920, price: 1, alcohol: false, smoking: true, outdoor: true, km: 0.9, hours: '6:00–18:00', blurb: 'Market hatch. Diners grab pork and pâté between tomb days.' },
  { name: 'Bánh Mì 42 Trần Phú', city: 'Nha Trang', neighborhood: 'Beachfront', address: '42 Trần Phú, Nha Trang', dish: 'banh-mi', rating: 4.4, reviews: 1800, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.0, hours: '6:00–21:00', blurb: 'Coastal crackle. Reviews mention pâté, pickles and eating it on the promenade.' },
  { name: 'Bánh Mì Cô Hai', city: 'Nha Trang', neighborhood: 'Center', address: 'Pasteur, Nha Trang', dish: 'banh-mi', rating: 4.3, reviews: 640, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.7, hours: '6:30–19:00', blurb: 'Inland of the strip. Guests like a quieter queue and a chilli that bites.' },
  { name: 'Bánh Mì Đà Lạt 8', city: 'Da Lat', neighborhood: 'Center', address: '8 Hòa Bình, Da Lat', dish: 'banh-mi', rating: 4.5, reviews: 1100, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.0, hours: '7:00–20:00', blurb: 'Cool-air loaf. Reviews rave about a crackly crust that lasts in the highlands.' },
  { name: 'Bánh Mì Gà Xé', city: 'Da Lat', neighborhood: 'Market', address: 'Chợ Đà Lạt, Da Lat', dish: 'banh-mi', rating: 4.4, reviews: 780, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.3, hours: '6:30–19:00', blurb: 'Shredded-chicken filling. Diners mention herbs and a morning market crowd.' },

  { name: 'Bún Chả Ninh Bình', city: 'Ninh Binh', neighborhood: 'Town center', address: 'Trần Hưng Đạo, Ninh Bình', dish: 'bun-cha', rating: 4.4, reviews: 520, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.3, hours: '10:00–14:00, 17:00–20:00', blurb: 'Hanoi-style grill in town. Reviews like smoky patties before a river day.' },
  { name: 'Bún Chả Cô Tuyết', city: 'Ninh Binh', neighborhood: 'Ninh Bình town', address: 'Lê Hồng Phong, Ninh Bình', dish: 'bun-cha', rating: 4.3, reviews: 310, price: 1, alcohol: true, smoking: true, outdoor: true, km: 1.9, hours: '11:00–20:00', blurb: 'Lunch-and-dinner stools. Guests mention a sour-sweet dipping broth and herbs.' },
  { name: 'Bún Chả Huế 9', city: 'Hue', neighborhood: 'Hue Center', address: '9 Nguyễn Tri Phương, Hue', dish: 'bun-cha', rating: 4.4, reviews: 640, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.4, hours: '10:30–14:00, 17:00–20:00', blurb: 'Northern grill with a central chilli kick. Reviews say ask for less heat if you need to.' },
  { name: 'Bún Chả Thành Nội', city: 'Hue', neighborhood: 'Hue Citadel', address: 'Đinh Tiên Hoàng, Hue', dish: 'bun-cha', rating: 4.3, reviews: 410, price: 1, alcohol: true, smoking: true, outdoor: true, km: 1.1, hours: '11:00–21:00', blurb: 'Citadel-side lunch. Diners like charcoal on the pork and a beer if you linger.' },
  { name: 'Bún Chả Đà Nẵng', city: 'Da Nang', neighborhood: 'Hải Châu', address: '56 Lê Duẩn, Hải Châu', dish: 'bun-cha', rating: 4.5, reviews: 980, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.5, hours: '10:00–14:00, 17:00–20:00', blurb: 'Hanoi plate on the river. Reviews praise smoky patties and a balanced dipping sauce.' },
  { name: 'Bún Chả Mỹ Khê', city: 'Da Nang', neighborhood: 'Sơn Trà', address: 'Võ Nguyên Giáp, Sơn Trà', dish: 'bun-cha', rating: 4.3, reviews: 560, price: 2, alcohol: true, smoking: false, outdoor: true, km: 3.4, hours: '11:00–21:00', blurb: 'Beach-road grill. Guests treat it as a short cab from Mỹ Khê with a breezier room.' },
  { name: 'Bún Chả Hội An', city: 'Hoi An', neighborhood: 'Old Town', address: '18 Thái Phiên, Hoi An', dish: 'bun-cha', rating: 4.4, reviews: 720, price: 1, alcohol: false, smoking: false, outdoor: true, km: 0.9, hours: '11:00–21:00', blurb: 'Northern lunch in the old town. Reviews mention charcoal and a papaya garnish.' },
  { name: 'Bún Chả An Hội', city: 'Hoi An', neighborhood: 'An Hội', address: 'Nguyễn Phúc Chu, Hoi An', dish: 'bun-cha', rating: 4.3, reviews: 390, price: 1, alcohol: true, smoking: true, outdoor: true, km: 1.5, hours: '11:00–21:00', blurb: 'Quieter riverbank grill. Diners like herbs piled high and fewer tour groups.' },
  { name: 'Bún Chả Nha Trang', city: 'Nha Trang', neighborhood: 'Center', address: '18 Thái Nguyên, Nha Trang', dish: 'bun-cha', rating: 4.4, reviews: 810, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.4, hours: '11:00–21:00', blurb: 'Hanoi-style inland of the beach. Reviews praise the dipping broth more than the décor.' },
  { name: 'Bún Chả 33 Trần Phú', city: 'Nha Trang', neighborhood: 'Beachfront', address: '33 Trần Phú, Nha Trang', dish: 'bun-cha', rating: 4.2, reviews: 540, price: 2, alcohol: true, smoking: false, outdoor: true, km: 1.0, hours: '11:00–22:00', blurb: 'Sea-view stools. Guests order the combo and a drink after the water.' },
  { name: 'Bún Chả Đà Lạt', city: 'Da Lat', neighborhood: 'Center', address: '15 Phan Bội Châu, Da Lat', dish: 'bun-cha', rating: 4.5, reviews: 670, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.1, hours: '11:00–20:00', blurb: 'Cool-climate grill. Reviews like smoke in the air and a sauce that is not too sweet.' },
  { name: 'Bún Chả Hồ Xuân Hương', city: 'Da Lat', neighborhood: 'Lake', address: 'Hồ Xuân Hương, Da Lat', dish: 'bun-cha', rating: 4.3, reviews: 420, price: 2, alcohol: true, smoking: false, outdoor: true, km: 1.6, hours: '11:00–21:00', blurb: 'Lake-side lunch. Diners mention herbs, charcoal pork and a jumper-weather terrace.' },

  { name: 'Bún Bò Huế Hàng Bồ', city: 'Hanoi', neighborhood: 'Old Quarter', address: '22 Hàng Bồ, Hoàn Kiếm', dish: 'bun-bo-hue', rating: 4.5, reviews: 1600, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.0, hours: '6:00–14:00', blurb: 'Central bowl in the capital. Reviews praise lemongrass and a heat you can ask to tone down.' },
  { name: 'Bún Bò Huế 18 Lò Đúc', city: 'Hanoi', neighborhood: 'Hai Bà Trưng', address: '18 Lò Đúc, Hai Bà Trưng', dish: 'bun-bo-hue', rating: 4.4, reviews: 980, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.7, hours: '6:00–13:00', blurb: 'Morning specialist. Guests mention thick noodles, hock and shrimp paste done properly.' },
  { name: 'Bún Bò Huế Ninh Bình', city: 'Ninh Binh', neighborhood: 'Town center', address: 'Trần Hưng Đạo, Ninh Bình', dish: 'bun-bo-hue', rating: 4.4, reviews: 480, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.4, hours: '6:00–13:00', blurb: 'Breakfast pot before the river. Reviews like lemongrass first, chilli second.' },
  { name: 'Bún Bò Cô Năm', city: 'Ninh Binh', neighborhood: 'Ninh Bình town', address: 'Lê Hồng Phong, Ninh Bình', dish: 'bun-bo-hue', rating: 4.3, reviews: 290, price: 1, alcohol: false, smoking: true, outdoor: true, km: 2.0, hours: '6:00–12:00', blurb: 'Sells out before noon. Diners call it the town’s serious Huế bowl.' },
  { name: 'Bún Bò Huế Hội An', city: 'Hoi An', neighborhood: 'Old Town', address: '32 Trần Phú, Hoi An', dish: 'bun-bo-hue', rating: 4.5, reviews: 1100, price: 1, alcohol: false, smoking: false, outdoor: true, km: 0.8, hours: '6:00–13:00', blurb: 'Early old-town pot. Reviews mention lemongrass and thick noodles before the heat.' },
  { name: 'Bún Bò Cẩm Nam', city: 'Hoi An', neighborhood: 'Cam Nam', address: 'Cẩm Nam, Hoi An', dish: 'bun-bo-hue', rating: 4.4, reviews: 360, price: 1, alcohol: false, smoking: true, outdoor: true, km: 2.2, hours: '6:00–12:00', blurb: 'Island-side breakfast. Guests like a short walk from the lantern core.' },
  { name: 'Bún Bò Huế Nha Trang', city: 'Nha Trang', neighborhood: 'Center', address: '21 Hoàng Hoa Thám, Nha Trang', dish: 'bun-bo-hue', rating: 4.4, reviews: 890, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.5, hours: '6:00–14:00', blurb: 'Inland of the beach. Reviews praise shrimp paste depth and a proper round noodle.' },
  { name: 'Bún Bò 55 Trần Phú', city: 'Nha Trang', neighborhood: 'Beachfront', address: '55 Trần Phú, Nha Trang', dish: 'bun-bo-hue', rating: 4.3, reviews: 620, price: 2, alcohol: true, smoking: false, outdoor: true, km: 1.1, hours: '6:00–21:00', blurb: 'Longer hours than most. Diners order extra chilli on the side after a swim.' },
  { name: 'Bún Bò Huế Đà Lạt', city: 'Da Lat', neighborhood: 'Center', address: '20 Phan Đình Phùng, Da Lat', dish: 'bun-bo-hue', rating: 4.5, reviews: 740, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.2, hours: '6:00–13:00', blurb: 'Highland heat in a cool room. Reviews like lemongrass and a broth that still bites.' },
  { name: 'Bún Bò Chợ Đà Lạt', city: 'Da Lat', neighborhood: 'Market', address: 'Chợ Đà Lạt, Da Lat', dish: 'bun-bo-hue', rating: 4.3, reviews: 410, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.4, hours: '6:00–12:00', blurb: 'Market stools. Guests mention hock, thick noodles and selling out by late morning.' },

  { name: 'Cao Lầu Hà Nội', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '14 Hàng Bông, Hoàn Kiếm', dish: 'cao-lau', rating: 4.3, reviews: 540, price: 2, alcohol: true, smoking: false, outdoor: false, km: 1.1, hours: '10:00–21:00', blurb: 'Hội An-style noodles in the Old Quarter. Reviews check the chew — if it bounces, you are close.' },
  { name: 'Cao Lầu Phố Cổ', city: 'Hanoi', neighborhood: 'Old Quarter', address: '9 Tạ Hiện, Hoàn Kiếm', dish: 'cao-lau', rating: 4.2, reviews: 380, price: 2, alcohol: true, smoking: false, outdoor: true, km: 0.8, hours: '11:00–22:00', blurb: 'Evening plate with roast pork and crackling. Guests treat it as a taste of the centre in the north.' },
  { name: 'Cao Lầu Ninh Bình', city: 'Ninh Binh', neighborhood: 'Town center', address: 'Trần Hưng Đạo, Ninh Bình', dish: 'cao-lau', rating: 4.3, reviews: 260, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.5, hours: '10:00–20:00', blurb: 'Chewy noodles, roast pork, a splash of broth. Reviews like it as a change from river-day phở.' },
  { name: 'Cao Lầu Tam Cốc', city: 'Ninh Binh', neighborhood: 'Tam Cốc', address: 'Tam Cốc, Ninh Bình', dish: 'cao-lau', rating: 4.2, reviews: 190, price: 2, alcohol: true, smoking: false, outdoor: true, km: 4.2, hours: '10:00–20:00', blurb: 'After the boats. Diners mention pork, greens and noodles with bite.' },
  { name: 'Cao Lầu Huế', city: 'Hue', neighborhood: 'Hue Center', address: '24 Lê Lợi, Hue', dish: 'cao-lau', rating: 4.4, reviews: 480, price: 2, alcohol: true, smoking: false, outdoor: false, km: 1.2, hours: '10:00–21:00', blurb: 'Hội An bowl between tomb days. Reviews praise the light splash of broth, not a soup.' },
  { name: 'Cao Lầu 6 Nguyễn Công Trứ', city: 'Hue', neighborhood: 'Hue Center', address: '6 Nguyễn Công Trứ, Hue', dish: 'cao-lau', rating: 4.3, reviews: 310, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.5, hours: '10:00–20:00', blurb: 'Family room. Guests like crackling on top and chilli-lime on the side.' },
  { name: 'Cao Lầu Đà Nẵng', city: 'Da Nang', neighborhood: 'Hải Châu', address: '88 Trần Phú, Hải Châu', dish: 'cao-lau', rating: 4.5, reviews: 920, price: 2, alcohol: true, smoking: false, outdoor: true, km: 1.3, hours: '10:00–21:00', blurb: 'Closest city to the source. Reviews say the noodle bounce is the test — this one passes.' },
  { name: 'Cao Lầu Sơn Trà', city: 'Da Nang', neighborhood: 'Sơn Trà', address: 'Ngô Quyền, Sơn Trà', dish: 'cao-lau', rating: 4.3, reviews: 410, price: 2, alcohol: false, smoking: false, outdoor: false, km: 3.2, hours: '10:00–20:00', blurb: 'East-of-the-river plate. A short cab from Mỹ Khê; guests mention roast pork and greens.' },
  { name: 'Cao Lầu Sài Gòn', city: 'Ho Chi Minh City', neighborhood: 'District 1', address: '19 Lê Thánh Tôn, District 1', dish: 'cao-lau', rating: 4.4, reviews: 860, price: 2, alcohol: true, smoking: false, outdoor: false, km: 1.0, hours: '10:00–22:00', blurb: 'Hội An noodles in D1. Reviews like chewy strands, five-spice pork and only a splash of broth.' },
  { name: 'Cao Lầu Quận 3', city: 'Ho Chi Minh City', neighborhood: 'District 3', address: 'Võ Văn Tần, District 3', dish: 'cao-lau', rating: 4.3, reviews: 420, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.8, hours: '10:00–21:00', blurb: 'Quieter room than D1. Diners mention crackling and herbs without a tourist markup.' },
  { name: 'Cao Lầu Nha Trang', city: 'Nha Trang', neighborhood: 'Beachfront', address: '61 Trần Phú, Nha Trang', dish: 'cao-lau', rating: 4.3, reviews: 510, price: 2, alcohol: true, smoking: false, outdoor: true, km: 1.1, hours: '10:00–22:00', blurb: 'Coastal take. Reviews still look for chew in the noodle — order it if you miss Hội An.' },
  { name: 'Cao Lầu 14 Pasteur', city: 'Nha Trang', neighborhood: 'Center', address: '14 Pasteur, Nha Trang', dish: 'cao-lau', rating: 4.2, reviews: 280, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.6, hours: '10:00–20:00', blurb: 'Inland plate. Guests like roast pork, greens and a chilli-lime that actually wakes the bowl.' },
  { name: 'Cao Lầu Đà Lạt', city: 'Da Lat', neighborhood: 'Center', address: '18 Nguyễn Chí Thanh, Da Lat', dish: 'cao-lau', rating: 4.4, reviews: 390, price: 2, alcohol: true, smoking: false, outdoor: false, km: 1.2, hours: '10:00–21:00', blurb: 'Cool-air noodles. Reviews mention bounce, pork and a jumper on the chair back.' },
  { name: 'Cao Lầu Hòa Bình', city: 'Da Lat', neighborhood: 'Hòa Bình', address: 'Hòa Bình, Da Lat', dish: 'cao-lau', rating: 4.3, reviews: 240, price: 2, alcohol: false, smoking: false, outdoor: true, km: 1.0, hours: '10:00–20:00', blurb: 'Square-adjacent. Diners treat it as a highland Hội An bowl with proper crackling.' },

  { name: 'Cộng Cà Phê Ninh Bình', city: 'Ninh Binh', neighborhood: 'Town center', address: 'Trần Hưng Đạo, Ninh Bình', dish: 'ca-phe-trung', rating: 4.3, reviews: 640, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.3, hours: '7:00–22:00', blurb: 'Retro room, egg coffee on the menu. Reviews say spoon the foam first — handy before Tràng An.' },
  { name: 'Café Trứng Ninh Bình', city: 'Ninh Binh', neighborhood: 'Ninh Bình town', address: 'Lê Hồng Phong, Ninh Bình', dish: 'ca-phe-trung', rating: 4.4, reviews: 280, price: 2, alcohol: false, smoking: false, outdoor: true, km: 1.8, hours: '8:00–21:00', blurb: 'Smaller sit. Guests mention a thicker cream and a quiet terrace.' },
  { name: 'Cộng Cà Phê Huế', city: 'Hue', neighborhood: 'Hue Center', address: 'Lê Lợi, Hue', dish: 'ca-phe-trung', rating: 4.4, reviews: 1100, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.2, hours: '7:00–22:00', blurb: 'Consistent egg coffee after the citadel. Reviews like the hot-water bath under the cup.' },
  { name: 'Café Trứng Đông Ba', city: 'Hue', neighborhood: 'Dong Ba', address: 'Nguyễn Tri Phương, Hue', dish: 'ca-phe-trung', rating: 4.3, reviews: 360, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.0, hours: '8:00–21:00', blurb: 'Localer foam. Diners mention robusta bitterness under a less-sweet cream.' },
  { name: 'Cộng Cà Phê Đà Nẵng', city: 'Da Nang', neighborhood: 'Hải Châu', address: 'Bạch Đằng, Hải Châu', dish: 'ca-phe-trung', rating: 4.4, reviews: 1800, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.1, hours: '7:00–23:00', blurb: 'River-road chain with egg coffee. Reviews call it consistent — sit upstairs if the street is loud.' },
  { name: 'Café Trứng Hải Châu', city: 'Da Nang', neighborhood: 'Hải Châu', address: 'Lê Duẩn, Hải Châu', dish: 'ca-phe-trung', rating: 4.5, reviews: 520, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.5, hours: '8:00–22:00', blurb: 'Thicker cream than the chain. Guests linger with cocoa on the foam.' },
  { name: 'Cộng Cà Phê Hội An', city: 'Hoi An', neighborhood: 'An Hội', address: 'Nguyễn Phúc Chu, Hoi An', dish: 'ca-phe-trung', rating: 4.4, reviews: 2100, price: 2, alcohol: false, smoking: false, outdoor: true, km: 1.3, hours: '7:00–23:00', blurb: 'Lantern-side egg coffee. Reviews tell you to spoon first, then stir — riverside seats fill early.' },
  { name: 'Café Trứng Hội An', city: 'Hoi An', neighborhood: 'Old Town', address: 'Nguyễn Thái Học, Hoi An', dish: 'ca-phe-trung', rating: 4.5, reviews: 680, price: 2, alcohol: false, smoking: false, outdoor: false, km: 0.9, hours: '8:00–22:00', blurb: 'Quiet upstairs room. Diners like a custard foam and a rest from the street.' },
  { name: 'Cộng Cà Phê Nha Trang', city: 'Nha Trang', neighborhood: 'Beachfront', address: 'Trần Phú, Nha Trang', dish: 'ca-phe-trung', rating: 4.3, reviews: 1500, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.0, hours: '7:00–23:00', blurb: 'Egg coffee after the beach. Reviews mention iced versions for humid afternoons.' },
  { name: 'Café Trứng Nha Trang', city: 'Nha Trang', neighborhood: 'Center', address: 'Pasteur, Nha Trang', dish: 'ca-phe-trung', rating: 4.4, reviews: 410, price: 2, alcohol: false, smoking: false, outdoor: false, km: 1.6, hours: '8:00–22:00', blurb: 'Inland sit. Guests praise a bitter robusta under a proper yolk cream.' },

  { name: 'Gỏi Cuốn Ninh Bình', city: 'Ninh Binh', neighborhood: 'Town center', address: 'Trần Hưng Đạo, Ninh Bình', dish: 'goi-cuon', rating: 4.3, reviews: 320, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.3, hours: '10:00–21:00', blurb: 'Cool rolls after a humid river day. Reviews like mint, prawn and a fish-sauce dip.' },
  { name: 'Gỏi Cuốn Cô Mai', city: 'Ninh Binh', neighborhood: 'Ninh Bình town', address: 'Lê Hồng Phong, Ninh Bình', dish: 'goi-cuon', rating: 4.4, reviews: 210, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.9, hours: '10:00–20:00', blurb: 'Herb-forward. Guests mention rice paper that is not gummy.' },
  { name: 'Gỏi Cuốn Huế', city: 'Hue', neighborhood: 'Hue Center', address: '11 Nguyễn Công Trứ, Hue', dish: 'goi-cuon', rating: 4.4, reviews: 480, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.3, hours: '10:00–21:00', blurb: 'Light lunch between tombs. Reviews like prawn-pork and a sharper northern-leaning dip.' },
  { name: 'Gỏi Cuốn Sông Hương', city: 'Hue', neighborhood: 'Hue Center', address: 'Lê Lợi, Hue', dish: 'goi-cuon', rating: 4.3, reviews: 360, price: 2, alcohol: true, smoking: false, outdoor: true, km: 1.1, hours: '11:00–22:00', blurb: 'Riverside rolls. Diners share a peanut dip and a drink if the day is hot.' },
  { name: 'Gỏi Cuốn Đà Nẵng', city: 'Da Nang', neighborhood: 'Hải Châu', address: '40 Trần Phú, Hải Châu', dish: 'goi-cuon', rating: 4.4, reviews: 720, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.2, hours: '10:00–21:00', blurb: 'River-road herbs. Reviews praise prawns that snap and a peanut sauce that is not cloying.' },
  { name: 'Gỏi Cuốn Mỹ Khê', city: 'Da Nang', neighborhood: 'Sơn Trà', address: 'Võ Nguyên Giáp, Sơn Trà', dish: 'goi-cuon', rating: 4.3, reviews: 410, price: 2, alcohol: true, smoking: false, outdoor: true, km: 3.5, hours: '11:00–22:00', blurb: 'Beach-adjacent rolls. Guests treat them as a light lunch after the water.' },
  { name: 'Gỏi Cuốn Đà Lạt', city: 'Da Lat', neighborhood: 'Center', address: '22 Phan Đình Phùng, Da Lat', dish: 'goi-cuon', rating: 4.4, reviews: 390, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.1, hours: '10:00–21:00', blurb: 'Cool-climate herbs. Reviews like mint, pork and a dip you can make sharper.' },
  { name: 'Gỏi Cuốn Hồ Xuân Hương', city: 'Da Lat', neighborhood: 'Lake', address: 'Hồ Xuân Hương, Da Lat', dish: 'goi-cuon', rating: 4.3, reviews: 270, price: 2, alcohol: true, smoking: false, outdoor: true, km: 1.5, hours: '11:00–21:00', blurb: 'Lake-side rolls. Diners mention a peanut dip and a jumper on the chair.' },

  { name: 'Cơm Tấm Hà Nội', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '27 Lý Quốc Sư, Hoàn Kiếm', dish: 'com-tam', rating: 4.4, reviews: 860, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.0, hours: '10:00–21:00', blurb: 'Saigon plate in the Old Quarter. Reviews like scallion oil, a grilled chop and pickles on the side.' },
  { name: 'Cơm Tấm 15 Hàng Bông', city: 'Hanoi', neighborhood: 'Hoàn Kiếm', address: '15 Hàng Bông, Hoàn Kiếm', dish: 'com-tam', rating: 4.3, reviews: 520, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.2, hours: '10:00–21:00', blurb: 'Stool-and-grill energy. Guests mention sườn and a nước mắm that is not too sweet.' },
  { name: 'Cơm Tấm Ninh Bình', city: 'Ninh Binh', neighborhood: 'Town center', address: 'Trần Hưng Đạo, Ninh Bình', dish: 'com-tam', rating: 4.3, reviews: 340, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.4, hours: '10:00–21:00', blurb: 'Broken rice after the river. Reviews praise a charcoal chop and scallion oil.' },
  { name: 'Cơm Tấm Cô Hạnh', city: 'Ninh Binh', neighborhood: 'Ninh Bình town', address: 'Lê Hồng Phong, Ninh Bình', dish: 'com-tam', rating: 4.4, reviews: 220, price: 1, alcohol: false, smoking: true, outdoor: true, km: 2.0, hours: '10:00–20:00', blurb: 'Local pricing. Diners order sườn bì and iced tea.' },
  { name: 'Cơm Tấm Huế', city: 'Hue', neighborhood: 'Hue Center', address: '19 Trần Hưng Đạo, Hue', dish: 'com-tam', rating: 4.4, reviews: 510, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.3, hours: '10:00–21:00', blurb: 'Southern plate with a central chilli. Reviews like the grill crust and pickles.' },
  { name: 'Cơm Tấm 8 Nguyễn Tri Phương', city: 'Hue', neighborhood: 'Hue Center', address: '8 Nguyễn Tri Phương, Hue', dish: 'com-tam', rating: 4.3, reviews: 290, price: 1, alcohol: true, smoking: true, outdoor: true, km: 1.6, hours: '10:00–21:00', blurb: 'Lunch stools. Guests mention broken rice that drinks the mắm.' },
  { name: 'Cơm Tấm Hội An', city: 'Hoi An', neighborhood: 'Old Town', address: '21 Trần Hưng Đạo, Hoi An', dish: 'com-tam', rating: 4.4, reviews: 640, price: 1, alcohol: false, smoking: false, outdoor: true, km: 1.0, hours: '10:00–21:00', blurb: 'Saigon lunch in the old town. Reviews praise scallion oil and a chop with caramel edges.' },
  { name: 'Cơm Tấm An Hội', city: 'Hoi An', neighborhood: 'An Hội', address: 'Nguyễn Phúc Chu, Hoi An', dish: 'com-tam', rating: 4.3, reviews: 310, price: 1, alcohol: true, smoking: true, outdoor: true, km: 1.5, hours: '10:00–21:00', blurb: 'Across the river. Diners like a quieter grill and an egg that is actually runny.' },
  { name: 'Cơm Tấm Nha Trang', city: 'Nha Trang', neighborhood: 'Center', address: '16 Thái Nguyên, Nha Trang', dish: 'com-tam', rating: 4.4, reviews: 780, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.4, hours: '10:00–21:00', blurb: 'Inland of the beach. Reviews mention charcoal pork and pickles that cut the richness.' },
  { name: 'Cơm Tấm 70 Trần Phú', city: 'Nha Trang', neighborhood: 'Beachfront', address: '70 Trần Phú, Nha Trang', dish: 'com-tam', rating: 4.3, reviews: 540, price: 2, alcohol: true, smoking: false, outdoor: true, km: 1.0, hours: '10:00–22:00', blurb: 'Sea-road plate. Guests order sườn and iced tea after a swim.' },
  { name: 'Cơm Tấm Đà Lạt', city: 'Da Lat', neighborhood: 'Center', address: '11 Nguyễn Thị Minh Khai, Da Lat', dish: 'com-tam', rating: 4.5, reviews: 610, price: 1, alcohol: false, smoking: false, outdoor: false, km: 1.1, hours: '10:00–21:00', blurb: 'Highland grill. Reviews like a smoky chop, scallion oil and a cooler room.' },
  { name: 'Cơm Tấm Chợ Đà Lạt', city: 'Da Lat', neighborhood: 'Market', address: 'Chợ Đà Lạt, Da Lat', dish: 'com-tam', rating: 4.3, reviews: 330, price: 1, alcohol: false, smoking: true, outdoor: true, km: 1.3, hours: '10:00–20:00', blurb: 'Market stools. Diners mention broken rice, pickles and a chop that is not over-sugared.' },
]

export const RESTAURANTS: Restaurant[] = SEEDS.map(toRestaurant)

export function priceSymbols(level: 1 | 2 | 3 | 4): string {
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

export function getRestaurantsForDish(
  dishId: string | 'All',
  city: FoodCity | 'All',
  sort: RestaurantSort,
  filters: RestaurantFilter,
  tripCities: FoodCity[] = [],
  options?: { skipInterleave?: boolean; preferNearby?: boolean },
): Restaurant[] {
  let list =
    dishId === 'All'
      ? [...RESTAURANTS]
      : RESTAURANTS.filter((r) => r.specialityDishIds.includes(dishId))
  if (city !== 'All') list = list.filter((r) => r.city === city)
  else if (tripCities.length > 0) list = list.filter((r) => tripCities.includes(r.city))

  if (filters.servesAlcohol) list = list.filter((r) => r.servesAlcohol)
  if (filters.allowsSmoking) list = list.filter((r) => r.allowsSmoking)

  const preferNearby =
    options?.preferNearby ?? (tripCities.length > 0 && city === 'All' && !options?.skipInterleave)
  const sorted = sortList(list, sort, preferNearby)

  if (options?.skipInterleave) return sorted
  if (city === 'All' && tripCities.length === 0) return interleaveByCity(sorted)
  return sorted
}

export function citiesForDish(dishId: string | 'All'): FoodCity[] {
  const source =
    dishId === 'All'
      ? RESTAURANTS
      : RESTAURANTS.filter((r) => r.specialityDishIds.includes(dishId))
  const set = new Set(source.map((r) => r.city))
  return FOOD_CITIES.filter((c) => set.has(c))
}

export function restaurantCityCounts(dishId: string | 'All'): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const r of RESTAURANTS) {
    if (dishId !== 'All' && !r.specialityDishIds.includes(dishId)) continue
    counts[r.city] = (counts[r.city] ?? 0) + 1
  }
  return counts
}

export function restaurantDishCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const r of RESTAURANTS) {
    for (const id of r.specialityDishIds) {
      counts[id] = (counts[id] ?? 0) + 1
    }
  }
  return counts
}
