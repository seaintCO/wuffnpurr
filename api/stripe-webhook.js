import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function notifyOrder(stripe, session) {
  if (!process.env.RESEND_API_KEY || !process.env.ORDER_NOTIFICATION_EMAIL) return;
  const items = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"]
  });
  const rows = items.data.map(item => {
    const name = item.description || item.price?.product?.name || "Product";
    return `<li>${escapeHtml(name)} × ${item.quantity || 1} — $${((item.amount_total || 0) / 100).toFixed(2)}</li>`;
  }).join("");
  const shipping = session.shipping_details || session.collected_information?.shipping_details;
  const address = shipping?.address;
  const addressText = address
    ? `${address.line1 || ""} ${address.line2 || ""}, ${address.city || ""}, ${address.state || ""} ${address.postal_code || ""}`
    : "See Stripe Dashboard";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.ORDER_FROM_EMAIL || "Woof N’ Purr Orders <orders@woofnpurr.shop>",
      to: [process.env.ORDER_NOTIFICATION_EMAIL],
      subject: `New Woof N’ Purr order — $${((session.amount_total || 0) / 100).toFixed(2)}`,
      html: `<h1>New paid order</h1><p>Stripe session: ${escapeHtml(session.id)}</p><ul>${rows}</ul><p><strong>Ship to:</strong> ${escapeHtml(shipping?.name || "Customer")} — ${escapeHtml(addressText)}</p><p>Open Stripe Dashboard for the full payment and customer record.</p>`
    })
  });
  if (!response.ok) throw new Error(`Order email failed with ${response.status}`);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: "Stripe webhook is not configured." });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const event = stripe.webhooks.constructEvent(
      await readRawBody(req),
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      if (session.payment_status === "paid" && session.metadata?.store === "woof-n-purr") {
        try {
          await notifyOrder(stripe, session);
        } catch (notificationError) {
          console.error("Order notification error:", notificationError);
        }
      }
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error.message);
    return res.status(400).json({ error: "Invalid webhook signature." });
  }
}
