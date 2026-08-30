import Stripe from "stripe";

const catalog = {
  pawbridge: { name: "PawBridge Pet Stairs", price: 3999, available: true },
  haven: { name: "Haven Pet Bed", price: 7999, available: true },
  companion: { name: "Companion Collar", price: 2499, available: true },
  waypoint: { name: "Waypoint Travel Kit", price: 4999, available: true },
  shedaway: { name: "ShedAway Vacuum", price: 4499, available: true },
  roadpaws: { name: "RoadPaws", price: 5499, available: false },
  nailgrinder: { name: "Pet Nail Grinder", price: 1999, available: false },
  freshnest: { name: "FreshNest", price: 24999, available: true },
  gentlegroom: { name: "GentleGroom", price: 2999, available: false }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "Stripe is not connected yet." });
  }
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
    const lineItems = [];
    for (const item of rawItems) {
      const product = catalog[item?.id];
      if (!product || !product.available) continue;
      const quantity = Math.max(1, Math.min(10, Number.parseInt(item?.quantity, 10) || 1));
      lineItems.push({
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: product.price,
          product_data: { name: product.name }
        }
      });
    }
    if (!lineItems.length) {
      return res.status(400).json({ error: "Your bag does not contain an available product." });
    }
    const forwardedProto = req.headers["x-forwarded-proto"];
    const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || "https";
    const host = req.headers.host;
    const siteUrl = (process.env.PUBLIC_SITE_URL || `${proto}://${host}`).replace(/\/$/, "");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${siteUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?checkout=cancelled`,
      billing_address_collection: "auto",
      shipping_address_collection: { allowed_countries: ["US"] },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      metadata: { store: "woof-n-purr" }
    });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ error: "Secure checkout could not be started. Please try again." });
  }
}
