import {
  addEntry, availabilityText, cancelEntry, courseAt, courseById, courses, enrolled, exampleById, freePlaces, newState,
} from './demo-model.js';

const demo = document.querySelector('[data-demo]');
const storageKey = 'helvnet.traverse.v1';
const feedback = demo.querySelector('[data-demo-feedback]');
const reset = demo.querySelector('[data-demo-reset]');
const mode = demo.dataset.demo;
const registryForm = demo.querySelector('[data-register-form]');
const guideForm = demo.querySelector('[data-request-form]');
const registerButtons = [...demo.querySelectorAll('.registry-session')];
const registryList = demo.querySelector('[data-registry-entries]');
const sampleButtons = [...demo.querySelectorAll('[data-example]')];
const useRemaining = demo.querySelector('[data-use-remaining]');
let state = newState();

function read() {
  try {
    const serialized = sessionStorage.getItem(storageKey);
    const saved = serialized ? JSON.parse(serialized) : null;
    if (saved?.version === 1 && Array.isArray(saved.entries) && saved.drafts) return saved;
  } catch { /* La démo peut continuer dans la page si le stockage est indisponible. */ }
  return state;
}

function write(next) {
  state = next;
  try { sessionStorage.setItem(storageKey, JSON.stringify(state)); }
  catch { /* L’état en mémoire continue de servir dans cette page. */ }
}

function announce(message) {
  feedback.textContent = message;
  feedback.hidden = !message;
}

function renderPublic() {
  for (const row of demo.querySelectorAll('[data-course]')) {
    const availability = row.querySelector('[data-public-availability]');
    const free = freePlaces(state, courseById(row.dataset.course));
    availability.textContent = availabilityText(free);
    availability.dataset.full = String(free === 0);
  }
}

function places(quantity) {
  return quantity === 1 ? '1 place' : `${quantity} places`;
}

function capacityMessage(free) {
  if (!free) return 'Cette séance est complète. Choisissez une autre heure ou un autre jour.';
  return `Il reste ${places(free)}. Réduisez la quantité ou choisissez une autre séance.`;
}

function renderRegistry() {
  const selected = courseById(state.selectedCourse) ?? courseById(newState().selectedCourse);
  for (const button of registerButtons) {
    const course = courseById(button.dataset.course);
    button.setAttribute('aria-pressed', String(course.id === selected.id));
    button.querySelector('[data-registry-count]').textContent = `${enrolled(state, course.id)}/${course.capacity}`;
  }
  demo.querySelector('[data-registry-title]').textContent = `${selected.day} · ${selected.time}`;
  demo.querySelector('[data-registry-availability]').textContent = availabilityText(freePlaces(state, selected));
  const active = state.entries.filter((entry) => entry.active && entry.courseId === selected.id);
  const entries = active.map((entry) => {
    const row = document.createElement('li');
    const label = document.createElement('span');
    const source = { initial: 'Inscriptions initiales', register: 'Ajout au registre', guide: 'Demande traitée' }[entry.source];
    label.textContent = `${source} · ${places(entry.quantity)}`;
    row.append(label);
    if (entry.source !== 'initial') {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'text-link bare-button';
      remove.dataset.cancel = entry.id;
      remove.textContent = 'Annuler';
      remove.setAttribute('aria-label', `Annuler l’inscription de ${places(entry.quantity)}`);
      row.append(remove);
    }
    return row;
  });
  registryList.replaceChildren(...entries);
}

function setupRegistry() {
  for (const button of registerButtons) {
    button.addEventListener('click', () => {
      write({ ...read(), selectedCourse: button.dataset.course });
      announce('');
      renderRegistry();
    });
  }

  registryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const current = read();
    const quantity = Number(registryForm.elements.quantity.value);
    const result = addEntry(current, { courseId: current.selectedCourse, quantity, source: 'register' });
    if (!result.state) {
      announce(result.reason === 'capacity' ? capacityMessage(result.free) : 'Indiquez un nombre entier de places.');
      return;
    }
    write(result.state);
    announce(`${places(quantity)} ajoutée${quantity === 1 ? '' : 's'}. L’horaire public est à jour.`);
    registryForm.elements.quantity.value = '1';
    renderRegistry();
  });

  registryList.addEventListener('click', (event) => {
    const control = event.target.closest('[data-cancel]');
    if (!control) return;
    const result = cancelEntry(read(), control.dataset.cancel);
    if (!result.state) return;
    write(result.state);
    renderRegistry();
    registryForm.elements.quantity.focus({ preventScroll: true });
    announce(`${places(result.entry.quantity)} libérée${result.entry.quantity === 1 ? '' : 's'}. L’horaire public est à jour.`);
  });
  registryForm.hidden = false;
}

function selectTimes(day, selected) {
  const options = courses.filter((course) => course.day === day).map(({ time }) => new Option(time, time));
  const field = guideForm.elements.time;
  field.replaceChildren(new Option('À préciser', ''), ...options);
  field.value = options.some((option) => option.value === selected) ? selected : '';
}

function currentDraft() {
  return Object.fromEntries(['quantity', 'day', 'time'].map((field) => [field, guideForm.elements[field].value]));
}

function renderSource(example) {
  const parts = example.parts.map(([text, field]) => {
    if (!field) return document.createTextNode(text);
    const mark = document.createElement('mark');
    mark.dataset.evidence = field;
    mark.append(text);
    if (field === 'quantity') {
      const thread = document.createElement('span');
      thread.className = 'thread-line';
      thread.dataset.thread = 'ia';
      thread.setAttribute('aria-hidden', 'true');
      mark.append(thread);
    }
    return mark;
  });
  demo.querySelector('[data-source-message]').replaceChildren(...parts);
}

