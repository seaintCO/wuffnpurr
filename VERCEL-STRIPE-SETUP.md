# Woof N’ Purr — Vercel and Stripe launch setup

## Vercel production variables

Add these under Project Settings → Environment Variables and select Production:

```text
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STORE_SLUG=woofnpurr
PUBLIC_SITE_URL=https://www.woofnpurr.shop
STRIPE_AUTOMATIC_TAX=false
FREE_SHIPPING_THRESHOLD_CENTS=4900
STANDARD_SHIPPING_AMOUNT_CENTS=699
```

Redeploy after saving the variables. Never place `STRIPE_SECRET_KEY` or
`STRIPE_WEBHOOK_SECRET` in browser code or commit their real values to GitHub.
Confirm that `support@woofnpurr.shop` can receive mail, and review the included
shipping, returns, privacy, and terms pages for the business before launch.

## Stripe webhook

In Stripe Developers → Webhooks, add this endpoint:

```text
https://www.woofnpurr.shop/api/stripe-webhook
```

Subscribe it to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Copy the endpoint signing secret (`whsec_...`) to the Vercel
`STRIPE_WEBHOOK_SECRET` variable and redeploy.

## Optional paid-order email

Stripe records paid orders and shipping information without these variables.
To also email the store when an order is paid, verify `woofnpurr.shop` in
Resend and add:

```text
RESEND_API_KEY=re_...
ORDER_NOTIFICATION_EMAIL=your-real-order-email@example.com
ORDER_FROM_EMAIL=Woof N’ Purr Orders <orders@woofnpurr.shop>
```

## Tax

Leave `STRIPE_AUTOMATIC_TAX=false` until Stripe Tax is activated and the
business registrations and product tax codes are configured. Then change it
to `true` and redeploy.

## Adding products

Create an active Stripe product with an active one-time USD price, description,
and image. It appears on the storefront automatically. Recommended metadata:

```text
store=woofnpurr
category=Home
featured=true
hero=false
sort=1
```

Only one product should use `hero=true`. Use `hidden=true` to keep an active
Stripe product off the storefront. Archive the price or product to stop sales.

## Final test

Use Stripe test keys first and complete an order with card `4242 4242 4242
4242`, any future expiration date, and any CVC. Confirm the product, shipping,
success verification, payment record, and webhook. Then replace the test
secret with the live secret and complete one small real purchase before
promoting the store.
