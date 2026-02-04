import Fuse from 'fuse.js';
import { faker } from '@faker-js/faker';

const state = {
  products: [],
  idSeq: 1,
  fuse: null,
};

export const catalogStore = {
  insert(productIn) {
    const productId = state.idSeq++;
    const enriched = {
      ...productIn,
      productId,
      metadata: productIn.metadata || {},
      units_sold: productIn.units_sold ?? faker.number.int({ min: 0, max: 50000 }),
      return_rate: productIn.return_rate ?? faker.number.float({ min: 0, max: 0.25, precision: 0.0001 }),
      complaints: productIn.complaints ?? faker.number.int({ min: 0, max: 500 }),
      created_rank: productIn.created_rank ?? state.products.length,
      category: productIn.category ?? 'electronics',
      brand: productIn.brand ?? inferBrand(productIn.title),
      currency: productIn.currency || 'INR',
    };
    state.products.push(enriched);
    rebuildIndex();
    return enriched;
  },
  updateMetadata(productId, metadata) {
    const p = state.products.find((x) => x.productId === productId);
    if (!p) return null;
    p.metadata = { ...(p.metadata || {}), ...metadata };
    rebuildIndex();
    return p;
  },
  all() { return state.products.slice(); },
  count() { return state.products.length; },
  searchRaw(query, fuseOptions) {
    if (!state.fuse) rebuildIndex(fuseOptions);
    return state.fuse.search(query);
  },
};

function inferBrand(title) {
  const low = (title || '').toLowerCase();
  const brands = ['apple', 'samsung', 'xiaomi', 'redmi', 'oneplus', 'realme', 'vivo', 'oppo', 'nokia', 'motorola', 'boat', 'jbl', 'sony', 'dell', 'hp', 'lenovo'];
  return brands.find((b) => low.includes(b)) || 'generic';
}

function rebuildIndex(fuseOptions) {
  const options = {
    includeScore: true,
    shouldSort: false,
    threshold: 0.42,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: 'title', weight: 0.6 },
      { name: 'description', weight: 0.25 },
      { name: 'brand', weight: 0.1 },
      { name: 'category', weight: 0.05 },
      { name: 'metadata.model', weight: 0.2 },
      { name: 'metadata.storage', weight: 0.15 },
      { name: 'metadata.color', weight: 0.1 },
    ],
    ...fuseOptions,
  };
  state.fuse = new Fuse(state.products, options);
}

export async function initCatalog(n = 1500) {
  if (state.products.length > 0) return;
  const categories = ['phone', 'phone-accessory', 'laptop', 'headphones', 'smartwatch', 'tablet', 'speaker', 'charger', 'screen-guard', 'cover'];
  const colors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'purple', 'silver', 'gold', 'pink'];
  const storages = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const rams = ['4GB', '6GB', '8GB', '12GB', '16GB'];

  const genPhoneTitle = () => {
    const series = faker.helpers.arrayElement(['iPhone', 'Samsung Galaxy', 'OnePlus', 'Xiaomi Redmi', 'Realme', 'Vivo', 'Oppo', 'Moto', 'Nokia']);
    const model = faker.number.int({ min: 5, max: 24 });
    const suffix = faker.helpers.arrayElement(['', ' Pro', ' Plus', ' Ultra']);
    return `${series} ${model}${suffix}`.trim();
  };

  for (let i = 0; i < n; i++) {
    const category = faker.helpers.arrayElement(categories);
    const isPhone = category === 'phone';
    const title = isPhone ? genPhoneTitle() : faker.commerce.productName();
    const brand = inferBrand(title);
    const storage = faker.helpers.arrayElement(storages);
    const ram = faker.helpers.arrayElement(rams);
    const color = faker.helpers.arrayElement(colors);

    const mrp = faker.number.int({ min: 999, max: 199999 });
    const discount = faker.number.float({ min: 0.0, max: 0.5, precision: 0.001 });
    const price = Math.max(499, Math.round(mrp * (1 - discount)));

    const p = catalogStore.insert({
      title,
      description: faker.commerce.productDescription(),
      rating: faker.number.float({ min: 2.5, max: 5, precision: 0.1 }),
      stock: faker.number.int({ min: 0, max: 500 }),
      price,
      mrp,
      currency: 'INR',
      category,
      brand,
      metadata: {
        model: `${title}`,
        storage,
        ram,
        color,
        screensize: faker.number.float({ min: 5.0, max: 17.0, precision: 0.1 }) + ' inches',
        brightness: faker.number.int({ min: 300, max: 3000 }) + ' nits',
        display: faker.helpers.arrayElement(['AMOLED', 'OLED', 'LCD', 'IPS']),
      },
    });
    // overwrite created_rank to reflect insertion order
    p.created_rank = i;
  }
}
