import { products } from './products.js';

function publicImageUrl(baseUrl, image) {
  if (!baseUrl) return null;
  const clean = baseUrl.replace(/\/$/, '');
  if (!/^https:\/\//i.test(clean)) return null;
  return `${clean}/assets/${image}`;
}

async function getDefaultPrice(stripe, product) {
  if (!product?.default_price) return null;
  if (typeof product.default_price === 'object') return product.default_price;
  return stripe.prices.retrieve(product.default_price);
}

export async function ensureStripeCatalog(stripe, { publicSiteUrl = '' } = {}) {
  const listed = await stripe.products.list({
    active: true,
    limit: 100,
    expand: ['data.default_price']
  });

  const bySku = new Map();
  for (const product of listed.data) {
    const sku = product.metadata?.woof_sku;
    if (sku) bySku.set(sku, product);
  }

  const priceMap = {};
  const report = [];

  for (const local of products) {
    let stripeProduct = bySku.get(local.id);
    const imageUrl = publicImageUrl(publicSiteUrl, local.image);

    if (!stripeProduct) {
      stripeProduct = await stripe.products.create({
        name: local.name,
        description: local.description,
        active: true,
        metadata: { woof_sku: local.id },
        ...(imageUrl ? { images: [imageUrl] } : {}),
        default_price_data: {
          currency: 'usd',
          unit_amount: local.priceCents
        }
      });
      report.push(`${local.name}: created`);
    } else {
      const updates = {};
      if (stripeProduct.name !== local.name) updates.name = local.name;
      if ((stripeProduct.description || '') !== local.description) updates.description = local.description;
      if (stripeProduct.metadata?.woof_sku !== local.id) updates.metadata = { ...stripeProduct.metadata, woof_sku: local.id };
      if (imageUrl && stripeProduct.images?.[0] !== imageUrl) updates.images = [imageUrl];
      if (Object.keys(updates).length) {
        stripeProduct = await stripe.products.update(stripeProduct.id, updates);
      }
    }

    let defaultPrice = await getDefaultPrice(stripe, stripeProduct);
    const priceMatches = defaultPrice &&
      defaultPrice.active &&
      defaultPrice.currency === 'usd' &&
      defaultPrice.unit_amount === local.priceCents;

    if (!priceMatches) {
      const previous = defaultPrice;
      const newPrice = await stripe.prices.create({
        product: stripeProduct.id,
        currency: 'usd',
        unit_amount: local.priceCents,
        metadata: { woof_sku: local.id }
      });
      await stripe.products.update(stripeProduct.id, { default_price: newPrice.id });
      if (previous?.id && previous.active) {
        try { await stripe.prices.update(previous.id, { active: false }); } catch {}
      }
      defaultPrice = newPrice;
      report.push(`${local.name}: price synced`);
    } else if (!report.some(line => line.startsWith(`${local.name}:`))) {
      report.push(`${local.name}: ready`);
    }

    priceMap[local.id] = defaultPrice.id;
  }

  return { priceMap, report };
}
