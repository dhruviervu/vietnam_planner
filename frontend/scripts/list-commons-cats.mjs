const ua = { 'User-Agent': 'VietnamPlanner/1.0 (image-audit)' }

async function categoryFiles(cat) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=${encodeURIComponent('Category:' + cat)}&gcmtype=file&gcmlimit=20&prop=imageinfo&iiprop=url&format=json`
  const r = await fetch(api, { headers: ua })
  const j = await r.json()
  const pages = Object.values(j.query?.pages || {})
  return pages.map((p) => p.title?.replace(/^File:/, '')).filter(Boolean)
}

const cats = [
  'Nguyen Hue Flower Street',
  'Hội An lantern festival',
  'Perfume Pagoda',
  'Po Klong Garai',
  'Dragon Bridge (Da Nang)',
  'Nha Trang Beach',
  'Water puppetry of Vietnam',
  'Hoan Kiem Lake',
  'Imperial City of Huế',
  'Saigon Opera House',
  'Cái Răng floating market',
  'Temple of Literature, Hanoi',
  'Hùng Temple',
  'Phù Đổng',
  'Châu Đốc',
  'Mèo Vạc District',
  'Trấn Quốc Pagoda',
  'Mid-Autumn Festival in Vietnam',
  'Nha nhac',
  'Cải lương',
]

for (const cat of cats) {
  await new Promise((r) => setTimeout(r, 1100))
  try {
    const files = await categoryFiles(cat)
    console.log('\n==', cat, files.length)
    console.log(files.slice(0, 12).join('\n'))
  } catch (e) {
    console.log('\n==', cat, 'ERR', e.message)
  }
}
