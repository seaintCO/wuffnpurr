import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "Stripe is not connected." });
  }
  const sessionId = String(req.query?.session_id || "");
  if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) {
    return res.status(400).json({ error: "Invalid checkout session." });
  }
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.store !== "woof-n-purr") {
      return res.status(404).json({ error: "Checkout session not found." });
    }
    return res.status(200).json({
      paid: session.payment_status === "paid",
      status: session.status,
      customerEmail: session.customer_details?.email || null
    });
  } catch (error) {
    console.error("Checkout verification error:", error);
    return res.status(404).json({ error: "Checkout session not found." });
  }
}
