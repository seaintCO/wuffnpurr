import Stripe from "stripe";
import { prepareCheckoutItems } from "../lib/stripe-store.js";

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function enabled(value) {
  return String(value || "").toLowerCase() === "true";
}

function safeSiteUrl(req) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || "https";
  const configured = process.env.PUBLIC_SITE_URL || `${proto}://${req.headers.host}`;
  const url = new URL(configured);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("PUBLIC_SITE_URL must use HTTPS.");
  }
  return url.origin;
}

function shippingOption(subtotal) {
  const freeThreshold = positiveInteger(process.env.FREE_SHIPPING_THRESHOLD_CENTS, 4900);
  const standardAmount = positiveInteger(process.env.STANDARD_SHIPPING_AMOUNT_CENTS, 699);
  const isFree = subtotal >= freeThreshold;
  return {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: isFree ? 0 : standardAmount, currency: "usd" },
      display_name: isFree ? "Complimentary shipping" : "Standard shipping",
      delivery_estimate: {
        minimum: { unit: "business_day", value: 3 },
        maximum: { unit: "business_day", value: 7 }
      }
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({
      error: "Stripe is not connected yet. Add STRIPE_SECRET_KEY in Vercel."
    });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { lineItems, subtotal } = await prepareCheckoutItems(stripe, req.body?.items);

    if (!lineItems.length) {
      return res.status(400).json({
        error: "Your bag does not contain a valid active Stripe product."
      });
    }

    const siteUrl = safeSiteUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${siteUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?checkout=cancelled`,
      customer_creation: "always",
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["US"]
      },
      shipping_options: [shippingOption(subtotal)],
      automatic_tax: {
        enabled: enabled(process.env.STRIPE_AUTOMATIC_TAX)
      },
      phone_number_collection: {
        enabled: true
      },
      allow_promotion_codes: true,
      payment_intent_data: {
        metadata: {
          store: "woof-n-purr"
        }
      },
      metadata: {
        store: "woof-n-purr"
      }
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({
      error: "Secure checkout could not be started. Check Stripe and try again."
    });
  }
}
