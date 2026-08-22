import type {
  CostLevel,
  PropertyType,
  StayFilterId,
  StayProperty,
} from './types'
import { buildExtraStaysForClusters } from './stayExtras'
import { STAY_CLUSTERS } from './clusters'
import { getStayCity } from './cities'

type StaySeed = Omit<
  StayProperty,
  | 'image'
  | 'bookingUrl'
  | 'sourceLabel'
  | 'mapsUrl'
  | 'reviewCount'
  | 'propertyType'
  | 'petsAllowed'
  | 'caretaker'
  | 'smokingAllowed'
  | 'drinkingAllowed'
  | 'quietHours'
  | 'flexibleCancel'
  | 'instantBook'
> & {
  imageIndex: number
}

const IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80',
]

const seed = (
  id: string,
  clusterId: string,
  name: string,
  rating: number,
  costLevel: CostLevel,
  typicalNightlyRange: [number, number],
  distanceLabel: string,
  amenities: string[],
  bestFor: StayFilterId[],
  reason: string,
  imageIndex: number,
): StaySeed => ({
  id, clusterId, name, rating, costLevel, typicalNightlyRange, distanceLabel,
  amenities, bestFor, reason, imageIndex,
})

const SEEDS: StaySeed[] = [
  seed('la-siesta-classic-ma-may', 'hanoi-old-quarter', 'La Siesta Classic Ma May', 4.7, 3, [70, 125], '5 min walk to Hoan Kiem Lake', ['Spa', 'Rooftop bar', 'Breakfast'], ['first-trip', 'food', 'walkable'], 'Polished service in the heart of the lanes, with a useful rooftop escape from the bustle.', 0),
  seed('peridot-grand', 'hanoi-old-quarter', 'Peridot Grand Luxury Boutique Hotel', 4.8, 4, [100, 180], '9 min walk to Hoan Kiem Lake', ['Pool', 'Spa', 'Rooftop bar'], ['luxury', 'first-trip', 'central'], 'A full-service boutique option with a rare central pool and strong skyline views.', 1),
  seed('hanoi-marvellous', 'hanoi-old-quarter', 'Hanoi Marvellous Hotel & Spa', 4.7, 2, [40, 75], '8 min walk to the lake', ['Spa', 'Breakfast', 'Family rooms'], ['budget', 'first-trip', 'walkable'], 'Friendly small-hotel value on the quieter western side of the Old Quarter.', 2),

  seed('sofitel-legend-metropole', 'hanoi-french-quarter', 'Sofitel Legend Metropole Hanoi', 4.8, 4, [220, 420], '2 min walk to the Opera House', ['Pool', 'Spa', 'Heritage tours'], ['luxury', 'culture', 'first-trip'], 'Hanoi’s landmark heritage hotel, chosen for history, gardens and exceptionally central calm.', 3),
  seed('capella-hanoi', 'hanoi-french-quarter', 'Capella Hanoi', 4.9, 4, [350, 650], '1 min walk to the Opera House', ['Pool', 'Spa', 'Fine dining'], ['luxury', 'culture', 'central'], 'An intimate, theatrical splurge beside the Opera House with highly personal service.', 4),
  seed('apricot-hotel', 'hanoi-french-quarter', 'Apricot Hotel', 4.5, 4, [110, 210], 'Across from Hoan Kiem Lake', ['Rooftop pool', 'Gym', 'Lake views'], ['luxury', 'walkable', 'first-trip'], 'The practical lake-view luxury pick, especially for travelers who want everything on foot.', 5),

  seed('intercontinental-westlake', 'hanoi-tay-ho', 'InterContinental Hanoi Westlake', 4.6, 4, [130, 230], 'Overwater on West Lake', ['Pool', 'Lake views', 'Family rooms'], ['quiet', 'luxury', 'families'], 'Resort-like overwater rooms make the city feel distant while remaining a short taxi away.', 6),
  seed('sheraton-hanoi', 'hanoi-tay-ho', 'Sheraton Hanoi Hotel', 4.5, 4, [110, 190], '4 min walk to the lake', ['Pool', 'Tennis', 'Club lounge'], ['families', 'quiet', 'luxury'], 'Dependable facilities and generous rooms suit families and longer stays.', 7),
  seed('oakwood-residence-hanoi', 'hanoi-tay-ho', 'Oakwood Residence Hanoi', 4.7, 3, [75, 145], '2 min walk to West Lake', ['Kitchen', 'Pool', 'Laundry'], ['families', 'quiet'], 'Apartment facilities and a calm lakeside position work especially well for longer visits.', 8),

  seed('grand-mercure-hanoi', 'hanoi-ba-dinh', 'Grand Mercure Hanoi', 4.7, 4, [100, 180], '8 min walk to Temple of Literature', ['Rooftop pool', 'Spa', 'Gym'], ['culture', 'luxury', 'families'], 'A contemporary full-service base near the city’s major cultural sights.', 9),
  seed('la-batisse-kim-ma', 'hanoi-ba-dinh', 'La Batisse Kim Ma Hotel', 4.4, 2, [35, 65], '10 min walk to Lotte Center', ['Breakfast', 'Restaurant', 'Airport transfer'], ['budget', 'quiet'], 'Straightforward comfort in a local, well-connected part of Ba Dinh.', 10),
  seed('the-q-hotel', 'hanoi-ba-dinh', 'The Q Hotel', 4.5, 2, [40, 75], '12 min walk to Truc Bach Lake', ['Breakfast', 'Gym', 'Family rooms'], ['budget', 'families', 'culture'], 'A sensible midrange choice between the Citadel sights and Truc Bach food streets.', 11),

  seed('fusion-original-saigon', 'hcmc-district-1', 'Fusion Original Saigon Centre', 4.7, 4, [130, 230], 'Above Saigon Centre mall', ['Pool', 'Gym', 'Club lounge'], ['first-trip', 'luxury', 'central'], 'Modern rooms, skyline pool and an exceptionally easy downtown position.', 0),
  seed('silverland-ben-thanh', 'hcmc-district-1', 'Silverland Ben Thanh', 4.7, 3, [85, 150], '2 min walk to Ben Thanh Market', ['Rooftop pool', 'Afternoon tea', 'Bar'], ['first-trip', 'walkable', 'food'], 'Distinctive design and generous extras make this a strong-value central boutique.', 1),
  seed('the-myst-dong-khoi', 'hcmc-district-1', 'The Myst Dong Khoi', 4.6, 4, [140, 250], '4 min walk to Nguyen Hue', ['Rooftop pool', 'Spa', 'Balconies'], ['luxury', 'culture', 'central'], 'A characterful alternative to chain hotels, with local materials and private balcony tubs.', 2),

  seed('mai-house-saigon', 'hcmc-district-3', 'Mai House Saigon Hotel', 4.7, 4, [105, 180], '6 min walk to War Remnants Museum', ['Pool', 'Spa', 'Family rooms'], ['luxury', 'culture', 'families'], 'Elegant, calm and close enough to walk into District 1 without sleeping amid its noise.', 3),
  seed('bach-suites-saigon', 'hcmc-district-3', 'Bach Suites Saigon', 4.8, 3, [85, 145], 'At Turtle Lake', ['Rooftop pool', 'Kitchenettes', 'Breakfast'], ['walkable', 'quiet', 'food'], 'Small, design-conscious suites in one of the city’s best café pockets.', 4),
  seed('hotel-des-arts-saigon', 'hcmc-district-3', 'Hôtel des Arts Saigon', 4.7, 4, [150, 260], '7 min walk to Notre-Dame Cathedral', ['Rooftop pool', 'Spa', 'Bars'], ['luxury', 'nightlife', 'culture'], 'A polished art-led stay with one of the city’s most atmospheric rooftop pools.', 5),

  seed('mia-saigon', 'hcmc-thao-dien', 'Mia Saigon', 4.8, 4, [190, 340], 'On the Saigon River', ['Riverfront pool', 'Spa', 'Shuttle boat'], ['luxury', 'quiet', 'families'], 'The strongest resort-style retreat within the city, with spacious river-facing rooms.', 6),
  seed('villa-song-saigon', 'hcmc-thao-dien', 'Villa Song Saigon', 4.7, 4, [150, 260], 'On the Saigon River', ['Pool', 'Boat shuttle', 'Breakfast'], ['quiet', 'luxury', 'families'], 'An intimate colonial-style riverside stay with a genuinely peaceful garden.', 7),
  seed('somerset-vista', 'hcmc-thao-dien', 'Somerset Vista Ho Chi Minh City', 4.5, 3, [90, 160], '8 min taxi to Thao Dien centre', ['Kitchen', 'Pool', 'Laundry'], ['families', 'quiet'], 'Large serviced apartments and excellent recreation facilities suit longer family stays.', 8),

  seed('eastin-grand-saigon', 'hcmc-phu-nhuan', 'Eastin Grand Hotel Saigon', 4.5, 3, [55, 95], '15 min taxi to the airport', ['Pool', 'Gym', 'Airport access'], ['budget', 'families'], 'A reliable full-service hotel that balances airport convenience and city access.', 9),
  seed('muong-thanh-luxury-phu-nhuan', 'hcmc-phu-nhuan', 'Muong Thanh Luxury Saigon Hotel', 4.4, 3, [50, 90], '10 min taxi to the airport', ['Pool', 'Spa', 'Family rooms'], ['budget', 'families'], 'Spacious rooms and a pool at rates usually below central equivalents.', 10),
  seed('homee-house-saigon', 'hcmc-phu-nhuan', 'Homee House Saigon', 4.5, 1, [22, 42], '15 min taxi to District 1', ['Kitchenette', 'Laundry', 'Self check-in'], ['budget', 'quiet'], 'A simple local apartment-style base for travelers prioritizing value.', 11),

  seed('wink-hotel-danang-centre', 'danang-hai-chau', 'Wink Hotel Danang Centre', 4.6, 2, [35, 65], '3 min walk to Han Market', ['24-hour stay', 'Gym', 'Bar'], ['budget', 'central', 'food'], 'Compact, lively and unusually flexible, right beside the market and cathedral.', 0),
  seed('vanda-hotel', 'danang-hai-chau', 'Vanda Hotel', 4.5, 3, [45, 85], 'Overlooking Dragon Bridge', ['Indoor pool', 'Spa', 'River views'], ['families', 'central', 'walkable'], 'River views and full facilities at a practical midrange price.', 1),
  seed('sanouva-danang', 'danang-hai-chau', 'Sanouva Danang Hotel', 4.5, 2, [30, 60], '6 min walk to Con Market', ['Spa', 'Breakfast', 'Gym'], ['budget', 'food', 'culture'], 'A dependable value base between Da Nang’s two major markets.', 2),

  seed('tms-hotel-danang-beach', 'danang-my-khe', 'TMS Hotel Da Nang Beach', 4.7, 3, [65, 120], 'Across from My Khe Beach', ['Infinity pool', 'Kids club', 'Spa'], ['beach', 'families', 'first-trip'], 'Strong sea views and family facilities without top-resort pricing.', 3),
  seed('haian-beach-hotel', 'danang-my-khe', 'HAIAN Beach Hotel & Spa', 4.6, 3, [55, 105], 'Across from My Khe Beach', ['Rooftop pool', 'Spa', 'Airport shuttle'], ['beach', 'first-trip', 'families'], 'A consistent all-rounder for beach access, pool time and nearby dining.', 4),
  seed('chicland-danang', 'danang-my-khe', 'Chicland Danang Beach Hotel', 4.6, 3, [70, 130], 'Across from My Khe Beach', ['Rooftop pool', 'Café', 'Bicycles'], ['beach', 'luxury', 'food'], 'Biophilic design and a quieter northern My Khe position give it boutique appeal.', 5),

  seed('intercontinental-danang', 'danang-son-tra', 'InterContinental Danang Sun Peninsula Resort', 4.8, 4, [450, 850], 'Private Son Tra bay', ['Private beach', 'Spa', 'Kids club'], ['luxury', 'quiet', 'families', 'beach'], 'A destination resort with dramatic architecture and one of the coast’s finest private settings.', 6),
  seed('son-tra-resort', 'danang-son-tra', 'Son Tra Resort', 4.2, 3, [90, 170], 'Private peninsula beach', ['Private pool villas', 'Beach', 'Restaurant'], ['families', 'quiet', 'beach'], 'Older but spacious villas offer privacy at a more approachable peninsula price.', 7),
  seed('radisson-hotel-danang', 'danang-son-tra', 'Radisson Hotel Danang', 4.6, 3, [75, 140], '2 min walk to north My Khe', ['Rooftop pool', 'Spa', 'Sea views'], ['beach', 'families', 'quiet'], 'Full-service comfort on the calmer northern edge of the main beach strip.', 8),

  seed('novotel-danang-premier', 'danang-han-river', 'Novotel Danang Premier Han River', 4.6, 4, [100, 180], 'On the Han River', ['Pool', 'Kids club', 'Rooftop bar'], ['families', 'central', 'nightlife'], 'A dependable riverfront tower with strong family facilities and panoramic views.', 9),
  seed('hilton-danang', 'danang-han-river', 'Hilton Da Nang', 4.6, 4, [95, 170], 'On the Han River', ['Pool', 'Executive lounge', 'Gym'], ['luxury', 'central', 'walkable'], 'Smart rooms and an excellent upper-river position near city restaurants.', 10),
  seed('melia-vinpearl-riverfront', 'danang-han-river', 'Melia Vinpearl Danang Riverfront', 4.5, 3, [65, 125], 'Across from the city skyline', ['Indoor and outdoor pools', 'Kids club', 'Spa'], ['families', 'central'], 'Large rooms and extensive pools make it an easy family compromise between city and beach.', 11),

  seed('almanity-hoi-an', 'hoian-ancient-town', 'Almanity Hoi An Resort & Spa', 4.7, 4, [90, 170], '10 min walk to Ancient Town', ['Large pool', 'Spa', 'Yoga'], ['luxury', 'first-trip', 'families'], 'Resort facilities within walking range of the heritage core—a rare combination.', 0),
  seed('little-hoi-an-boutique', 'hoian-ancient-town', 'Little Hoi An Boutique Hotel & Spa', 4.6, 3, [65, 115], '4 min walk to Night Market', ['Pool', 'Spa', 'Bicycles'], ['first-trip', 'walkable', 'culture'], 'A charming riverside base just outside the busiest pedestrian lanes.', 1),
  seed('hoian-central-hotel', 'hoian-ancient-town', 'Hoi An Central Hotel', 4.6, 2, [35, 65], '5 min walk to Central Market', ['Pool', 'Breakfast', 'Bicycles'], ['budget', 'walkable', 'first-trip'], 'Excellent-value pool and garden stay at the eastern gate of the old town.', 2),

  seed('laluna-hoi-an-riverside', 'hoian-cam-pho', 'Laluna Hoi An Riverside Hotel & Spa', 4.6, 3, [55, 100], '7 min walk to Japanese Bridge', ['Pool', 'Spa', 'River views'], ['walkable', 'families', 'culture'], 'Easy heritage access with a pool and calmer riverside outlook.', 3),
  seed('cozy-savvy-boutique', 'hoian-cam-pho', 'Cozy Savvy Boutique Hotel Hoi An', 4.8, 2, [40, 75], '12 min walk to Ancient Town', ['Pool', 'Bicycles', 'Breakfast'], ['budget', 'families', 'walkable'], 'Warm service, modern rooms and unusually strong value just west of the centre.', 4),
  seed('silkotel-hoi-an', 'hoian-cam-pho', 'Silkotel Hoi An', 4.5, 3, [50, 90], '6 min walk to Japanese Bridge', ['Two pools', 'Spa', 'Bicycles'], ['families', 'walkable', 'first-trip'], 'A practical resort-style choice close to the old town’s western entrance.', 5),

  seed('lasenta-boutique', 'hoian-cam-chau', 'Lasenta Boutique Hotel Hoian', 4.7, 3, [55, 105], '8 min taxi to Ancient Town', ['Infinity pool', 'Rice-field views', 'Bicycles'], ['quiet', 'families', 'luxury'], 'The rice-field-facing pool captures Cam Chau’s calm without feeling isolated.', 6),
  seed('an-villa-hoi-an', 'hoian-cam-chau', 'An Villa Hoi An', 4.8, 3, [65, 120], '12 min taxi to Ancient Town', ['Pool', 'Garden', 'Bicycles'], ['quiet', 'families', 'food'], 'An intimate garden retreat with thoughtful hosts and a genuinely residential setting.', 7),
  seed('hoi-an-chic-green-retreat', 'hoian-cam-chau', 'Hoi An Chic Green Retreat', 4.7, 3, [50, 95], '10 min taxi to Ancient Town', ['Pool', 'Rice-field views', 'Shuttle'], ['quiet', 'families', 'culture'], 'Spacious, green and well placed for cycling between town and countryside.', 8),

  seed('a-bang-beach-villa', 'hoian-an-bang', 'A Bang Beach Villa', 4.7, 2, [40, 80], '2 min walk to An Bang Beach', ['Pool', 'Breakfast', 'Bicycles'], ['beach', 'budget', 'families'], 'A friendly small villa that delivers genuine beach proximity without resort prices.', 9),
  seed('the-watermark-beachside', 'hoian-an-bang', 'The Watermark Beachside Hotel', 4.8, 3, [55, 105], '1 min walk to An Bang Beach', ['Pool', 'Breakfast', 'Adults-focused'], ['beach', 'quiet'], 'Personal service and a tucked-away lane make this a calm beach-village favorite.', 10),
  seed('citadines-pearl-hoi-an', 'hoian-an-bang', 'Citadines Pearl Hoi An', 4.3, 3, [65, 130], 'On An Bang beachfront', ['Large pool', 'Private beach', 'Kids facilities'], ['beach', 'families'], 'Extensive facilities suit families who want a self-contained beachfront stay.', 11),

  seed('cam-thanh-garden-lodge', 'hoian-cam-thanh', 'Cam Thanh Garden Lodge', 4.7, 2, [32, 68], '5 min to coconut forest bay', ['Pool', 'Garden', 'Kayak'], ['quiet', 'families', 'culture'], 'A green lodge base for basket-boat mornings and slower village evenings.', 0),
  seed('bay-breeze-homestay', 'hoian-cam-thanh', 'Bay Breeze Homestay', 4.6, 1, [22, 45], 'Beside Cam Thanh waterways', ['Breakfast', 'Bicycles', 'Kayak'], ['budget', 'quiet', 'families'], 'Simple rooms with hosts who arrange bay trips and bikes into town.', 1),
  seed('coconut-grove-retreat', 'hoian-cam-thanh', 'Coconut Grove Retreat', 4.8, 3, [48, 95], 'Edge of the coconut forest', ['Pool', 'Spa', 'Garden'], ['quiet', 'luxury', 'families'], 'A secluded pool retreat that still keeps Old Town a short taxi away.', 2),

  seed('an-hoi-riverside-inn', 'hoian-an-hoi', 'An Hoi Riverside Inn', 4.6, 2, [35, 70], '2 min walk to An Hoi Bridge', ['River view', 'Breakfast', 'Bar'], ['first-trip', 'nightlife', 'walkable'], 'Lantern views across the river without sleeping inside the pedestrian crush.', 3),
  seed('lantern-view-house', 'hoian-an-hoi', 'Lantern View House', 4.7, 2, [30, 62], 'Facing the night market', ['Terrace', 'Breakfast', 'Family rooms'], ['food', 'nightlife', 'walkable'], 'A compact house-stay with balcony views over the evening lantern strip.', 4),
  seed('hoa-riverside-hotel', 'hoian-an-hoi', 'Hoa Riverside Hotel', 4.5, 3, [45, 88], 'On the An Hoi embankment', ['Pool', 'Spa', 'River views'], ['first-trip', 'families', 'walkable'], 'Small hotel comfort with an easy bridge walk into Old Town.', 5),

  seed('cam-nam-garden-stay', 'hoian-cam-nam', 'Cam Nam Garden Stay', 4.6, 2, [25, 55], '8 min walk to Cam Nam Bridge', ['Garden', 'Breakfast', 'Bicycles'], ['budget', 'quiet', 'families'], 'Leafy rooms on the quieter island side of the river.', 6),
  seed('island-breeze-homestay', 'hoian-cam-nam', 'Island Breeze Homestay', 4.7, 1, [20, 40], 'Local Cam Nam lanes', ['Kitchen', 'Laundry', 'Terrace'], ['budget', 'quiet', 'culture'], 'A local home base for travellers who prefer neighbourhood streets.', 7),
  seed('thu-bon-view-lodge', 'hoian-cam-nam', 'Thu Bon View Lodge', 4.5, 2, [28, 58], 'River edge of Cam Nam', ['River view', 'Breakfast', 'Bicycles'], ['quiet', 'walkable', 'culture'], 'Calm river outlooks with a short bridge hop into the heritage core.', 8),

  seed('spatel-d-annam', 'hue-citadel', 'Spatel d’Annam - Imperial Boutique Spa & Hotel', 4.7, 3, [55, 100], 'Opposite the Imperial City', ['Pool', 'Spa', 'Garden'], ['culture', 'walkable', 'quiet'], 'The most atmospheric full-service option directly beside the Citadel.', 0),
  seed('a-mira-homestay', 'hue-citadel', 'A-mâze House', 4.7, 1, [20, 40], '8 min walk to the Citadel', ['Garden', 'Shared kitchen', 'Bicycles'], ['budget', 'culture', 'quiet'], 'A small characterful home stay that fits the old-city neighborhood mood.', 1),
  seed('the-purple-hue-homestay', 'hue-citadel', 'The Purple Hue Homestay', 4.8, 1, [22, 42], '10 min walk to Imperial City', ['Garden', 'Breakfast', 'Family rooms'], ['budget', 'families', 'culture'], 'Thoughtful local hosts and a peaceful lane make it more memorable than a basic guesthouse.', 2),

  seed('melia-vinpearl-hue', 'hue-riverside', 'Melia Vinpearl Hue', 4.7, 4, [80, 145], '10 min walk to the river', ['Sky pool', 'Spa', 'City views'], ['luxury', 'families', 'central'], 'Hue’s best skyline facilities and a convenient shopping-centre location.', 3),
  seed('senna-hue', 'hue-riverside', 'Senna Hue Hotel', 4.7, 4, [65, 120], '5 min walk to Walking Street', ['Courtyard pool', 'Spa', 'Garden'], ['families', 'quiet', 'central'], 'A leafy courtyard and large pool create calm surprisingly close to the action.', 4),
  seed('white-lotus-hue', 'hue-riverside', 'White Lotus Hue Hotel', 4.6, 3, [45, 85], '4 min walk to Truong Tien Bridge', ['Pool', 'Spa', 'River views'], ['first-trip', 'walkable', 'budget'], 'Central, modern and well priced for travelers who want river and market access.', 5),

  seed('la-y-riverview', 'hue-phu-hiep', 'La Y Riverview', 4.6, 2, [28, 55], 'On the Nhu Y River', ['River terrace', 'Breakfast', 'Bicycles'], ['quiet', 'budget'], 'A peaceful water-facing alternative to Hue’s main hotel streets.', 6),
  seed('chi-homestay-hue', 'hue-phu-hiep', 'Chi Homestay Hue', 4.7, 1, [18, 35], '8 min taxi to Imperial City', ['Kitchen', 'Garden', 'Laundry'], ['budget', 'quiet', 'culture'], 'Simple, warm local hospitality at a genuinely low price.', 7),
  seed('toto-homestay', 'hue-phu-hiep', 'TOTO Homestay Hue', 4.6, 1, [18, 38], '9 min taxi to Dong Ba Market', ['Family rooms', 'Kitchen', 'Terrace'], ['budget', 'families'], 'A no-frills family-run option for travelers who value hosts over hotel facilities.', 8),

  seed('intercontinental-nha-trang', 'nhatrang-centre', 'InterContinental Nha Trang', 4.7, 4, [130, 230], 'Across from Nha Trang Beach', ['Pool', 'Kids club', 'Sea views'], ['luxury', 'beach', 'families'], 'The most dependable upscale beachfront service in the central strip.', 9),
  seed('libra-nha-trang', 'nhatrang-centre', 'Libra Nha Trang Hotel', 4.4, 2, [30, 60], '5 min walk to the beach', ['Indoor pool', 'Gym', 'Breakfast'], ['budget', 'central', 'beach'], 'A capable central hotel with more facilities than its typical price suggests.', 10),
  seed('potique-hotel', 'nhatrang-centre', 'Potique Hotel', 4.8, 4, [90, 165], '4 min walk to the beach', ['Rooftop pool', 'Spa', 'Kids club'], ['luxury', 'culture', 'families'], 'Locally inspired design and polished service offer character beyond a standard beach tower.', 11),

  seed('boton-blue', 'nhatrang-north-beach', 'Boma Resort Nha Trang', 4.7, 4, [100, 190], 'On a quiet northern bay', ['Sea-view pool', 'Spa', 'Kids club'], ['quiet', 'luxury', 'families', 'beach'], 'A stylish retreat north of town for travelers happy to trade walkability for calm.', 0),
  seed('navada-beach-hotel', 'nhatrang-north-beach', 'Navada Beach Hotel', 4.6, 3, [45, 85], 'Across from Hon Chong Beach', ['Rooftop pool', 'Sea views', 'Breakfast'], ['beach', 'budget', 'quiet'], 'Excellent sea-view value on a calmer beach than the central promenade.', 1),
  seed('volga-nha-trang', 'nhatrang-north-beach', 'Volga Nha Trang Hotel', 4.3, 2, [30, 60], '2 min walk to Hon Chong Beach', ['Pool', 'Family rooms', 'Restaurant'], ['budget', 'families', 'beach'], 'A simple, affordable option for families prioritizing beach location.', 2),

  seed('queen-ann-nha-trang', 'nhatrang-south-tran-phu', 'Queen Ann Nha Trang Hotel', 4.6, 3, [50, 95], 'Across from the beach', ['Pool', 'Kids room', 'Sea views'], ['families', 'beach', 'budget'], 'Family-friendly facilities and broad sea views at moderate rates.', 3),
  seed('emerald-bay-hotel-spa', 'nhatrang-south-tran-phu', 'Emerald Bay Hotel & Spa', 4.4, 2, [35, 70], '2 min walk to the beach', ['Pool', 'Spa', 'Family rooms'], ['budget', 'beach', 'families'], 'A straightforward beach hotel with a useful pool and quieter southern position.', 4),
  seed('xavia-hotel', 'nhatrang-south-tran-phu', 'Xavia Hotel', 4.5, 2, [35, 70], 'Across from the beach', ['Indoor pool', 'Gym', 'Sea views'], ['budget', 'beach'], 'Modern rooms and unobstructed views make it a strong-value southern pick.', 5),

  seed('colline-dalat', 'dalat-centre', 'Hôtel Colline', 4.5, 3, [65, 115], '3 min walk to Da Lat Market', ['Gym', 'Restaurants', 'Family rooms'], ['first-trip', 'central', 'families'], 'The easiest polished base for market evenings and car-free central exploring.', 6),
  seed('len-hotel', 'dalat-centre', 'Le Récit Boutique Hôtel de Dalat', 4.6, 3, [45, 85], '8 min walk to Da Lat Market', ['Breakfast', 'Family rooms', 'Restaurant'], ['culture', 'walkable', 'first-trip'], 'European-inspired character on a calmer street just above the centre.', 7),
  seed('stop-and-go-boutique', 'dalat-centre', 'Stop and Go Boutique Hotel', 4.5, 1, [22, 42], '10 min walk to the market', ['Garden', 'Shared kitchen', 'Family rooms'], ['budget', 'quiet'], 'A whimsical garden guesthouse for travelers who prefer personality to facilities.', 8),

  seed('dalat-palace-heritage', 'dalat-xuan-huong', 'Dalat Palace Heritage Hotel', 4.5, 4, [120, 220], 'Overlooking Xuan Huong Lake', ['Heritage rooms', 'Golf access', 'Restaurant'], ['luxury', 'culture', 'first-trip'], 'The classic Da Lat splurge, chosen for history, lawns and a commanding lake outlook.', 9),
  seed('mercure-dalat-resort', 'dalat-xuan-huong', 'Mercure Dalat Resort', 4.7, 4, [90, 170], '6 min taxi to Xuan Huong Lake', ['Gardens', 'Family rooms', 'Restaurant'], ['families', 'quiet', 'luxury'], 'Restored villas and flower-filled grounds create a relaxed heritage-resort feel.', 10),
  seed('golf-valley-hotel', 'dalat-xuan-huong', 'Golf Valley Hotel', 4.5, 3, [55, 100], '6 min walk to the lake', ['Gym', 'Spa', 'Family rooms'], ['families', 'walkable', 'central'], 'A modern, practical compromise between lake calm and market access.', 11),

  seed('ana-mandara-villas-dalat', 'dalat-hillside', 'Ana Mandara Villas Dalat Resort & Spa', 4.7, 4, [110, 210], '12 min taxi to Da Lat Market', ['Historic villas', 'Heated pool', 'Spa'], ['luxury', 'quiet', 'culture'], 'A pine-shaded collection of historic villas that feels rooted in old Da Lat.', 0),
  seed('teracotta-dalat', 'dalat-hillside', 'Terracotta Hotel & Resort Dalat', 4.4, 3, [70, 140], 'On Tuyen Lam Lake', ['Indoor pool', 'Gardens', 'Kids club'], ['families', 'quiet'], 'Extensive lakeside grounds and activities work well for a resort-focused family stay.', 1),
  seed('zen-valley-dalat', 'dalat-hillside', 'Zen Valley Dalat', 4.6, 3, [55, 105], '12 min taxi to centre', ['Heated pool', 'Valley views', 'Garden'], ['quiet', 'families'], 'Bungalow-style rooms and broad valley views deliver genuine hillside calm.', 2),

  seed('seashells-phu-quoc', 'phuquoc-duong-dong', 'Seashells Phu Quoc Hotel & Spa', 4.6, 4, [85, 160], '4 min walk to Night Market', ['Beachfront pool', 'Spa', 'Kids club'], ['families', 'central', 'beach'], 'The rare option combining a central town location with true beachfront resort facilities.', 3),
  seed('lahana-resort', 'phuquoc-duong-dong', 'Lahana Resort Phu Quoc', 4.7, 3, [55, 105], '5 min taxi to Night Market', ['Hilltop pool', 'Gardens', 'Family rooms'], ['quiet', 'families', 'budget'], 'Leafy hillside grounds feel secluded while remaining close to town.', 4),
  seed('the-poplar-resort', 'phuquoc-duong-dong', 'The Poplar Resort Phu Quoc', 4.6, 1, [25, 50], 'On Duong Dong beachfront', ['Beach access', 'Kitchenettes', 'Airport transfer'], ['budget', 'beach'], 'Simple rooms with direct sand access—an uncommon bargain close to town.', 5),

  seed('la-veranda-phu-quoc', 'phuquoc-long-beach', 'La Veranda Resort Phu Quoc - MGallery', 4.8, 4, [180, 340], 'On Long Beach', ['Private beach', 'Spa', 'Pool'], ['luxury', 'quiet', 'beach'], 'A refined colonial-style garden resort with one of Long Beach’s most atmospheric settings.', 6),
  seed('salinda-resort', 'phuquoc-long-beach', 'Salinda Resort Phu Quoc Island', 4.8, 4, [150, 280], 'On Long Beach', ['Saltwater pool', 'Spa', 'Kids club'], ['luxury', 'families', 'beach', 'food'], 'Personal service, mature gardens and notably strong dining make it a polished all-rounder.', 7),
  seed('dusit-princess-moonrise', 'phuquoc-long-beach', 'Dusit Princess Moonrise Beach Resort', 4.7, 3, [95, 175], 'On Long Beach', ['Infinity pool', 'Spa', 'Airport shuttle'], ['first-trip', 'beach', 'families'], 'A reliable mid-upscale resort with sunset views and easy airport access.', 8),

  seed('mango-bay-phu-quoc', 'phuquoc-ong-lang', 'Mango Bay Resort', 4.7, 3, [90, 180], 'On Ong Lang Beach', ['Private coves', 'Yoga', 'Restaurant'], ['quiet', 'beach', 'food'], 'Low-impact bungalows and excellent sunset dining define the island’s original barefoot retreat.', 9),
  seed('chen-sea-resort', 'phuquoc-ong-lang', 'Chen Sea Resort & Spa Phu Quoc', 4.7, 4, [170, 310], 'On a private bay', ['Private beach', 'Pool', 'Spa'], ['luxury', 'quiet', 'beach'], 'Spacious villas around a calm private bay suit couples and quiet-seeking families.', 10),
  seed('camia-resort-spa', 'phuquoc-ong-lang', 'Camia Resort & Spa', 4.7, 3, [85, 160], 'On Ong Lang coast', ['Two pools', 'Private beach', 'Spa'], ['families', 'quiet', 'beach'], 'A relaxed, good-value resort with sunset pools and plenty of garden space.', 11),

  seed('ancient-hue-garden-houses', 'hue-kim-long', 'Ancient Hue Garden Houses', 4.8, 4, [110, 210], '8 min taxi to Imperial City', ['Garden villas', 'Pool', 'Spa'], ['luxury', 'quiet', 'culture'], 'Traditional garden-house architecture makes this one of Hue’s most distinctive retreats.', 0),
  seed('hue-ecolodge', 'hue-kim-long', 'Hue Ecolodge', 4.5, 3, [50, 95], '12 min taxi to Thien Mu Pagoda', ['Pool', 'Gardens', 'Bicycles'], ['quiet', 'families', 'culture'], 'Leafy grounds and bungalow rooms create a rural feel within reach of the Citadel.', 1),
  seed('deja-vu-homestay', 'hue-kim-long', 'Deja Vu Homestay', 4.7, 1, [22, 42], '10 min taxi to Imperial City', ['Garden', 'Breakfast', 'Bicycles'], ['budget', 'quiet', 'culture'], 'A warm, artful home stay that suits travelers seeking a personal local base.', 2),

  seed('le-more-hotel', 'nhatrang-xom-moi', 'LeMore Hotel Nha Trang', 4.5, 2, [30, 60], '8 min walk to Xom Moi Market', ['Pool', 'Gym', 'Family rooms'], ['budget', 'families', 'food'], 'A modern inland hotel offering broad facilities at a low typical rate.', 3),
  seed('art-nest-hotel', 'nhatrang-xom-moi', 'The Art Nest Hotel Nha Trang', 4.5, 2, [32, 65], '9 min walk to the beach', ['Rooftop pool', 'Spa', 'Breakfast'], ['budget', 'walkable', 'food'], 'Compact, contemporary rooms well placed between local food streets and the beach.', 4),
  seed('rex-hotel-apartment', 'nhatrang-xom-moi', 'Rex Hotel & Apartment', 4.3, 1, [22, 45], '5 min walk to Xom Moi Market', ['Kitchenettes', 'Laundry', 'Family rooms'], ['budget', 'families'], 'A practical apartment-style choice for longer stays and market shopping.', 5),

  seed('dalat-cadasa-resort', 'dalat-tran-hung-dao', 'Dalat Cadasa Resort', 4.4, 3, [45, 90], '5 min walk to Da Lat Station', ['Historic villas', 'Gardens', 'Restaurant'], ['culture', 'quiet', 'families'], 'French-era villas in mature gardens fit the neighborhood’s heritage character.', 6),
  seed('le-house-dalat', 'dalat-tran-hung-dao', 'Le House Da Lat', 4.6, 2, [35, 70], '8 min taxi to Da Lat Market', ['Garden', 'Family rooms', 'Breakfast'], ['quiet', 'families', 'budget'], 'A small, peaceful villa stay with more personality than a standard centre hotel.', 7),
  seed('the-chocolate-box', 'dalat-tran-hung-dao', 'The Chocolate Box Hotel', 4.5, 2, [30, 60], '7 min walk to Da Lat Station', ['Café', 'Garden', 'Family rooms'], ['budget', 'culture', 'quiet'], 'A cozy design-led base for enjoying the station and villa district on foot.', 8),

  seed('famiana-resort-spa', 'phuquoc-cua-lap', 'Famiana Resort & Spa Phu Quoc', 4.5, 3, [75, 145], 'On Long Beach', ['Private beach', 'Pool', 'Spa'], ['beach', 'families', 'quiet'], 'A spacious, established resort with easy sand and airport access.', 9),
  seed('eden-resort-phu-quoc', 'phuquoc-cua-lap', 'Eden Resort Phu Quoc', 4.3, 2, [45, 90], 'On Long Beach', ['Beach access', 'Pool', 'Airport shuttle'], ['budget', 'beach', 'families'], 'A straightforward beach-and-pool option near the airport at moderate prices.', 10),
  seed('phu-quoc-valley-sen', 'phuquoc-cua-lap', 'Phu Quoc Valley Sen Bungalow', 4.7, 1, [28, 55], '7 min taxi to Long Beach', ['Pool', 'Garden', 'Airport transfer'], ['budget', 'quiet'], 'Garden bungalows and a pool offer unusually peaceful value just inland.', 11),
]

