const Stripe = require("stripe");
const fs = require("fs").promises;
const path = require("path");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function loadCatalog() {
  const catalogPath = path.join(process.cwd(), "data", "prodotti.json");
  const raw = await fs.readFile(catalogPath, "utf-8");
  return JSON.parse(raw);
}

function buildIndex(catalog) {
  const all = [...(catalog.vini || []), ...(catalog.oli || [])];
  const index = new Map();
  for (const p of all) index.set(String(p.id), p);
  return index;
}

module.exports = async (req, res) => {
  // Se apri l'URL nel browser (GET), deve rispondere 405 e NON crashare
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cart } = req.body || {};
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const siteUrl = process.env.SITE_URL;
    if (!siteUrl) {
      return res.status(500).json({ error: "Missing SITE_URL env var" });
    }

    const catalog = await loadCatalog();
    const index = buildIndex(catalog);

    const line_items = cart.map((item) => {
      const product = index.get(String(item.id));
      if (!product || !product.stripePriceId) {
        throw new Error(`Invalid product or missing stripePriceId: ${item?.id}`);
      }
      const quantity = Math.max(1, Number(item.quantity || 1));
      return { price: product.stripePriceId, quantity };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${siteUrl}/negozio.html?success=1`,
      cancel_url: `${siteUrl}/negozio.html?canceled=1`
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
