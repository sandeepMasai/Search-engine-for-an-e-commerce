import React, { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost:4000/api/v1'

export default function App() {
  const [q, setQ] = useState('latest iphone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])

  async function search() {
    const query = q.trim()
    if (!query) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/search/product?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Search failed')
      setItems(data.data || [])
    } catch (e) {
      setError(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    search()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial', padding: 16, maxWidth: 1000, margin: '0 auto' }}>
      <h1>E-commerce Search</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Search products (e.g., 'Sastha wala iPhone', 'iPhone 50k rupees')"
          style={{ flex: 1, padding: 10, fontSize: 16 }}
        />
        <button onClick={search} disabled={loading} style={{ padding: '10px 16px', fontSize: 16 }}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>
      {error && <div style={{ color: 'crimson', marginBottom: 12 }}>Error: {error}</div>}
      <Results items={items} />
    </div>
  )
}

function Results({ items }) {
  if (!items?.length) return <div>No results</div>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
      {items.map((it) => (
        <div key={it.productId} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600 }}>{it.title}</div>
          <div style={{ color: '#6b7280', fontSize: 12, margin: '6px 0 8px' }}>{it.description}</div>
          <div style={{ fontSize: 14 }}>
            <b>Price:</b> ₹{it.Sellingprice?.toLocaleString?.('en-IN') || it.Sellingprice}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            <span>MRP: ₹{it.mrp?.toLocaleString?.('en-IN') || it.mrp}</span>
          </div>
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 12 }}>
            {Object.entries(it.Metadata || {})
              .slice(0, 6)
              .map(([k, v]) => (
                <span key={k} style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 999 }}>{k}: {String(v)}</span>
              ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 12 }}>
            <b>Stock:</b> {it.stock > 0 ? `${it.stock} available` : 'Out of stock'}
          </div>
        </div>
      ))}
    </div>
  )
}
