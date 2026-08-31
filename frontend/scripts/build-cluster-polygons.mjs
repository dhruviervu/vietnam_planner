import fs from 'node:fs'
import path from 'node:path'

const osm = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', '_cluster-osm.json'), 'utf8'))

const KEEP = new Set([
  'hanoi-old-quarter',
  'hanoi-tay-ho',
  'hanoi-ba-dinh',
  'hcmc-district-1',
  'hcmc-district-3',
  'hcmc-phu-nhuan',
  'danang-hai-chau',
  'danang-son-tra',
  'hoian-ancient-town',
  'hue-citadel',
])

function compact(ring) {
  return ring.map((p) => `[${p[0]}, ${p[1]}]`).join(', ')
}

const traces = {
  'hanoi-french-quarter': [
    [105.8512, 21.0280], [105.8536, 21.0282], [105.8558, 21.0274],
    [105.8578, 21.0258], [105.8600, 21.0240], [105.8622, 21.0222],
    [105.8630, 21.0202], [105.8618, 21.0186], [105.8584, 21.0180],
    [105.8548, 21.0182], [105.8520, 21.0192], [105.8506, 21.0214],
    [105.8504, 21.0242], [105.8508, 21.0266],
  ],
  'hcmc-thao-dien': [
    [106.7258, 10.8012], [106.7284, 10.7982], [106.7324, 10.7968],
    [106.7370, 10.7974], [106.7412, 10.7998], [106.7438, 10.8034],
    [106.7448, 10.8078], [106.7434, 10.8124], [106.7396, 10.8158],
    [106.7348, 10.8172], [106.7304, 10.8152], [106.7276, 10.8114],
    [106.7262, 10.8070], [106.7256, 10.8038],
  ],
  'danang-my-khe': [
    [108.2446, 16.0722], [108.2474, 16.0728], [108.2478, 16.0674],
    [108.2482, 16.0614], [108.2492, 16.0554], [108.2504, 16.0496],
    [108.2520, 16.0444], [108.2536, 16.0402], [108.2508, 16.0396],
    [108.2488, 16.0442], [108.2472, 16.0498], [108.2460, 16.0558],
    [108.2450, 16.0618], [108.2446, 16.0676],
  ],
  'danang-han-river': [
    [108.2266, 16.0542], [108.2294, 16.0548], [108.2310, 16.0584],
    [108.2316, 16.0632], [108.2318, 16.0682], [108.2310, 16.0728],
    [108.2292, 16.0758], [108.2270, 16.0752], [108.2262, 16.0706],
    [108.2260, 16.0652], [108.2262, 16.0596],
  ],
  'hoian-an-bang': [
    [108.3282, 15.9070], [108.3310, 15.9172], [108.3368, 15.9148],
    [108.3432, 15.9108], [108.3484, 15.9070], [108.3472, 15.9038],
    [108.3416, 15.9072], [108.3358, 15.9104], [108.3308, 15.9058],
  ],
  'hoian-cam-chau': [
    [108.3290, 15.8816], [108.3342, 15.8802], [108.3402, 15.8808],
    [108.3456, 15.8838], [108.3482, 15.8882], [108.3476, 15.8930],
    [108.3438, 15.8962], [108.3376, 15.8966], [108.3322, 15.8942],
    [108.3290, 15.8896], [108.3280, 15.8852],
  ],
  'hoian-cam-thanh': [
    [108.3388, 15.8722], [108.3450, 15.8706], [108.3508, 15.8712],
    [108.3518, 15.8758], [108.3504, 15.8802], [108.3460, 15.8824],
    [108.3412, 15.8814], [108.3382, 15.8774],
  ],
  'hoian-cam-pho': [
    [108.3106, 15.8782], [108.3158, 15.8768], [108.3208, 15.8766],
    [108.3238, 15.8778], [108.3246, 15.8808], [108.3236, 15.8848],
    [108.3210, 15.8882], [108.3168, 15.8900], [108.3124, 15.8892],
    [108.3100, 15.8858], [108.3096, 15.8818],
  ],
  'hoian-an-hoi': [
    [108.3272, 15.8754], [108.3300, 15.8756], [108.3330, 15.8754],
    [108.3356, 15.8748], [108.3364, 15.8738], [108.3356, 15.8728],
    [108.3328, 15.8724], [108.3296, 15.8726], [108.3274, 15.8734],
    [108.3270, 15.8744],
  ],
  'hoian-cam-nam': [
    [108.3266, 15.8662], [108.3312, 15.8656], [108.3366, 15.8660],
    [108.3406, 15.8672], [108.3410, 15.8694], [108.3378, 15.8710],
    [108.3328, 15.8712], [108.3284, 15.8702], [108.3268, 15.8680],
  ],
  'hue-riverside': [
    [107.5844, 16.4656], [107.5892, 16.4648], [107.5942, 16.4644],
    [107.5988, 16.4648], [107.6036, 16.4658], [107.6056, 16.4634],
    [107.6030, 16.4616], [107.5974, 16.4612], [107.5914, 16.4616],
    [107.5860, 16.4626], [107.5840, 16.4638],
  ],
  'hue-phu-hiep': [
    [107.5876, 16.4740], [107.5926, 16.4730], [107.5982, 16.4736],
    [107.6026, 16.4766], [107.6040, 16.4810], [107.6014, 16.4850],
    [107.5960, 16.4864], [107.5910, 16.4854], [107.5880, 16.4820],
    [107.5870, 16.4776],
  ],
  'hue-kim-long': [
    [107.5446, 16.4656], [107.5496, 16.4640], [107.5552, 16.4646],
    [107.5596, 16.4672], [107.5606, 16.4716], [107.5578, 16.4756],
    [107.5530, 16.4770], [107.5476, 16.4754], [107.5448, 16.4710],
  ],
  'nhatrang-centre': [
    [109.1908, 16.0],
  ],
}

