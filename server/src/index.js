import app from './app.js';
import { initCatalog, productRepo } from './repositories/product.repo.js';

const PORT = process.env.PORT || 4000;

async function start() {
  await initCatalog(1500);
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Catalog size: ${productRepo.count()} products`);
  });
}

start().catch((e) => {
  console.error('Failed to start server', e);
  process.exit(1);
});
