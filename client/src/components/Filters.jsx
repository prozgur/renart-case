import React from "react";

export function Filters({ draft, setDraft, onApply, onReset, disabled }) {
  return (
    <div className="toolbar">
      <input
        className="input"
        placeholder="Search by name..."
        value={draft.q}
        onChange={(e) => setDraft((p) => ({ ...p, q: e.target.value }))}
      />

      <input
        className="input"
        placeholder="Min price"
        type="number"
        min="0"
        value={draft.minPrice}
        onChange={(e) => setDraft((p) => ({ ...p, minPrice: e.target.value }))}
      />

      <input
        className="input"
        placeholder="Max price"
        type="number"
        min="0"
        value={draft.maxPrice}
        onChange={(e) => setDraft((p) => ({ ...p, maxPrice: e.target.value }))}
      />

      <input
        className="input"
        placeholder="Min popularity (0-5)"
        type="number"
        min="0"
        max="5"
        step="0.1"
        value={draft.minPopularity}
        onChange={(e) =>
          setDraft((p) => ({ ...p, minPopularity: e.target.value }))
        }
      />

      <select
        className="select"
        value={draft.sort}
        onChange={(e) => setDraft((p) => ({ ...p, sort: e.target.value }))}
      >
        <option value="price">Sort by price</option>
        <option value="name">Sort by name</option>
        <option value="popularity">Sort by popularity</option>
        <option value="weight">Sort by weight</option>
      </select>

      <select
        className="select"
        value={draft.order}
        onChange={(e) => setDraft((p) => ({ ...p, order: e.target.value }))}
      >
        <option value="asc">Asc</option>
        <option value="desc">Desc</option>
      </select>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="button" onClick={onApply} disabled={disabled}>
          Apply
        </button>
        <button className="input" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
