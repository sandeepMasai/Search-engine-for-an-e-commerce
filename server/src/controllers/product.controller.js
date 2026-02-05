import { productService } from '../services/product.service.js';
import { searchAndRank } from '../services/search.service.js';

export const productController = {
  create: (req, res, next) => {
    try {
      const body = req.body || {};
      const required = ['title', 'description', 'rating', 'stock', 'price', 'mrp'];
      for (const k of required) {
        if (body[k] === undefined || body[k] === null) {
          return res.status(400).json({ error: `Missing field ${k}` });
        }
      }
      const product = productService.create(body);
      return res.status(201).json({ productId: product.productId });
    } catch (e) {
      return next(e);
    }
  },

  updateMetadata: (req, res, next) => {
    try {
      const { productId, Metadata } = req.body || {};
      if (!productId || typeof productId !== 'number') {
        return res.status(400).json({ error: 'Invalid productId' });
      }
      if (!Metadata || typeof Metadata !== 'object') {
        return res.status(400).json({ error: 'Invalid Metadata' });
      }
      const updated = productService.updateMetadata(productId, Metadata);
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      return res.json({ productId, Metadata: updated.metadata || {} });
    } catch (e) {
      return next(e);
    }
  },

  search: (req, res, next) => {
    try {
      const query = String(req.query.query || '').trim();
      if (!query) return res.status(400).json({ error: 'Missing query' });
      const products = productService.getAll();
      const { results } = searchAndRank(query, products);
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
      return next(e);
    }
  },
};
