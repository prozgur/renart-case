const RAW  = import.meta.env.VITE_API_BASE_URL || '/api';
const BASE = RAW.endsWith('/api') ? RAW : RAW.replace(/\/$/, '') + '/api';

function toItems(base, params) {
  const gold = 75;
  let rows = base.map((p, i) => ({
    id: i + 1,
    ...p,
    popularity5: Math.round(p.popularityScore * 50) / 10,
    priceUSD: Number(((p.popularityScore + 1) * p.weight * gold).toFixed(2)),
  }));

  const q = (params.q || '').trim().toLowerCase();
  if (q) rows = rows.filter(r => r.name.toLowerCase().includes(q));
  if (params.minPopularity !== '' && params.minPopularity != null) rows = rows.filter(r => r.popularity5 >= Number(params.minPopularity));
  if (params.minPrice !== '' && params.minPrice != null) rows = rows.filter(r => r.priceUSD >= Number(params.minPrice));
  if (params.maxPrice !== '' && params.maxPrice != null) rows = rows.filter(r => r.priceUSD <= Number(params.maxPrice));

  const order = params.order === 'desc' ? -1 : 1;
  const sort  = params.sort || 'price';
  rows.sort((a,b) => {
    switch (sort) {
      case 'name':       return a.name.localeCompare(b.name) * order;
      case 'popularity': return (a.popularity5 - b.popularity5) * order;
      case 'weight':     return (a.weight - b.weight) * order;
      case 'price':
      default:           return (a.priceUSD - b.priceUSD) * order;
    }
  });

  const total   = rows.length;
  const page    = Number(params.page || 1);
  const perPage = Number(params.perPage || 12);
  const start   = (page - 1) * perPage;
  const items   = rows.slice(start, start + perPage);

  return { items, meta: { total, page, perPage, goldPriceUSDPerGram: gold } };
}

export async function fetchProducts(params) {
  try {
    const qs = new URLSearchParams();
    for (const [k,v] of Object.entries(params)) {
      if (k === 'userTouched') continue;
      if (v !== '' && v != null) qs.set(k, v);
    }
    const res = await fetch(`${BASE}/products?${qs.toString()}`);
    if (res.ok) return await res.json();
  } catch {}

  try {
    const res2 = await fetch('/data/products.json', { cache: 'no-store' });
    if (res2.ok) {
      const base = await res2.json();
      return toItems(base, params);
    }
  } catch {}

  return { items: [], meta: { total: 0, page: 1, perPage: Number(params.perPage || 12) } };
}
