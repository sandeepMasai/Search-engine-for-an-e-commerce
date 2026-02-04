import express from 'express';
import cors from 'cors';
import { initCatalog, catalogStore } from './store/catalog.js';
import { router as apiRouter } from './store/routes.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1', apiRouter);

const PORT = process.env.PORT || 4000;

async function start() {
  await initCatalog(1500);
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Catalog size: ${catalogStore.count()} products`);
  });
}

start().catch((e) => {
  console.error('Failed to start server', e);
  process.exit(1);
});
