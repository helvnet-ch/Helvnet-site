import { contactEmail, contactPath, origin, projectPath } from './config.mjs';
import { guidedRequest, publicSchedule, registry } from './demo-views.mjs';
import { plotterScene } from './engraving.mjs';
import { offerings } from './offerings.mjs';
import { projects } from './projects.mjs';
import { terrain } from './terrain.mjs';

const [nh, kebab] = projects;
const emailDraft = `mailto:${contactEmail}?subject=${encodeURIComponent('Demande de devis Helvnet')}&amp;body=${encodeURIComponent('Bonjour Diego,\r\n\r\nVoici mon besoin :\r\n\r\nNom :\r\nE-mail :\r\n\r\nMerci,')}`;
const imageFolder = '/assets/projets';

function imageSet({ file, width, small, medium }) {
  return [small, medium, width].filter(Boolean).map((size) => {
    const suffix = size === width ? '' : `-${size}`;
    return `${imageFolder}/${file}${suffix}.webp ${size}w`;
  }).join(', ');
}

function projectImage(image, { eager = false, sizes = '(min-width: 82rem) 1248px, 94vw' } = {}) {
  const { file, width, height, alt } = image;
  return `<img src="${imageFolder}/${file}.webp" srcset="${imageSet(image)}" sizes="${sizes}" width="${width}" height="${height}" alt="${alt}" decoding="async"${eager ? '' : ' loading="lazy"'}>`;
}

function projectCover({ mobile, ...cover }) {
  return `<picture><source media="(max-width: 47.99rem)" srcset="${imageSet(mobile)}" sizes="90vw" width="${mobile.width}" height="${mobile.height}">${projectImage(cover, { eager: true })}</picture>`;
}

function workEntry(project, image, sizes, imageClass = '') {
  return `<article class="work-entry work-entry--${project.slug}">
    <a class="work-image ${imageClass}" href="${projectPath(project.slug)}" aria-label="Découvrir la réalisation ${project.name}">${projectImage(image, { sizes })}${project === nh ? '<span class="work-raccord thread-line" aria-hidden="true"></span>' : ''}</a>
    <div class="work-copy">
      <p class="kicker">${project.sector}</p>
      <h3>${project.name}</h3>
      <p>${project.summary}</p>
      <a class="text-link" href="${projectPath(project.slug)}">Découvrir la réalisation <span class="visually-hidden">${project.name}</span></a>
    </div>
  </article>`;
}

function workReport() {
  return `<section class="work" id="realisations" aria-labelledby="work-title">
    <header class="work-head"><p class="kicker">Réalisations web</p><h2 class="section-title" id="work-title">Du chantier au comptoir</h2></header>
    <div class="work-spread">
      ${workEntry(nh, nh.cover, '(min-width: 82rem) 720px, (min-width: 52rem) 60vw, 90vw')}
      ${workEntry(kebab, kebab.details[0], '(min-width: 42rem) 250px, 55vw', 'work-image--phone')}
    </div>
  </section>`;
}

export function layout(page, content) {
  const canonical = `${origin}${page.path}`;
  const shareImage = `${origin}/assets/partage/${page.share ?? 'helvnet'}.jpg`;
  return `<!doctype html>
<html lang="fr-CH">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  <meta name="theme-color" content="#F3EEE3">
  ${page.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fr_CH">
  <meta property="og:site_name" content="Helvnet">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${shareImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${page.shareAlt ?? 'Le traceur de Gruyère, atelier informatique Helvnet'}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="preload" href="/assets/fonts/instrument-sans.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/barlow-condensed-700.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/styles.css">
  ${(page.scripts ?? []).map((script) => `<script type="module" src="/assets/${script}.js"></script>`).join('\n  ')}
</head>
<body class="${page.body ?? 'interior'}">
  <a class="skip-link" href="#contenu">Aller au contenu</a>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="/" aria-label="Helvnet, accueil"><img src="/assets/logo.png" width="504" height="62" alt="Helvnet"></a>
      <nav class="header-nav" aria-label="Navigation principale"><a href="/#metiers">Les métiers</a><a href="/#realisations">Réalisations</a></nav>
      <a class="button header-quote" href="${page.offer ? `${contactPath}?axe=${page.offer}` : contactPath}"${page.path === contactPath ? ' aria-current="page"' : ''}>Demander un devis</a>
    </div>
  </header>
  ${content}
  <footer class="site-footer">
    <div class="wrap footer-inner">
      <a class="brand" href="/" aria-label="Helvnet, accueil"><img src="/assets/logo.png" width="504" height="62" alt="Helvnet"></a>
      <p>Atelier informatique en Suisse romande</p>
      ${page.path !== '/' ? '<a class="text-link" href="/assets/estampe-helvnet.svg" download>Emporter l’estampe</a>' : ''}
      <a class="text-link" href="mailto:${contactEmail}">${contactEmail}</a>
    </div>
  </footer>
</body>
</html>
`;
}

