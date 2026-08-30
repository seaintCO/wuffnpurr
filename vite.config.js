import { defineConfig, loadEnv } from "vite";
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [{
      name: "local-stripe-checkout",
      configureServer(server) {
        server.middlewares.use("/api/create-checkout-session", (req, res, next) => {
          if (req.method !== "POST") return next();
          let body = "";
          req.on("data", chunk => body += chunk);
          req.on("end", async () => {
            res.setHeader("Content-Type", "application/json");
            if (!env.STRIPE_SECRET_KEY) {
              res.statusCode = 503;
              res.end(JSON.stringify({ error: "Stripe is not connected yet." }));
              return;
            }
            try {
              const parsed = JSON.parse(body || "{}");
              const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
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
                res.statusCode = 400;
                res.end(JSON.stringify({ error: "Your bag does not contain an available product." }));
                return;
              }
              const stripe = new Stripe(env.STRIPE_SECRET_KEY);
              const siteUrl = "http://localhost:5173";
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
              res.statusCode = 200;
              res.end(JSON.stringify({ url: session.url }));
            } catch (error) {
              console.error(error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: "Secure checkout could not be started. Please try again." }));
            }
          });
        });
      }
    }]
  };
});
