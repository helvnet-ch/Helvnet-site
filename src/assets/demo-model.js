export const courses = [
  { id: 'mar-1830', day: 'Mardi', time: '18 h 30', title: 'Mobilité', capacity: 8, initial: 5 },
  { id: 'jeu-1800', day: 'Jeudi', time: '18 h', title: 'Renforcement', capacity: 6, initial: 4 },
  { id: 'jeu-1930', day: 'Jeudi', time: '19 h 30', title: 'Mobilité', capacity: 8, initial: 3 },
  { id: 'sam-1000', day: 'Samedi', time: '10 h', title: 'Circuit', capacity: 10, initial: 7 },
];

export const featuredCourse = 'jeu-1800';

export const examples = [
  {
    id: 'deux', label: 'Deux places',
    parts: [['Bonjour, pouvez-vous me réserver '], ['deux places', 'quantity'], [' au cours de '], ['jeudi', 'day'], [' à '], ['18 h', 'time'], [' ?']],
    proposal: { quantity: '2', day: 'Jeudi', time: '18 h' },
  },
  {
    id: 'incomplet', label: 'Heure à préciser',
    parts: [['Gardez-moi '], ['une place', 'quantity'], [' '], ['jeudi', 'day']],
    proposal: { quantity: '1', day: 'Jeudi', time: '' },
  },
  {
    id: 'trois', label: 'Trois places',
    parts: [['Bonjour, auriez-vous '], ['trois places', 'quantity'], [' pour '], ['jeudi', 'day'], [' à '], ['18 h', 'time'], [' ?']],
    proposal: { quantity: '3', day: 'Jeudi', time: '18 h' },
  },
];

export function newState() {
  return {
    version: 1,
    entries: courses.map(({ id, initial }) => ({ id: `initial-${id}`, courseId: id, quantity: initial, source: 'initial', active: true })),
    selectedCourse: featuredCourse,
    selectedExample: examples[0].id,
    drafts: {},
  };
}

export const courseById = (id) => courses.find((course) => course.id === id);
export const courseAt = (day, time) => courses.find((course) => course.day === day && course.time === time);
export const exampleById = (id) => examples.find((example) => example.id === id) ?? examples[0];

export function enrolled(state, courseId) {
  return state.entries.reduce((count, entry) => entry.active && entry.courseId === courseId ? count + entry.quantity : count, 0);
}

export function freePlaces(state, course) {
  return Math.max(0, course.capacity - enrolled(state, course.id));
}

export function availabilityText(free) {
  if (free === 0) return 'Complet';
  return free === 1 ? '1 place disponible' : `${free} places disponibles`;
}

export function addEntry(state, { courseId, quantity, source, requestId }) {
  const processed = requestId && state.entries.find((entry) => entry.requestId === requestId);
  if (processed) return { reason: 'processed', entry: processed };

  const course = courseById(courseId);
  if (!course) return { reason: 'time' };
  if (!Number.isSafeInteger(quantity) || quantity < 1) return { reason: 'quantity' };
  const free = freePlaces(state, course);
  if (quantity > free) return { reason: 'capacity', free };

  const entry = { id: `inscription-${state.entries.length + 1}`, courseId, quantity, source, requestId, active: true };
  return { state: { ...state, entries: [...state.entries, entry], selectedCourse: courseId }, entry };
}

export function cancelEntry(state, id) {
  const entry = state.entries.find((candidate) => candidate.id === id && candidate.active);
  if (!entry) return { reason: 'cancelled' };
  return {
    state: { ...state, entries: state.entries.map((candidate) => candidate.id === id ? { ...candidate, active: false } : candidate) },
    entry,
  };
}
