const header = document.querySelector(".site-header");
const mobileToggle = document.querySelector(".mobile-toggle");
const navLinks = document.querySelectorAll(".main-nav a");

if (mobileToggle && header) {
  mobileToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    mobileToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header?.classList.remove("nav-open");
    mobileToggle?.setAttribute("aria-expanded", "false");
  });
});
