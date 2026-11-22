const quoteForm = document.querySelector('[data-quote-form]');

if (quoteForm) {
  const fallback = document.querySelector('[data-email-draft]');
  const draft = new URL(fallback.href);
  const name = quoteForm.elements.namedItem('name');
  const project = quoteForm.elements.namedItem('project');
  const axes = [...quoteForm.querySelectorAll('[name=axis]')];
  const preferred = new URL(window.location.href).searchParams.get('axe');
  const initialAxis = axes.find((axis) => axis.value === preferred);
  if (initialAxis) initialAxis.checked = true;

  for (const axis of axes) {
    axis.addEventListener('change', () => {
      if (!axis.checked) return;
      for (const other of axes) {
        if (other !== axis && (other.value === 'ensemble' || axis.value === 'ensemble')) other.checked = false;
      }
    });
  }

  for (const field of [name, project]) {
    field.addEventListener('input', () => field.setCustomValidity(''));
  }

  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    name.setCustomValidity(name.value.trim() ? '' : 'Indiquez votre nom.');
    project.setCustomValidity(project.value.trim() ? '' : 'Décrivez votre projet en quelques lignes.');
    if (!quoteForm.reportValidity()) return;

    const data = new FormData(quoteForm);
    const email = String(data.get('email')).trim();
    const interests = axes.filter((axis) => axis.checked).map((axis) => axis.dataset.label);
    const lines = [
      'Bonjour Diego,',
      '',
      project.value.trim().replace(/\r?\n/g, '\r\n'),
      '',
      `Nom : ${name.value.trim()}`,
      `E-mail : ${email}`,
    ];
    if (interests.length) lines.push(`Axes : ${interests.join(', ')}`);
    lines.push('', 'Merci,');

    const subject = encodeURIComponent(draft.searchParams.get('subject'));
    const body = encodeURIComponent(lines.join('\r\n'));
    window.location.assign(`mailto:${draft.pathname}?subject=${subject}&body=${body}`);
  });

  fallback.hidden = true;
  quoteForm.hidden = false;
}
