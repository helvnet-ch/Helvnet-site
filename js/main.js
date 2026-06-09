const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Ouvrir le menu");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Ouvrir le menu" : "Fermer le menu");
    navigation.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll("[data-reveal]");

if (!reducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll("[data-year]").forEach((item) => {
  item.textContent = new Date().getFullYear();
});

const actionBar = document.createElement("div");
actionBar.className = "mobile-action-bar";
actionBar.setAttribute("aria-label", "Actions rapides");
actionBar.innerHTML = `
  <a class="mobile-action-call" href="tel:+41798721965" aria-label="Appeler Helvnet">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.6 15.6 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.1.36 2.28.55 3.48.55a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.55 21 3 13.45 3 4.12a1 1 0 0 1 1-1H7.5a1 1 0 0 1 1 1c0 1.2.19 2.37.55 3.48a1 1 0 0 1-.25 1.03l-2.2 2.17Z"/></svg>
  </a>
  <a class="mobile-action-main" href="contact.html#audit">Demander un audit gratuit</a>
`;
document.body.append(actionBar);

const carousel = document.querySelector("[data-carousel]");
const carouselDots = document.querySelectorAll("[data-carousel-dots] .carousel-dot");
const mobileMedia = window.matchMedia("(max-width: 768px)");

if (carousel && carouselDots.length) {
  const cards = [...carousel.querySelectorAll(".offer-card")];
  let carouselFrame;

  const setActiveDot = (index) => {
    carouselDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === index;
      dot.classList.toggle("is-active", isActive);
      if (isActive) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };

  const updateCarousel = () => {
    carouselFrame = undefined;
    if (!mobileMedia.matches) return;

    const viewportCenter = carousel.scrollLeft + carousel.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(viewportCenter - cardCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveDot(nearestIndex);
  };

  carousel.addEventListener("scroll", () => {
    if (!carouselFrame) carouselFrame = requestAnimationFrame(updateCarousel);
  }, { passive: true });

  carouselDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      cards[index]?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "center"
      });
    });
  });

  mobileMedia.addEventListener("change", updateCarousel);
  updateCarousel();
}
