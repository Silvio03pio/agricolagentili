// api/contact.js (CommonJS)
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function clamp(str, max) {
  return (str || "").toString().trim().slice(0, max);
}
function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

// CORS: consenti chiamate da dominio prod e da Live Server
function setCors(res, origin) {
  const allowlist = new Set([
    "https://agricolagentiliorvieto.com",
    "https://www.agricolagentiliorvieto.com",
    "http://127.0.0.1:5500",
    "http://localhost:5500"
  ]);

  if (allowlist.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || "";
  setCors(res, origin);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, phone, subject, message, privacy, website } = req.body || {};

    // Honeypot anti-bot
    if ((website || "").toString().trim().length > 0) {
      return res.status(200).json({ ok: true });
    }

    const clean = {
      name: clamp(name, 120),
      email: clamp(email, 180).toLowerCase(),
      phone: clamp(phone, 40),
      subject: clamp(subject, 40),
      message: clamp(message, 4000),
      consent: Boolean(privacy),
      source: "web",
      page: "/contatti.html"
    };

    if (!clean.name || clean.name.length < 2) return res.status(400).json({ error: "Nome non valido" });
    if (!clean.email || !isEmailValid(clean.email)) return res.status(400).json({ error: "Email non valida" });
    if (!clean.subject) return res.status(400).json({ error: "Seleziona un oggetto" });
    if (!clean.message || clean.message.length < 10) return res.status(400).json({ error: "Messaggio troppo breve" });
    if (!clean.consent) return res.status(400).json({ error: "Consenso privacy obbligatorio" });

    // IP hash (privacy-friendly)
    const ip =
      (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "";
    const ip_hash = ip ? sha256(ip) : null;

    const { error } = await supabase.from("contatti").insert({ ...clean, ip_hash });

    if (error) {
      console.error("[CONTACT INSERT ERROR]", error);
      return res.status(500).json({ error: "Errore server" });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[CONTACT API ERROR]", e);
    return res.status(500).json({ error: "Errore server" });
  }
};
