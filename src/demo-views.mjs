const webExample = `<div class="example-browser" data-example-visual>
  <div class="example-browser-bar"><span aria-hidden="true"></span><strong data-browser-format>Écran large</strong></div>
  <form class="example-web-form" data-sample-form>
    <label>Nom<input autocomplete="off" placeholder="Camille" required></label>
    <label>E-mail<input type="email" autocomplete="off" placeholder="camille@example.test" required></label>
    <button class="demo-submit" type="submit" disabled>Écrire</button>
  </form>
</div>`;

const applicationExample = `<div class="example-planning" data-example-visual>
  <div class="example-lane"><h3>À planifier</h3><div class="example-slot" data-plan-from><strong class="example-appointment" data-appointment>Visite technique</strong></div></div>
  <div class="example-lane"><h3>Mercredi · 14 h</h3><div class="example-slot" data-plan-to></div></div>
</div>`;

const aiExample = `<div class="example-ai" data-example-visual>
  <div class="example-mail"><h3>E-mail reçu</h3><blockquote>« Il nous faudrait <mark>douze câbles</mark> pour <mark>vendredi</mark>, à <mark>Bulle</mark>. »</blockquote></div>
  <div class="example-record">
    <h3>Fiche préparée</h3>
    <p data-record-empty>Les champs apparaissent après l’extraction.</p>
    <dl data-record-fields hidden>
      <div><dt>Quantité</dt><dd>12</dd></div>
      <div><dt>Échéance</dt><dd>Vendredi</dd></div>
      <div><dt>Localité</dt><dd>Bulle</dd></div>
      <div><dt>Adresse</dt><dd class="example-missing">À compléter</dd></div>
    </dl>
  </div>
</div>`;

const examples = {
  web: { markup: webExample, action: 'Passer au téléphone' },
  application: { markup: applicationExample, action: 'Placer la demande' },
  ia: { markup: aiExample, action: 'Extraire les informations' },
};

export function exampleSection(offer) {
  const example = examples[offer.id];
  return `<section class="example-section" id="${offer.section}" data-example="${offer.id}" aria-labelledby="example-title-${offer.id}">
    <header class="example-description">
      <p class="eyebrow">Démonstration</p>
      <h2 id="example-title-${offer.id}">${offer.exampleTitle}</h2>
      <p>${offer.id === 'ia' ? 'Exemple guidé · extraction préparée' : 'Exemple interactif'}</p>
      <button class="button button-primary" type="button" data-example-action hidden>${example.action}</button>
    </header>
    ${example.markup}
    <p class="example-status" role="status" data-example-status></p>
  </section>`;
}