function inferPropertyType(name: string, amenities: string[]): PropertyType {
  const n = name.toLowerCase()
  if (n.includes('resort')) return 'resort'
  if (n.includes('villa') || n.includes('bungalow')) return 'villa'
  if (
    n.includes('apartment') ||
    n.includes('residence') ||
    n.includes('suites') ||
    amenities.some((a) => /kitchen/i.test(a))
  ) {
    return 'apartment'
  }
  if (n.includes('homestay') || n.includes('house') || n.includes('airbnb')) return 'airbnb'
  return 'hotel'
}

function cityLabelForCluster(clusterId: string): string {
  const cluster = STAY_CLUSTERS.find((c) => c.id === clusterId)
  if (!cluster) return 'Vietnam'
  return getStayCity(cluster.cityId).label
}

/** Top OTA detail/search pages — Booking, Agoda, Hotels.com, Airbnb. */
function buildBookingUrl(
  stayId: string,
  name: string,
  propertyType: PropertyType,
  clusterId: string,
): string {
  const city = cityLabelForCluster(clusterId)
  const query = encodeURIComponent(`${name}, ${city}`)

  if (propertyType === 'airbnb') {
    return `https://www.airbnb.com/s/homes?query=${query}`
  }
  if (propertyType === 'apartment') {
    // Apartments often list on both Airbnb and Booking — prefer Booking for hotel-style suites.
    const pick = stayId.length % 2
    return pick === 0
      ? `https://www.booking.com/searchresults.html?ss=${query}`
      : `https://www.airbnb.com/s/homes?query=${query}`
  }

  const hotelSites = [
    `https://www.booking.com/searchresults.html?ss=${query}`,
    `https://www.agoda.com/search?textToSearch=${query}`,
    `https://www.hotels.com/Hotel-Search?destination=${query}`,
  ]
  let h = 0
  for (let i = 0; i < stayId.length; i++) h = (h * 31 + stayId.charCodeAt(i)) >>> 0
  return hotelSites[h % hotelSites.length]
}