// fix accidental typo above — Nha Trang centre is written fully below
traces['nhatrang-centre'] = [
  [109.1908, 12.2522], [109.1958, 12.2526], [109.1964, 12.2462],
  [109.1962, 12.2400], [109.1956, 12.2348], [109.1914, 12.2346],
  [109.1906, 12.2406], [109.1904, 12.2466],
]
traces['nhatrang-north-beach'] = [
  [109.1938, 12.2882], [109.1996, 12.2886], [109.2006, 12.2800],
  [109.1990, 12.2720], [109.1974, 12.2660], [109.1934, 12.2664],
  [109.1928, 12.2740], [109.1932, 12.2820],
]
traces['nhatrang-south-tran-phu'] = [
  [109.1934, 12.2322], [109.1978, 12.2316], [109.1996, 12.2240],
  [109.2006, 12.2160], [109.2016, 12.2098], [109.1968, 12.2094],
  [109.1954, 12.2164], [109.1944, 12.2240],
]
traces['nhatrang-xom-moi'] = [
  [109.1744, 12.2380], [109.1810, 12.2368], [109.1856, 12.2394],
  [109.1866, 12.2450], [109.1840, 12.2500], [109.1784, 12.2510],
  [109.1746, 12.2474], [109.1736, 12.2420],
]
traces['dalat-centre'] = [
  [108.4334, 11.9390], [108.4376, 11.9378], [108.4416, 11.9382],
  [108.4440, 11.9408], [108.4442, 11.9440], [108.4420, 11.9468],
  [108.4380, 11.9476], [108.4344, 11.9458], [108.4330, 11.9424],
]
traces['dalat-xuan-huong'] = [
  [108.4434, 11.9446], [108.4470, 11.9466], [108.4506, 11.9496],
  [108.4542, 11.9510], [108.4566, 11.9488], [108.4554, 11.9454],
  [108.4524, 11.9430], [108.4484, 11.9420], [108.4448, 11.9426],
]
traces['dalat-hillside'] = [
  [108.4140, 11.9180], [108.4206, 11.9164], [108.4266, 11.9176],
  [108.4296, 11.9216], [108.4290, 11.9266], [108.4254, 11.9300],
  [108.4194, 11.9304], [108.4146, 11.9268], [108.4134, 11.9220],
]
traces['dalat-tran-hung-dao'] = [
  [108.4470, 11.9286], [108.4526, 11.9270], [108.4580, 11.9276],
  [108.4620, 11.9306], [108.4626, 11.9346], [108.4594, 11.9376],
  [108.4540, 11.9386], [108.4488, 11.9364], [108.4466, 11.9324],
]
traces['phuquoc-duong-dong'] = [
  [103.9584, 10.2100], [103.9640, 10.2084], [103.9696, 10.2100],
  [103.9736, 10.2146], [103.9746, 10.2206], [103.9720, 10.2256],
  [103.9664, 10.2276], [103.9608, 10.2248], [103.9578, 10.2188],
  [103.9574, 10.2140],
]
traces['phuquoc-long-beach'] = [
  [103.9630, 10.2050], [103.9686, 10.2038], [103.9722, 10.1978],
  [103.9746, 10.1898], [103.9762, 10.1818], [103.9776, 10.1738],
  [103.9724, 10.1728], [103.9694, 10.1808], [103.9674, 10.1888],
  [103.9648, 10.1968],
]
traces['phuquoc-ong-lang'] = [
  [103.9250, 10.3050], [103.9322, 10.3080], [103.9382, 10.3040],
  [103.9442, 10.2958], [103.9480, 10.2858], [103.9500, 10.2758],
  [103.9444, 10.2744], [103.9378, 10.2828], [103.9318, 10.2928],
  [103.9268, 10.3000],
]
traces['phuquoc-cua-lap'] = [
  [103.9700, 10.1680], [103.9766, 10.1668], [103.9820, 10.1618],
  [103.9840, 10.1548], [103.9808, 10.1504], [103.9738, 10.1510],
  [103.9704, 10.1564], [103.9688, 10.1630],
]

