import Stripe from "stripe";

const LAUNCH_AT = new Date("2026-09-10T00:00:00-05:00").getTime();

const catalog = {
  pawbridge: { name: "PawBridge Pet Stairs", price: 3999 },
  haven: { name: "Haven Pet Bed", price: 7999 },
  companion: { name: "Companion Collar", price: 2499 },
  waypoint: { name: "Waypoint Travel Kit", price: 4999 },
  shedaway: { name: "ShedAway Vacuum", price: 4499 },
  roadpaws: { name: "RoadPaws", price: 5499 },
  nailgrinder: { name: "Pet Nail Grinder", price: 1999 },
  freshnest: { name: "FreshNest", price: 24999 },
  gentlegroom: { name: "GentleGroom", price: 2999 }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  if (Date.now() < LAUNCH_AT) {
    return res.status(423).json({ error: "The collection launches September 10." });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "Stripe is not connected yet." });
  }

  try {
    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
    const lineItems = [];
    for (const item of rawItems) {
      const product = catalog[item?.id];
      if (!product) continue;
      const quantity = Math.max(1, Math.min(10, Number.parseInt(item.quantity, 10) || 1));
      lineItems.push({
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: product.price,
          product_data: { name: product.name }
        }
      });
    }
    if (!lineItems.length) return res.status(400).json({ error: "Your bag is empty." });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const proto = req.headers["x-forwarded-proto"] || "https";
    const base = (process.env.PUBLIC_SITE_URL || `${proto}://${req.headers.host}`).replace(/\/$/, "");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${base}/?checkout=success`,
      cancel_url: `${base}/?checkout=cancelled`,
      shipping_address_collection: { allowed_countries: ["US"] },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true
    });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Secure checkout could not be started." });
  }
}