function enrichStay(
  property: Omit<StayProperty, 'image' | 'bookingUrl' | 'sourceLabel' | 'mapsUrl' | 'reviewCount' | 'propertyType' | 'petsAllowed' | 'caretaker' | 'smokingAllowed' | 'drinkingAllowed' | 'quietHours' | 'flexibleCancel' | 'instantBook'> & {
    imageIndex: number
  },
): StayProperty {
  const { imageIndex, ...rest } = property
  const propertyType = inferPropertyType(rest.name, rest.amenities)
  const reviewCount = 40 + Math.round(rest.rating * 87 + rest.name.length * 3) % 420
  const petsAllowed =
    propertyType === 'apartment' ||
    propertyType === 'villa' ||
    rest.bestFor.includes('families')
  const caretaker = propertyType === 'hotel' || propertyType === 'resort' || rest.costLevel >= 3
  const smokingAllowed = false
  const drinkingAllowed = rest.amenities.some((a) => /bar|rooftop/i.test(a)) || rest.costLevel >= 3
  const quietHours = rest.bestFor.includes('quiet') || rest.bestFor.includes('families')
  const flexibleCancel = rest.costLevel >= 2
  const instantBook = propertyType === 'airbnb' || propertyType === 'apartment' || rest.rating >= 4.6

  return {
    ...rest,
    image: IMAGES[imageIndex],
    bookingUrl: buildBookingUrl(rest.id, rest.name, propertyType, rest.clusterId),
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${rest.name}, Vietnam`)}`,
    sourceLabel: 'See booking options',
    reviewCount,
    propertyType,
    petsAllowed,
    caretaker,
    smokingAllowed,
    drinkingAllowed,
    quietHours,
    flexibleCancel,
    instantBook,
  }
}

export const STAY_PROPERTIES: StayProperty[] = [
  ...SEEDS,
  ...buildExtraStaysForClusters(),
].map(enrichStay)

export const STAY_PROPERTY_BY_ID = Object.fromEntries(
  STAY_PROPERTIES.map((property) => [property.id, property]),
) as Record<string, StayProperty>

export function getStaysForCluster(clusterId: string): StayProperty[] {
  return STAY_PROPERTIES.filter((property) => property.clusterId === clusterId)
}
