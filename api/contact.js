// js/contatti.js
(() => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const successBox = document.getElementById("form-success");
  const btn = form.querySelector('button[type="submit"]');
  const btnText = btn?.querySelector(".btn-text");
  const btnLoading = btn?.querySelector(".btn-loading");

  // Honeypot anti-bot
  const hp = document.createElement("input");
  hp.type = "text";
  hp.name = "website";
  hp.autocomplete = "off";
  hp.tabIndex = -1;
  hp.style.position = "absolute";
  hp.style.left = "-9999px";
  hp.style.opacity = "0";
  form.appendChild(hp);

  // Endpoint: in locale (Live Server) punta a Vercel, in prod usa relativo
  const IS_LOCAL = location.hostname === "127.0.0.1" || location.hostname === "localhost";
  const VERCEL_ORIGIN = "https://agricolagentili-f4fl.vercel.app";
  const CONTACT_ENDPOINT = IS_LOCAL ? `${VERCEL_ORIGIN}/api/contact` : "/api/contact";

  function setLoading(isLoading) {
    if (!btn) return;
    btn.disabled = isLoading;
    if (btnText && btnLoading) {
      btnText.style.display = isLoading ? "none" : "inline";
      btnLoading.style.display = isLoading ? "inline" : "none";
    }
  }

  function showError(message) {
    alert(message);
  }

  // Intercetta submit e forza POST via fetch
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const payload = {
      name: form.elements["name"]?.value || "",
      email: form.elements["email"]?.value || "",
      phone: form.elements["phone"]?.value || "",
      subject: form.elements["subject"]?.value || "",
      message: form.elements["message"]?.value || "",
      privacy: form.elements["privacy"]?.checked || false,
      website: hp.value
    };

    try {
      setLoading(true);

      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch {}

      if (!res.ok) {
        throw new Error(data?.error || `Invio non riuscito (HTTP ${res.status})`);
      }

      form.style.display = "none";
      if (successBox) successBox.style.display = "block";
      form.reset();
    } catch (err) {
      showError(err?.message || "Invio non riuscito");
      console.error("[CONTACT FORM ERROR]", err);
    } finally {
      setLoading(false);
    }
  });
})();
