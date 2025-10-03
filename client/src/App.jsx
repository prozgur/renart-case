import React, { useEffect, useMemo, useState } from "react";
import { Filters } from "./components/Filters.jsx";
import { ProductCard } from "./components/ProductCard.jsx";
import { fetchProducts } from "./lib/api.js";
import { useDebouncedValue } from "./lib/hooks.js";
import SkeletonCard from "./components/SkeletonCard.jsx";
import SeoJsonLd from "./components/SeoJsonLd.jsx";

const INITIAL = {
  q: "",
  minPrice: "",
  maxPrice: "",
  minPopularity: "",
  sort: "price",
  order: "asc",
  page: 1,
  perPage: 12,
  userTouched: false,
};

function useUrlParamsState(initial) {
  const [state, setState] = useState(() => {
    const usp = new URLSearchParams(window.location.search);
    const obj = { ...initial };
    for (const k of Object.keys(initial)) {
      const v = usp.get(k);
      if (v !== null) obj[k] = ["page", "perPage"].includes(k) ? Number(v) : v;
    }
    return obj;
  });

  useEffect(() => {
    const usp = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => {
      if (k === "userTouched") return;
      if (v !== "" && v != null) usp.set(k, String(v));
    });
    const url = `${window.location.pathname}?${usp.toString()}`;
    window.history.replaceState(null, "", url);
  }, [state]);

  return [state, setState];
}

export default function App() {
  // Uygulanan filtreler
  const [params, setParams] = useUrlParamsState(INITIAL);
  // Taslak (Apply'e basılana kadar sadece burada)
  const [draft, setDraft] = useState(params);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, perPage: 12 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Uygulanan arama metnini debounce et (taslağı değil!)
  const debouncedQ = useDebouncedValue(params.q, 300);

  // Uygulanan filtreler değiştiğinde taslağı senkron tut (Apply/Reset sonrası)
  useEffect(() => {
    setDraft((d) => ({
      ...d,
      q: params.q,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      minPopularity: params.minPopularity,
      sort: params.sort,
      order: params.order,
      perPage: params.perPage,
    }));
    // page'i senkronlamıyoruz; pagination uygulanan state'te kalsın
  }, [
    params.q,
    params.minPrice,
    params.maxPrice,
    params.minPopularity,
    params.sort,
    params.order,
    params.perPage,
  ]);

  const chips = useMemo(() => {
    if (!params.userTouched) return [];
    const arr = [];
    if (params.q) arr.push(["q", `search: ${params.q}`]);
    if (params.minPrice !== "") arr.push(["minPrice", `min: $${params.minPrice}`]);
    if (params.maxPrice !== "") arr.push(["maxPrice", `max: $${params.maxPrice}`]);
    if (params.minPopularity !== "") arr.push(["minPopularity", `pop >= ${params.minPopularity}`]);
    if (params.sort !== "price") arr.push(["sort", `sort: ${params.sort}`]);
    if (params.order !== "asc") arr.push(["order", params.order]);
    return arr;
  }, [params]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const effective = { ...params, q: debouncedQ };
      const { items, meta } = await fetchProducts(effective);
      setItems(items);
      setMeta(meta);
    } catch (e) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  // SADECE uygulanan filtreler değişince yükle
  useEffect(() => {
    load();
  }, [
    debouncedQ,
    params.minPrice,
    params.maxPrice,
    params.minPopularity,
    params.sort,
    params.order,
    params.page,
    params.perPage,
  ]);

  // Apply: taslağı uygula ve sayfayı 1'e çek
  function applyFilters() {
    setParams((p) => ({ ...p, ...draft, page: 1, userTouched: true }));
  }

  // Reset: hem taslağı hem uygulananı sıfırla
  function resetFilters() {
    setDraft(INITIAL);
    setParams(INITIAL);
  }

  // Taslak ile uygulanan aynıysa Apply'i pasifleştirelim (opsiyonel UX)
  const applyDisabled = JSON.stringify(
    (({ q, minPrice, maxPrice, minPopularity, sort, order, perPage }) => ({
      q,
      minPrice,
      maxPrice,
      minPopularity,
      sort,
      order,
      perPage,
    }))(draft)
  ) ===
    JSON.stringify(
      (({ q, minPrice, maxPrice, minPopularity, sort, order, perPage }) => ({
        q,
        minPrice,
        maxPrice,
        minPopularity,
        sort,
        order,
        perPage,
      }))(params)
    );

  function clearChip(key) {
    const cleared = {
      ...params,
      [key]: key === "sort" ? "price" : key === "order" ? "asc" : "",
      page: 1,
    };
    setParams(cleared);
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Renart — Product List</h1>
        <small>
          {meta.total} items | page: {meta.page}
        </small>
      </div>

      <Filters
        draft={draft}
        setDraft={setDraft}
        onApply={applyFilters}
        onReset={resetFilters}
        disabled={applyDisabled}
      />

      {params.userTouched && (
        <div className="chips">
          {chips.map(([key, text]) => (
            <div key={key} className="chip">
              {text}
              <button onClick={() => clearChip(key)}>×</button>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="empty">
          <h3>No results</h3>
          <p>Try clearing filters or adjusting your query.</p>
          <button className="button" onClick={resetFilters}>
            Clear filters
          </button>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="grid">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="pagination">
            <button
              className="button"
              disabled={meta.page <= 1}
              onClick={() => setParams((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              Prev
            </button>
            <span>Page {meta.page}</span>
            <button
              className="button"
              disabled={meta.page * meta.perPage >= meta.total}
              onClick={() => setParams((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </button>
            <select
              className="select"
              value={params.perPage}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  perPage: Number(e.target.value),
                  page: 1,
                }))
              }
            >
              {[12, 24, 48].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {!loading && !error && items.length > 0 && <SeoJsonLd products={items} />}
    </div>
  );
}
