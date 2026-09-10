const MAX_PAGES = 5;
const PAGE_SIZE = 100;

function truthy(value) {
  return String(value || "").toLowerCase() === "true";
}

function normalizeCategory(product) {
  return String(product?.metadata?.category || "Collection").trim() || "Collection";
}

function normalizeSort(product) {
  const value = Number.parseInt(product?.metadata?.sort || "9999", 10);
  return Number.isFinite(value) ? value : 9999;
}

function shouldShowProduct(product) {
  if (!product || product.deleted || product.active === false) return false;

  const metadata = product.metadata || {};
  if (truthy(metadata.hidden)) return false;

  // Safe for shared Stripe accounts:
  // - products with no `store` metadata are included
  // - products explicitly tagged to another store are excluded
  const store = String(metadata.store || "").trim().toLowerCase();
  if (store && store !== "woofnpurr" && store !== "woof-n-purr") return false;

  return true;
}

export async function listStripeStoreProducts(stripe) {
  const allPrices = [];
  let startingAfter;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const params = {
      active: true,
      limit: PAGE_SIZE,
      expand: ["data.product"]
    };
    if (startingAfter) params.starting_after = startingAfter;

    const response = await stripe.prices.list(params);
    allPrices.push(...response.data);

    if (!response.has_more || response.data.length === 0) break;
    startingAfter = response.data[response.data.length - 1].id;
  }

  const chosenByProduct = new Map();

  for (const price of allPrices) {
    if (
      !price ||
      !price.active ||
      price.type !== "one_time" ||
      price.currency !== "usd" ||
      price.unit_amount == null
    ) {
      continue;
    }

    const product = price.product;
    if (!product || typeof product === "string" || !shouldShowProduct(product)) continue;

    const current = chosenByProduct.get(product.id);
    const isDefault = product.default_price === price.id;
    const currentIsDefault = current?.product?.default_price === current?.price?.id;

    if (!current || (isDefault && !currentIsDefault) || (!currentIsDefault && price.created > current.price.created)) {
      chosenByProduct.set(product.id, { product, price });
    }
  }

  const products = [...chosenByProduct.values()].map(({ product, price }) => ({
    productId: product.id,
    priceId: price.id,
    name: product.name || "Untitled product",
    description: product.description || "",
    price: price.unit_amount / 100,
    unitAmount: price.unit_amount,
    currency: price.currency,
    image: Array.isArray(product.images) && product.images.length ? product.images[0] : null,
    category: normalizeCategory(product),
    featured: truthy(product.metadata?.featured),
    hero: truthy(product.metadata?.hero),
    sort: normalizeSort(product),
    updated: product.updated || product.created || 0
  }));

  products.sort((a, b) => {
    if (a.hero !== b.hero) return a.hero ? -1 : 1;
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.sort !== b.sort) return a.sort - b.sort;
    return b.updated - a.updated;
  });

  return products;
}

export async function validateCheckoutItems(stripe, items) {
  if (!Array.isArray(items)) return [];

  const normalized = items
    .slice(0, 25)
    .map(item => ({
      priceId: String(item?.priceId || "").trim(),
      quantity: Math.max(1, Math.min(10, Number.parseInt(item?.quantity, 10) || 1))
    }))
    .filter(item => /^price_[A-Za-z0-9]+$/.test(item.priceId));

  const checked = await Promise.all(
    normalized.map(async item => {
      try {
        const price = await stripe.prices.retrieve(item.priceId, { expand: ["product"] });
        const product = price.product;

        const valid =
          price.active &&
          price.type === "one_time" &&
          price.currency === "usd" &&
          price.unit_amount != null &&
          product &&
          typeof product !== "string" &&
          shouldShowProduct(product);

        if (!valid) return null;

        return { price: price.id, quantity: item.quantity };
      } catch {
        return null;
      }
    })
  );

  return checked.filter(Boolean);
}