export function homePage() {
  return `<main id="contenu" tabindex="-1">
    <section class="studio" aria-labelledby="studio-title">
      <figure class="workbench" data-plotter>
        <div class="paper-sheet">
          <div class="studio-copy">
            <p class="kicker studio-location">Fribourg</p>
            <h1 id="studio-title" class="studio-title">Atelier <span>informatique</span></h1>
            <p class="studio-intro">Je suis Diego. Je crée des sites web, des applications et des automatisations IA en Suisse romande.</p>
            <nav class="service-index" id="metiers" aria-label="Les trois métiers Helvnet">
              ${offerings.map((offer) => `<a id="metier-${offer.id}" href="${offer.path}">${offer.name}<span class="thread-line" data-thread="${offer.id}" aria-hidden="true"></span></a>`).join('')}
            </nav>
          </div>
          <div class="studio-drawing">${plotterScene()}</div>
        </div>
        <figcaption class="bench-controls">
          <div class="bench-caption"><strong>Le traceur de Gruyère</strong><span>Un relief imaginaire des Préalpes fribourgeoises</span></div>
          <div class="plotter-controls" data-plotter-controls hidden>
            <div class="plotter-range"><label for="relief">À plat</label><input type="range" min="0" max="100" value="0" id="relief" aria-label="Hauteur du relief" aria-valuetext="À plat"><span>En relief</span><output for="relief" aria-hidden="true">00 %</output></div>
            <button type="button" class="button plotter-toggle">Soulever le dessin</button>
          </div>
        </figcaption>
        <script type="application/json" data-terrain>${JSON.stringify({ sole: terrain.sole, rise: terrain.rise, trail: terrain.trail })}</script>
      </figure>
    </section>
    <div class="wrap">
      ${workReport()}
      <section class="atelier-note" id="atelier" aria-label="Un mot de Diego">
        <p>Je suis passé de l’électronique au logiciel en gardant le goût des mécanismes que l’on peut observer. Comme coach, je connais les plannings de salle, les inscriptions qui bougent et les demandes qu’il faut préciser.</p>
        <p class="signature">Diego</p>
      </section>
      <section class="closing" aria-label="Emporter l’estampe ou parler de votre projet">
        <div><a class="text-link print-link" href="/assets/estampe-helvnet.svg" download>Emporter l’estampe</a><p>Gravure à plat · SVG</p></div>
        <a class="button" href="${contactPath}">Demander un devis</a>
      </section>
    </div>
  </main>`;
}

export function servicePage(offer) {
  const proofs = { web: publicSchedule, application: registry, ia: guidedRequest };
  const proofNames = { web: 'Consulter l’horaire', application: 'Essayer le registre', ia: 'Traiter un message' };
  return `<main id="contenu" class="wrap service-page service-page--${offer.id}" tabindex="-1">
    <a class="text-link back-link" href="/#metier-${offer.id}">Retour au traceur</a>
    <header class="service-heading">
      <div><h1>${offer.name}</h1><p>${offer.intro}</p></div>
      <div class="service-brief"><p>${offer.scope}</p><div class="service-actions"><a class="button" href="${contactPath}?axe=${offer.id}">Demander un devis</a><a class="text-link" href="#${offer.section}">${proofNames[offer.id]}</a></div></div>
    </header>
    ${offer.id === 'web' ? workReport() : ''}
    ${proofs[offer.id]()}
    <nav class="service-navigation" aria-label="Les autres métiers">
      ${offerings.filter((other) => other !== offer).map((other) => `<a class="text-link" href="${other.path}">${other.name}</a>`).join('')}
      <a class="button" href="${contactPath}?axe=${offer.id}">Demander un devis</a>
    </nav>
  </main>`;
}

