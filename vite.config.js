import { defineConfig, loadEnv } from 'vite';
import Stripe from 'stripe';
import { productById } from './lib/products.js';
import { ensureStripeCatalog } from './lib/stripeCatalog.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    publicDir: 'public',
    build: { outDir: 'dist', emptyOutDir: true },
    plugins: [{
      name: 'local-stripe-checkout',
      configureServer(server) {
        server.middlewares.use('/api/create-checkout-session', (req, res, next) => {
          if (req.method !== 'POST') return next();
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            if (!env.STRIPE_SECRET_KEY) {
              res.statusCode = 503;
              res.end(JSON.stringify({ error: 'Stripe is not connected yet. Add STRIPE_SECRET_KEY to .env.local.' }));
              return;
            }
            try {
              const parsed = JSON.parse(body || '{}');
              const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
              const stripe = new Stripe(env.STRIPE_SECRET_KEY);
              const { priceMap } = await ensureStripeCatalog(stripe, { publicSiteUrl: env.PUBLIC_SITE_URL || '' });
              const lineItems = [];
              for (const item of rawItems) {
                const product = productById[item?.id];
                const price = priceMap[item?.id];
                if (!product || !price) continue;
                const quantity = Math.max(1, Math.min(10, Number.parseInt(item.quantity, 10) || 1));
                lineItems.push({ price, quantity });
              }
              if (!lineItems.length) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Your bag is empty.' }));
                return;
              }
              const siteUrl = 'http://localhost:5173';
              const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                line_items: lineItems,
                success_url: `${siteUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${siteUrl}/?checkout=cancelled`,
                customer_creation: 'always',
                billing_address_collection: 'auto',
                shipping_address_collection: { allowed_countries: ['US'] },
                phone_number_collection: { enabled: true },
                allow_promotion_codes: true,
                payment_intent_data: { metadata: { store: 'woof-n-purr' } },
                metadata: { store: 'woof-n-purr' }
              });
              res.statusCode = 200;
              res.end(JSON.stringify({ url: session.url }));
            } catch (error) {
              console.error(error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Secure checkout could not be started. Check your Stripe key and try again.' }));
            }
          });
        });
      }
    }]
  };
});
