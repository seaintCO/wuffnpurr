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

## Required Vercel Environment Variables

STRIPE_SECRET_KEY=sk_live_...
PUBLIC_SITE_URL=https://www.woofnpurr.shop
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STORE_SLUG=woofnpurr
STRIPE_AUTOMATIC_TAX=false
FREE_SHIPPING_THRESHOLD_CENTS=4900
STANDARD_SHIPPING_AMOUNT_CENTS=699

Optional paid-order email notification:

RESEND_API_KEY=re_...
ORDER_NOTIFICATION_EMAIL=orders@example.com
ORDER_FROM_EMAIL=Woof N’ Purr Orders <orders@woofnpurr.shop>

Create a Stripe webhook endpoint at:

https://www.woofnpurr.shop/api/stripe-webhook

Listen for `checkout.session.completed` and
`checkout.session.async_payment_succeeded`. Copy its signing secret into
`STRIPE_WEBHOOK_SECRET`.

Activate Stripe Tax before setting `STRIPE_AUTOMATIC_TAX=true`.

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