function figureText({ title, caption }) {
  return `<figcaption class="figure-caption"><h2>${title}</h2><p>${caption}</p></figcaption>`;
}

export function projectPage(project) {
  const next = project === nh ? kebab : nh;
  const isRestaurant = project === kebab;
  const cover = isRestaurant ? project.details[0] : project.cover;
  const details = isRestaurant ? [project.cover, project.details[1]] : project.details;
  return `<main id="contenu" class="wrap project" tabindex="-1">
    <a class="text-link back-link" href="/#realisations">Toutes les réalisations</a>
    <header class="project-heading">
      <div><p class="kicker">Réalisation web · ${project.sector}</p><h1>${project.name}</h1></div>
      <div class="project-intro"><p>${project.need}</p><p>${project.role}</p></div>
    </header>
    <figure class="project-cover">
      <div class="project-cover-art${isRestaurant ? ' project-cover-art--phone' : ''}">${isRestaurant ? `<div class="phone-capture">${projectImage(cover, { eager: true, sizes: '(min-width: 48rem) 320px, 66vw' })}<span class="capture-mark capture-mark--call" aria-hidden="true"></span></div>` : projectCover(cover)}</div>
      ${figureText(cover)}
    </figure>
    <div class="project-details">
      ${details.map((detail) => {
        return `<figure class="project-detail${isRestaurant ? ' project-detail--wide' : ''}">
          <div class="detail-image"><div class="detail-capture">${projectImage(detail, { sizes: isRestaurant ? '(min-width: 82rem) 1248px, 94vw' : '(min-width: 64rem) 630px, 90vw' })}${isRestaurant ? '' : '<span class="capture-mark capture-mark--quote" aria-hidden="true"></span>'}</div></div>
          ${figureText(detail)}
        </figure>`;
      }).join('')}
    </div>
    <div class="project-actions">
      ${project.url ? `<a class="text-link" href="${project.url}">Voir le site<span class="visually-hidden"> de ${project.name}</span></a>` : ''}
      <a class="button" href="${contactPath}?axe=web">Demander un devis</a>
    </div>
    <nav class="project-navigation" aria-label="Continuer à explorer">
      <a class="text-link" href="/#realisations">Toutes les réalisations</a>
      <a class="text-link" href="${projectPath(next.slug)}">${next.name}</a>
    </nav>
  </main>`;
}

export function contactPage() {
  return `<main id="contenu" class="wrap contact" tabindex="-1">
    <div class="contact-intro">
      <p class="kicker">Demande de devis</p>
      <h1>Qu’aimeriez-vous créer ou simplifier&nbsp;?</h1>
      <p>Décrivez votre besoin en quelques lignes. On pourra préciser le périmètre ensemble et je vous proposerai un devis sur mesure.</p>
      <a class="text-link contact-address" href="mailto:${contactEmail}">${contactEmail}</a>
    </div>
    <div class="contact-panel">
      <a class="button" href="${emailDraft}" data-email-draft>Préparer ma demande par e-mail</a>
      <form class="contact-form" data-quote-form hidden>
        <fieldset class="contact-axes"><legend>Quel axe vous intéresse&nbsp;?</legend>
          ${offerings.map((offer) => `<label><input type="checkbox" name="axis" value="${offer.id}" data-label="${offer.name}">${offer.name}</label>`).join('')}
          <label><input type="checkbox" name="axis" value="ensemble" data-label="À définir ensemble">À définir ensemble</label>
        </fieldset>
        <div class="contact-fields">
          <label>Nom<input name="name" required autocomplete="name" maxlength="100"></label>
          <label>E-mail<input name="email" type="email" required autocomplete="email" maxlength="254"></label>
          <label class="full-field">Votre besoin<textarea name="project" rows="4" required maxlength="1200"></textarea></label>
        </div>
        <p class="contact-help" id="draft-help">Votre messagerie ouvrira un brouillon que vous pourrez relire avant de l’envoyer.</p>
        <button class="button" type="submit" aria-describedby="draft-help">Préparer ma demande par e-mail</button>
      </form>
    </div>
  </main>`;
}
