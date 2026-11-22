export const projects = [
  {
    slug: 'nh-installation',
    name: 'NH Installation',
    sector: 'Électricité à Fribourg',
    summary: 'De la découverte des interventions à la description d’un chantier.',
    description: 'Un site vitrine pour présenter les interventions de NH Installation et guider une demande de devis, du type de travaux à la commune et au délai.',
    need: 'La personne qui prépare des travaux doit pouvoir vérifier que l’électricien intervient sur son type de chantier, puis lui expliquer ce dont elle a besoin.',
    role: 'J’ai conçu et développé la vitrine, de la présentation des interventions à la demande de devis.',
    url: 'https://nh-installation.ch/',
    poster: {
      file: 'nh-tableaux', width: 1100, height: 400, small: 550, medium: 760,
      alt: 'Câbles et bornier électrique en gros plan, tirés de la galerie de NH Installation.',
    },
    cover: {
      file: 'nh-accueil', width: 1440, height: 728, small: 760,
      mobile: { file: 'nh-accueil-detail', width: 800, height: 558, small: 400 },
      alt: 'Accueil de NH Installation avec la présentation des interventions et le bouton bleu « Demander un devis ».',
      title: 'Passer de l’intervention au devis',
      caption: 'L’accueil nomme les interventions sous le titre. Le bouton de devis est placé juste en dessous, au moment où le visiteur a reconnu son besoin.',
    },
    details: [
      {
        file: 'nh-devis', width: 896, height: 990, small: 520,
        alt: 'Formulaire de NH Installation avec les champs commune, type de demande, délai souhaité et message.',
        title: 'Décrire le chantier',
        caption: 'La commune, le type de demande et le délai souhaité ont chacun leur champ. Le message sert à préciser les travaux et les particularités du lieu.',
      },
    ],
  },
  {
    slug: 'kebab-paradise',
    name: 'Kebab Paradise',
    sector: 'Restaurant à Bulle',
    summary: 'La carte en images, l’appel à portée de pouce.',
    description: 'La vitrine de Kebab Paradise à Bulle, avec une carte illustrée et un bouton d’appel accessible pendant la consultation sur téléphone.',
    need: 'La personne qui a faim doit pouvoir choisir son repas en parcourant la carte, puis appeler le restaurant pour commander.',
    role: 'J’ai conçu et développé la vitrine, avec une carte illustrée et un accès direct à l’appel.',
    url: 'https://kebab-paradise.ch/',
    poster: {
      file: 'kebab-carte-detail', width: 1100, height: 400, small: 550, medium: 760,
      alt: 'Gros plan sur les photos de la carte de Kebab Paradise, dont le kebab et le dürüm.',
    },
    cover: {
      file: 'kebab-carte', width: 1440, height: 660, small: 760,
      mobile: { file: 'kebab-carte-detail', width: 1100, height: 400, small: 550, medium: 760 },
      alt: 'Plats de Kebab Paradise présentés côte à côte dans une grille de photographies légendées.',
      title: 'Choisir à partir de la carte',
      caption: 'Chaque famille de plats associe une photo, un nom et une courte description. On peut comparer aussitôt le kebab et le dürüm.',
    },
    details: [
      {
        file: 'kebab-mobile', width: 780, height: 1552, small: 390,
        alt: 'Carte de Kebab Paradise sur téléphone avec le bouton « Appeler » au bas de l’écran.',
        title: 'Appeler pendant la lecture',
        caption: 'Sur téléphone, « Appeler » reste au bas de l’écran pendant que l’on parcourt la carte. On peut passer commande depuis le plat que l’on regarde.',
      },
      {
        file: 'kebab-accueil', width: 1440, height: 900, small: 760,
        alt: 'Accueil de Kebab Paradise sur ordinateur avec le titre « Le Paradis au centre de Bulle » et le lien vers la carte.',
        title: 'La vue d’ensemble sur ordinateur',
        caption: 'L’accueil réunit le lieu, l’accès à la carte et la commande. Ces actions restent visibles dans la navigation en haut.',
      },
    ],
  },
];
