import { contactEmail, contactPath, origin, pagesByPath } from './config.mjs';
import { exampleSection } from './demo-views.mjs';
import { offerings } from './offerings.mjs';

const brand = '<a class="brand" href="/" aria-label="Helvnet, accueil"><img src="/assets/logo.png" srcset="/assets/logo-320.png 320w, /assets/logo.png 504w" sizes="152px" width="504" height="62" alt="Helvnet"></a>';
const emailDraft = `mailto:${contactEmail}?subject=${encodeURIComponent('Demande de devis Helvnet')}&amp;body=${encodeURIComponent('Bonjour Diego,\r\n\r\nVoici mon besoin :\r\n\r\nNom :\r\nE-mail :\r\n\r\nMerci,')}`;
const tagline = 'Sites web, applications et intégrations IA sur mesure.';
const organizationId = `${origin}/#helvnet`;
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: 'Helvnet',
      url: `${origin}/`,
      logo: `${origin}/assets/logo-square.png`,
      email: contactEmail,
      founder: { '@type': 'Person', name: 'Diego Vicente' },
      areaServed: ['Fribourg', 'Suisse romande'],
    },
    {
      '@type': 'WebSite',
      '@id': `${origin}/#site`,
      name: 'Helvnet',
      url: `${origin}/`,
      inLanguage: 'fr-CH',
      publisher: { '@id': organizationId },
    },
  ],
};

function attribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

function pageMetadata(path) {
  const { title, description } = pagesByPath.get(path);
  return `data-page-title="${attribute(title)}" data-page-description="${attribute(description)}"`;
}

function contactHref(offer) {
  return offer ? `${contactPath}?axe=${offer}` : contactPath;
}

function quoteLink(offer, settings = '') {
  return `<a class="button button-primary" href="${contactHref(offer)}"${settings}>Demander un devis</a>`;
}

function objectControls() {
  return `<details class="object-settings" data-object-settings hidden>
    <summary>Régler la forme</summary>
    <div class="object-options">
      <label>Teinte <input type="color" data-shade value="#c6ff5c"></label>
      <button class="text-link bare-button" type="button" data-reset-shade>Teintes par service</button>
      <label>Filets <input type="range" id="shape-lines" min="12" max="42" value="28"><output for="shape-lines">28</output></label>
      <label>Ouverture <input type="range" id="shape-opening" min="0" max="100" value="22"><output for="shape-opening">22 %</output></label>
    </div>
  </details>`;
}

export function layout(page, content) {
  const canonical = `${origin}${page.path}`;
  const experience = !page.noindex;
  return `<!doctype html>
<html lang="fr-CH">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${attribute(page.description)}">
  <meta name="theme-color" content="#000000">
  ${page.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fr_CH">
  <meta property="og:site_name" content="Helvnet">
  <meta property="og:title" content="${attribute(page.title)}">
  <meta property="og:description" content="${attribute(page.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${origin}/assets/partage/helvnet.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="La galerie des trois services Helvnet">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="stylesheet" href="/assets/styles.css">
  <script type="module" src="/assets/navigation.js"></script>
  ${experience ? '<script type="module" src="/assets/experience.js"></script>' : ''}
  ${page.home ? `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : ''}
</head>
<body>
  <a class="skip-link" href="#contenu">Aller au contenu</a>
  <header class="site-header">
    <div class="shell header-inner">
      ${brand}
      ${page.home ? `<h1 class="header-tagline" id="gallery-title" tabindex="-1">${tagline}</h1>` : `<p class="header-tagline" id="gallery-title">${tagline}</p>`}
      <details class="site-menu">
        <summary><span class="menu-glyph" aria-hidden="true"></span> Menu</summary>
        <div class="menu-panel">
          <nav aria-label="Navigation principale">
            <a href="/" data-menu-link="gallery"${page.home ? ' aria-current="page"' : ''}>Accueil</a>
            ${offerings.map(({ path, name, id }) => `<a href="${path}" data-menu-link="${id}"${page.offer === id ? ' aria-current="page"' : ''}>${name}</a>`).join('')}
            <a href="/#atelier" data-menu-link="atelier">L’atelier</a>
          </nav>
          ${experience ? objectControls() : ''}
          <p class="menu-identity">Diego Vicente <span aria-hidden="true">/</span> Suisse romande</p>
        </div>
      </details>
      ${quoteLink(page.offer ?? (page.home ? 'web' : undefined), ' data-active-quote')}
    </div>
  </header>
  ${content}
  <footer class="shell site-footer"><a href="/#atelier">L’atelier</a><a href="mailto:${contactEmail}">${contactEmail}</a></footer>
