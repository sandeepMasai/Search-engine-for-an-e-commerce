import express from 'express';
import { catalogStore } from './catalog.js';
import { searchAndRank } from '../search/ranker.js';

export const router = express.Router();

router.post('/product', (req, res) => {
  try {
    const body = req.body || {};
    const required = ['title', 'description', 'rating', 'stock', 'price', 'mrp'];
    for (const k of required) {
      if (body[k] === undefined || body[k] === null) {
        return res.status(400).json({ error: `Missing field ${k}` });
      }
    }
    const product = catalogStore.insert(body);
    return res.status(201).json({ productId: product.productId });
  } catch (e) {
    return res.status(500).json({ error: 'Internal error', details: String(e) });
  }
});

router.put('/product/meta-data', (req, res) => {
  try {
    const { productId, Metadata } = req.body || {};
    if (!productId || typeof productId !== 'number') {
      return res.status(400).json({ error: 'Invalid productId' });
    }
    if (!Metadata || typeof Metadata !== 'object') {
      return res.status(400).json({ error: 'Invalid Metadata' });
    }
    const updated = catalogStore.updateMetadata(productId, Metadata);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    return res.json({ productId, Metadata: updated.metadata || {} });
  } catch (e) {
    return res.status(500).json({ error: 'Internal error', details: String(e) });
  }
});

router.get('/search/product', (req, res) => {
  try {
    const query = String(req.query.query || '').trim();
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const { results } = searchAndRank(query, catalogStore.all());
    const data = results.map((p) => ({
      productId: p.productId,
      title: p.title,
      description: p.description,
      mrp: p.mrp,
      Sellingprice: p.price,
      Metadata: p.metadata || {},
      stock: p.stock,
    }));
    return res.json({ data });
  } catch (e) {
    return res.status(500).json({ error: 'Internal error', details: String(e) });
  }
});
