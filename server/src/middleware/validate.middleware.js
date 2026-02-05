export function validate(schemaName) {
  return (req, res, next) => {
    try {
      // Placeholder validation. Extend with Joi/Zod as needed.
      if (schemaName === 'createProduct') {
        const b = req.body || {};
        const required = ['title', 'description', 'rating', 'stock', 'price', 'mrp'];
        for (const k of required) {
          if (b[k] === undefined || b[k] === null) {
            return res.status(400).json({ error: `Missing field ${k}` });
          }
        }
        if (typeof b.rating !== 'number' || b.rating < 0 || b.rating > 5) {
          return res.status(400).json({ error: 'rating must be a number between 0 and 5' });
        }
        if (typeof b.stock !== 'number' || b.stock < 0) {
          return res.status(400).json({ error: 'stock must be a non-negative number' });
        }
      }
      if (schemaName === 'updateMetadata') {
        const { productId, Metadata } = req.body || {};
        if (!productId || typeof productId !== 'number') {
          return res.status(400).json({ error: 'Invalid productId' });
        }
        if (!Metadata || typeof Metadata !== 'object') {
          return res.status(400).json({ error: 'Invalid Metadata' });
        }
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}
