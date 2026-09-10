# Woof N’ Purr V10 — Dynamic Stripe Catalog

Stripe is the live product database for this build.

## Vercel setup

Add ONE required Environment Variable:

STRIPE_SECRET_KEY = sk_live_...

Then redeploy.

## How products appear

The storefront automatically displays active Stripe products that have:
- an ACTIVE one-time price
- currency USD
- an active Stripe Product

The site uses:
- Stripe Product name → product title
- Stripe Product description → description
- Stripe Product image → store photography
- Stripe Price → live storefront price
- Stripe Product metadata `category` → category navigation

The storefront checks Stripe on every page load and refreshes the catalog every 60 seconds.

## Useful Stripe metadata

Optional metadata on each Stripe Product:

category = Home
featured = true
hero = true
sort = 1
store = woofnpurr
hidden = true

`hero=true` makes that product the homepage hero.
If no hero is set, a product named PawBridge is preferred automatically.

### Shared Stripe account safety

Products with no `store` metadata are included.
Products explicitly tagged to a DIFFERENT `store` are excluded.

If you share one Stripe account across businesses, tag Woof N’ Purr products:
store = woofnpurr

## Images

Upload your product image directly to the Stripe Product.
If a Stripe product has no image, the store displays a clean Woof N’ Purr placeholder instead of a fake product photo.

## Checkout

The browser sends only Stripe Price IDs and quantity.
The Vercel function re-fetches and validates the Price/Product directly from Stripe before creating Checkout.

Checkout collects:
- payment
- billing information as needed
- US shipping address
- phone number
- Stripe promotion codes

## Local preview

npm install
npm run dev

Local Vite preview uses the included Woof N’ Purr demo catalog because Vercel serverless API routes are not running locally.

For the live Stripe catalog, deploy to Vercel with STRIPE_SECRET_KEY.
