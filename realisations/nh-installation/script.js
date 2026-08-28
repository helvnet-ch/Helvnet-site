const toggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (toggle && mobileNav) {
  toggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("active");
    document.body.classList.toggle("menu-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.textContent = isOpen ? "×" : "☰";
  });
}

document.querySelectorAll("[data-mobile-nav] a").forEach((link) => {
  link.addEventListener("click", () => {
    if (!mobileNav || !toggle) return;
    mobileNav.classList.remove("active");
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "☰";
  });
});

const quoteForm = document.querySelector("[data-quote-form]");
const whatsAppButton = document.querySelector("[data-whatsapp-submit]");

if (quoteForm && whatsAppButton) {
  whatsAppButton.addEventListener("click", () => {
    if (!quoteForm.reportValidity()) return;

    const data = new FormData(quoteForm);
    const message = [
      "Bonjour NH installation,",
      "",
      "Je souhaite obtenir un devis.",
      "",
      `Nom: ${data.get("nom")}`,
      `Téléphone: ${data.get("telephone")}`,
      `E-mail: ${data.get("email")}`,
      `Commune: ${data.get("commune")}`,
      `Type de demande: ${data.get("service")}`,
      `Délai souhaité: ${data.get("delai") || "Non précisé"}`,
      "",
      "Message:",
      data.get("message")
    ].join("\n");

    window.open(`https://wa.me/41798852795?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  });
}
