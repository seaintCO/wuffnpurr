import test from "node:test";
import assert from "node:assert/strict";
import { listStripeStoreProducts, prepareCheckoutItems } from "../lib/stripe-store.js";

const product = {
  id: "prod_123",
  active: true,
  name: "PawBridge",
  description: "Pet stairs",
  images: ["https://example.com/paw.jpg"],
  metadata: { store: "woofnpurr", category: "Home", featured: "true" },
  default_price: "price_123",
  updated: 10
};

const price = {
  id: "price_123",
  active: true,
  type: "one_time",
  currency: "usd",
  unit_amount: 3999,
  product,
  created: 10
};

test("lists active products assigned to the store", async () => {
  const stripe = { prices: { list: async () => ({ data: [price], has_more: false }) } };
  const result = await listStripeStoreProducts(stripe, "woofnpurr");
  assert.equal(result.length, 1);
  assert.equal(result[0].price, 39.99);
});

test("validates checkout and calculates the subtotal server-side", async () => {
  const stripe = { prices: { retrieve: async () => price } };
  const result = await prepareCheckoutItems(stripe, [{ priceId: "price_123", quantity: 2 }]);
  assert.deepEqual(result.lineItems, [{ price: "price_123", quantity: 2 }]);
  assert.equal(result.subtotal, 7998);
});

test("rejects prices assigned to another store", async () => {
  const other = { ...price, product: { ...product, metadata: { store: "other-store" } } };
  const stripe = { prices: { retrieve: async () => other } };
  const result = await prepareCheckoutItems(stripe, [{ priceId: "price_123", quantity: 1 }]);
  assert.equal(result.lineItems.length, 0);
});

test("handles a malformed cart safely", async () => {
  const result = await prepareCheckoutItems({ prices: {} }, null);
  assert.deepEqual(result, { lineItems: [], subtotal: 0 });
});
