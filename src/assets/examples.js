const motion = matchMedia('(prefers-reduced-motion: reduce)');

const scenarios = {
  web(demo, active) {
    demo.querySelector('[data-browser-format]').textContent = active ? 'Téléphone' : 'Écran large';
    return active
      ? ['Revenir au grand écran', 'Format téléphone. Les champs sont les uns sous les autres.']
      : ['Passer au téléphone', 'Format écran large. Les champs sont côte à côte lorsque la largeur le permet.'];
  },
  application(demo, active) {
    const appointment = demo.querySelector('[data-appointment]');
    const from = appointment.getBoundingClientRect();
    demo.querySelector(active ? '[data-plan-to]' : '[data-plan-from]').append(appointment);
    const to = appointment.getBoundingClientRect();
    if (!motion.matches && from.width && to.width) {
      appointment.getAnimations().forEach((animation) => animation.cancel());
      appointment.animate([
        { transform: `translate(${from.x - to.x}px, ${from.y - to.y}px)` },
        { transform: 'translate(0, 0)' },
      ], { duration: 320, easing: 'cubic-bezier(.24,.74,.3,1)' });
    }
    return active
      ? ['Retirer du planning', 'Visite technique planifiée mercredi à 14 h.']
      : ['Placer la demande', 'Visite technique à planifier.'];
  },
  ia(demo, active) {
    demo.querySelector('[data-record-empty]').hidden = active;
    demo.querySelector('[data-record-fields]').hidden = !active;
    return active
      ? ['Relire l’e-mail', 'Quantité 12, échéance vendredi, localité Bulle. L’adresse reste à compléter.']
      : ['Extraire les informations', 'E-mail affiché.'];
  },
};

for (const demo of document.querySelectorAll('[data-example]')) {
  const action = demo.querySelector('[data-example-action]');
  const status = demo.querySelector('[data-example-status]');
  const update = scenarios[demo.dataset.example];
  let active = false;

  action.addEventListener('click', () => {
    active = !active;
    demo.dataset.active = String(active);
    const [label, message] = update(demo, active);
    action.textContent = label;
    status.textContent = message;
  });
  action.hidden = false;

  const form = demo.querySelector('[data-sample-form]');
  if (form) {
    form.querySelector('button').disabled = false;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      status.textContent = 'Saisie validée dans la démonstration.';
    });
  }
}