</body>
</html>
`;
}

function art() {
  return `<div class="stage-visuals" aria-hidden="true">
    <div class="energy-fallback" data-energy-fallback>
      ${offerings.map(({ id }) => `<div class="fallback-sculpture" data-fallback-sculpture="${id}"></div>`).join('')}
    </div>
    <canvas class="stage-canvas" data-energy-orb hidden></canvas>
  </div>`;
}

function gallery(page) {
  return `<section class="screen gallery" id="metiers" data-screen="gallery" data-route="/" data-kind="gallery" ${pageMetadata('/')}${page.home ? '' : ' hidden'} aria-labelledby="gallery-title">
    <div class="gallery-interaction" data-swipe-surface>
      <button type="button" class="step-button step-previous" data-step="-1" aria-label="Service précédent" hidden><span aria-hidden="true"></span></button>
      <button type="button" class="step-button step-next" data-step="1" aria-label="Service suivant" hidden><span aria-hidden="true"></span></button>
    </div>
    <div class="gallery-captions">
      ${offerings.map((offer, index) => `<div class="gallery-caption" data-caption="${offer.id}"${index ? ' hidden' : ''}>
        <h2>${offer.name}</h2>
        <p>${offer.summary}</p>
        <a class="button button-outline" href="${offer.path}" data-enter="${offer.id}">${offer.galleryLink} <span class="button-chevron" aria-hidden="true"></span></a>
      </div>`).join('')}
    </div>
    <div class="gallery-dock shell">
      <nav class="service-rail" aria-label="Sélectionner un service">
        ${offerings.map((offer, index) => `<a class="rail-link" href="${offer.path}" data-choice="${offer.id}"${index === 0 ? ' data-active' : ''}><span class="rail-bulb" aria-hidden="true"></span><span>${offer.name}</span></a>`).join('')}
      </nav>
      <p class="gesture-help" data-gesture-help hidden><span class="wheel-mark" aria-hidden="true"></span><span class="wheel-help">Défiler pour ouvrir le service</span><span class="swipe-help">Glisser pour changer de service</span></p>
    </div>
  </section>`;
}

function serviceTabs(offer, current) {
  const routes = [
    [offer.path, 'Présentation', 'service'],
    [`${offer.path}#${offer.section}`, 'Démo', 'demo'],
    [`${offer.path}#capacites-${offer.id}`, 'Capacités', 'capabilities'],
  ];
  return `<div class="service-dock">
    <a class="return-gallery" href="/"> <span class="button-chevron" aria-hidden="true"></span> Tous les services</a>
    <nav class="section-rail" aria-label="Parcours ${offer.name}">${routes.map(([href, label, key]) => `<a href="${href}"${current === key ? ' aria-current="location"' : ''}>${label}</a>`).join('')}</nav>
  </div>`;
}

function serviceScreens(offer, initial) {
  const hidden = initial ? '' : ' hidden';
  const meta = `data-world="${offer.id}" data-service-path="${offer.path}"`;
  return `<section class="screen service-screen service-intro" data-screen="${offer.id}" data-route="${offer.path}" data-kind="service" ${meta} ${pageMetadata(offer.path)}${hidden} aria-labelledby="title-${offer.id}">
    <div class="service-center shell">
      <div class="service-story">
        <p class="eyebrow">Sur mesure</p>
        <h1 id="title-${offer.id}" class="display-heading" tabindex="-1">${offer.heading}</h1>
        <p class="service-description">${offer.description}</p>
        <div class="service-actions"><a class="button button-primary" href="${offer.path}#${offer.section}">Essayer la démo</a>${quoteLink(offer.id)}</div>
      </div>
    </div>
    <div class="shell">${serviceTabs(offer, 'service')}</div>
  </section>
  <section class="screen service-screen demo-screen" data-screen="${offer.id}-demo" data-route="${offer.path}#${offer.section}" data-kind="demo" ${meta}${hidden}>
    <div class="service-center shell">
      ${exampleSection(offer)}
    </div>
    <div class="shell">${serviceTabs(offer, 'demo')}</div>
  </section>
  <section class="screen service-screen capabilities-screen" id="capacites-${offer.id}" data-screen="${offer.id}-capabilities" data-route="${offer.path}#capacites-${offer.id}" data-kind="capabilities" ${meta}${hidden} aria-labelledby="capabilities-${offer.id}">
    <div class="service-center shell">
      <div class="capabilities-content">
        <p class="eyebrow">${offer.name}</p>
        <h2 class="display-heading" id="capabilities-${offer.id}" tabindex="-1">Ce que je peux réaliser</h2>
        <ul class="capability-list">${offer.capabilities.map(([title, description]) => `<li><h3>${title}</h3><p>${description}</p></li>`).join('')}</ul>
        <p class="project-brief">${offer.projectBrief}</p>
        ${quoteLink(offer.id)}
      </div>
    </div>
    <div class="shell">${serviceTabs(offer, 'capabilities')}</div>
  </section>`;
}

