# Search-engine-for-an-e-commerce

# E-commerce Product Search Engine (Electronics) — Full Summary

This project implements a **high-performance product search engine** for a large electronics catalog using a **Node.js + Express backend** and a **React + Vite frontend**.  
It is designed specifically to handle **real-world Indian e-commerce search behavior**, including **typos, Hinglish queries, price caps, and attribute-based intent**.

The system runs entirely **in memory** for fast response times and is suitable as a **search prototype, interview assignment, or system design demo**.

---

## What the System Does

- Generates **1500+ synthetic electronics products** at server startup
- Provides APIs to:
  - Create products
  - Update product metadata
  - Search products with intelligent ranking
- Supports **natural language queries** like:
  - “Sastha wala iPhone”
  - “Ifone 16”
  - “iPhone 50k rupees”
  - “iPhone red color more storage”
- Returns **ranked results in under a second**

---

## Key Search Capabilities

### 1. Text & Intent Understanding
- Matches across title, description, brand, category, and metadata
- Normalizes **typos and Hinglish terms**
  - `sastha / sasta → cheap`
  - `ifone → iphone`
  - `mobile → phone`

### 2. Ranking Signals
Multiple signals are combined into a final relevance score:
- Text relevance
- Rating & popularity proxy
- Price affinity (cheap vs premium intent)
- Price caps (e.g., `50k`)
- Stock availability penalty
- Attribute hints (color, storage, model)
- Recency proxy

### 3. Price Awareness
- Understands numeric caps like `50k`, `under 30000`
- Prefers cheaper items unless premium intent is detected

---

## Tech Stack

### Backend
- Node.js (18+)
- Express
- In-memory data store
- `@faker-js/faker` for synthetic data
- Custom ranking & normalization logic

### Frontend
- React
- Vite
- Simple search UI consuming backend APIs

---

## Project Structure

server/
└─ src/
├─ app.js
├─ index.js
├─ routes/
├─ controllers/
├─ services/
├─ repositories/
├─ search/
└─ middleware/

client/
└─ src/
├─ App.jsx
├─ main.jsx
└─ vite.config.js


---

## How to Run Locally

### Backend
```bash
cd server
npm install
npm run dev

curl http://localhost:4000/health


cd client
npm install
npm run dev
http://localhost:4000/api/v1

Create Product

POST /product

Update Metadata

PUT /product/meta-data

Search

GET /search/product?query=...

Returns a ranked list of products matching user intent.



Performance Characteristics

In-memory search → sub-second latency

No external database dependency

Scales well for demo and prototype use cases

Design Goals

Mimic real e-commerce search behavior

Handle noisy, human queries (typos, Hinglish)

Keep architecture simple, readable, and extensible

Avoid heavy search engines (Elastic) for clarity

Limitations

Data resets on server restart

No persistence layer

No authentication

Designed for prototype/demo scale

Future Enhancements

Replace in-memory store with MongoDB / Postgres / Elastic

Add semantic or vector search

Introduce filters and facets

Add validation and logging

Write unit and integration tests