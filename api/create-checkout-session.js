import Stripe from 'stripe';
import { productById } from '../lib/products.js';
import { ensureStripeCatalog } from '../lib/stripeCatalog.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Stripe is not connected yet. Add STRIPE_SECRET_KEY in Vercel.' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
    const siteUrl = (process.env.PUBLIC_SITE_URL || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`).replace(/\/$/, '');
    const { priceMap } = await ensureStripeCatalog(stripe, { publicSiteUrl: siteUrl });

    const lineItems = [];
    for (const item of rawItems) {
      const product = productById[item?.id];
      const price = priceMap[item?.id];
      if (!product || !price) continue;
      const quantity = Math.max(1, Math.min(10, Number.parseInt(item.quantity, 10) || 1));
      lineItems.push({ price, quantity });
    }

    if (!lineItems.length) {
      return res.status(400).json({ error: 'Your bag is empty.' });
    }

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

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: 'Secure checkout could not be started. Check your Stripe key and try again.' });
  }
}
