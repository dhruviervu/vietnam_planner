const ua = {
  'User-Agent': 'VietnamPlanner/1.0 (event-images; educational)',
  'Api-User-Agent': 'VietnamPlanner/1.0',
}

const topics = {
  'fest-tet': ['Tết', 'Nguyễn Huệ Boulevard', 'Old Quarter, Hanoi', 'Hoàn Kiếm Lake'],
  'fest-hoian-lantern': ['Hội An', 'Japanese Bridge', 'Thu Bồn River', 'Hoi An'],
  'fest-perfume-pagoda': ['Perfume Pagoda', 'Hương Tích Cave'],
  'fest-lim': ['Quan họ', 'Bắc Ninh', 'Lim Festival'],
  'fest-hung-kings': ['Hùng Kings Temple Festival', 'Hùng Temple', 'Phú Thọ province'],
  'fest-giong': ['Thánh Gióng', 'Gióng Festival', 'Phù Đổng'],
  'fest-ba-chua-xu': ['Bà Chúa Xứ', 'Châu Đốc', 'Sam Mountain', 'An Giang province'],
  'fest-khau-vai': ['Khau Vai', 'Đồng Văn', 'Mèo Vạc', 'Hà Giang province'],
  'fest-danang-fireworks': ['Da Nang International Fireworks Festival', 'Dragon Bridge (Da Nang)', 'Hàn River', 'Mỹ Khê Beach'],
  'fest-nhatrang-sea': ['Nha Trang', 'Po Nagar', 'Nha Trang Beach'],
  'fest-vu-lan': ['Vu Lan', 'Ghost Festival', 'Trấn Quốc Pagoda', 'Hội An'],
  'fest-mid-autumn': ['Mid-Autumn Festival', 'Old Quarter, Hanoi', 'Hội An'],
  'fest-kate': ['Po Klong Garai Temple', 'Kate festival', 'Cham people', 'Phan Rang–Tháp Chàm'],
  'fest-ooc-om-boc': ['Ok Om Bok', 'Sóc Trăng', 'Cần Thơ', 'Cái Răng floating market'],
  'perf-water-puppet': ['Water puppetry', 'Thăng Long Water Puppet Theatre', 'Hoàn Kiếm Lake'],
  'perf-ca-tru': ['Ca trù', 'Hanoi Opera House', 'Temple of Literature, Hanoi'],
  'perf-nha-nhac': ['Nhã nhạc', 'Imperial City, Huế', 'Duyệt Thị Đường'],
  'perf-cai-luong': ['Cải lương', 'Municipal Theatre, Ho Chi Minh City', 'Ho Chi Minh City'],
  'perf-hat-cheo': ['Chèo', 'Hanoi Opera House', 'Vietnam Museum of Ethnology'],
}

async function summaryImage(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  const r = await fetch(url, { headers: ua })
  if (!r.ok) return null
  const j = await r.json()
  return j.originalimage?.source || j.thumbnail?.source || null
}

async function mediaImages(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}`
  const r = await fetch(url, { headers: ua })
  if (!r.ok) return []
  const j = await r.json()
  const out = []
  for (const item of j.items || []) {
    if (item.type !== 'image') continue
    const src =
      item.srcset?.slice(-1)[0]?.src ||
      item.original?.source ||
      item.src
    if (src && /\.(jpe?g|png|webp)/i.test(src)) out.push(src.startsWith('http') ? src : `https:${src}`)
  }
  return out
}

const result = {}
for (const [id, titles] of Object.entries(topics)) {
  const seen = new Set()
  const urls = []
  for (const title of titles) {
    await new Promise((r) => setTimeout(r, 200))
    const one = await summaryImage(title)
    if (one && !seen.has(one)) {
      seen.add(one)
      urls.push(one)
    }
    await new Promise((r) => setTimeout(r, 200))
    for (const u of await mediaImages(title)) {
      if (!seen.has(u)) {
        seen.add(u)
        urls.push(u)
      }
      if (urls.length >= 14) break
    }
    if (urls.length >= 14) break
  }
  result[id] = urls
  console.log(id, urls.length, urls[0]?.slice(0, 90))
}

import { writeFileSync } from 'node:fs'
writeFileSync(new URL('./event-media-found.json', import.meta.url), JSON.stringify(result, null, 2))
