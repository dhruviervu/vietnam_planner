export type NeighbourhoodTip = {
  title: string
  body: string
}

export type NeighbourhoodSight = {
  name: string
  bullets: string[]
  experienceId?: string
  image: string
}

export type NeighbourhoodStayPick = {
  stayId: string
  name: string
  tier: string
  vibe: string
  bookingUrl: string
  image: string
}

export type NeighbourhoodGuide = {
  intro: string
  gettingAroundTitle: string
  gettingAround: NeighbourhoodTip[]
  safetyTitle?: string
  safety?: NeighbourhoodTip[]
  sightsTitle: string
  sights: NeighbourhoodSight[]
  stays: NeighbourhoodStayPick[]
}

function booking(name: string, city = 'Hanoi') {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${name}, ${city}, Vietnam`)}`
}

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`

export const NEIGHBOURHOOD_GUIDES: Partial<Record<string, NeighbourhoodGuide>> = {
  'hanoi-old-quarter': {
    intro:
      'Old Quarter in Hanoi is the city’s historic, cultural, and commercial heart. Known historically as the “36 Guild Streets” (36 Phố Phường), this district blends traditional French-colonial architecture with bustling trade, rich street-food culture, and vibrant nightlife.',
    gettingAroundTitle: 'Getting around & pedestrian navigation',
    gettingAround: [
      {
        title: 'Crossing the street',
        body: 'Traffic flows continuously and motorbikes rarely stop for pedestrian crossings. To cross: look for a clear gap, step onto the road, and walk slowly at a steady, predictable pace. Do not run, stop abruptly, or make sudden backward movements — drivers gauge your trajectory and steer around you.',
      },
      {
        title: 'Sidewalk walking',
        body: 'Sidewalks are routinely blocked by parked motorbikes, outdoor shop displays, and low plastic seats for street food stalls. Expect to walk along the edge of the road frequently.',
      },
      {
        title: 'Ride-hailing & public transit',
        body: 'Downloading ride-hailing apps before arriving makes getting around straightforward. Xanh SM (electric vehicles) and Grab offer transparent pricing for both cars and motorbikes (GrabBike).',
      },
      {
        title: 'Cyclos (pedicabs)',
        body: 'Fun for a slow tour, but agree on the total price and duration before sitting down. Clarify whether the agreed price is per person or for the entire ride.',
      },
    ],
    safetyTitle: 'Safety & scams',
    safety: [
      {
        title: 'Snatch-and-grab theft',
        body: 'Petty crime is low compared to many global capitals, but phone and bag snatching by passing motorbikes does happen. Keep your phone secure, especially when taking photos near busy roads or checking maps on curb edges.',
      },
      {
        title: 'Fruit / street vendors',
        body: 'Vendors carrying shoulder poles may approach, put the pole over your shoulder, offer a hat for a photo, or hand you fruit, then demand steep payment. Firmly decline with a polite wave or say “Không, cảm ơn” (No, thank you).',
      },
      {
        title: 'Shoe repair',
        body: 'People carrying repair kits may point at your shoes, claim they are damaged, and begin applying glue or soles before demanding high fees. Keep walking if someone kneels near your feet.',
      },
      {
        title: 'Taxi / meter scams',
        body: 'Unregulated street taxis may use rigged meters or inflated fixed rates. Stick to ride-hailing apps or established brands (e.g., Mai Linh or Vinasun) rather than flagging unmetered cars.',
      },
    ],
    sightsTitle: 'Iconic landmarks & sacred sites',
    sights: [
      {
        name: 'Hoàn Kiếm Lake',
        experienceId: 'hoan-kiem-lake',
        image: photo('1509030450996-dd1a26cea77b'),
        bullets: [
          'The focal point of the Old Quarter, a scenic gathering place surrounded by trees and walking paths.',
          'The iconic red Húc Bridge leads to Ngọc Sơn Temple on a small island.',
          'Transforms into a pedestrian walking street on weekend evenings.',
        ],
      },
      {
        name: 'St. Joseph Cathedral',
        experienceId: 'st-joseph-cathedral',
        image: photo('1555921017-83909c8c0d90'),
        bullets: [
          'A late 19th-century Neo-Gothic church whose façade echoes Notre Dame in Paris.',
          'Surrounded by vibrant sidewalk cafes popular for iced tea and egg coffee.',
          'Striking historic architecture inside and out.',
        ],
      },
      {
        name: 'Đồng Xuân Market',
        experienceId: 'dong-xuan-market',
        image: photo('1556910103-1c02745aae4d'),
        bullets: [
          'Hanoi’s largest indoor market, in a multi-story building at the northern edge of the Old Quarter.',
          'Wholesale stalls selling textiles, clothing, souvenirs, and local snacks.',
          'Surrounding food alleys offer traditional local dishes.',
        ],
      },
      {
        name: 'Hanoi Weekend Night Market start point',
        experienceId: 'hanoi-weekend-night-market',
        image: photo('1516450360452-9312f5e86fc7'),
        bullets: [
          'The sprawling outdoor market runs Friday through Sunday evening down Hàng Đào toward Đồng Xuân Market.',
          'Pedestrian-only streets lined with stalls selling handicrafts, street food, and apparel.',
          'Accompanied by live street music and cultural performances.',
        ],
      },
    ],
    stays: [],
  },

  'hanoi-french-quarter': {
    intro:
      'Located directly south and east of Hoàn Kiếm Lake, the French Quarter (Ba Đình / Hoàn Kiếm southern area) offers a distinctly different vibe from the Old Quarter, characterized by wide tree-lined boulevards, grand colonial mansions, upscale shopping, and government embassies.',
    gettingAroundTitle: 'Getting around',
    gettingAround: [
      {
        title: 'Pedestrian environment',
        body: 'Unlike the tight, congested streets of the Old Quarter, the French Quarter features broad, paved sidewalks that are much easier and safer to walk along.',
      },
      {
        title: 'Taxis & ride-hailing',
        body: 'Grab and Xanh SM work smoothly throughout the area, with clear pickup spots outside major landmarks and hotels.',
      },
      {
        title: 'Crossing roads',
        body: 'Streets are wider and traffic moves faster here than in the Old Quarter, but traffic lights and marked pedestrian crosswalks are far more common and generally respected by drivers.',
      },
    ],
    sightsTitle: 'Places to see',
    sights: [
      {
        name: 'Hanoi Opera House',
        experienceId: 'hanoi-opera-house',
        image: photo('1566073771259-6a8506099945'),
        bullets: [
          'An iconic 1911 landmark modeled after the Palais Garnier in Paris, with classic French colonial architecture.',
          'Admire the grand exterior façade, ornate columns, and surrounding plaza.',
          'Attend evening opera, orchestra, or traditional Vietnamese theatrical performances.',
        ],
      },
      {
        name: 'Hoa Lo Prison Relic',
        experienceId: 'hoa-lo-prison',
        image: photo('1578662996442-48f60103fc96'),
        bullets: [
          'Historically dubbed the “Hanoi Hilton,” this prison was built by French colonists in the late 19th century.',
          'Exhibits cover Vietnamese revolutionaries under colonial rule and American POWs during the Vietnam War.',
          'Preserves original cell blocks, watchtowers, and historical artifacts.',
        ],
      },
      {
        name: 'Trang Tien Plaza',
        experienceId: 'trang-tien-plaza',
        image: photo('1441986300917-64674bd600d8'),
        bullets: [
          'A historic high-end shopping center in a grand colonial building at the corner of Hoàn Kiếm Lake.',
          'International luxury fashion brands, cosmetics, and fine dining.',
          'A comfortable stop for air-conditioned shopping and cafe breaks.',
        ],
      },
    ],
    stays: [
      {
        stayId: 'apricot-hotel',
        name: 'Apricot Hotel',
        tier: '5-star',
        vibe: 'Luxury neo-classical hotel overlooking Hoàn Kiếm Lake. Features an upscale art collection, a rooftop pool with panoramic city views, and fine dining.',
        bookingUrl: booking('Apricot Hotel'),
        image: photo('1566073771259-6a8506099945'),
      },
      {
        stayId: 'grand-cititel-hanoi',
        name: 'Grand Cititel Hanoi Hotel',
        tier: '4-star',
        vibe: 'Sleek, modern, and centrally located. Known for clean, comfortable rooms, great service, and a convenient base near major dining spots.',
        bookingUrl: booking('Grand Cititel Hanoi Hotel'),
        image: photo('1564501049412-61c2a3083791'),
      },
      {
        stayId: 'hanoi-fiesta-grand',
        name: 'Hanoi Fiesta Grand Hotel & Spa',
        tier: '4-star',
        vibe: 'Highly rated boutique option blending modern comforts with classic Vietnamese hospitality. On-site spa and easy walking access to both the French and Old Quarters.',
        bookingUrl: booking('Hanoi Fiesta Grand Hotel & Spa'),
        image: photo('1542314831-068cd1dbfeeb'),
      },
      {
        stayId: 'hotel-de-rond-hanoi',
        name: 'Hôtel De Rond Hanoi',
        tier: '4-star',
        vibe: 'Stylish mid-to-upscale property with contemporary rooms, friendly staff, and quiet interiors despite being close to the action.',
        bookingUrl: booking('Hotel De Rond Hanoi'),
        image: photo('1571896349842-33c89424de2d'),
      },
      {
        stayId: 'la-selva-premium-hanoi',
        name: 'La Selva Premium Hotel',
        tier: '4-star',
        vibe: 'Highly rated for exceptional customer service, cozy modern rooms, and a location bridging the Old and French Quarters.',
        bookingUrl: booking('La Selva Premium Hotel Hanoi'),
        image: photo('1582719478250-c89cae4dc85b'),
      },
    ],
  },

  'hanoi-tay-ho': {
    intro:
      'West Lake (Hồ Tây) is Hanoi’s largest freshwater lake and a scenic, upscale respite north of the city center. Known for breezy lakeside paths, leafy residential enclaves, a vibrant expat community, and a relaxed cafe scene, Tây Hồ contrasts sharply with the dense intensity of the Old Quarter.',
    gettingAroundTitle: 'Getting around',
    gettingAround: [
      {
        title: 'Circumference distance',
        body: 'The lake perimeter spans about 17 km (10.5 miles), making a full walk challenging in one go.',
      },
      {
        title: 'Bicycles & scooters',
        body: 'Cycling or riding an electric scooter along lakeside roads like Tô Ngọc Vân, Xuân Diệu, and Trích Sài is a popular way to explore. Bicycle rentals are widely available around the lake shore.',
      },
      {
        title: 'Ride-hailing',
        body: 'Grab and Xanh SM cars/bikes operate seamlessly across the district and are ideal for getting from the Old Quarter to Tây Hồ (about a 10 to 15-minute ride).',
      },
      {
        title: 'Pedestrian walkways',
        body: 'Promenade paths line major stretches of the lake, offering wide, scenic walking space away from heavy vehicular traffic.',
      },
    ],
    safetyTitle: 'Safety & scams',
    safety: [
      {
        title: 'Low petty crime',
        body: 'Tây Hồ is generally considered one of the safest neighborhoods in Hanoi due to its residential and expat-heavy profile. Standard vigilance with bags and phones on main roads still applies.',
      },
      {
        title: 'Overpriced lakeside menus',
        body: 'Some casual seafood or snail (ốc) stalls right along the water do not display fixed prices and may charge tourists inflated rates. Always check the menu prices or clarify costs beforehand.',
      },
      {
        title: 'Taxis',
        body: 'Use ride-hailing apps rather than unmetered street taxis waiting outside popular lakeside venues.',
      },
    ],
    sightsTitle: 'Places to see',
    sights: [
      {
        name: 'Tran Quoc Pagoda',
        experienceId: 'tran-quoc-pagoda',
        image: photo('1548013146-72479768bada'),
        bullets: [
          'Hanoi’s oldest Buddhist pagoda, dating back over 1,400 years, on a small islet along the causeway between West Lake and Trúc Bạch Lake.',
          'Striking 11-story red stupa holding Buddhist relics and statues.',
          'Beautiful lakeside views, particularly at sunset.',
        ],
      },
      {
        name: 'Phủ Tây Hồ',
        experienceId: 'phu-tay-ho',
        image: photo('1506905925346-21bda4d32df4'),
        bullets: [
          'An important spiritual temple complex on a peninsula jutting into West Lake, dedicated to Mother Goddess Liễu Hạnh.',
          'Draws local worshippers for prayers and traditional rituals, especially during full moons and Lunar New Year.',
          'Surrounded by small local food stalls known for bánh tôm (crispy deep-fried shrimp cakes).',
        ],
      },
      {
        name: 'Quan Thanh Temple',
        experienceId: 'quan-thanh-temple',
        image: photo('1477587458883-47145ed94245'),
        bullets: [
          'An 11th-century Taoist temple near the southern edge of the lake at the start of Thanh Niên street.',
          'Houses a massive 4-tonne black bronze statue of Tran Vu cast in 1677.',
          'Ancient courtyards, shaded banyan trees, and intricate wood carvings.',
        ],
      },
    ],
    stays: [
      {
        stayId: 'intercontinental-westlake',
        name: 'InterContinental Hanoi Westlake by IHG',
        tier: 'Luxury',
        vibe: 'High-end resort stay with rooms built on stilts over West Lake, private balconies, lake views, an outdoor pool, and multiple fine dining venues.',
        bookingUrl: 'https://www.ihg.com/intercontinental/hotels/us/en/hanoi/hanha/hoteldetail',
        image: photo('1571003123894-1f0594d2b5d9'),
      },
      {
        stayId: 'pan-pacific-hanoi',
        name: 'Pan Pacific Hanoi',
        tier: 'Luxury',
        vibe: 'Upscale high-rise between West Lake and Trúc Bạch Lake, with refined rooms, an all-weather pool, and The Summit rooftop bar with panoramic city views.',
        bookingUrl: 'https://www.panpacific.com/en/hotels-and-resorts/pp-hanoi.html',
        image: photo('1551882547-ff40c63fe5fa'),
      },
      {
        stayId: 'sheraton-hanoi',
        name: 'Sheraton Hanoi Hotel',
        tier: 'Upper mid-range / luxury',
        vibe: 'Classic upscale hotel in lush gardens on the eastern shore of West Lake, with spacious rooms, a large outdoor pool, and easy access to Xuân Diệu dining.',
        bookingUrl: 'https://www.marriott.com/en-us/hotels/hansh-sheraton-hanoi-hotel/overview/',
        image: photo('1445019980597-93fa8acb246c'),
      },
      {
        stayId: 'irest-orange-tay-ho',
        name: 'iRest Orange Tay Ho Lakeside Apartment',
        tier: 'Mid-range / budget',
        vibe: 'Modern serviced apartments along Vũ Miên, with clean air-conditioned studios, kitchenettes, and direct lake views at moderate daily rates.',
        bookingUrl: booking('iRest Orange Tay Ho Lakeside Apartment'),
        image: photo('1520250497591-112f2f40a3f4'),
      },
      {
        stayId: 'sunset-westlake-hanoi',
        name: 'Sunset Westlake Hanoi Hotel',
        tier: 'Budget / value',
        vibe: 'Relaxed budget-friendly hotel along Lạc Long Quân with bright rooms, lake views from select balconies, and simple amenities for cost-conscious travelers.',
        bookingUrl: booking('Sunset Westlake Hanoi Hotel'),
        image: photo('1590490360182-c33d57733427'),
      },
    ],
  },

  'hanoi-ba-dinh': {
    intro:
      'Ba Đình is Hanoi’s political and administrative center. Home to government ministries, foreign embassies, botanical parks, and national monuments, this district features wide, quiet avenues lined with mahogany trees and grand yellow-walled colonial buildings.',
    gettingAroundTitle: 'Getting around',
    gettingAround: [
      {
        title: 'Wide, paved avenues',
        body: 'Walking in Ba Đình is much easier than in the Old Quarter. Sidewalks along Hoàng Diệu and Phan Đình Phùng are wide, clean, and well-shaded by giant trees.',
      },
      {
        title: 'Security & restricted zones',
        body: 'Because of embassy compounds and government sites, expect security checkpoints and police posts. Avoid photographing military buildings or restricted gates.',
      },
      {
        title: 'Ride-hailing & taxis',
        body: 'Grab and Xanh SM work smoothly for quick pickups across the district. Walking between sights within the historic park area is straightforward and pleasant.',
      },
    ],
    safetyTitle: 'Safety & scams',
    safety: [
      {
        title: 'Very safe environment',
        body: 'Ba Đình is one of the safest districts in Hanoi due to a heavy police and military presence near government sites.',
      },
      {
        title: 'Strict etiquette & dress codes',
        body: 'When visiting national sites like the Ho Chi Minh Mausoleum, modest dress (covering shoulders and knees) is strictly enforced. Security will turn away visitors in sleeveless tops, shorts, or hats inside memorial halls.',
      },
      {
        title: 'Visiting hours',
        body: 'Key government and memorial sites close early in the afternoon (and often on Mondays and Fridays). Always double-check operating hours before heading out.',
      },
    ],
    sightsTitle: 'Places to see',
    sights: [
      {
        name: 'Ho Chi Minh’s Mausoleum',
        experienceId: 'ho-chi-minh-mausoleum',
        image: photo('1528127269322-539801943592'),
        bullets: [
          'A monumental granite structure on Ba Đình Square where the embalmed body of Vietnam’s former leader lies in state.',
          'Formal honor guard ceremonies and expansive parade grounds.',
          'Part of a complex that includes the Presidential Palace, Ho Chi Minh’s Stilt House, and gardens.',
        ],
      },
      {
        name: 'Imperial Citadel of Thang Long',
        experienceId: 'thang-long-citadel',
        image: photo('1533929736458-ca588d08c8be'),
        bullets: [
          'A UNESCO World Heritage site representing over a millennium of Vietnamese military and royal history.',
          'Ancient stone gates, underground command bunkers from the Vietnam War, and archaeological display halls.',
          'The iconic Hanoi Flag Tower (Kỳ đài Hà Nội) stands near the entrance.',
        ],
      },
    ],
    stays: [
      {
        stayId: 'lotte-hotel-hanoi',
        name: 'Lotte Hotel Hanoi',
        tier: 'Luxury',
        vibe: 'Modern luxury high-rise on the upper floors of Lotte Center, with panoramic city views, an outdoor pool, full spa, and upscale dining.',
        bookingUrl: 'https://www.lottehotel.com/hanoi-hotel/en.html',
        image: photo('1618773928121-c32242e63f39'),
      },
      {
        stayId: 'fte-ba-dinh-hotel',
        name: 'FTE Ba Dinh Hotel',
        tier: 'Mid-range',
        vibe: 'Contemporary 4-star hotel with sleek modern rooms, attentive service, and an outdoor rooftop pool with city views in a quieter residential corner of the district.',
        bookingUrl: booking('FTE Ba Dinh Hotel'),
        image: photo('1611892440504-42a792e24d32'),
      },
      {
        stayId: 'collection-o-ba-dinh',
        name: 'Collection O Ba Dinh - Japanese Town',
        tier: 'Budget',
        vibe: 'Comfortable value lodging near the Đào Tấn Japanese enclave, with simple air-conditioned rooms close to authentic restaurants and cafes.',
        bookingUrl: booking('Collection O Ba Dinh Japanese Town'),
        image: photo('1564501049412-61c2a3083791'),
      },
    ],
  },

  'hcmc-district-1': {
    intro:
      'District 1 (Quận 1) is the commercial, financial, and cultural heart of Ho Chi Minh City (Saigon). Characterized by bustling tree-lined boulevards, colonial architecture, glass skyscrapers, and lively night markets, it is the primary hub for first-time visitors to southern Vietnam.',
    gettingAroundTitle: 'Getting around',
    gettingAround: [
      {
        title: 'Pedestrian walkways',
        body: 'Areas like Nguyễn Huệ Walking Street and Book Street offer broad, pedestrian-only plazas. Secondary streets often have sidewalks occupied by parked scooters and outdoor dining.',
      },
      {
        title: 'Ride-hailing apps',
        body: 'Grab and Xanh SM are the standard methods for transit. Motorbike rides (GrabBike) excel at navigating dense rush-hour traffic along major arteries like Nam Kỳ Khởi Nghĩa.',
      },
      {
        title: 'Crossing streets',
        body: 'Ho Chi Minh City traffic is dense and continuous. Cross steadily, at a slow, predictable pace, without sudden stops or running, so motorbike drivers can read your line and flow around you.',
      },
      {
        title: 'Public buses & metro',
        body: 'Central bus terminals near Bến Thành connect to outer districts. Metro Line 1 has central stations at Bến Thành Market and the Opera House.',
      },
    ],
    safetyTitle: 'Safety & scams',
    safety: [
      {
        title: 'Motorbike phone/bag snatching',
        body: 'This is the most common crime in District 1. Avoid holding your phone out near the edge of the street or curb, and keep cross-body bags slung away from road traffic.',
      },
      {
        title: 'Market bargaining & price inflation',
        body: 'At tourist hubs like Bến Thành Market, initial quoted prices for clothing, souvenirs, and food can be marked up significantly. Negotiate politely or visit fixed-price stalls.',
      },
      {
        title: 'Unmetered taxis & cyclo scams',
        body: 'Avoid unbranded street taxis. Stick to ride-hailing apps or established metered companies like Vinasun and Mai Linh. For cyclo rides, agree explicitly on total duration and total price in cash before getting in.',
      },
      {
        title: 'Nightlife hustles',
        body: 'Around Bùi Viện Walking Street, be cautious of inflated drink bills, hidden service charges, or over-aggressive street promoters.',
      },
    ],
    sightsTitle: 'Places to see',
    sights: [
      {
        name: 'Ben Thanh Market',
        experienceId: 'ben-thanh',
        image: photo('1583417319070-4a69db38a482'),
        bullets: [
          'Saigon’s most famous historic market hall, with a clock-tower entrance that serves as a city symbol.',
          'Hundreds of stalls selling local handicrafts, coffee, textiles, and souvenirs.',
          'A lively street-food hall inside offering bún riêu, gỏi cuốn, and fresh juices.',
        ],
      },
      {
        name: 'Notre Dame Cathedral of Saigon',
        experienceId: 'notre-dame-saigon',
        image: photo('1578662996442-48f60103fc96'),
        bullets: [
          'An 1880s Neo-Romanesque cathedral built with red bricks imported from Marseille.',
          'Twin 58-meter bell towers overlooking Paris Square.',
          'Directly across the street from the Saigon Central Post Office.',
        ],
      },
      {
        name: 'Independence Palace (Reunification Palace)',
        experienceId: 'independence-palace',
        image: photo('1528127269322-539801943592'),
        bullets: [
          'A preserved 1960s modernist landmark that served as the home and workplace of the South Vietnamese President.',
          'Intact presidential living quarters, war command bunker rooms, and rooftop helipad.',
          'Historic site where North Vietnamese tanks crashed through the gates on April 30, 1975, ending the Vietnam War.',
        ],
      },
    ],
    stays: [
      {
        stayId: 'park-hyatt-saigon',
        name: 'Park Hyatt Saigon',
        tier: 'Ultra-luxury',
        vibe: 'Elegant French colonial-style luxury hotel at Lam Sơn Square, with refined rooms, a lush courtyard pool, a full-service spa, and high-end dining.',
        bookingUrl: 'https://www.hyatt.com/park-hyatt/en-US/sgnhp-park-hyatt-saigon',
        image: photo('1566073771259-6a8506099945'),
      },
      {
        stayId: 'the-reverie-saigon',
        name: 'The Reverie Saigon Hotel',
        tier: 'Ultra-luxury',
        vibe: 'Opulent Italian-designed high-rise in the Times Square building on Nguyễn Huệ Boulevard, with sweeping river views, grand marble interiors, and an outdoor pool.',
        bookingUrl: 'https://www.thereveriesaigon.com/',
        image: photo('1542314831-068cd1dbfeeb'),
      },
      {
        stayId: 'silverland-sakyo',
        name: 'Silverland Sakyo Hotel',
        tier: 'Mid-range',
        vibe: 'Boutique stay in the Lê Thánh Tôn enclave, blending Japanese and Vietnamese aesthetics with timber interiors, an open-air rooftop hot tub, and daily afternoon tea.',
        bookingUrl: booking('Silverland Sakyo Hotel', 'Ho Chi Minh City'),
        image: photo('1571896349842-33c89424de2d'),
      },
      {
        stayId: 'hammock-hotel-fine-arts',
        name: 'The Hammock Hotel Fine Arts Museum',
        tier: 'Trendy / upper-budget',
        vibe: 'Playful design hotel with hanging indoor hammocks in every room, a rooftop lounge with complimentary drinks and snacks, and a location steps from the Fine Arts Museum.',
        bookingUrl: booking('The Hammock Hotel Fine Arts Museum', 'Ho Chi Minh City'),
        image: photo('1520250497591-112f2f40a3f4'),
      },
      {
        stayId: 'city-backpackers-hostel',
        name: 'CityBackpackers Hostel',
        tier: 'Budget',
        vibe: 'A clean, social budget hostel with comfortable bunk dorms, private rooms, free breakfast, and an easy location near Bến Thành Market.',
        bookingUrl: booking('CityBackpackers Hostel', 'Ho Chi Minh City'),
        image: photo('1551882547-ff40c63fe5fa'),
      },
    ],
  },

  'hcmc-district-3': {
    intro:
      'District 3 (Quận 3) sits directly adjacent to District 1. While still central, it offers a distinctly greener, more residential atmosphere characterized by leafy canopy avenues, preserved French villas, hip coffee shops, and rich local street-food culture.',
    gettingAroundTitle: 'Getting around',
    gettingAround: [
      {
        title: 'Tree-lined avenues',
        body: 'Major thoroughfares like Trần Quốc Thảo, Trương Định, and Nam Kỳ Khởi Nghĩa have high foliage canopies that make daytime walking more comfortable than in exposed areas.',
      },
      {
        title: 'Alleyway navigation (hẻm)',
        body: 'District 3 is famous for its network of residential alleys. These narrow passageways are mostly pedestrian and motorbike-only, with hidden eateries, boutique stores, and quiet homes.',
      },
      {
        title: 'Ride-hailing & taxis',
        body: 'Grab and Xanh SM are quick and affordable between District 3 and District 1 — typically a 5 to 10-minute ride.',
      },
      {
        title: 'Crossing streets',
        body: 'Traffic is somewhat calmer than on main District 1 junctions, but the same rule applies: walk steadily and predictably without sudden erratic movements.',
      },
    ],
    safetyTitle: 'Safety & scams',
    safety: [
      {
        title: 'Low crime rate',
        body: 'District 3 is a generally quiet and safe residential neighborhood. Petty crime is minimal compared to high-density tourist areas.',
      },
      {
        title: 'Bag/phone snatching',
        body: 'As in all central Saigon districts, keep your smartphone and belongings secure when standing near street curbs or riding on motorbikes.',
      },
      {
        title: 'Fair local pricing',
        body: 'District 3 caters heavily to residents, students, and office workers, so menu prices in restaurants, cafes, and street-food stalls are transparent, with far less inflated tourist pricing.',
      },
    ],
    sightsTitle: 'Places to see',
    sights: [
      {
        name: 'War Remnants Museum',
        experienceId: 'war-remnants',
        image: photo('1578662996442-48f60103fc96'),
        bullets: [
          'One of Vietnam’s most visited museums, documenting the history and human impact of the Vietnam War.',
          'Military aircraft, tanks, and heavy weaponry in the outdoor courtyard.',
          'Graphic photographic exhibits including the Requiem collection and displays on the global anti-war movement.',
        ],
      },
      {
        name: 'Tân Định Church',
        experienceId: 'tan-dinh-church',
        image: photo('1555921017-83909c8c0d90'),
        bullets: [
          'An 1870s Catholic church famous for its vibrant pink exterior, Gothic architecture, and white trim.',
          'Highly photogenic landmark along Hai Bà Trưng street.',
          'Across from the historic Tân Định Market, known for fabrics and local food.',
        ],
      },
      {
        name: 'Turtle Lake (Hồ Con Rùa)',
        experienceId: 'turtle-lake-saigon',
        image: photo('1439066615861-d1af74d74000'),
        bullets: [
          'A unique modernist concrete monument and fountain roundabout built in the late 1960s.',
          'A popular evening gathering spot for local youths and students.',
          'Surrounded by street-food vendors selling snacks like bánh tráng nướng and bánh tráng trộn.',
        ],
      },
      {
        name: 'Vĩnh Nghiêm Pagoda',
        experienceId: 'vinh-nghiem-pagoda',
        image: photo('1548013146-72479768bada'),
        bullets: [
          'A major Mahayana Buddhist monastery with traditional Japanese-influenced Vietnamese temple architecture.',
          'A striking 7-story, 40-meter stone tower and serene inner prayer halls.',
          'A central hub for local Buddhist rituals and cultural festivals.',
        ],
      },
    ],
    stays: [
      {
        stayId: 'hotel-des-arts-saigon',
        name: 'Hôtel des Arts Saigon - MGallery',
        tier: 'Luxury',
        vibe: 'Elegant 5-star boutique property decorated with Indochine art and vintage furnishings, plus a rooftop infinity pool and lounge with city views.',
        bookingUrl: booking('Hotel des Arts Saigon MGallery', 'Ho Chi Minh City'),
        image: photo('1571003123894-1f0594d2b5d9'),
      },
      {
        stayId: 'sheraton-saigon-grand-opera',
        name: 'Sheraton Saigon Grand Opera Hotel',
        tier: 'Luxury / upper mid-range',
        vibe: 'Classic upscale hotel with spacious modern rooms, an outdoor pool, a full fitness facility, and convenient access to the District 1 border.',
        bookingUrl: 'https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/',
        image: photo('1445019980597-93fa8acb246c'),
      },
      {
        stayId: 'mai-house-saigon',
        name: 'Mai House Saigon Hotel',
        tier: 'Upper mid-range',
        vibe: 'A colonial-inspired luxury boutique hotel with warm French-Indochine decor, a quiet courtyard swimming pool, and comfortable amenities.',
        bookingUrl: booking('Mai House Saigon Hotel', 'Ho Chi Minh City'),
        image: photo('1582719478250-c89cae4dc85b'),
      },
      {
        stayId: 'bach-suites-saigon',
        name: 'Bach Suites Saigon',
        tier: 'Boutique mid-range',
        vibe: 'Chic, minimalist property near Turtle Lake, with stylish residential suite layouts, white marble touches, and an outdoor rooftop pool.',
        bookingUrl: booking('Bach Suites Saigon', 'Ho Chi Minh City'),
        image: photo('1618773928121-c32242e63f39'),
      },
      {
        stayId: 'cozy-home-district-3',
        name: 'Cozy Home District 3',
        tier: 'Budget',
        vibe: 'Value-focused serviced apartment/guesthouse in a quiet residential alley, with air-conditioned rooms and kitchenettes for budget travelers.',
        bookingUrl: booking('Cozy Home District 3', 'Ho Chi Minh City'),
        image: photo('1590490360182-c33d57733427'),
      },
    ],
  },

  'hcmc-thao-dien': {
    intro:
      'Thảo Điền is an affluent, green enclave in District 2 (now part of Thủ Đức City), situated on a loop along the Saigon River. Known for breezy riverside views, French-colonial villas, high-rise condominiums, international schools, and trendy expat cafe culture, it offers a distinct resort-like contrast to central Saigon.',
    gettingAroundTitle: 'Getting around',
    gettingAround: [
      {
        title: 'Walkability & layout',
        body: 'The main arterial loop is Xuân Thủy, Thảo Điền, and Nguyễn Văn Hưởng. Walking along core streets like Xuân Thủy is easy, with boutique shops, bakeries, and outdoor dining packed close together.',
      },
      {
        title: 'Saigon Waterbus',
        body: 'A scenic, cheap way to reach Thảo Điền from District 1. The public Saigon Waterbus connects Bạch Đằng Station (District 1) to Bình An / Thảo Điền pier in about 20 minutes.',
      },
      {
        title: 'Ride-hailing & transit',
        body: 'Grab cars/bikes and Xanh SM operate heavily here. Metro Line 1 runs along the highway border, connecting Thảo Điền Station to Bến Thành Market in District 1.',
      },
      {
        title: 'Flooding considerations',
        body: 'Thảo Điền sits on low-lying riverside ground. Severe high tides plus heavy monsoon downpours can cause temporary street flooding along sections of Nguyễn Văn Hưởng.',
      },
    ],
    safetyTitle: 'Safety & scams',
    safety: [
      {
        title: 'Very safe neighbourhood',
        body: 'Thảo Điền is one of the safest enclaves in Southern Vietnam, heavily patrolled by private security outside residential compounds and villas.',
      },
      {
        title: 'Petty theft warning',
        body: 'Bag and phone snatching on motorbikes can still occur on quiet secondary streets or near major road edges. Keep handheld devices secure when checking maps.',
      },
      {
        title: 'Transparent pricing',
        body: 'Scams are virtually non-existent here. Shops, western bistros, and local Vietnamese cafes operate with fixed, transparent pricing.',
      },
    ],
    sightsTitle: 'Places to see',
    sights: [
      {
        name: 'Saigon Outcast',
        experienceId: 'saigon-outcast',
        image: photo('1516450360452-9312f5e86fc7'),
        bullets: [
          'An iconic outdoor creative community hub built from repurposed shipping containers.',
          'Outdoor rock-climbing wall, skate bowl, open-air cinema nights, and live music gigs.',
          'Weekend craft markets, craft beer festivals, and community art workshops.',
        ],
      },
      {
        name: 'The Factory Contemporary Arts Centre',
        experienceId: 'factory-contemporary-arts',
        image: photo('1460661419201-fd4cecdf8a8b'),
        bullets: [
          'A landmark modern art space dedicated to contemporary Vietnamese and Southeast Asian artists.',
          'Rotating exhibitions, installation spaces, a specialized arts library, and a cafe.',
          'A central gathering spot for the city’s modern art community.',
        ],
      },
      {
        name: 'Vincom Mega Mall Thảo Điền',
        experienceId: 'vincom-mega-mall-thao-dien',
        image: photo('1441986300917-64674bd600d8'),
        bullets: [
          'A multi-story shopping complex at the entrance of the district along the highway.',
          'Air-conditioned retail, an indoor ice-skating rink, multiplex cinemas, and international dining.',
          'Direct connection to the nearby Metro station.',
        ],
      },
    ],
    stays: [
      {
        stayId: 'mia-saigon',
        name: 'Mia Saigon Luxury Boutique Hotel',
        tier: 'Ultra-luxury',
        vibe: 'Elegant Indochine-inspired 5-star boutique hotel on the Saigon riverbank, with private river-view balconies, an outdoor pool, full spa, and refined dining.',
        bookingUrl: booking('Mia Saigon Luxury Boutique Hotel', 'Ho Chi Minh City'),
        image: photo('1564501049412-61c2a3083791'),
      },
      {
        stayId: 'villa-song-saigon',
        name: 'Villa Song Saigon',
        tier: 'Luxury boutique',
        vibe: 'French colonial-style boutique villa hotel on the riverfront, with personalized service, an outdoor saltwater pool, and open-air riverside dining at Bistro Song Vie.',
        bookingUrl: booking('Villa Song Saigon', 'Ho Chi Minh City'),
        image: photo('1542314831-068cd1dbfeeb'),
      },
      {
        stayId: 'amanaki-thao-dien',
        name: 'Amanaki Thao Dien Hotel',
        tier: 'Upper mid-range',
        vibe: 'Eco-conscious boutique stay with natural timber designs, an indoor swimming pool, fitness center, and apartment-style suites with kitchenettes.',
        bookingUrl: booking('Amanaki Thao Dien Hotel', 'Ho Chi Minh City'),
        image: photo('1520250497591-112f2f40a3f4'),
      },
      {
        stayId: 'common-inn-thao-dien',
        name: 'Common Inn Thao Dien',
        tier: 'Boutique mid-range / budget',
        vibe: 'Stylish, minimalist boutique property with clean compact air-conditioned rooms, a lush rooftop garden terrace, and walking access to the Xuân Thủy cafe strip.',
        bookingUrl: booking('Common Inn Thao Dien', 'Ho Chi Minh City'),
        image: photo('1611892440504-42a792e24d32'),
      },
      {
        stayId: 'm-village-thao-dien',
        name: 'M Village Thảo Điền',
        tier: 'Budget / long-stay value',
        vibe: 'Modern co-living hotel with sleek, affordable studio rooms, greenery, outdoor courtyard lounges, and shared kitchen facilities for budget travelers.',
        bookingUrl: booking('M Village Thao Dien', 'Ho Chi Minh City'),
        image: photo('1590490360182-c33d57733427'),
      },
    ],
  },

  'hcmc-phu-nhuan': {
    intro:
      'Phú Nhuận is an inner-city district between central Saigon (District 1 / District 3) and Tan Son Nhat International Airport (SGN). Known as the cafe capital and culinary playground of Saigon’s young professionals, it offers an authentic, high-density residential experience without heavy tourist crowds.',
    gettingAroundTitle: 'Getting around',
    gettingAround: [
      {
        title: 'Airport proximity',
        body: 'Roughly 10–15 minutes from Tan Son Nhat International Airport, making it ideal for short layovers or arrival/departure stays.',
      },
      {
        title: 'Key commercial corridors',
        body: 'Phan Xích Long is the main dining strip, while Lê Văn Sỹ and Huỳnh Văn Bánh are known for independent fashion boutiques, coffee shops, and local street food.',
      },
      {
        title: 'Ride-hailing & transit',
        body: 'Grab and Xanh SM bikes/cars are cheap and ubiquitous. A quick 10-minute ride connects you to District 1 or District 3.',
      },
      {
        title: 'Dense traffic',
        body: 'Traffic along Nguyễn Văn Trỗi and Hoàng Văn Thụ gets heavily congested during morning and evening rush hours due to airport traffic. Plan extra time if catching a flight.',
      },
    ],
    safetyTitle: 'Safety & scams',
    safety: [
      {
        title: 'Safe & local',
        body: 'Phú Nhuận is extremely safe with very low violent crime. It caters primarily to residents and office workers, so tourist-targeted scams are virtually non-existent.',
      },
      {
        title: 'Drive-by theft',
        body: 'As with the rest of Saigon, keep bags cross-bodied and avoid holding your phone loosely near street curbs.',
      },
      {
        title: 'Fair pricing',
        body: 'Restaurants, markets, and street-food stalls operate on transparent local pricing, with no inflated tourist markups.',
      },
    ],
    sightsTitle: 'Places to see',
    sights: [
      {
        name: 'Gia Định Park',
        experienceId: 'gia-dinh-park',
        image: photo('1441974233539-aded63043ea9'),
        bullets: [
          'One of the largest green lungs in Ho Chi Minh City, sprawling across the Phú Nhuận border.',
          'Shaded by hundreds of mature eucalyptus and banyan trees.',
          'Popular for morning jogging, outdoor aerobics, and local community gatherings.',
        ],
      },
      {
        name: 'Pháp Hoa Pagoda',
        experienceId: 'phap-hoa-pagoda',
        image: photo('1477587458883-47145ed94245'),
        bullets: [
          'A century-old Buddhist temple along the Nhiêu Lộc – Thị Nghè canal.',
          'Famous for colorful lantern-releasing ceremonies during Buddha’s Birthday (Vesak).',
          'Houses a unique collection of thousands of antique ceramics.',
        ],
      },
      {
        name: 'Phan Xích Long street food hub',
        experienceId: 'phan-xich-long',
        image: photo('1556910103-1c02745aae4d'),
        bullets: [
          'A major culinary boulevard packed with restaurants, milk-tea shops, and street stalls.',
          'Regional Vietnamese specialties like bún đậu mắm tôm, bánh xèo, and grilled seafood.',
          'A highly active nightlife hub for local youths and university students.',
        ],
      },
    ],
    stays: [
      {
        stayId: 'eastin-grand-saigon',
        name: 'Eastin Grand Hotel Saigon',
        tier: 'Luxury / 5-star',
        vibe: 'Modern luxury hotel with polished executive rooms, an outdoor swimming pool, a full fitness center, and fine dining midway between the airport and city center.',
        bookingUrl: booking('Eastin Grand Hotel Saigon', 'Ho Chi Minh City'),
        image: photo('1566073771259-6a8506099945'),
      },
      {
        stayId: 'muong-thanh-luxury-phu-nhuan',
        name: 'Mường Thanh Luxury Sài Gòn Hotel',
        tier: 'Luxury / upper mid-range',
        vibe: 'High-rise upscale hotel with comfortable rooms, an outdoor rooftop pool overlooking the city skyline, and easy access to central business corridors.',
        bookingUrl: booking('Muong Thanh Luxury Saigon Hotel', 'Ho Chi Minh City'),
        image: photo('1551882547-ff40c63fe5fa'),
      },
      {
        stayId: 'home-hotel-saigon',
        name: 'HOME Hotel Saigon',
        tier: 'Mid-range boutique',
        vibe: 'Stylish, cozy boutique property with contemporary air-conditioned rooms, warm service, and a convenient location close to local dining streets.',
        bookingUrl: booking('HOME Hotel Saigon', 'Ho Chi Minh City'),
        image: photo('1571896349842-33c89424de2d'),
      },
      {
        stayId: 'cactusland-hotel',
        name: 'Cactusland Hotel & Apartment',
        tier: 'Mid-range / budget',
        vibe: 'Chic, minimalist boutique hotel and serviced apartments with plant-filled decor, clean studio layouts, and kitchenette options for short or long stays.',
        bookingUrl: booking('Cactusland Hotel & Apartment', 'Ho Chi Minh City'),
        image: photo('1520250497591-112f2f40a3f4'),
      },
    ],
  },

  'danang-hai-chau': {
    intro:
      'Hải Châu is the commercial, administrative, and cultural center of Da Nang. Positioned along the western bank of the Han River, this downtown district bridges historical trading hubs, government quarters, and modern riverfront nightlife.',
    gettingAroundTitle: 'Getting around',
    gettingAround: [
      {
        title: 'Bạch Đằng river promenade',
        body: 'The main riverfront street (Bạch Đằng) has wide, paved pedestrian walkways lined with trees, public art, and cafes, making daytime and evening strolling simple.',
      },
      {
        title: 'Bridges connecting the city',
        body: 'Dragon Bridge (Cầu Rồng) links downtown to Mỹ Khê Beach. Han River Bridge (Cầu Sông Hàn) is Vietnam’s famous swing bridge. Thuận Phước Bridge is a suspension bridge at the mouth of Da Nang Bay.',
      },
      {
        title: 'Ride-hailing & taxis',
        body: 'Grab and Xanh SM work seamlessly. Motorbike taxis (GrabBike) are cheap for short hops between markets and museums.',
      },
      {
        title: 'Walkability',
        body: 'Traffic is significantly less dense than in Hanoi or Ho Chi Minh City, making street crossings easier for pedestrians.',
      },
    ],
    safetyTitle: 'Safety & scams',
    safety: [
      {
        title: 'Extremely safe environment',
        body: 'Da Nang is widely regarded as one of Vietnam’s safest and most orderly cities, with low rates of violent crime or street hustling.',
      },
      {
        title: 'Fair pricing',
        body: 'Restaurants, street-food stalls, and traditional markets operate primarily on fixed or reasonable local pricing, with little of the aggressive markup found in heavier tourist zones.',
      },
      {
        title: 'Standard vigilance',
        body: 'Keep your phone and bag secure when standing near main roads or enjoying crowded weekend riverfront events.',
      },
    ],
    sightsTitle: 'Places to see',
    sights: [
      {
        name: 'Museum of Cham Sculpture',
        experienceId: 'cham-sculpture-museum',
        image: photo('1578662996442-48f60103fc96'),
        bullets: [
          'A French-built museum from 1915 housing the world’s largest collection of Champa kingdom stone carvings.',
          'Intricate sandstone altars, terracotta relics, and Hindu deity statues from the 7th to 15th centuries.',
          'Open-air terracotta-roofed courtyards near the foot of the Dragon Bridge.',
        ],
      },
      {
        name: 'Dragon Bridge (Cầu Rồng)',
        experienceId: 'dragon-bridge',
        image: photo('1516450360452-9312f5e86fc7'),
        bullets: [
          'A 666-meter steel bridge shaped like a yellow dragon spanning the Han River.',
          'Every Saturday and Sunday at 9:00 PM, traffic stops while the dragon spits fire and water from its head.',
          'Excellent views of the illuminated skyline along the Bạch Đằng promenade.',
        ],
      },
      {
        name: 'Han Market (Chợ Hàn)',
        experienceId: 'han-market',
        image: photo('1556910103-1c02745aae4d'),
        bullets: [
          'A two-story commercial market from the French colonial era at Trần Phú and Nguyễn Thái Học.',
          'Ground floor: dried seafood, tropical fruits, spices, and a food court serving mì Quảng.',
          'Second floor: custom tailors, fabrics, silk, and footwear.',
        ],
      },
      {
        name: 'Da Nang Cathedral (Pink Church)',
        experienceId: 'da-nang-cathedral',
        image: photo('1555921017-83909c8c0d90'),
        bullets: [
          'A 1923 Gothic-style Catholic church from the French period, also called Con Gà Church.',
          'Pastel pink façade, stained-glass windows, and a weathercock-topped bell tower.',
          'Active house of worship with regular outdoor and indoor mass.',
        ],
      },
    ],
    stays: [
      {
        stayId: 'novotel-danang-premier',
        name: 'Novotel Danang Premier Han River',
        tier: 'Luxury',
        vibe: 'Sleek 37-story high-rise on Bạch Đằng with private balcony views of the Han River, an outdoor infinity pool, a spa, and a rooftop bar.',
        bookingUrl: 'https://www.ihg.com/novotel/hotels/us/en/da-nang/dadha/hoteldetail',
        image: photo('1566073771259-6a8506099945'),
      },
      {
        stayId: 'hilton-danang',
        name: 'Hilton Da Nang',
        tier: 'Luxury',
        vibe: 'Modern 28-story hotel on the river promenade, steps from the Han River Bridge, with contemporary rooms, an executive lounge, and a rooftop bar.',
        bookingUrl: 'https://www.hilton.com/en/hotels/dadnnhi-hilton-da-nang/',
        image: photo('1542314831-068cd1dbfeeb'),
      },
      {
        stayId: 'vanda-hotel',
        name: 'Vanda Hotel Da Nang',
        tier: 'Mid-range',
        vibe: 'Boutique 19-story property next to the Museum of Cham Sculpture and Dragon Bridge, with comfortable rooms, an indoor pool, and a top-floor lounge.',
        bookingUrl: booking('Vanda Hotel Da Nang', 'Da Nang'),
        image: photo('1571896349842-33c89424de2d'),
      },
    ],
  },

  'danang-my-khe': {
    intro:
      'Mỹ Khê is a world-famous 10 km coastline of fine white sand, warm clear water, and soft surf. It blends urban convenience with a relaxed tropical vibe: palms, modern hotels, and seafood joints along Võ Nguyên Giáp. Named after an old fishing village (“beautiful stream”), U.S. troops used it as an R&R stretch in the war years and nicknamed it China Beach. February to August is dry and sunny; sunrise (5:00–6:30) or after 16:00 is the best light and heat.',
    gettingAroundTitle: 'Getting around',
    gettingAround: [
      {
        title: 'Airport & city hops',
        body: 'About 15 minutes (6 km) from Da Nang International Airport. Grab or local taxis are the straightforward option.',
      },
      {
        title: 'Motorbike along the coast',
        body: 'Motorbike rentals are popular for the coastal road toward Hoi An (about 30 minutes).',
      },
    ],
    safetyTitle: 'Safety',
    safety: [
      {
        title: 'Lifeguards & rip currents',
        body: 'Very safe, with active lifeguards in peak hours (typically 5:00–9:00 AM and 3:00–6:00 PM). Swim strictly between the red-and-yellow flags to avoid occasional rip currents.',
      },
    ],
    sightsTitle: 'Places to see & things to do',
    sights: [
      {
        name: 'My Khe Beach',
        experienceId: 'my-khe-beach',
        image: photo('1507525428034-b723cf961d3e'),
        bullets: [
          'Fine white sand, palm line, and easy surf along Võ Nguyên Giáp.',
          'Jet skiing, parasailing, and beginner surf lessons around the T18–T20 beach zones.',
          'Sunrise for fishermen and joggers; late afternoon to skip midday heat.',
        ],
      },
      {
        name: 'Linh Ung Pagoda (Lady Buddha)',
        experienceId: 'linh-ung-pagoda',
        image: photo('1548013146-72479768bada'),
        bullets: [
          'North on Sơn Trà Peninsula — Vietnam’s tallest Goddess of Mercy statue at 67 meters.',
          'Panoramic views back over Mỹ Khê and the Da Nang coastline.',
        ],
      },
      {
        name: 'Marble Mountains',
        experienceId: 'marble-mountains',
        image: photo('1533929736458-ca588d08c8be'),
        bullets: [
          'South of the beach strip — limestone peaks with caves, pagodas, and viewpoints.',
        ],
      },
      {
        name: 'Dragon Bridge',
        experienceId: 'dragon-bridge',
        image: photo('1516450360452-9312f5e86fc7'),
        bullets: [
          'West into the city center — the weekend fire-and-water show is a short taxi from the sand.',
        ],
      },
    ],
    stays: [
      {
        stayId: 'tms-hotel-danang-beach',
        name: 'TMS Hotel Da Nang Beach',
        tier: 'Luxury / mid-range',
        vibe: 'High-rise oceanfront hotel on Võ Nguyên Giáp with sea views, pool, and family facilities without ultra-resort pricing.',
        bookingUrl: booking('TMS Hotel Da Nang Beach', 'Da Nang'),
        image: photo('1571003123894-1f0594d2b5d9'),
      },
      {
        stayId: 'belle-maison-hadian',
        name: 'Belle Maison Hadian Hotel',
        tier: 'Luxury / mid-range',
        vibe: 'Oceanfront stay on the Mỹ Khê strip with contemporary rooms and a short walk to the sand.',
        bookingUrl: booking('Belle Maison Hadian Hotel', 'Da Nang'),
        image: photo('1582719478250-c89cae4dc85b'),
      },
      {
        stayId: 'haian-beach-hotel',
        name: 'Haian Beach Hotel & Spa',
        tier: 'Mid-range',
        vibe: 'Consistent beach-and-pool all-rounder across from Mỹ Khê, with spa and airport shuttle.',
        bookingUrl: booking('Haian Beach Hotel and Spa', 'Da Nang'),
        image: photo('1520250497591-112f2f40a3f4'),
      },
    ],
  },

  'danang-son-tra': {
    intro:
      'Sơn Trà Peninsula (Monkey Mountain) is a lush coastal national park jutting northeast of Da Nang. Rising over 600 meters, it offers dense tropical rainforest, secluded beaches, winding coastal roads, and sweeping views of ocean and city.',
    gettingAroundTitle: 'Getting around',
    gettingAround: [
      {
        title: 'Scooter & motorbike',
        body: 'The coastal loop is popular, but steep inclines need caution. Local authorities restrict automatic scooters on some high roads (such as toward InterContinental / Bàn Cờ Peak) — use a semi-automatic or manual bike, or hire a driver.',
      },
      {
        title: 'Ride-hailing & private cars',
        body: 'Grab and Xanh SM will take you to primary coastal sites like Linh Ứng Pagoda. For a full peninsula loop, negotiate a half-day private car; return Grabs from deep mountain roads can be difficult.',
      },
      {
        title: 'Guided tours & jeep rentals',
        body: 'Open-air vintage military jeep tours or guided treks are a hassle-free way to cover mountain roads and watch for wildlife.',
      },
    ],
    safetyTitle: 'Safety & scams',
    safety: [
      {
        title: 'Mountain road safety',
        body: 'Caution on tight hairpins and steep descents. Check brakes before heading up, and avoid riding after heavy rain or in fog.',
      },
      {
        title: 'Wildlife rules',
        body: 'Do not feed or pet wild monkeys or doucs. Feeding makes them aggressive and causes roadside accidents. Keep food and plastic bags inside the vehicle or backpack.',
      },
      {
        title: 'Fixed ticket pricing',
        body: 'Entry to the nature reserve and Linh Ứng Pagoda is free. Parking at the pagoda is a small official fee (typically 5,000–10,000 VND).',
      },
    ],
    sightsTitle: 'Places to see',
    sights: [
      {
        name: 'Linh Ung Pagoda',
        experienceId: 'linh-ung-pagoda',
        image: photo('1548013146-72479768bada'),
        bullets: [
          'Home to Vietnam’s tallest Goddess of Mercy (Lady Buddha) at 67 meters.',
          'Panoramic views of the Da Nang coastline and Mỹ Khê Beach.',
          'Courtyard gardens, marble statues, and traditional temple architecture.',
        ],
      },
      {
        name: 'Ban Co Peak',
        experienceId: 'ban-co-peak',
        image: photo('1464822759023-fed622ff2c3b'),
        bullets: [
          'Highest accessible point, with a bronze immortal playing chess on a stone board.',
          'Cloud-capped 360-degree views over the ocean, Hải Vân Pass, and Da Nang.',
          'Reached by a steep, winding mountain road.',
        ],
      },
      {
        name: 'Ghềnh Bàng & Bãi Bụt',
        experienceId: 'ghenh-bang-bai-but',
        image: photo('1507525428034-b723cf961d3e'),
        bullets: [
          'Rugged coastal spots with rocky shores, coral, and calmer water.',
          'Snorkeling, kayaking, and camping along quieter coves.',
          'Less commercialized than the main city beaches.',
        ],
      },
      {
        name: 'Thousand-Year Banyan Tree',
        experienceId: 'thousand-year-banyan',
        image: photo('1441974233539-aded63043ea9'),
        bullets: [
          'A massive heritage tree with roots forming thick natural pillars.',
          'A peaceful stop on the northern coastal road of the peninsula.',
        ],
      },
    ],
    stays: [
      {
        stayId: 'intercontinental-danang',
        name: 'InterContinental Danang Sun Peninsula Resort',
        tier: 'Ultra-luxury',
        vibe: 'Bill Bensley resort in a private Sơn Trà cove, with private beach, funicular, infinity pools, and high-end dining.',
        bookingUrl: 'https://www.ihg.com/intercontinental/hotels/us/en/da-nang/dadhc/hoteldetail',
        image: photo('1564501049412-61c2a3083791'),
      },
      {
        stayId: 'mercure-danang-french-village',
        name: 'Mercure Danang French Village Bana Hills',
        tier: 'Luxury / resort',
        vibe: 'High-end resort near the peninsula approach, with oceanfront rooms, pools, and access toward nature trails and city beaches.',
        bookingUrl: booking('Mercure Danang French Village Bana Hills', 'Da Nang'),
        image: photo('1551882547-ff40c63fe5fa'),
      },
      {
        stayId: 'son-tra-resort',
        name: 'Son Tra Resort',
        tier: 'Upper mid-range',
        vibe: 'Tranquil villa resort on a private bay, with beachfront villas, lush gardens, and quiet ocean views away from city noise.',
        bookingUrl: booking('Son Tra Resort', 'Da Nang'),
        image: photo('1445019980597-93fa8acb246c'),
      },
      {
        stayId: 'navy-hotel-danang',
        name: 'Navy Hotel Da Nang',
        tier: 'Mid-range',
        vibe: 'Modern 4-star hotel near the foot of the peninsula and Yết Kiêu, with a swimming pool and easy access to the nature reserve.',
        bookingUrl: booking('Navy Hotel Da Nang', 'Da Nang'),
        image: photo('1618773928121-c32242e63f39'),
      },
      {
        stayId: 'son-tra-sea-hotel',
        name: 'Son Tra Sea Hotel',
        tier: 'Budget',
        vibe: 'Affordable beachfront hotel on Hoàng Sa near the peninsula base, with clean air-conditioned rooms, sea views, and a short hop to Linh Ứng.',
        bookingUrl: booking('Son Tra Sea Hotel', 'Da Nang'),
        image: photo('1590490360182-c33d57733427'),
      },
    ],
  },

  'danang-han-river': {
    intro:
      'The Han Riverfront is the urban heart of Da Nang. Twin boulevards — Bạch Đằng on the west bank and Trần Hưng Đạo on the east — hold nighttime promenades, iconic bridges, night markets, rooftop bars, and river cruises.',
    gettingAroundTitle: 'Getting around',
    gettingAround: [
      {
        title: 'Walking & promenade strolls',
        body: 'Continuous pedestrian walkways along Bạch Đằng and Trần Hưng Đạo are paved, wide, and ideal for evening walks or morning jogs.',
      },
      {
        title: 'Ride-hailing & taxis',
        body: 'Grab and Xanh SM are easy on either bank. Traffic around Dragon Bridge gets heavy during weekend night shows (about 8:30–9:30 PM).',
      },
      {
        title: 'Han River cruises',
        body: 'Evening boat tours depart from the Bạch Đằng port near the Cham Museum — a 45–90 minute water view of the skyline and lit bridges.',
      },
    ],
    safetyTitle: 'Safety & scams',
    safety: [
      {
        title: 'Dragon Bridge fire show traffic',
        body: 'Friday, Saturday, and Sunday at 9:00 PM, traffic on the bridge stops. Secure a pedestrian-deck or riverbank vantage by 8:30 PM, and hold phones and bags in dense crowds.',
      },
      {
        title: 'Fire show spray zone',
        body: 'Stand slightly back from the bridge head during the fire-and-water performance — the spray can soak spectators at the front.',
      },
      {
        title: 'Street vendor pricing',
        body: 'Promenade stall prices are generally reasonable, but confirm the price per dish (especially seafood) before ordering.',
      },
    ],
    sightsTitle: 'Places to see',
    sights: [
      {
        name: 'Dragon Bridge',
        experienceId: 'dragon-bridge',
        image: photo('1516450360452-9312f5e86fc7'),
        bullets: [
          'Da Nang’s 666-meter yellow dragon spanning the Han River.',
          'Breathes fire and water Friday, Saturday, and Sunday at 9:00 PM.',
          'Fully illuminated at night with dynamic LED colour.',
        ],
      },
      {
        name: 'Han River Bridge',
        experienceId: 'han-river-bridge',
        image: photo('1464822759023-fed622ff2c3b'),
        bullets: [
          'Vietnam’s first swing bridge, designed and funded by local residents.',
          'Rotates around 11:00 PM–1:00 AM on weekends to let large ships pass.',
          'Surrounding promenade has open-air cafes and street performances.',
        ],
      },
      {
        name: 'Son Tra Night Market',
        experienceId: 'son-tra-night-market',
        image: photo('1516450360452-9312f5e86fc7'),
        bullets: [
          'East bank near the Dragon Bridge head, with the Carp-Dragon statue and a padlock boardwalk.',
          'Grilled seafood, avocado ice cream, and souvenirs.',
          'A practical dinner spot while watching the fire show.',
        ],
      },
      {
        name: 'Museum of Cham Sculpture',
        experienceId: 'cham-sculpture-museum',
        image: photo('1578662996442-48f60103fc96'),
        bullets: [
          'Southern end of Bạch Đằng — the world’s largest Cham sandstone collection.',
          '5th to 15th-century Hindu art, altars, and statues from regional temple ruins.',
        ],
      },
    ],
    stays: [
      {
        stayId: 'novotel-danang-premier',
        name: 'Novotel Danang Premier Han River',
        tier: 'Luxury',
        vibe: 'West-bank skyline icon on Bạch Đằng, with riverfront balconies, executive lounges, an outdoor pool, and fireworks-festival views.',
        bookingUrl: 'https://www.ihg.com/novotel/hotels/us/en/da-nang/dadha/hoteldetail',
        image: photo('1566073771259-6a8506099945'),
      },
      {
        stayId: 'melia-vinpearl-riverfront',
        name: 'Meliá Vinpearl Danang Riverfront',
        tier: 'Upper mid-range / luxury',
        vibe: 'East-bank high-rise on Trần Hưng Đạo with floor-to-ceiling glass toward Dragon Bridge and a large outdoor pool deck.',
        bookingUrl: booking('Melia Vinpearl Danang Riverfront', 'Da Nang'),
        image: photo('1542314831-068cd1dbfeeb'),
      },
      {
        stayId: 'courtyard-marriott-danang',
        name: 'Courtyard by Marriott Danang Han River',
        tier: 'Upper mid-range',
        vibe: 'Contemporary riverfront property with direct water views, rooftop dining, and easy access to markets and business streets.',
        bookingUrl: booking('Courtyard by Marriott Danang Han River', 'Da Nang'),
        image: photo('1571896349842-33c89424de2d'),
      },
      {
        stayId: 'haian-riverfront-hotel',
        name: 'Haian Riverfront Hotel Danang',
        tier: 'Mid-range',
        vibe: 'Stylish 4-star boutique on Bạch Đằng, walking distance to Han Market and Dragon Bridge, with river-facing balconies and an indoor pool.',
        bookingUrl: booking('Haian Riverfront Hotel Danang', 'Da Nang'),
        image: photo('1582719478250-c89cae4dc85b'),
      },
      {
        stayId: 'wink-hotel-danang-riverside',
        name: 'Wink Hotel Danang Riverside',
        tier: 'Budget / tech-boutique',
        vibe: 'Trendy stay for modern travellers: smart room controls, 24-hour flexible check-in, co-working, and high-floor river views.',
        bookingUrl: booking('Wink Hotel Danang Riverside', 'Da Nang'),
        image: photo('1611892440504-42a792e24d32'),
      },
    ],
  },
}

export function getNeighbourhoodGuide(clusterId: string) {
  return NEIGHBOURHOOD_GUIDES[clusterId] ?? null
}
