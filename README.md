# Woof N’ Purr — LIVE Stripe Build

This is the launch build. All nine products are available now.

## Stripe is automatic

You do NOT have to manually create nine Price IDs and wire them into the code.

1. Add your Stripe secret key to `.env.local`.
2. Run `npm run stripe:sync`.
3. The script creates/syncs all nine products and prices in the Stripe mode represented by that key.
4. The website checkout uses those Stripe products and server-side prices.

## Local test

```powershell
Copy-Item ".env.example" ".env.local"
notepad ".env.local"
npm install
npm run stripe:sync
npm run dev
```

Open http://localhost:5173

## Vercel

Add only this required environment variable:

`STRIPE_SECRET_KEY=sk_live_...`

Then redeploy. The checkout endpoint will also auto-create/sync missing Stripe products on the first checkout, so the catalog cannot silently break if a product is missing.

## Checkout collects

- Payment
- Customer record
- Billing details when needed
- US shipping address
- Phone number
- Stripe promotion codes

Never commit your Stripe secret key to GitHub.
