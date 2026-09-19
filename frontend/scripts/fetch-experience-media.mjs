/**
 * Fetch 10 relevant photos and 2–3 matching YouTube videos per experience.
 * Run: node scripts/fetch-experience-media.mjs
 * Force refresh: FORCE=1 node scripts/fetch-experience-media.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'src', 'pages', 'PlanBuilder', 'data')
const OUT_JSON = path.join(DATA_DIR, 'experienceMedia.json')
const OUT_TS = path.join(DATA_DIR, 'experienceMedia.ts')

const PHOTO_COUNT = 10
const UA = 'VietnamPlannerMediaBot/1.1 (travel planner; local research)'
const FORCE = process.env.FORCE === '1'

const PLACE_ALIASES = {
  'halong-cruise': ['Ha Long Bay', 'Halong Bay cruise', 'Ha Long Bay junk'],
  'temple-literature': ['Temple of Literature Hanoi', 'Van Mieu Quoc Tu Giam'],
  'old-quarter': ['Hanoi Old Quarter', 'Hang Ma Street Hanoi'],
  'ninh-binh': ['Trang An Ninh Binh', 'Trang An Landscape Complex'],
  'mua-cave': ['Hang Mua Ninh Binh', 'Mua Cave viewpoint'],
  'hoa-lu': ['Hoa Lu ancient capital', 'Hoa Lu Ninh Binh'],
  'hoi-an-lanterns': ['Hoi An lanterns night', 'Hoi An Ancient Town night'],
  'cooking-class': ['Hoi An cooking class', 'Vietnamese cooking class Hoi An'],
  'ha-giang-loop': ['Ha Giang Loop', 'Ma Pi Leng Pass'],
  'sapa-trek': ['Sa Pa rice terraces', 'Sapa trek Vietnam'],
  'hue-citadel': ['Hue Imperial Citadel', 'Imperial City Hue', 'Meridian Gate Hue'],
  'da-nang-beach': ['My Khe Beach Da Nang', 'China Beach Da Nang'],
  'phong-nha': ['Phong Nha-Ke Bang National Park'],
  'war-remnants': ['War Remnants Museum Ho Chi Minh City'],
  'cu-chi': ['Cu Chi Tunnels', 'Củ Chi tunnels'],
  'mekong-delta': ['Cai Rang floating market', 'Mekong Delta floating market'],
  'cai-rang-floating-market': ['Cai Rang floating market Can Tho'],
  'phong-dien-floating-market': ['Phong Dien floating market Can Tho'],
  'ninh-kieu-wharf': ['Ninh Kieu Wharf Can Tho'],
  'moi-canal': ['Rach Moi canal Can Tho'],
  'chua-ong-can-tho': ['Chua Ong Quang Dong assembly hall Can Tho'],
  'nam-nha-pagoda': ['Nam Nha Pagoda Can Tho'],
  'phuoc-hau-pagoda': ['Phuoc Hau Pagoda Can Tho'],
  'pothi-somron': ['Pothi Somron Khmer pagoda Can Tho'],
  'munir-ansay': ['Munir Ansay Munirensay Khmer pagoda Can Tho'],
  'quang-duc-pagoda': ['Quang Duc Pagoda Can Tho'],
  'truc-lam-phuong-nam': ['Truc Lam Phuong Nam Zen Monastery Can Tho'],
  'can-tho-cathedral': ['Can Tho Cathedral'],
  'binh-thuy-ancient-house': ['Binh Thuy Ancient House Can Tho'],
  'can-tho-grand-prison': ['Kham Lon Can Tho prison'],
  'can-tho-museum': ['Can Tho Museum Hoa Binh'],
  'military-zone-9-museum': ['Military Zone 9 Museum Can Tho'],
  'hcm-museum-can-tho': ['Ho Chi Minh Museum Can Tho branch'],
  'bang-lang-stork': ['Bang Lang stork sanctuary Thot Not'],
  'con-son': ['Con Son islet Can Tho'],
  'con-au': ['Con Au islet Can Tho'],
  'con-khuong': ['Con Khuong islet Can Tho'],
  'my-khanh-village': ['My Khanh eco tourism village Can Tho'],
  'giot-dang-orchard': ['Giot Dang fruit orchard Can Tho'],
  'ba-lang-gardens': ['Ba Lang fruit gardens Can Tho'],
  'lung-ngoc-hoang': ['Lung Ngoc Hoang nature reserve'],
  'ninh-kieu-love-bridge': ['Ninh Kieu Love Bridge Can Tho'],
  'can-tho-bridge': ['Can Tho Bridge Cau Can Tho'],
  'can-tho-old-market': ['Cho Co Can Tho old market'],
  'can-tho-night-market': ['Can Tho night market Ninh Kieu'],
  'tay-do-market': ['Tay Do night market Can Tho'],
  'luu-huu-phuoc-park': ['Luu Huu Phuoc Park Can Tho'],
  'song-hau-park': ['Song Hau Park Can Tho'],
  'phu-quoc-snorkel': ['Phu Quoc snorkeling', 'Phu Quoc coral'],
  'phu-quoc-sunset': ['Phu Quoc sunset beach', 'Long Beach Phu Quoc'],
  'egg-coffee': ['Vietnamese egg coffee', 'ca phe trung Hanoi'],
  'hanoi-food-tour': ['Hanoi street food', 'bun cha Hanoi'],
  'train-street': ['Hanoi Train Street', 'Train Street Hanoi'],
  'an-bang': ['An Bang Beach Hoi An'],
  'my-son': ['My Son Sanctuary', 'Mỹ Sơn Cham'],
  'marble-mountains': ['Marble Mountains Da Nang', 'Ngu Hanh Son'],
  'cat-ba': ['Cat Ba Island', 'Cat Ba National Park'],
  'lan-ha': ['Lan Ha Bay', 'Lan Ha Bay kayak'],
  'cat-ba-national-park': ['Cat Ba National Park', 'Vuon quoc gia Cat Ba'],
  'lan-ha-bay': ['Lan Ha Bay Cat Ba', 'Vinh Lan Ha'],
  'trung-trang-cave': ['Trung Trang Cave Cat Ba', 'Hang Trung Trang'],
  'hospital-cave-cat-ba': ['Hospital Cave Cat Ba', 'Hang Quan Y Cat Ba'],
  'hoa-cuong-cave': ['Hoa Cuong Cave Cat Ba', 'Hang Hoa Cuong Diamond Cave'],
  'thien-long-cave-cat-ba': ['Thien Long Cave Cat Ba'],
  'nguon-giong-cave': ['Nguon Giong Cave Cat Ba'],
  'cannon-fort-cat-ba': ['Cannon Fort Cat Ba', 'Cao Diem 177 Cat Ba'],
  'cat-co-1': ['Cat Co 1 Beach Cat Ba'],
  'cat-co-2': ['Cat Co 2 Beach Cat Ba'],
  'cat-co-3': ['Cat Co 3 Beach Cat Ba'],
  'tung-thu-beach': ['Tung Thu Beach Cat Ba'],
  'cat-dua-island': ['Monkey Island Cat Ba', 'Dao Cat Dua'],
  'viet-hai-village': ['Viet Hai village Cat Ba'],
  'viet-hai-fishing-village': ['Viet Hai fishing village Cat Ba'],
  'cua-van-via-cat-ba': ['Cua Van floating village'],
  'cai-beo-village': ['Cai Beo floating village Cat Ba'],
  'hoi-lake': ['Hoi Lake Cat Ba', 'Ho Hoi Tran Chau'],
  'kim-giao-forest': ['Kim Giao forest Cat Ba'],
  'nho-khoi-mountain': ['Nho Khoi mountain Cat Ba'],
  'ngu-lam-peak': ['Ngu Lam peak Cat Ba', 'Dinh Ngu Lam'],
  'cat-ba-market': ['Cat Ba market'],
  'cat-ba-night-market': ['Cat Ba night market'],
  'cat-ba-square': ['Cat Ba central square'],
  'cat-ba-cable-car': ['Sun World Cat Ba cable car', 'Cat Hai Phu Long cable car'],
  'phu-long-mangrove': ['Phu Long mangrove Cat Ba'],
  'ben-thanh': ['Ben Thanh Market', 'Bến Thành Market'],
  'perfume-river': ['Perfume River Hue', 'Huong River Hue'],
  'dark-cave': ['Dark Cave Phong Nha', 'Hang Toi Phong Nha'],
  'dong-van': ['Dong Van Karst Plateau', 'Dong Van Vietnam'],
  'dong-van-old-quarter': ['Dong Van Ancient Town', 'Pho co Dong Van'],
  'dong-van-old-market': ['Dong Van old market'],
  'vuong-palace-dong-van': ['Vuong Palace Dong Van', 'Dinh Vua Meo Sa Phin'],
  'ma-pi-leng-dong-van': ['Ma Pi Leng Pass Dong Van'],
  'tu-san-dong-van': ['Tu San Canyon Dong Van'],
  'nho-que-dong-van': ['Nho Que River Dong Van'],
  'lung-cu-dong-van': ['Lung Cu Flag Tower'],
  'cuc-bac-milestone': ['Cuc Bac milestone Vietnam', 'Cot moc Cuc Bac Lung Cu'],
  'lo-lo-chai-dong-van': ['Lo Lo Chai village Lung Cu'],
  'lao-sa-dong-van': ['Lao Sa village Sung La'],
  'sung-la-dong-van': ['Sung La Valley Dong Van'],
  'pao-house-dong-van': ['Pao House Sung La'],
  'tham-ma-dong-van': ['Tham Ma Pass'],
  'chin-khoanh-dong-van': ['Chin Khoanh Pass'],
  'ma-le-dong-van': ['Ma Le ancient village Dong Van'],
  'sunday-market-dong-van': ['Dong Van Sunday market'],
  'ma-le-market': ['Ma Le market Ha Giang'],
  'don-cao-fortress': ['Don Cao fortress Dong Van', 'French bunker Dong Van'],
  'thien-huong-village': ['Thien Huong ancient village Dong Van'],
  'lung-ngoc-ho-cave': ['Lung Ngoc Ho cave Dong Van'],
  'pho-cao-village': ['Pho Cao village Dong Van'],
  'pho-bang-ancient-town': ['Pho Bang ancient town Ha Giang'],
  'lung-cam-village': ['Lung Cam cultural village Ha Giang'],
  'ma-pi-leng-pass': ['Ma Pi Leng Pass', 'Ma Pi Leng Ha Giang'],
  'dong-van-geopark': ['Dong Van Karst Plateau Geopark', 'Dong Van UNESCO Geopark'],
  'quan-ba-heaven-gate': ['Quan Ba Heaven Gate', 'Cong Troi Quan Ba'],
  'tu-san-canyon': ['Tu San Canyon', 'Hem Tu San Nho Que'],
  'nho-que-river': ['Nho Que River', 'Nho Que boat Ha Giang'],
  'tham-ma-pass': ['Tham Ma Pass', 'Deo Tham Ma'],
  'chin-khoanh-pass': ['Chin Khoanh Pass', 'Deo Chin Khoanh'],
  'bac-sum-pass': ['Bac Sum Pass', 'Deo Bac Sum Ha Giang'],
  'quan-ba-twin-mountains': ['Quan Ba Twin Mountains', 'Nui Doi Quan Ba'],
  'yen-minh-pine-forest': ['Yen Minh pine forest', 'Thong Yen Minh'],
  'du-gia-waterfall': ['Du Gia Waterfall', 'Thac Du Gia'],
  'hoang-su-phi-terraces': ['Hoang Su Phi rice terraces', 'Hoang Su Phi Ha Giang'],
  'chieu-lau-thi': ['Chieu Lau Thi mountain', 'Kieu Lieu Ti'],
  'tay-con-linh': ['Tay Con Linh mountain', 'Tay Con Linh Ha Giang'],
  'lung-khuy-cave': ['Lung Khuy Cave', 'Hang Lung Khuy Quan Ba'],
  'lung-cu-flag-tower': ['Lung Cu Flag Tower', 'Cot co Lung Cu'],
  'dong-van-ancient-town': ['Dong Van Ancient Town', 'Pho co Dong Van'],
  'vuong-palace': ['Vuong Palace Dong Van', 'Dinh Vua Meo Sa Phin'],
  'meo-vac-town': ['Meo Vac town', 'Meo Vac Ha Giang'],
  'yen-minh-town': ['Yen Minh town Ha Giang'],
  'ha-giang-km0': ['Ha Giang city Km 0', 'Ha Giang provincial capital'],
  'sung-la-valley': ['Sung La Valley', 'Sung La Dong Van'],
  'pao-house': ['Pao House Sung La', 'Nha Pao Lao Sa'],
  'lao-xa-village': ['Lao Sa village Ha Giang', 'Lao Xa Sung La'],
  'lung-tam-weaving': ['Lung Tam weaving village', 'Lung Tam Quan Ba'],
  'du-gia-village': ['Du Gia village Ha Giang'],
  'nam-dam-village': ['Nam Dam village Quan Ba'],
  'lo-lo-chai-village': ['Lo Lo Chai village Lung Cu'],
  'seo-lung-village': ['Seo Lung village Ha Giang'],
  'ma-le-village': ['Ma Le ancient village Dong Van'],
  'lung-pu-village': ['Lung Pu village Meo Vac'],
  'khau-vai-love-market': ['Khau Vai love market', 'Cho tinh Khau Vai'],
  'dong-van-sunday-market': ['Dong Van Sunday market'],
  'meo-vac-market': ['Meo Vac market'],
  'quan-ba-market': ['Quan Ba market Ha Giang'],
  'hoang-su-phi-market': ['Hoang Su Phi market'],
  'fansipan': ['Fansipan mountain', 'Fansipan cable car Sapa'],
  'bia-hoi': ['bia hoi Hanoi', 'bia hơi Hanoi'],
  'hoan-kiem-lake': ['Hoan Kiem Lake', 'Turtle Tower Hanoi'],
  'hoa-lo-prison': ['Hoa Lo Prison', 'Hỏa Lò Prison'],
  'ho-chi-minh-mausoleum': ['Ho Chi Minh Mausoleum', 'Ba Dinh Square'],
  'west-lake': ['West Lake Hanoi', 'Tran Quoc Pagoda'],
  'ethnology-museum': ['Vietnam Museum of Ethnology'],
  'thang-long-citadel': ['Imperial Citadel of Thang Long', 'Flag Tower of Hanoi'],
  'dong-xuan-market': ['Dong Xuan Market Hanoi'],
  'hanoi-opera-house': ['Hanoi Opera House'],
  'quan-thanh-temple': ['Quan Thanh Temple Hanoi'],
  'long-bien-bridge': ['Long Bien Bridge Hanoi'],
  'notre-dame-saigon': ['Notre-Dame Cathedral Basilica of Saigon'],
  'independence-palace': ['Independence Palace Saigon', 'Reunification Palace'],
  'landmark81-viewpoint': ['Landmark 81 Ho Chi Minh City'],
  'jade-emperor-pagoda': ['Jade Emperor Pagoda Saigon'],
  'nguyen-hue-walking': ['Nguyen Hue Boulevard', 'Nguyen Hue walking street'],
  'cho-lon': ['Cho Lon Saigon', 'Thien Hau Temple Ho Chi Minh', 'Binh Tay Market'],
  'apartment-cafes': ['Cafe apartment Ho Chi Minh', 'The Cafe Apartment District 1'],
  'hoi-an-ancient-town': ['Hoi An Ancient Town', 'Japanese Covered Bridge'],
  'cam-thanh-basket-boats': ['Cam Thanh basket boat', 'Hoi An coconut boat'],
  'tra-que-village': ['Tra Que Vegetable Village'],
  'thanh-ha-pottery': ['Thanh Ha Pottery Village Hoi An'],
  'japanese-covered-bridge': ['Japanese Covered Bridge Hoi An', 'Chua Cau Hoi An'],
  'tan-ky-old-house': ['Tan Ky Old House Hoi An'],
  'phung-hung-old-house': ['Phung Hung Old House Hoi An'],
  'duc-an-old-house': ['Duc An Old House Hoi An'],
  'quan-thang-old-house': ['Quan Thang Old House Hoi An'],
  'hoi-an-market': ['Hoi An Central Market', 'Hoi An market'],
  'fujian-assembly-hall': ['Fujian Assembly Hall Hoi An', 'Hoi Quan Phuc Kien'],
  'cantonese-assembly-hall': ['Cantonese Assembly Hall Hoi An'],
  'hainan-assembly-hall': ['Hainan Assembly Hall Hoi An'],
  'teochew-assembly-hall': ['Teochew Assembly Hall Hoi An', 'Trieu Chau Assembly Hall'],
  'chinese-assembly-hall': ['Chinese Assembly Hall Hoi An', 'Ngu Bang Assembly Hall'],
  'quan-cong-temple': ['Quan Cong Temple Hoi An', 'Chua Ong Hoi An'],
  'phap-bao-pagoda': ['Phap Bao Pagoda Hoi An'],
  'hoi-an-central-mosque': ['Hoi An Mosque'],
  'museum-trade-ceramics': ['Museum of Trade Ceramics Hoi An'],
  'hoi-an-history-museum': ['Hoi An Museum of History and Culture'],
  'sa-huynh-museum': ['Museum of Sa Huynh Culture Hoi An'],
  'folk-culture-museum': ['Museum of Folk Culture Hoi An'],
  'precious-heritage-museum': ['Precious Heritage Museum Hoi An Rehahn'],
  'kim-bong-village': ['Kim Bong carpentry village Hoi An'],
  'cam-thanh-nipa-forest': ['Cam Thanh coconut forest Hoi An', 'Bay Mau water coconut'],
  'cua-dai-beach': ['Cua Dai Beach Hoi An'],
  'cu-lao-cham': ['Cu Lao Cham', 'Cham Islands Hoi An'],
  'thien-mu-pagoda': ['Thien Mu Pagoda Hue'],
  'tu-duc-tomb': ['Tomb of Tu Duc Hue'],
  'minh-mang-tomb': ['Tomb of Minh Mang Hue'],
  'dong-ba-market': ['Dong Ba Market Hue'],
  'forbidden-purple-city': ['Forbidden Purple City Hue', 'Tu Cam Thanh Hue'],
  'ngo-mon-gate': ['Ngo Mon Gate Hue', 'Meridian Gate Hue'],
  'thai-hoa-palace': ['Thai Hoa Palace Hue', 'Palace of Supreme Harmony Hue'],
  'can-chanh-palace': ['Can Chanh Palace Hue'],
  'duyet-thi-duong': ['Duyet Thi Duong Hue', 'Royal Theatre Hue'],
  'the-mieu': ['The Mieu Hue', 'The To Mieu Hue'],
  'nine-dynastic-urns': ['Nine Dynastic Urns Hue', 'Cuu Dinh Hue'],
  'hung-mieu': ['Hung Mieu Hue'],
  'phung-tien-palace': ['Phung Tien Palace Hue'],
  'hue-flag-tower': ['Flag Tower of Hue', 'Cot Co Hue'],
  'khai-dinh-tomb': ['Khai Dinh Tomb Hue', 'Ung Lang Hue'],
  'gia-long-tomb': ['Gia Long Tomb Hue', 'Thien Tho Lang'],
  'dong-khanh-tomb': ['Dong Khanh Tomb Hue'],
  'thieu-tri-tomb': ['Thieu Tri Tomb Hue'],
  'duc-duc-tomb': ['Duc Duc Tomb Hue', 'An Lang Hue'],
  'tu-dam-pagoda': ['Tu Dam Pagoda Hue'],
  'huyen-tran-temple': ['Huyen Tran Temple Hue'],
  'tu-hieu-pagoda': ['Tu Hieu Pagoda Hue'],
  'bao-quoc-pagoda': ['Bao Quoc Pagoda Hue'],
  'dieu-de-pagoda': ['Dieu De Pagoda Hue'],
  'truc-lam-bach-ma': ['Truc Lam Bach Ma Hue'],
  'hon-chen-temple': ['Hon Chen Temple Hue'],
  'voi-re-temple': ['Voi Re Temple Hue'],
  'dinh-cat-church': ['Dinh Cat Church Hue'],
  'phu-cam-cathedral': ['Phu Cam Cathedral Hue'],
  'hue-royal-antiquities': ['Hue Museum of Royal Antiquities', 'Long An Palace Hue'],
  'thua-thien-hue-history-museum': ['Thua Thien Hue History Museum'],
  'ho-chi-minh-museum-hue': ['Ho Chi Minh Museum Hue'],
  'le-ba-dang-art': ['Le Ba Dang Art Foundation Hue'],
  'thanh-toan-bridge': ['Thanh Toan Bridge Hue'],
  'truong-tien-bridge': ['Trang Tien Bridge Hue', 'Truong Tien Bridge'],
  'ho-quyen': ['Ho Quyen Hue', 'Royal Tiger Arena Hue'],
  'an-dinh-palace': ['An Dinh Palace Hue'],
  'ngu-binh-mountain': ['Ngu Binh Mountain Hue'],
  'ho-thuy-tien': ['Ho Thuy Tien Hue', 'Abandoned water park Hue'],
  'tam-giang-lagoon': ['Tam Giang Lagoon'],
  'lap-an-lagoon': ['Lap An Lagoon Hue'],
  'bach-ma-national-park': ['Bach Ma National Park'],
  'vong-canh-hill': ['Vong Canh Hill Hue'],
  'nguon-dai-river': ['Nguon Dai Hue'],
  'thuan-an-beach': ['Thuan An Beach Hue'],
  'canh-duong-beach': ['Canh Duong Beach Hue'],
  'lang-co-bay': ['Lang Co Beach Hue'],
  'thuy-xuan-village': ['Thuy Xuan incense village Hue'],
  'phuoc-tich-village': ['Phuoc Tich ancient village Hue'],
  'tay-loc-market': ['Tay Loc Market Hue'],
  'ben-ngu-market': ['Ben Ngu Market Hue'],
  'phuong-duc-village': ['Phuong Duc bronze village Hue'],
  'bao-la-village': ['Bao La bamboo village Hue'],
  'da-vien-island': ['Da Vien Island Hue'],
  'dragon-bridge': ['Dragon Bridge Da Nang'],
  'son-tra': ['Son Tra Peninsula', 'Monkey Mountain Da Nang'],
  'linh-ung-pagoda': ['Linh Ung Pagoda Lady Buddha Da Nang'],
  'ba-na-hills': ['Golden Bridge Ba Na Hills', 'Ba Na Hills Da Nang'],
  'sung-sot-cave': ['Sung Sot Cave Ha Long', 'Surprise Cave Halong'],
  'ti-top-island': ['Ti Top Island Ha Long', 'Titov Island'],
  'bai-tu-long-bay': ['Bai Tu Long Bay'],
  'thien-cung-cave': ['Thien Cung Cave Ha Long', 'Hang Thien Cung'],
  'dau-go-cave': ['Dau Go Cave Ha Long', 'Hang Dau Go'],
  'me-cung-cave': ['Me Cung Cave Ha Long'],
  'trinh-nu-cave': ['Trinh Nu Cave Ha Long'],
  'trong-cave': ['Hang Trong Ha Long', 'Drum Cave Ha Long Bay'],
  'luon-cave': ['Luon Cave Ha Long', 'Hang Luon'],
  'dong-tien-cave': ['Dong Tien Cave Ha Long', 'Ho Dong Tien'],
  'soi-sim-island': ['Soi Sim Island Ha Long'],
  'tuan-chau-island': ['Tuan Chau Island', 'Tuan Chau marina'],
  'co-to-island': ['Co To Island Vietnam'],
  'quan-lan-island': ['Quan Lan Island'],
  'ngoc-vung-island': ['Ngoc Vung Island'],
  'mat-rong-island': ['Mat Rong Island Ha Long', 'Dragon Eye Island Halong'],
  'hon-trong-mai': ['Hon Trong Mai', 'Fighting Cocks Ha Long'],
  'hon-dinh-huong': ['Hon Dinh Huong', 'Incense Burner Islet Ha Long'],
  'hon-con-coc': ['Hon Con Coc Ha Long'],
  'hon-cho-da': ['Hon Cho Da Ha Long'],
  'cua-van-village': ['Cua Van floating village'],
  'vung-vieng-village': ['Vung Vieng floating village'],
  'ba-hang-village': ['Ba Hang fishing village Ha Long'],
  'bai-chay-beach': ['Bai Chay Beach Ha Long'],
  'bai-chay-bridge': ['Bai Chay Bridge'],
  'bai-tho-mountain': ['Bai Tho Mountain Ha Long'],
  'quang-ninh-museum': ['Quang Ninh Museum'],
  'sun-world-halong': ['Sun World Ha Long', 'Sun World Halong Complex'],
  'queen-cable-halong': ['Queen Cable Car Ha Long'],
  'sun-wheel-halong': ['Sun Wheel Ha Long'],
  'dragon-park-halong': ['Dragon Park Ha Long'],
  'typhoon-water-park': ['Typhoon Water Park Ha Long'],
  'ha-long-market': ['Cho Ha Long 1', 'Ha Long Market'],
  'bai-chay-night-market': ['Bai Chay Night Market'],
  'ha-long-flower-park': ['Ha Long Flower Park'],
  'funny-art-museum-halong': ['3D Funny Art Museum Ha Long'],
  'loi-am-pagoda': ['Loi Am Pagoda Ha Long', 'Chua Loi Am'],
  'long-tien-pagoda': ['Long Tien Pagoda Ha Long'],
  'cua-ong-temple': ['Cua Ong Temple Cam Pha'],
  'tran-quoc-nghien-temple': ['Tran Quoc Nghien Temple Ha Long'],
  'bao-bien-road': ['Duong Bao Bien Tran Quoc Nghien'],
  'trang-an-boats': ['Trang An boat Ninh Binh'],
  'tam-coc-boats': ['Tam Coc Ninh Binh', 'Tam Coc boat'],
  'van-long': ['Van Long Nature Reserve'],
  'bai-dinh': ['Bai Dinh Pagoda Ninh Binh'],
  'thung-nham': ['Thung Nham Bird Park Ninh Binh'],
  'tuyet-tinh-coc': ['Tuyet Tinh Coc Ninh Binh', 'Am Tien Cave Hoa Lu'],
  'cuc-phuong': ['Cuc Phuong National Park'],
  'dong-thien-ha': ['Thien Ha Cave Ninh Binh', 'Galaxy Cave Ninh Binh'],
  'dong-tien-canh': ['Hang Tien Tam Coc', 'Tien Cave Ninh Binh'],
  'bich-dong-pagoda': ['Bich Dong Pagoda Ninh Binh'],
  'thai-vi-temple': ['Thai Vi Temple Tam Coc'],
  'hang-thien-huong': ['Thien Huong Cave Ninh Binh'],
  'den-tran-hoa-lu': ['Den Tran Trang An Ninh Binh'],
  'bai-dinh-co': ['Bai Dinh ancient pagoda', 'Chua Bai Dinh Co'],
  'pho-co-hoa-lu': ['Pho Co Hoa Lu Ninh Binh'],
  'dinh-le-tombs': ['Lang vua Dinh Hoa Lu', 'Ma Yen mountain Ninh Binh'],
  'phat-diem-cathedral': ['Phat Diem Cathedral Ninh Binh'],
  'kim-son-sedge': ['Kim Son sedge village Ninh Binh'],
  'ninh-van-stone': ['Ninh Van stone carving village'],
  'van-lam-embroidery': ['Van Lam embroidery village Ninh Binh'],
  'bear-sanctuary-ninh-binh': ['BEAR SANCTUARY Ninh Binh FOUR PAWS'],
  'co-vien-lau': ['Co Vien Lau Tam Coc'],
  'cat-cat-village': ['Cat Cat Village Sapa'],
  'sapa-market': ['Sa Pa market', 'Sapa town market'],
  'ham-rong-mountain': ['Ham Rong Mountain Sapa'],
  'hoang-lien-national-park': ['Hoang Lien National Park Sapa'],
  'o-quy-ho-pass': ['O Quy Ho Pass Sapa', 'Tram Ton Pass'],
  'muong-hoa-valley': ['Muong Hoa Valley Sapa'],
  'sapa-ancient-stone-field': ['Sapa ancient stone field', 'Bai da co Sapa'],
  'seng-my-ty-reservoir': ['Seo My Ty lake Sapa', 'Seng My Ty reservoir'],
  'coc-san-cave': ['Coc San cave Sapa'],
  'fairy-cave-sapa': ['Fairy Cave Sapa', 'Hang Tien Sapa'],
  'silver-waterfall': ['Silver Waterfall Sapa', 'Thac Bac Sapa'],
  'love-waterfall': ['Love Waterfall Sapa', 'Thac Tinh Yeu'],
  'cat-cat-waterfall': ['Cat Cat waterfall Sapa'],
  'cau-may': ['Cau May Sapa cloud bridge'],
  'rong-may-skywalk': ['Rong May glass bridge Sapa'],
  'ta-van-village': ['Ta Van village Sapa'],
  'lao-chai-village': ['Lao Chai village Sapa'],
  'ta-phin-village': ['Ta Phin village Sapa'],
  'y-linh-ho-village': ['Y Linh Ho village Sapa'],
  'sin-chai-village': ['Sin Chai village Sapa'],
  'ban-ho-village': ['Ban Ho village Sapa'],
  'nam-sai-village': ['Nam Sai village Sapa'],
  'sa-pa-village': ['Sa Pa village Sapa commune'],
  'hau-thao-village': ['Hau Thao village Sapa'],
  'sapa-stone-church': ['Sa Pa stone church'],
  'sapa-center-square': ['Sa Pa square'],
  'sapa-lake': ['Sa Pa lake'],
  'kim-son-bao-thang': ['Kim Son Bao Thang Fansipan'],
  'bich-van-thien-tu': ['Bich Van Thien Tu Fansipan'],
  'fansipan-buddha': ['Fansipan Buddha statue'],
  'sapa-museum': ['Sa Pa museum'],
  'sun-plaza-sapa': ['Sun Plaza Sapa'],
  'bac-ha-market': ['Bac Ha market'],
  'coc-ly-market': ['Coc Ly market'],
  'can-cau-market': ['Can Cau market'],
  'muong-hum-market': ['Muong Hum market'],
  'cao-son-market': ['Cao Son market Lao Cai'],
  'sao-beach': ['Sao Beach Phu Quoc', 'Bai Sao'],
  'duong-dong-night-market': ['Duong Dong night market Phu Quoc'],
  'starfish-beach': ['Rach Vem starfish beach Phu Quoc'],
  'long-beach-pq': ['Long Beach Phu Quoc', 'Bai Truong'],
  'khem-beach': ['Bai Khem Phu Quoc'],
  'ong-lang-beach': ['Ong Lang Beach Phu Quoc'],
  'ganh-dau-beach': ['Ganh Dau Beach Phu Quoc'],
  'vung-bau-beach': ['Vung Bau Beach Phu Quoc'],
  'cua-can-beach': ['Cua Can Beach Phu Quoc'],
  'thom-beach': ['Bai Thom Phu Quoc'],
  'hon-thom-island': ['Hon Thom Phu Quoc', 'Pineapple Island'],
  'hon-may-rut': ['Hon May Rut Phu Quoc'],
  'hon-mong-tay': ['Hon Mong Tay Phu Quoc'],
  'hon-gam-ghi': ['Hon Gam Ghi Phu Quoc'],
  'an-thoi-archipelago': ['An Thoi islands Phu Quoc'],
  'phu-quoc-national-park': ['Phu Quoc National Park'],
  'suoi-tranh': ['Suoi Tranh waterfall Phu Quoc'],
  'suoi-da-ban': ['Suoi Da Ban Phu Quoc'],
  'ganh-dau-cape': ['Ganh Dau Cape Phu Quoc'],
  'ho-quoc-pagoda': ['Ho Quoc Pagoda Phu Quoc', 'Truc Lam Ho Quoc'],
  'sung-hung-pagoda': ['Sung Hung Pagoda Phu Quoc'],
  'su-muon-pagoda': ['Su Muon Pagoda Phu Quoc'],
  'cao-dai-phu-quoc': ['Cao Dai Temple Phu Quoc'],
  'phu-quoc-prison': ['Phu Quoc Prison', 'Coconut Tree Prison'],
  'coi-nguon-museum': ['Coi Nguon Museum Phu Quoc'],
  'ham-ninh-village': ['Ham Ninh fishing village Phu Quoc'],
  'cua-can-village': ['Cua Can village Phu Quoc'],
  'grand-world-pq': ['Grand World Phu Quoc'],
  'sunset-town-pq': ['Sunset Town Phu Quoc'],
  'kiss-bridge': ['Kiss Bridge Phu Quoc', 'Cau Hon'],
  'hon-thom-cable': ['Hon Thom cable car Phu Quoc'],
  'vinwonders-pq': ['VinWonders Phu Quoc'],
  'vinpearl-safari-pq': ['Vinpearl Safari Phu Quoc'],
  'aquatopia-pq': ['Aquatopia Phu Quoc'],
  'khu-cuong-pepper': ['Khu Cuong pepper farm Phu Quoc'],
  'duc-phat-pepper': ['Duc Phat pepper farm Phu Quoc'],
  'khai-hoan-fish-sauce': ['Khai Hoan fish sauce Phu Quoc'],
  'phung-hung-fish-sauce': ['Phung Hung fish sauce Phu Quoc'],
  'sim-wine-farm': ['Sim wine Phu Quoc'],
  'ngoc-hien-pearl': ['Ngoc Hien pearl farm Phu Quoc'],
  'dinh-cau': ['Dinh Cau Phu Quoc'],
  'paradise-cave': ['Paradise Cave Phong Nha', 'Thien Duong Cave'],
  'phong-nha-cave-boat': ['Phong Nha Cave boat'],
  'son-doong-cave': ['Son Doong Cave'],
  'hang-en': ['Hang En cave', 'Hang En Phong Nha'],
  'hang-va': ['Hang Va cave'],
  'nuoc-nut-cave': ['Nuoc Nut Cave', 'Hang Nuoc Nut'],
  'tu-lan-caves': ['Tu Lan Cave System'],
  'hang-tien': ['Hang Tien Phong Nha', 'Hang Tien Tu Lan'],
  'tra-ang-cave': ['Tra Ang Cave'],
  'hang-vom': ['Hang Vom Phong Nha'],
  'hang-dai-a': ['Hang Dai A'],
  'hang-over': ['Hang Over Phong Nha'],
  'hang-pygmy': ['Hang Pygmy'],
  'son-nu-cave': ['Son Nu Cave Phong Nha'],
  'ruc-mon-cave': ['Ruc Mon Cave'],
  'e-cave': ['E Cave Phong Nha'],
  'mooc-spring': ['Mooc Spring', 'Suoi Nuoc Mooc'],
  'chay-river': ['Chay River Phong Nha', 'Song Chay'],
  'hava-valley': ['Hava Valley Phong Nha'],
  'ozo-treetop': ['Ozo Treetop Park Phong Nha'],
  'phong-nha-botanical': ['Phong Nha Botanical Garden'],
  'bong-lai-valley': ['Bong Lai Valley Phong Nha'],
  'duck-stop': ['The Duck Stop Phong Nha'],
  'pub-cold-beer': ['Pub with Cold Beer Phong Nha'],
  'east-hill-phong-nha': ['East Hill Phong Nha'],
  'thac-gio': ['Thac Gio waterfall Phong Nha'],
  'vang-macaque': ['Vang macaque Phong Nha'],
  'eight-ladies-cave': ['Hang Tam Co', 'Eight Ladies Cave'],
  'highway-20-memorial': ['Highway 20 memorial Phong Nha'],
  'ben-tien-ferry': ['Ben Tien Ferry Phong Nha'],
  'tram-tran': ['Tram Tran Phong Nha'],
  'phong-nha-park-hq': ['Phong Nha Ke Bang National Park headquarters'],
  'khe-gat-airfield': ['Khe Gat airfield'],
  'phong-nha-market': ['Phong Nha market'],
  'po-nagar': ['Po Nagar Cham Towers Nha Trang'],
  'long-son-pagoda': ['Long Son Pagoda white Buddha Nha Trang'],
  'nha-trang-cathedral': ['Nha Trang Cathedral Christ the King Stone Church'],
  'hai-duc-pagoda': ['Hai Duc Pagoda Nha Trang'],
  'tong-lam-lo-son': ['Tong Lam Lo Son Pagoda Da Lo Nha Trang'],
  'chua-tu-ton': ['Chua Tu Ton Hon Do Nha Trang'],
  'kim-son-temple': ['Sac Tu Kim Son Pagoda Nha Trang'],
  'nguyen-trung-truc-temple': ['Nguyen Trung Truc temple Nha Trang'],
  'oceanographic-museum-nt': ['National Oceanographic Museum Nha Trang Cau Da'],
  'yersin-museum': ['Alexandre Yersin Museum Pasteur Institute Nha Trang'],
  'khanh-hoa-museum': ['Khanh Hoa Museum Nha Trang'],
  'tram-huong-tower': ['Tram Huong Tower Nha Trang lotus'],
  'do-theatre': ['Do Theatre Nha Trang Vega City'],
  'truong-xuan-gallery': ['Truong Xuan Gallery Nha Trang'],
  'tri-nguyen-aquarium': ['Tri Nguyen Aquarium Hon Mieu pirate ship'],
  'hon-chong': ['Hon Chong promontory Nha Trang'],
  'hon-do-rocks': ['Hon Do red island Nha Trang'],
  'ba-ho-waterfalls': ['Ba Ho Waterfalls Nha Trang'],
  'yang-bay': ['Yang Bay waterfall eco park Khanh Hoa'],
  'ta-gu-waterfall': ['Ta Gu waterfall Khanh Son'],
  'suoi-thach-lam': ['Suoi Thach Lam Nha Trang'],
  'hon-ba-nature-reserve': ['Hon Ba Nature Reserve Khanh Hoa'],
  'nha-trang-beach': ['Nha Trang Beach Tran Phu'],
  'bai-duong-beach': ['Bai Duong Beach Nha Trang'],
  'doc-let-beach': ['Doc Let Beach Ninh Hoa'],
  'bai-dai-beach': ['Bai Dai Long Beach Cam Ranh'],
  'hon-tre-island': ['Hon Tre Island Vinpearl cable car Nha Trang'],
  'hon-tam-island': ['Hon Tam Island Nha Trang'],
  'hon-mun-island': ['Hon Mun Island marine park Nha Trang'],
  'hon-mieu-island': ['Hon Mieu Island Nha Trang'],
  'hon-mot-island': ['Hon Mot Island Nha Trang'],
  'hon-lao-island': ['Hon Lao Monkey Island Nha Trang'],
  'hoa-lan-island': ['Hoa Lan Orchid Island Nha Trang'],
  'diep-son-island': ['Diep Son Island sandbar Van Phong'],
  'ninh-van-bay': ['Ninh Van Bay Nha Trang'],
  'van-phong-bay': ['Van Phong Bay Khanh Hoa'],
  'vinwonders-nha-trang': ['VinWonders Nha Trang Vinpearl Land'],
  'vinpearl-harbor': ['Vinpearl Harbour Nha Trang'],
  'thap-ba-hot-springs': ['Thap Ba Hot Springs mud bath Nha Trang'],
  'i-resort-mud-bath': ['I-Resort mud bath Nha Trang'],
  'hundred-egg-mud-bath': ['100 Egg Mud Bath Tram Trung Nha Trang'],
  'suoi-mo': ['Suoi Mo eco tourism Nha Trang'],
  'nha-trang-promenade': ['Nha Trang Beach promenade Tran Phu'],
  'dam-market': ['Cho Dam market Nha Trang'],
  'xom-moi-market': ['Xom Moi market Nha Trang'],
  'nha-trang-night-market': ['Nha Trang night market Tran Phu'],
  'skylight-nha-trang': ['Skylight Havana Hotel Nha Trang skydeck'],
  'xuan-huong-lake': ['Xuan Huong Lake Da Lat'],
  'crazy-house': ['Hang Nga Crazy House Da Lat'],
  'valley-of-love': ['Valley of Love Da Lat'],
  'tuyen-lam-lake': ['Tuyen Lam Lake Da Lat'],
  'lake-of-sighs': ['Ho Than Tho Lake of Sighs Da Lat'],
  'da-lat-railway-station': ['Da Lat Railway Station'],
  'da-lat-cathedral': ['Da Lat Cathedral Chicken Church'],
  'domaine-de-marie': ['Domaine de Marie Pink Church Da Lat'],
  'linh-phuoc-pagoda': ['Linh Phuoc Pagoda Da Lat'],
  'truc-lam-monastery': ['Truc Lam Zen Monastery Da Lat'],
  'linh-an-pagoda': ['Linh An Pagoda Da Lat'],
  'thien-vuong-pagoda': ['Thien Vuong Co Sat Da Lat'],
  'bao-dai-palace-i': ['Bao Dai Palace I Da Lat Dinh I'],
  'bao-dai-palace-ii': ['Bao Dai Palace II Da Lat'],
  'bao-dai-palace-iii': ['Bao Dai Summer Palace III Da Lat'],
  'lam-vien-square': ['Lam Vien Square Da Lat'],
  'clay-tunnel-dalat': ['Clay Tunnel Dalat Sculpture Tunnel'],
  'elephant-falls': ['Elephant Falls Thac Voi Da Lat'],
  'pongour-waterfall': ['Pongour Waterfall Da Lat'],
  'prenn-waterfall': ['Prenn Waterfall Da Lat'],
  'tiger-cave-waterfall': ['Tiger Cave Waterfall Da Lat'],
  'cam-ly-waterfall': ['Cam Ly Waterfall Da Lat'],
  'dambri-waterfall': ['Dambri Waterfall Bao Loc'],
  'langbiang': ['Langbiang Mountain Da Lat'],
  'da-lat-flower-gardens': ['Da Lat Flower Gardens'],
  'van-thanh-flowers': ['Van Thanh Flower Village Da Lat'],
  'thai-phien-flowers': ['Thai Phien Flower Village Da Lat'],
  'cau-dat-tea': ['Cau Dat Tea Hill Da Lat'],
  'da-lat-market': ['Da Lat Market Cho Da Lat'],
  'fairytale-land-dalat': ['Dalat Fairytale Land'],
  'lumiere-light-garden': ['Lumiere Light Garden Da Lat'],
  'hydrangea-trai-mat': ['Hydrangea farm Trai Mat Da Lat'],
  'fresh-garden-dalat': ['Fresh Garden Dalat'],
  'cu-lan-village': ['Cu Lan Village Da Lat'],
  'chicken-village-kho': ['Chicken Village Dong KHo Da Lat'],
  'mongo-land-dalat': ['Mongo Land Da Lat'],
  'french-quarter-dalat': ['French villas Da Lat Tran Hung Dao'],
  'hundred-roofs-bar': ['100 Roofs Bar Da Lat'],
}

const STOP = new Set([
  'the', 'and', 'of', 'a', 'in', 'at', 'for', 'to', 'with', 'from', 'day',
  'walk', 'evening', 'morning', 'afternoon', 'class', 'tour', 'crawl', 'corner',
  'circuit', 'complex', 'escape', 'viewpoint', 'peak', 'section', 'hidden',
])

function placeName(exp) {
  return exp.name.replace(/\([^)]*\)/g, '').trim()
}

function tokens(exp) {
  return placeName(exp)
    .toLowerCase()
    .replace(/[^a-z0-9\sàáảãạăằắẩẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
}

function aliases(exp) {
  return PLACE_ALIASES[exp.id] ?? [placeName(exp)]
}

function parseExperiences() {
    const files = [
      'experiences.ts',
      'experiencesExtra.ts',
      'experiencesHoiAn.ts',
      'experiencesNinhBinh.ts',
      'experiencesDaLat.ts',
      'experiencesHue.ts',
      'experiencesSapa.ts',
      'experiencesPhuQuoc.ts',
      'experiencesHaLong.ts',
      'experiencesPhongNha.ts',
      'experiencesNhaTrang.ts',
      'experiencesCanTho.ts',
      'experiencesHaGiang.ts',
      'experiencesCatBa.ts',
      'experiencesDongVan.ts',
    ]
  const list = []
  const blobs = []
  for (const file of files) {
    const text = fs.readFileSync(path.join(DATA_DIR, file), 'utf8')
    blobs.push(text)
    const cityConst = text.match(/city: '([^']+)' as const/)
    const regionConst = text.match(/region: '([^']+)' as const/)
    const re = /id: '([^']+)',\s*\n\s*name: '([^']+)',(?:\s*\n\s*region: '([^']+)',\s*\n\s*city: '([^']+)')?/g
    let m
    while ((m = re.exec(text))) {
      list.push({
        id: m[1],
        name: m[2],
        region: m[3] ?? regionConst?.[1] ?? cityConst?.[1] ?? '',
        city: m[4] ?? cityConst?.[1] ?? m[3] ?? '',
      })
    }
  }
  const all = blobs.join('\n')
  for (const exp of list) {
    const idx = all.indexOf(`id: '${exp.id}'`)
    const slice = idx >= 0 ? all.slice(idx, idx + 2800) : ''
    const sm = slice.match(/signal: '([^']+)'/)
    const featured = /featured:\s*true/.test(slice)
    const hiddenGem = /hiddenGem:\s*true/.test(slice)
    const signal = sm?.[1] ?? ''
    let tag = 'Popular'
    if (signal === 'must-do' || featured) tag = 'Must do'
    else if (hiddenGem || signal === 'hidden-gem') tag = 'Hidden gem'
    else if (signal === 'vietnam-special' || signal === 'local-life') tag = 'Local favourite'
    else if (signal === 'adventure' || signal === 'picture-perfect') tag = 'Unique'
    exp.videoCount = tag === 'Must do' || tag === 'Popular' ? 3 : 2
  }
  return list
}

function cleanUrl(url) {
  return url?.split('?')[0] ?? url
}

function photoScore(title, exp) {
  const t = (title ?? '').toLowerCase()
  if (/logo|flag|map|icon|svg|coat of arms|location map|diagram|signature|stamp|qr /i.test(t)) return -100
  const toks = tokens(exp)
  let s = 0
  for (const tok of toks) if (t.includes(tok)) s += 3
  for (const a of aliases(exp)) {
    const parts = a.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    if (parts.every((p) => t.includes(p))) s += 6
  }
  if (t.includes(exp.city.toLowerCase())) s += 1
  if (t.includes('vietnam') || t.includes('viet nam')) s += 0.5
  return s
}

async function wikiJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) return null
  return res.json()
}

async function fetchCommonsHits(query, limit = 40) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|mime|size',
    iiurlwidth: '1280',
    format: 'json',
    origin: '*',
  })
  const json = await wikiJson(`https://commons.wikimedia.org/w/api.php?${params}`)
  const out = []
  for (const page of Object.values(json?.query?.pages ?? {})) {
    const info = page.imageinfo?.[0]
    if (!info?.thumburl) continue
    if (info.mime?.startsWith('video/')) continue
    if ((info.size ?? 0) < 50000) continue
    out.push({
      url: cleanUrl(info.thumburl),
      title: page.title ?? '',
      size: info.size ?? 0,
    })
  }
  return out
}

async function fetchWikipediaPageImages(query) {
  const search = await wikiJson(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=3&format=json&origin=*`,
  )
  const hits = search?.query?.search ?? []
  const out = []
  for (const hit of hits.slice(0, 2)) {
    const params = new URLSearchParams({
      action: 'query',
      titles: hit.title,
      generator: 'images',
      gimlimit: '25',
      prop: 'imageinfo',
      iiprop: 'url|mime|size',
      iiurlwidth: '1280',
      format: 'json',
      origin: '*',
    })
    const json = await wikiJson(`https://en.wikipedia.org/w/api.php?${params}`)
    for (const page of Object.values(json?.query?.pages ?? {})) {
      const info = page.imageinfo?.[0]
      if (!info?.thumburl) continue
      if (info.mime?.startsWith('video/') || info.mime === 'image/svg+xml') continue
      if ((info.size ?? 0) < 40000) continue
      out.push({
        url: cleanUrl(info.thumburl),
        title: page.title ?? '',
        size: info.size ?? 0,
      })
    }
    await sleep(200)
  }
  return out
}

async function fetchPhotosForExperience(exp, curated = []) {
  const queries = [
    ...aliases(exp).map((a) => `"${a}"`),
    ...aliases(exp),
    `${placeName(exp)} ${exp.city}`,
    `${placeName(exp)} Vietnam`,
  ]
  const scored = []
  const seen = new Set()

  for (const url of curated) {
    const clean = cleanUrl(url)
    if (seen.has(clean)) continue
    seen.add(clean)
    scored.push({ url: clean, title: url, size: 200000, score: 12 })
  }

  for (const q of queries) {
    const wiki = await fetchWikipediaPageImages(q.replace(/"/g, ''))
    for (const hit of wiki) {
      if (seen.has(hit.url)) continue
      const score = photoScore(hit.title, exp)
      if (score < 3) continue
      seen.add(hit.url)
      scored.push({ ...hit, score })
    }
    await sleep(200)
    const commons = await fetchCommonsHits(q, 30)
    for (const hit of commons) {
      if (seen.has(hit.url)) continue
      const score = photoScore(hit.title, exp)
      if (score < 3) continue
      seen.add(hit.url)
      scored.push({ ...hit, score })
    }
    await sleep(250)
    if (scored.length >= PHOTO_COUNT + 8) break
  }

  scored.sort((a, b) => b.score - a.score || b.size - a.size)
  let urls = scored.map((s) => s.url).slice(0, PHOTO_COUNT)

  if (urls.length < PHOTO_COUNT) {
    const extraQueries = [...aliases(exp), `${placeName(exp)} Vietnam`, `${exp.city} ${tokens(exp)[0] ?? ''}`]
    for (const q of extraQueries) {
      const extra = await fetchCommonsHits(q, 50)
      extra.sort((a, b) => photoScore(b.title, exp) - photoScore(a.title, exp) || b.size - a.size)
      for (const hit of extra) {
        if (urls.includes(hit.url)) continue
        if (photoScore(hit.title, exp) < 1) continue
        urls.push(hit.url)
        if (urls.length >= PHOTO_COUNT) break
      }
      if (urls.length >= PHOTO_COUNT) break
      await sleep(200)
    }
  }

  return urls.slice(0, PHOTO_COUNT)
}

async function fetchOpenversePhotos(query, limit = 20) {
  const urls = []
  const params = new URLSearchParams({
    q: query,
    page_size: String(Math.min(20, limit)),
    page: '1',
  })
  const res = await fetch(`https://api.openverse.engineering/v1/images?${params}`, {
    headers: { 'User-Agent': UA },
  })
  if (!res.ok) return []
  const json = await res.json()
  for (const item of json.results ?? []) {
    const title = `${item.title ?? ''} ${item.tags?.map((t) => t.name).join(' ') ?? ''}`
    if (!item.url?.startsWith('http')) continue
    urls.push({ url: cleanUrl(item.url), title, size: 100000 })
  }
  return urls
}

async function padPhotos(exp, existing) {
  const urls = [...(existing ?? [])]
  const seen = new Set(urls)
  const queries = [...aliases(exp), placeName(exp), `${tokens(exp).slice(0, 2).join(' ')} Vietnam`]
  for (const q of queries) {
    const hits = await fetchCommonsHits(q, 50)
    hits.sort((a, b) => photoScore(b.title, exp) - photoScore(a.title, exp) || b.size - a.size)
    for (const hit of hits) {
      if (seen.has(hit.url)) continue
      const score = photoScore(hit.title, exp)
      const toks = tokens(exp)
      const hasToken = toks.some((t) => hit.title.toLowerCase().includes(t))
      if (score < 1 && !hasToken) continue
      seen.add(hit.url)
      urls.push(hit.url)
      if (urls.length >= PHOTO_COUNT) return urls.slice(0, PHOTO_COUNT)
    }
    await sleep(200)
  }
  for (const q of queries) {
    const ov = await fetchOpenversePhotos(q, 20)
    for (const hit of ov) {
      if (seen.has(hit.url)) continue
      const toks = tokens(exp)
      const hasToken = toks.some((t) => hit.title.toLowerCase().includes(t))
      if (photoScore(hit.title, exp) < 1 && !hasToken) continue
      seen.add(hit.url)
      urls.push(hit.url)
      if (urls.length >= PHOTO_COUNT) return urls.slice(0, PHOTO_COUNT)
    }
    await sleep(250)
  }
  return urls.slice(0, PHOTO_COUNT)
}

function extractCuratedImages() {
  const text = fs.readFileSync(path.join(DATA_DIR, 'experienceImages.ts'), 'utf8')
  const map = {}
  const blockRe = /'([^']+)':\s*\[([\s\S]*?)\]/g
  let m
  while ((m = blockRe.exec(text))) {
    const id = m[1]
    const files = [...m[2].matchAll(/w\('([^']+)'(?:,\s*(\d+))?\)/g)].map((x) => x[1])
    const urls = files.map(
      (file) =>
        `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1200`,
    )
    if (urls.length) map[id] = { urls, files }
  }
  return map
}

function videoScore(title, exp) {
  const t = (title ?? '').toLowerCase()
  const toks = tokens(exp)
  const city = exp.city.toLowerCase()
  const generic = /top \d+|things to do in|best of |what to do in|places to visit in/.test(t)
  const tokenHits = toks.filter((tok) => t.includes(tok)).length
  if (generic && tokenHits < Math.min(2, toks.length)) return -20
  let s = tokenHits * 5
  if (t.includes(city)) s += 1
  if (t.includes('vietnam') || t.includes('viet nam')) s += 1
  if (t.includes('tour') || t.includes('visit') || t.includes('guide')) s += 1
  return s
}

async function fetchYoutubeCandidates(page, query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForTimeout(1800)
    const consent = page.locator('button:has-text("Accept all"), button:has-text("I agree"), button:has-text("Accept")')
    if (await consent.first().isVisible({ timeout: 1500 }).catch(() => false)) {
      await consent.first().click().catch(() => {})
      await page.waitForTimeout(1500)
    }
    await page.waitForTimeout(2000)
    return await page.evaluate(() => {
      const out = []
      const seen = new Set()
      const cards = document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer')
      for (const card of cards) {
        const a =
          card.querySelector('a#video-title') ||
          card.querySelector('a#video-title-link') ||
          card.querySelector('a[href*="watch?v="]')
        if (!a) continue
        const href = a.getAttribute('href') ?? ''
        const m = href.match(/[?&]v=([\w-]{11})/)
        if (!m || seen.has(m[1])) continue
        const title = (
          a.getAttribute('title') ||
          a.getAttribute('aria-label') ||
          a.textContent ||
          ''
        )
          .replace(/by .*? \d+ (second|minute|hour|day|week|month|year)s? ago.*/i, '')
          .replace(/\s+/g, ' ')
          .trim()
        if (!title || /now playing/i.test(title)) continue
        seen.add(m[1])
        out.push({ youtubeId: m[1], title })
        if (out.length >= 12) break
      }
      return out
    })
  } catch {
    return []
  }
}