function atelier(initial) {
  return `<section class="screen info-screen atelier" id="atelier" data-screen="atelier" data-route="/#atelier" data-kind="atelier"${initial ? '' : ' hidden'} aria-labelledby="atelier-title">
    <div class="shell atelier-inner">
      <p class="eyebrow">Fribourg · Suisse romande</p>
      <h2 class="display-heading" id="atelier-title" tabindex="-1">L’atelier Helvnet</h2>
      <p>Je suis Diego Vicente. Avec Helvnet, j’accompagne les indépendants et les PME de Fribourg et de Suisse romande pour créer un site, développer un outil interne ou automatiser une tâche.</p>
      <p>Vous me décrivez votre façon de travailler. Je vous propose un premier périmètre, puis un devis sur mesure.</p>
      <div class="service-actions">${quoteLink(undefined, ' data-active-quote')}<a class="text-link" href="mailto:${contactEmail}">${contactEmail}</a></div>
    </div>
    <div class="shell"><div class="service-dock"><a class="return-gallery" href="/"><span class="button-chevron" aria-hidden="true"></span> Tous les services</a></div></div>
  </section>`;
}

function contact(initial) {
  return `<section class="screen info-screen quote-screen" data-screen="quote" data-route="${contactPath}" data-kind="quote" ${pageMetadata(contactPath)}${initial ? '' : ' hidden'} aria-labelledby="quote-title">
    <div class="shell contact">
      <div class="contact-intro">
        <p class="eyebrow">Demande de devis</p>
        <h1 class="display-heading" id="quote-title" tabindex="-1">Un devis pour votre projet informatique</h1>
        <p>Indiquez votre objectif, les outils ou le site que vous utilisez déjà et votre échéance si elle est connue. On précise ensemble le périmètre, puis je vous propose un devis.</p>
        <a class="text-link contact-address" href="mailto:${contactEmail}">${contactEmail}</a>
      </div>
      <div class="contact-panel">
        <a class="button button-primary" href="${emailDraft}" data-email-draft>Préparer ma demande par e-mail</a>
        <form class="contact-form" data-quote-form hidden>
          <fieldset class="contact-axes"><legend>De quoi avez-vous besoin&nbsp;?</legend>
            ${offerings.map((offer) => `<label><input type="checkbox" name="axis" value="${offer.id}" data-label="${offer.name}">${offer.name}</label>`).join('')}
            <label><input type="checkbox" name="axis" value="ensemble" data-label="À définir ensemble">À définir ensemble</label>
          </fieldset>
          <div class="contact-fields">
            <label>Nom<input name="name" required autocomplete="name" maxlength="100"></label>
            <label>E-mail<input name="email" type="email" required autocomplete="email" maxlength="254"></label>
            <label class="full-field">Votre besoin<textarea name="project" rows="3" required maxlength="1200"></textarea></label>
          </div>
          <p class="contact-help" id="draft-help">Vous pourrez relire le brouillon dans votre messagerie avant de l’envoyer.</p>
          <div class="contact-actions">
            <button class="button button-primary" type="submit" aria-describedby="draft-help">Préparer ma demande par e-mail</button>
            <button class="text-link bare-button" type="submit" data-copy-request>Copier ma demande</button>
          </div>
          <p class="contact-status" role="status" data-copy-status></p>
          <label class="contact-draft" data-manual-draft hidden>Votre brouillon
            <textarea rows="6" readonly spellcheck="false"></textarea>
          </label>
        </form>
      </div>
    </div>
    <div class="shell"><div class="service-dock"><a class="return-gallery" href="/"><span class="button-chevron" aria-hidden="true"></span> Tous les services</a></div></div>
  </section>`;
}

export function experiencePage(page) {
  const initial = page.offer ?? (page.path === contactPath ? 'quote' : 'gallery');
  return `<main id="contenu" class="experience" data-experience data-current="${initial}" data-mode="${page.offer ? 'service' : initial}" data-world="${page.offer ?? 'web'}" tabindex="-1">
    ${art()}
    ${gallery(page)}
    ${offerings.map((offer) => serviceScreens(offer, page.offer === offer.id)).join('')}
    ${atelier(page.home)}
    ${contact(initial === 'quote')}
    <p class="visually-hidden" data-selection-status role="status"></p>
  </main>`;
}

export function notFoundPage() {
  const page = {
    path: '/404.html', title: 'Page introuvable | Helvnet',
    description: 'Retrouvez les trois services de Helvnet et le formulaire de devis.', noindex: true,
  };
  return layout(page, `<main class="shell not-found" id="contenu" tabindex="-1">
    <h1 class="display-heading">Page introuvable</h1>
    <p>Cette page a été déplacée ou retirée. Retrouvez les services de l’atelier Helvnet.</p>
    <ul>${offerings.map((offer) => `<li><a class="text-link" href="${offer.path}">${offer.galleryLink}</a></li>`).join('')}</ul>
    <div class="service-actions">${quoteLink()}<a class="text-link" href="/">Revenir à l’accueil</a></div>
  </main>`);
}
