import Stripe from "stripe";
import { listStripeStoreProducts } from "../lib/stripe-store.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({
      configured: false,
      products: [],
      error: "Stripe is not connected yet."
    });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const products = await listStripeStoreProducts(stripe);

    return res.status(200).json({
      configured: true,
      products
    });
  } catch (error) {
    console.error("Stripe catalog error:", error);
    return res.status(500).json({
      configured: true,
      products: [],
      error: "Could not load the Stripe catalog."
    });
  }
}