async function fetchVideoForExperience(page, exp) {
  if (!page) return []
  const queries = [
    `"${aliases(exp)[0]}" Vietnam`,
    `${placeName(exp)} ${exp.city} Vietnam`,
    `${aliases(exp)[0]} visit`,
  ]
  const pool = []
  for (const q of queries) {
    const batch = await fetchYoutubeCandidates(page, q)
    for (const item of batch) {
      if (!pool.some((p) => p.youtubeId === item.youtubeId)) pool.push(item)
    }
    await sleep(700)
  }
  pool.sort((a, b) => videoScore(b.title, exp) - videoScore(a.title, exp))
  const want = exp.videoCount ?? 2
  const picked = pool.filter((v) => videoScore(v.title, exp) >= 0).slice(0, want)
  if (picked.length) return picked
  return pool.slice(0, want)
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function writeTs(media) {
  const body = `/** Auto-generated by scripts/fetch-experience-media.mjs — do not edit by hand. */
export type ExperienceVideo = {
  youtubeId: string
  title?: string
}

export type ExperienceMedia = {
  photos: string[]
  videos: ExperienceVideo[]
}

export const EXPERIENCE_MEDIA: Record<string, ExperienceMedia> = ${JSON.stringify(media, null, 2)}

export function getExperienceMedia(id: string): ExperienceMedia | null {
  return EXPERIENCE_MEDIA[id] ?? null
}
`
  fs.writeFileSync(OUT_TS, body, 'utf8')
}

async function main() {
  const experiences = parseExperiences()
  const limit = process.env.LIMIT ? Number(process.env.LIMIT) : experiences.length
  const slice = experiences.slice(0, limit)
  const curated = extractCuratedImages()
  console.log(`Fetching focused media for ${slice.length} experiences…`)

  const media = fs.existsSync(OUT_JSON) ? JSON.parse(fs.readFileSync(OUT_JSON, 'utf8')) : {}

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' })

  let i = 0
  for (const exp of slice) {
    const existing = media[exp.id]
    const photosOk = !FORCE && existing?.photos?.length >= PHOTO_COUNT
    const wantVideos = exp.videoCount ?? 2
    const videosOk = !FORCE && (existing?.videos?.length ?? 0) >= wantVideos
    if (photosOk && videosOk) {
      console.log(`[skip] ${exp.id}`)
      continue
    }
    i += 1
    console.log(`[${i}] ${exp.id} — ${exp.name}`)
    const curatedEntry = curated[exp.id]
    let photos = existing?.photos ?? []
    if (!photosOk) {
      photos =
        photos.length > 0
          ? await padPhotos(exp, photos)
          : await fetchPhotosForExperience(exp, curatedEntry?.urls ?? [])
    }
    const videos = videosOk ? existing.videos : await fetchVideoForExperience(page, exp)
    media[exp.id] = { photos, videos }
    console.log(`  → ${photos.length} photos, ${videos.length} video${videos[0]?.title ? ` (${videos[0].title.slice(0, 70)})` : ''}`)
    fs.writeFileSync(OUT_JSON, JSON.stringify(media, null, 2), 'utf8')
    writeTs(media)
  }

  await browser.close()
  writeTs(media)
  console.log(`Done. Wrote ${OUT_TS}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