function renderProposal() {
  const fields = currentDraft();
  const course = courseAt(fields.day, fields.time);
  const quantity = Number(fields.quantity);
  const validQuantity = Number.isSafeInteger(quantity) && quantity > 0;
  const processed = state.entries.find((entry) => entry.requestId === state.selectedExample);
  const free = course ? freePlaces(state, course) : 0;
  const reply = demo.querySelector('[data-request-draft]');
  const capacity = demo.querySelector('[data-request-capacity]');
  const submit = guideForm.querySelector('[type=submit]');

  for (const field of guideForm.querySelectorAll('[data-field]')) field.disabled = Boolean(processed);
  submit.disabled = Boolean(processed);
  useRemaining.hidden = true;

  if (processed) {
    submit.textContent = processed.active ? 'Réservation validée' : 'Inscription annulée';
    capacity.textContent = processed.active ? `L’inscription est dans le registre. ${availabilityText(free)}.` : 'L’inscription de cette demande a été annulée dans le registre.';
    reply.textContent = processed.active
      ? `Bonjour, je vous confirme ${places(processed.quantity)} pour le cours de ${course.day.toLowerCase()} à ${course.time}.`
      : `Bonjour, l’inscription de ${places(processed.quantity)} au cours de ${course.day.toLowerCase()} à ${course.time} a été annulée.`;
    return;
  }

  submit.textContent = 'Valider la réservation';
  if (!course) {
    capacity.textContent = 'Choisissez l’heure du cours pour vérifier les places disponibles.';
    reply.textContent = `Bonjour, à quelle heure souhaitez-vous venir ${fields.day.toLowerCase()} ?`;
  } else if (!validQuantity) {
    capacity.textContent = 'Indiquez un nombre entier de places.';
    reply.textContent = 'Bonjour, combien de places souhaitez-vous réserver ?';
  } else if (quantity > free) {
    capacity.textContent = capacityMessage(free);
    reply.textContent = free
      ? `Bonjour, je peux vous proposer ${places(free)} à ${course.time} ou regarder un autre horaire.`
      : `Bonjour, le cours de ${course.day.toLowerCase()} à ${course.time} est complet. Quel autre horaire vous conviendrait ?`;
    if (free) {
      useRemaining.hidden = false;
      useRemaining.dataset.quantity = free;
      useRemaining.textContent = `Utiliser ${free === 1 ? 'la place restante' : `les ${places(free)}`}`;
    }
  } else {
    capacity.textContent = `${availabilityText(free)} pour ce cours.`;
    reply.textContent = `Bonjour, je peux vous proposer ${places(quantity)} pour le cours de ${course.day.toLowerCase()} à ${course.time}.`;
  }
}

function renderGuide() {
  const example = exampleById(state.selectedExample);
  const applied = state.entries.find((entry) => entry.requestId === example.id);
  const course = applied && courseById(applied.courseId);
  const draft = course
    ? { quantity: applied.quantity, day: course.day, time: course.time }
    : state.drafts[example.id] ?? example.proposal;
  for (const button of sampleButtons) button.setAttribute('aria-pressed', String(button.dataset.example === example.id));
  renderSource(example);
  guideForm.elements.quantity.value = draft.quantity;
  guideForm.elements.day.value = draft.day;
  selectTimes(draft.day, draft.time);
  renderProposal();
}

function persistDraft() {
  const current = read();
  write({ ...current, drafts: { ...current.drafts, [current.selectedExample]: currentDraft() } });
  announce('');
  renderProposal();
}

function setupGuide() {
  for (const button of sampleButtons) {
    button.addEventListener('click', () => {
      write({ ...read(), selectedExample: button.dataset.example });
      demo.dataset.activeField = 'quantity';
      announce('');
      renderGuide();
    });
  }

  guideForm.addEventListener('focusin', (event) => {
    if (event.target.dataset.field) demo.dataset.activeField = event.target.dataset.field;
  });
  guideForm.addEventListener('input', (event) => {
    if (!event.target.dataset.field) return;
    if (event.target.name === 'day') selectTimes(event.target.value, '');
    persistDraft();
  });
  useRemaining.addEventListener('click', () => {
    guideForm.elements.quantity.value = useRemaining.dataset.quantity;
    demo.dataset.activeField = 'quantity';
    persistDraft();
    guideForm.elements.quantity.focus({ preventScroll: true });
  });
  guideForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const current = read();
    const fields = currentDraft();
    const course = courseAt(fields.day, fields.time);
    const result = addEntry(current, {
      courseId: course?.id, quantity: Number(fields.quantity), source: 'guide', requestId: current.selectedExample,
    });
    if (!result.state) {
      const reasons = {
        time: 'L’heure est à préciser avant de réserver.', quantity: 'Indiquez un nombre entier de places.',
        capacity: 'La demande dépasse les places disponibles pour cette séance.', processed: 'Cette demande a déjà été traitée.',
      };
      announce(reasons[result.reason]);
      return;
    }
    write(result.state);
    renderGuide();
    announce(`Réservation de ${places(result.entry.quantity)} enregistrée dans le registre de la démo.`);
  });

  demo.querySelector('.guide-samples').hidden = false;
  guideForm.hidden = false;
}

function render() {
  state = read();
  if (mode === 'public') renderPublic();
  if (mode === 'registry') renderRegistry();
  if (mode === 'guide') renderGuide();
}

reset.addEventListener('click', () => {
  write(newState());
  if (mode === 'guide') demo.dataset.activeField = 'quantity';
  if (mode === 'registry') registryForm.elements.quantity.value = '1';
  render();
  announce('La démonstration est revenue à son état initial.');
});

if (mode === 'registry') setupRegistry();
if (mode === 'guide') setupGuide();
render();
reset.hidden = false;
window.addEventListener('pageshow', render);
