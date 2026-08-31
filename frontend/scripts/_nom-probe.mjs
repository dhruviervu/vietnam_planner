const UA = 'vietnam-planner/1.0 (stay-cluster polygons)'

async function nom(params) {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    format: 'json',
    polygon_geojson: '1',
    limit: '8',
    countrycodes: 'vn',
    ...params,
  })}`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  const rows = await res.json()
  return rows.map((r) => ({
    type: r.type,
    class: r.class,
    osm: `${r.osm_type}/${r.osm_id}`,
    name: r.display_name?.slice(0, 90),
    geo: r.geojson?.type,
    n:
      r.geojson?.type === 'Polygon'
        ? r.geojson.coordinates[0].length
        : r.geojson?.type === 'MultiPolygon'
          ? r.geojson.coordinates[0][0].length
          : 0,
  }))
}

const qs = [
  { q: 'Khu phố cổ, Hà Nội' },
  { q: 'Hoan Kiem, Hanoi', featuretype: 'settlement' },
  { q: 'Quận 1, Thành phố Hồ Chí Minh' },
  { q: 'Quận 3, Thành phố Hồ Chí Minh' },
  { q: 'Thảo Điền, Thành phố Hồ Chí Minh' },
  { q: 'Phường Thảo Điền' },
  { q: 'Cẩm Châu, Hội An' },
  { q: 'Phường Cẩm Châu, Hội An' },
  { q: 'Xã Cẩm Thanh, Hội An' },
  { q: 'Phường Cẩm Phô, Hội An' },
  { q: 'Cồn Cẩm Nam, Hội An' },
  { q: 'Kinh thành Huế' },
  { q: 'Hoàng thành Huế' },
  { q: 'Thành phố Huế citadel' },
  { q: 'Dương Đông, Phú Quốc' },
  { q: 'Phường Dương Đông, Phú Quốc' },
  { q: 'Hội An Ancient Town' },
  { q: 'Phố cổ Hội An' },
]

for (const p of qs) {
  await new Promise((r) => setTimeout(r, 1100))
  const rows = await nom(p)
  console.log('\n===', p.q, '===')
  for (const r of rows) console.log(JSON.stringify(r))
}
