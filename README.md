# Woof N’ Purr V11 — HDR + Dynamic Stripe

This is the production-ready Woof N’ Purr storefront.

Included:
- sharp HDR PawBridge hero image with dog
- all existing product photography
- dynamic Stripe product catalog
- Stripe-hosted checkout
- search
- live category navigation
- sorting
- product quick-view
- working shopping bag
- quantity controls
- mobile layout
- Vercel deployment config
- GitHub-ready structure

## Required Vercel Environment Variable

STRIPE_SECRET_KEY=sk_live_...

Optional:
PUBLIC_SITE_URL=https://www.woofnpurr.shop

## Stripe product rules

Products automatically show when they are:
- Active in Stripe
- using an active one-time USD price

Recommended Stripe metadata:

store=woofnpurr
category=Home
featured=true
hero=true
sort=1

Use hero=true on PawBridge if you want Stripe to control the homepage hero.

## Local preview

npm install
npm run dev

Local preview uses the included fallback catalog.
The live Vercel deployment loads products directly from Stripe.