const comments = {
  'hanoi-old-quarter': 'OSM historic Khu phố cổ (Google Old Quarter outline)',
  'hanoi-tay-ho': 'OSM Tây Hồ, clipped to the city map frame',
  'hanoi-ba-dinh': 'OSM Ba Đình, clipped to the city map frame',
  'hanoi-french-quarter': 'Street ring south/east of Hoan Kiem (Trang Tien / Opera / Tran Hung Dao)',
  'hcmc-district-1': 'OSM historic Quận 1',
  'hcmc-district-3': 'OSM historic Quận 3',
  'hcmc-phu-nhuan': 'OSM Phú Nhuận',
  'hcmc-thao-dien': 'Saigon River peninsula — Thảo Điền / An Phú stay area',
  'danang-hai-chau': 'OSM Hải Châu, clipped to the city map frame',
  'danang-son-tra': 'OSM Sơn Trà, clipped to the city map frame',
  'danang-my-khe': 'My Khe hotel/beach band along Vo Nguyen Giap',
  'danang-han-river': 'East-bank An Hai promenade',
  'hoian-ancient-town': 'OSM Hoi An Old Town heritage core',
  'hoian-an-bang': 'An Bang village and beach, inland of the sand',
  'hoian-cam-chau': 'East of town along Cua Dai road',
  'hoian-cam-thanh': 'Coconut village east of the old town',
  'hoian-cam-pho': 'West of the Japanese Bridge',
  'hoian-an-hoi': 'An Hoi islet, south of the Hoai',
  'hoian-cam-nam': 'Cam Nam island, south of the Thu Bon',
  'hue-citadel': 'OSM Kinh thành Huế walls',
  'hue-riverside': 'Le Loi south-bank hotel street',
  'hue-phu-hiep': 'Gia Hoi / Phu Hiep, north-east of the citadel',
  'hue-kim-long': 'Kim Long, west toward Thien Mu',
  'nhatrang-centre': 'Tran Phu promenade around the night market',
  'nhatrang-north-beach': 'North Beach / Hon Chong',
  'nhatrang-south-tran-phu': 'South Tran Phu beach road',
  'nhatrang-xom-moi': 'Inland market quarter west of the strip',
  'dalat-centre': 'Hoa Binh / market centre',
  'dalat-xuan-huong': 'North and east shore of Xuan Huong Lake',
  'dalat-hillside': 'Quieter hillside south-west of town',
  'dalat-tran-hung-dao': 'Tran Hung Dao villa belt',
  'phuquoc-duong-dong': 'Duong Dong town',
  'phuquoc-long-beach': 'West-coast Long Beach strip south of town',
  'phuquoc-ong-lang': 'Ong Lang / north-west coast',
  'phuquoc-cua-lap': 'Cua Lap / airport side',
}

const order = [
  'hanoi-old-quarter', 'hanoi-french-quarter', 'hanoi-tay-ho', 'hanoi-ba-dinh',
  'hcmc-district-1', 'hcmc-district-3', 'hcmc-thao-dien', 'hcmc-phu-nhuan',
  'danang-hai-chau', 'danang-my-khe', 'danang-son-tra', 'danang-han-river',
  'hoian-an-bang', 'hoian-cam-chau', 'hoian-cam-thanh', 'hoian-cam-pho',
  'hoian-ancient-town', 'hoian-an-hoi', 'hoian-cam-nam',
  'hue-citadel', 'hue-riverside', 'hue-phu-hiep', 'hue-kim-long',
  'nhatrang-centre', 'nhatrang-north-beach', 'nhatrang-south-tran-phu', 'nhatrang-xom-moi',
  'dalat-centre', 'dalat-xuan-huong', 'dalat-hillside', 'dalat-tran-hung-dao',
  'phuquoc-duong-dong', 'phuquoc-long-beach', 'phuquoc-ong-lang', 'phuquoc-cua-lap',
]

let body = `import type { GeoRing } from './types'
import { landRing } from '../lib/geoRing'

/**
 * Neighbourhood outlines in WGS84 [lng, lat].
 * OSM/Nominatim outer rings where a public polygon exists (clipped to the
 * city map frame). Street-following rings for tourist names Google Maps
 * outlines but OSM does not polygonize.
 */

export const CLUSTER_POLYGONS: Record<string, GeoRing> = {
`

for (const id of order) {
  const ring = KEEP.has(id) ? osm[id] : traces[id]
  if (!ring) throw new Error(`missing ${id}`)
  body += `  // ${comments[id]}\n`
  body += `  '${id}': landRing([\n    ${compact(ring)},\n  ]),\n`
}

body += `}
`

const dest = path.join(process.cwd(), 'src/pages/WhereToStay/data/clusterPolygons.ts')
fs.writeFileSync(dest, body)
console.log('wrote', dest, 'clusters', order.length)
