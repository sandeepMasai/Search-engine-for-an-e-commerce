const HINGLISH_SYNONYMS = new Map([
  ['sasta', 'cheap'],
  ['sastha', 'cheap'],
  ['mehenga', 'expensive'],
  ['ifone', 'iphone'],
  ['fone', 'phone'],
  ['mobile', 'phone'],
  ['ke', ''],
]);

function normalizeQuery(q) {
  const tokens = String(q || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => HINGLISH_SYNONYMS.get(t) ?? t)
    .filter(Boolean);
  return tokens.join(' ').trim();
}

function detectIntents(tokens) {
  const intents = {
    cheap: false,
    premium: false,
    latest: false,
    storageMore: false,
    color: null,
    priceCap: null,
    modelHint: null,
  };

  const cheapWords = new Set(['cheap', 'budget', 'low', 'affordable', 'value']);
  const premiumWords = new Set(['pro', 'ultra', 'max', 'premium', 'flagship']);
  const latestWords = new Set(['latest', 'new', 'newest', '2025', '2026']);

  for (const t of tokens) {
    if (cheapWords.has(t)) intents.cheap = true;
    if (premiumWords.has(t)) intents.premium = true;
    if (latestWords.has(t)) intents.latest = true;
    if (t.endsWith('gb') || t.endsWith('tb')) intents.storageMore = true;

    if (/^\d{2,3}k$/.test(t)) {
      const k = parseInt(t.replace('k', ''), 10);
      intents.priceCap = k * 1000;
    }
    if (/^\d{5,6}$/.test(t)) intents.priceCap = parseInt(t, 10);

    if (['red','blue','black','white','green','gold','silver','purple','pink'].includes(t)) intents.color = t;

    if (/iphone|samsung|oneplus|redmi|realme|vivo|oppo|nokia|moto|motorola/.test(t)) intents.modelHint = t;
  }

  return intents;
}

function textRelevanceScore(p, tokens) {
  const hay = `${p.title} ${p.description} ${p.brand} ${p.category} ${Object.values(p.metadata||{}).join(' ')}`.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (hay.includes(t)) score += 1.0;
  }
  return Math.min(1, score / Math.max(1, tokens.length));
}

function zscore(value, min, max) {
  if (min === max) return 0.5;
  return (value - min) / (max - min);
}

export function searchAndRank(rawQuery, products) {
  const normalized = normalizeQuery(rawQuery);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const intents = detectIntents(tokens);

  // Precompute bounds
  const prices = products.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const ratings = products.map((p) => p.rating);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);
  const solds = products.map((p) => p.units_sold || 0);
  const minSold = Math.min(...solds);
  const maxSold = Math.max(...solds);

  const scored = products.map((p) => {
    const textScore = textRelevanceScore(p, tokens);

    const ratingScore = zscore(p.rating, minRating, maxRating);
    const popularityScore = zscore(p.units_sold || 0, minSold, maxSold);

    // Price affinity
    let priceScore = 1 - zscore(p.price, minPrice, maxPrice); // cheaper is better by default a bit
    if (intents.premium) priceScore = zscore(p.price, minPrice, maxPrice); // premium flips it

    // If user specified price cap, penalize those above cap
    if (intents.priceCap) {
      if (p.price <= intents.priceCap) {
        priceScore += 0.15; // small boost
      } else {
        priceScore -= 0.25; // penalty if exceeding cap
      }
    }

    // Availability
    const stockScore = p.stock > 0 ? 1.0 : 0.0;

    // Recency proxy (lower created_rank is older). Favor newer if asking latest.
    const recency = 1 - Math.min(1, (p.created_rank || 0) / Math.max(1, products.length));
    const recencyScore = intents.latest ? recency : 0.2 * recency;

    // Attribute match boosts
    let attrBoost = 0;
    if (intents.storageMore) {
      const st = String((p.metadata?.storage || '')).toUpperCase();
      if (/(256GB|512GB|1TB)/.test(st)) attrBoost += 0.1;
    }
    if (intents.color && String(p.metadata?.color || '').toLowerCase() === intents.color) attrBoost += 0.05;
    if (intents.modelHint && String(p.title).toLowerCase().includes(intents.modelHint)) attrBoost += 0.05;

    // Out-of-stock penalty
    const oosPenalty = p.stock === 0 ? 0.5 : 0;

    const finalScore =
      0.45 * textScore +
      0.2 * ratingScore +
      0.15 * popularityScore +
      0.1 * priceScore +
      0.07 * recencyScore +
      0.03 * attrBoost -
      oosPenalty;

    return { p, score: finalScore };
  });

  const filtered = scored
    .filter(({ p, score }) => score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);

  return { query: rawQuery, normalized, intents, results: filtered.map((x) => x.p) };
}
