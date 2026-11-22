import { availabilityText, courses, enrolled, examples, featuredCourse, freePlaces, newState } from './assets/demo-model.js';
import { offerings } from './offerings.mjs';

const [web, app, ai] = offerings;
const initialState = newState();
const days = [...new Set(courses.map((course) => course.day))];

function demoNavigation(current) {
  return `<nav class="demo-navigation" aria-label="Les vues de la démonstration">
    ${current !== 'public' ? `<a class="text-link" href="${web.path}#horaire">Voir l’horaire public</a>` : ''}
    ${current !== 'registry' ? `<a class="text-link" href="${app.path}#registre">Ouvrir le registre</a>` : ''}
    ${current !== 'guide' ? `<a class="text-link" href="${ai.path}#analyse">Traiter une demande</a>` : ''}
    <button class="text-link bare-button" type="button" data-demo-reset hidden>Recommencer la démo</button>
  </nav>`;
}

function demoHeading(title, id, description) {
  return `<header class="demo-heading">
    <p class="kicker">Démonstration d’atelier</p>
    <h2 class="section-title" id="${id}">${title}</h2>
    <p>${description}</p>
  </header>`;
}

export function publicSchedule() {
  return `<section class="public-demo" id="horaire" data-demo="public" aria-labelledby="horaire-titre">
    ${demoHeading('Voir l’horaire public', 'horaire-titre', 'La Traverse est une salle de sport fictive. Consultez les places disponibles dans son horaire.')}
    <div class="public-sheet">
      <header class="schedule-heading"><h3>La Traverse</h3><p>Horaire des cours</p></header>
      <ul class="schedule" aria-label="Horaire des cours">
        ${courses.map((course) => `<li class="schedule-row${course.id === featuredCourse ? ' is-featured' : ''}" data-course="${course.id}">
          <span class="schedule-time"><span>${course.day}</span><strong>${course.time}</strong></span>
          <span class="schedule-course">${course.title}</span>
          <span class="availability" data-public-availability>${availabilityText(freePlaces(initialState, course))}</span>
        </li>`).join('')}
      </ul>
    </div>
    ${demoNavigation('public')}
    <p class="demo-feedback" data-demo-feedback role="status" hidden></p>
  </section>`;
}

export function registry() {
  return `<section class="registry-demo" id="registre" data-demo="registry" aria-labelledby="registre-titre">
    ${demoHeading('Registre d’inscriptions', 'registre-titre', 'Sélectionnez un cours et modifiez les inscriptions. L’horaire public reprend les places encore libres.')}
    <div class="registry-layout">
      <ul class="registry-sessions" aria-label="Séances de La Traverse">
        ${courses.map((course) => `<li><button class="registry-session" type="button" data-course="${course.id}" aria-pressed="${course.id === featuredCourse}" aria-controls="inscriptions">
          <span class="thread-line" data-thread aria-hidden="true"></span>
          <span class="schedule-time"><span>${course.day}</span><strong>${course.time}</strong></span>
          <span class="schedule-course">${course.title}</span>
          <span class="registry-count"><strong data-registry-count>${enrolled(initialState, course.id)}/${course.capacity}</strong><span>places prises</span></span>
        </button></li>`).join('')}
      </ul>
      <div class="registry-detail" id="inscriptions">
        <h3 data-registry-title>Jeudi · 18 h</h3>
        <p data-registry-availability>2 places disponibles</p>
        <ul class="registry-entries" data-registry-entries aria-label="Inscriptions de cette séance"><li>Inscriptions initiales · 4 places</li></ul>
        <form class="register-form" data-register-form novalidate hidden>
          <label>Places à ajouter <input name="quantity" type="number" inputmode="numeric" value="1" min="1" step="1" required></label>
          <button class="button" type="submit">Ajouter des places</button>
        </form>
        <p class="demo-feedback" data-demo-feedback role="status" hidden></p>
      </div>
    </div>
    ${demoNavigation('registry')}
  </section>`;
}

export function guidedRequest() {
  return `<section class="guide-demo" id="analyse" data-demo="guide" aria-labelledby="analyse-titre" data-active-field="quantity">
    ${demoHeading('Du message à la réservation', 'analyse-titre', 'Choisissez un champ pour retrouver les mots qui justifient la proposition. Vous pouvez la corriger avant validation.')}
    <div class="guide-samples" role="group" aria-label="Messages à traiter" hidden>
      ${examples.map((example, i) => `<button type="button" class="sample-button" data-example="${example.id}" aria-pressed="${i === 0}">${example.label}</button>`).join('')}
    </div>
    <div class="analysis-sheet">
      <div class="source-column">
        <h3>Message reçu</h3>
        <blockquote data-source-message>${examples[0].parts.map(([text, field]) => field ? `<mark data-evidence="${field}">${text}${field === 'quantity' ? '<span class="thread-line" data-thread="ia" aria-hidden="true"></span>' : ''}</mark>` : text).join('')}</blockquote>
      </div>
      <div class="proposal-column">
        <h3>Proposition</h3>
        <p class="analysis-mode">Exemple guidé · analyse préparée</p>
        <form class="request-form" data-request-form novalidate hidden>
          <div class="request-fields">
            <label>Places <input data-field="quantity" name="quantity" type="number" inputmode="numeric" min="1" step="1" value="2" required></label>
            <label>Jour <select data-field="day" name="day">${days.map((day) => `<option${day === 'Jeudi' ? ' selected' : ''}>${day}</option>`).join('')}</select></label>
            <label>Heure <select data-field="time" name="time" required><option value="">À préciser</option><option selected>18 h</option><option>19 h 30</option></select></label>
          </div>
          <p class="request-capacity" data-request-capacity></p>
          <p class="request-draft"><strong>Brouillon de réponse</strong><span data-request-draft>Bonjour, je peux vous proposer deux places jeudi à 18 h.</span></p>
          <div class="request-actions">
            <button class="button" type="submit">Valider la réservation</button>
            <button class="text-link bare-button" type="button" data-use-remaining hidden></button>
          </div>
        </form>
        <p class="demo-feedback" data-demo-feedback role="status" hidden></p>
      </div>
    </div>
    ${demoNavigation('guide')}
  </section>`;
}
