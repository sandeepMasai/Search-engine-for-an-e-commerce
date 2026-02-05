import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "https://search-engine-backend-ajyn.onrender.com/api/v1";

export default function App() {
  const [q, setQ] = useState("latest iphone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  async function search() {
    const query = q.trim();
    if (!query) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/search/product?query=${encodeURIComponent(query)}`
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Search failed");

      setItems(data.data || []);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search();
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 16, maxWidth: 1000, margin: "0 auto" }}>
      <h1>E-commerce Search</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search products..."
          style={{ flex: 1, padding: 10, fontSize: 16 }}
        />

        <button onClick={search} disabled={loading} style={{ padding: "10px 16px" }}>
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {error && <div style={{ color: "crimson" }}>Error: {error}</div>}

      <Results items={items} />
    </div>
  );
}

function Results({ items }) {
  if (!items?.length) return <div>No results</div>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 12,
      }}
    >
      {items.map((it) => (
        <div
          key={it.productId}
          style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}
        >
          <div style={{ fontWeight: 600 }}>{it.title}</div>

          <div style={{ color: "#6b7280", fontSize: 12 }}>
            {it.description}
          </div>

          <div>
            <b>Price:</b> ₹
            {Number(it.Sellingprice || 0).toLocaleString("en-IN")}
          </div>

          <div style={{ fontSize: 12 }}>
            MRP: ₹{Number(it.mrp || 0).toLocaleString("en-IN")}
          </div>

          <div style={{ marginTop: 8, fontSize: 12 }}>
            <b>Stock:</b>{" "}
            {it.stock > 0 ? `${it.stock} available` : "Out of stock"}
          </div>
        </div>
      ))}
    </div>
  );
}
