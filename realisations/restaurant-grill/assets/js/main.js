
const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".menu-panel");
const infoSection = document.querySelector("[data-info-section]");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.target;

    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    panels.forEach(panel => {
      if (target === "all" || panel.dataset.category === target) {
        panel.classList.remove("hidden");
      } else {
        panel.classList.add("hidden");
      }
    });

    if (infoSection) {
      if (target === "all" || target === "infos") {
        infoSection.classList.remove("hidden");
      } else {
        infoSection.classList.add("hidden");
      }
    }
  });
});

document.querySelectorAll(".nav-links a").forEach(link => {
  const current = window.location.pathname.split("/").pop() || "index.html";
  if (link.getAttribute("href") === current) link.classList.add("active");
});


window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (!loader) return;

  setTimeout(() => {
    loader.classList.add("hide");
  }, 3000);
});
