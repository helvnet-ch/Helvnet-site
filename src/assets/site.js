const quoteForm = document.querySelector('[data-quote-form]');

if (quoteForm) {
  const fallback = document.querySelector('[data-email-draft]');
  const draft = new URL(fallback.href);
  const name = quoteForm.elements.namedItem('name');
  const project = quoteForm.elements.namedItem('project');
  const axes = [...quoteForm.querySelectorAll('[name=axis]')];
  const manual = quoteForm.querySelector('[data-manual-draft]');
  const draftText = manual.querySelector('textarea');
  const status = quoteForm.querySelector('[data-copy-status]');
  let preferred;
  function syncAxis() {
    const next = new URL(window.location.href).searchParams.get('axe');
    if (next === preferred) return;
    preferred = next;
    for (const axis of axes) axis.checked = axis.value === preferred;
  }
  syncAxis();
  window.addEventListener('helvnet:quote', syncAxis);

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

  quoteForm.addEventListener('input', () => {
    status.textContent = '';
    manual.hidden = true;
  });

  quoteForm.addEventListener('submit', async (event) => {
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
      project.value.trim(),
      '',
      `Nom : ${name.value.trim()}`,
      `E-mail : ${email}`,
    ];
    if (interests.length) lines.push(`Axes : ${interests.join(', ')}`);
    lines.push('', 'Merci,');

    const message = lines.join('\n');
    draftText.value = message;
    manual.hidden = false;
    if (event.submitter?.hasAttribute('data-copy-request')) {
      try {
        await navigator.clipboard.writeText(message);
        status.textContent = `Demande copiée. Vous pouvez la coller dans un e-mail à ${draft.pathname}.`;
      } catch {
        status.textContent = 'Sélectionnez le brouillon pour le copier dans votre messagerie.';
        draftText.focus();
        draftText.select();
      }
      return;
    }

    const subject = encodeURIComponent(draft.searchParams.get('subject'));
    const body = encodeURIComponent(message.replace(/\n/g, '\r\n'));
    status.textContent = 'Votre brouillon est aussi disponible ci-dessous.';
    window.location.assign(`mailto:${draft.pathname}?subject=${subject}&body=${body}`);
  });

  fallback.hidden = true;
  quoteForm.hidden = false;
}
