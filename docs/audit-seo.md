# Audit SEO de helvnet.ch

Audit du 24 novembre 2026. La référence publique avant correction est la version `928cb8a` servie par Nginx sur Keywest. La version corrigée a été construite localement et vérifiée avec le même Nginx sur Keywest, dans une instance de prévisualisation. L’activation publique requiert une session `sudo` authentifiée.

## Inventaire et chaînes HTTP

Les demandes sont des **GET**. Chaque chaîne indique le premier statut, les destinations de redirection dans l’ordre et le statut final. Les chemins courts désignent `https://helvnet.ch`. Pour une réponse directe, l’URL testée est aussi la destination finale. Dans le tableau, « trois formes » désigne les variantes sans slash, avec slash et avec `.html`. Les fichiers `index.html` sont contrôlés à part.

Le sitemap de `4fe0375` annonçait l’accueil, les pages historiques de services, de méthode, de présentation et de contact, ainsi que quatre démos. La génération de `f4e6e6d` publiait les études de cas `/projets/nh-installation/` et `/projets/kebab-paradise/`. Le chemin `/projets/` a également été testé. Les deux arbres Git ont été conservés.

Les deux journaux Nginx accessibles sont partagés entre plusieurs sites. Parmi 319 requêtes GET ou HEAD ayant un référent explicite sur Helvnet, aucune n’a révélé de chemin historique supplémentaire. Ce filtre ne couvre pas les accès directs ni les visites issues d’un moteur de recherche.

| URL ancienne ou variante | Ancien contenu ou intention | Avant sur le domaine public | Après sur Nginx en prévisualisation | Action et justification |
| --- | --- | --- | --- | --- |
| `/services`, trois formes | Anciennes offres de création de sites | 301 → `/#metiers` → 200 | **301 → `/developpement-web/` → 200** | Le service Web reprend la création et la refonte. |
| `/creation-site-web`, trois formes | Alias de création de sites | 301 → `/developpement-web/` → 200 | 301 → `/developpement-web/` → 200 | Le service conserve la même intention. |
| `/approche`, trois formes | Méthode de création de site, du premier échange au devis | 301 → `/#atelier` → 200 | 301 → `/developpement-web/` → 200 | La page Web explique les prestations, les éléments à préparer et le devis. |
| `/a-propos`, trois formes | Présentation de Diego et de Helvnet | 301 → `/#atelier` → 200 | 301 → `/#atelier` → 200 | La section Atelier présente la même activité et est accessible sans JavaScript. |
| `/contact.html` | Prise de contact | 301 → `/contact/` → 200 | 301 → `/contact/` → 200 | Le devis actuel reprend le parcours de contact. |
| `/merci`, `/merci/`, `/merci.html` | Confirmation de l’envoi de l’ancien formulaire | 404, 404, 301 → `/contact/` → 200, dans l’ordre | 404 sur les trois | Le parcours actuel prépare un e-mail et possède sa propre confirmation. |
| `/realisations`, trois formes | Liste d’exemples et ancien accès au portfolio | 301 → `/#metiers` → 200 | 404 | Le portfolio a été retiré. |
| `/realisations/cafe-brunch`, trois formes et `/realisations/cafe-brunch/index.html` | Accueil d’une démo de café | 404 | 404 | La démo a été retirée. |
| `/realisations/cafe-brunch/boissons`, trois formes | Carte des boissons | 404 | 404 | La carte a été retirée. |
| `/realisations/cafe-brunch/brunch`, trois formes | Carte du brunch | 404 | 404 | La carte a été retirée. |
| `/realisations/cafe-brunch/vins`, trois formes | Carte des vins | 404 | 404 | La carte a été retirée. |
| `/realisations/cafe-brunch/contact`, trois formes | Contact du café fictif | 404 | 404 | Le destinataire était le café de la démo. |
| `/realisations/restaurant-grill`, trois formes et `/realisations/restaurant-grill/index.html` | Accueil d’une démo de restaurant | 404 | 404 | La démo a été retirée. |
| `/realisations/restaurant-grill/apropos`, trois formes | Présentation du restaurant | 404 | 404 | La page présentait le restaurant de la démo. |
| `/realisations/restaurant-grill/contact`, trois formes | Contact du restaurant | 404 | 404 | Le destinataire était le restaurant de la démo. |
| `/realisations/restaurant-grill/menu`, trois formes | Menu du restaurant | 404 | 404 | Le menu a été retiré. |
| `/realisations/nh-installation`, trois formes | Démo d’un électricien et accès à ses prestations | 301 → `/developpement-web/` → 200 | **404** | Le visiteur cherchait des prestations électriques. |
| `/realisations/nh-installation/index.html` | Fichier d’entrée de la même démo | 404 | 404 | La démo a été retirée. |
| `/realisations/nh-installation/a-propos`, `/contact`, `/realisations` et `/services` sous la même démo, trois formes chacune | Présentation, coordonnées, chantiers et services de l’électricien | 404 | 404 | Ces pages relevaient de l’activité de l’électricien. |
| `/realisations/nh-installation/public/__forms.html` | Support de l’ancien formulaire de la démo | 404 | 404 | Le formulaire a été retiré avec la démo. |
| `/realisations/kebab-paradise`, trois formes | Démo de restauration avec carte et contact | 301 → `/developpement-web/` → 200 | **404** | Le visiteur cherchait le restaurant de la démo. |
| `/realisations/kebab-paradise/index.html` | Fichier d’entrée de la même démo | 404 | 404 | La démo a été retirée. |
| `/projets`, trois formes | Racine de l’ancienne famille d’études de cas | 404 | 404 | Le portfolio a été retiré. |
| `/projets/nh-installation`, trois formes | Étude de cas de la vitrine NH Installation | 301 → `/developpement-web/` → 200 | **404** | L’étude de cas a été retirée avec le portfolio. |
| `/projets/kebab-paradise`, trois formes | Étude de cas de la vitrine Kebab Paradise | 301 → `/developpement-web/` → 200 | **404** | L’étude de cas a été retirée avec le portfolio. |
| `/reseaux-sociaux`, `/identite-visuelle`, `/photo-video`, trois formes chacune | Anciens alias d’offres sans page dédiée retrouvée | 301 → `/#atelier` → 200 | 404 | L’offre actuelle compte trois autres services. |
| `/index.html` et `index.html` dans les quatre répertoires canoniques | Doublons des cinq pages | 200 | 301 → page canonique correspondante → 200 | Une seule adresse principale par page. |
| `/404.html` | Document d’erreur consultable en direct | 200 | 404 | Le document d’erreur reste disponible sous le statut 404. |
| `/verification-seo-page-inconnue-2026/` | Adresse inexistante de contrôle | 404 | 404 | La page d’erreur fournit les trois liens de service et un accès au devis. |

Les 121 cas incluent les cinq canoniques, les quatre variantes sans slash, les paramètres de contact, `/#atelier`, les deux fichiers d’indexation et les variantes d’hôte. La prévisualisation Node a couvert les 112 cas sans variante d’hôte.

| Vérification | Avant sur le domaine public | Après sur Nginx en prévisualisation |
| --- | --- | --- |
| HTTP sans www, HTTP avec www et HTTPS avec www sur `/services` | 301 → `https://helvnet.ch/services` → 301 → `https://helvnet.ch/#metiers` → 200 | **301 → `https://helvnet.ch/developpement-web/` → 200** |
| Ces trois variantes d’hôte sur `/` et `/contact/?axe=ia` | 301 → la même adresse en HTTPS sans www → 200 | Même chaîne. |
| `/developpement-web`, `/applications-sur-mesure`, `/automatisation-ia`, `/contact` | 301 → la même adresse avec slash → 200 | Même chaîne. |
| `/services?source=controle` | 301 → `/#metiers` → 200 | 301 → `/developpement-web/?source=controle` → 200 |
| `/a-propos.html?source=controle` | 301 → `/#atelier` → 200 | 301 → `/?source=controle#atelier` → 200 |
| `/contact?axe=ia` | 301 → `/contact/?axe=ia` → 200 | Même chaîne. |
| `/contact/?axe=web`, `?axe=application`, `?axe=ia` | 200 avec la canonique `/contact/` | 200 avec la canonique `/contact/`. Les trois présélections ont été vérifiées dans le formulaire. |
| `/robots.txt` et `/sitemap.xml` | 200 | 200. Le sitemap ne contient que les cinq canoniques. |

Le premier GET de `/services` avant correction a renvoyé `301` et `Location: https://helvnet.ch/#metiers`. Le statut correspond à la directive active de `/etc/nginx/snippets/helvnet-redirects.conf`. La réponse examinée portait `X-Helvnet-Origin: keywest` sans en-tête `Age`. L’hôte en production servait les fichiers avec `try_files` et une vraie erreur 404. La 404 signalée sur cette adresse n’a pas été reproduite lors de l’audit. Un cache local ayant mémorisé une ancienne 301 peut conserver l’ancienne destination jusqu’à son expiration. [Redirections et recherche Google](https://developers.google.com/search/docs/crawling-indexing/301-redirects?hl=fr)

## Pages et performances

- Les cinq pages répondent en HTML statique avec un titre distinct, un H1 visible, une méta-description et une canonique absolue. Les services, leurs exemples, les livrables et le contact sont lisibles sans exécuter les démos. Les liens vers les trois services, le devis et `/#atelier` ont été vérifiés. Les titres et canoniques suivent aussi les changements de page dans la galerie.
- Six formats d’écran de 320 × 568 à 1440 × 900 ont été contrôlés dans Edge. La rotation, les gestes tactiles, la navigation, les trois démos et les trois choix du devis ont été rejoués. Le lien e-mail reste utilisable sans JavaScript. La présélection s’applique au formulaire interactif.
- Les cinq réponses 200 sont explorables. Le HTML est en `fr-CH`, le logo a un texte alternatif et des dimensions déclarées, et le JSON-LD de l’accueil identifie Helvnet, le site, Diego Vicente et le logo de marque de 512 × 512 px. [Données structurées d’organisation](https://developers.google.com/search/docs/appearance/structured-data/organization?hl=fr) · [URL canoniques](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls?hl=fr)
- Une recherche de motifs tarifaires dans le répertoire actif de Keywest avant correction et dans les fichiers générés après correction n’a trouvé aucun ancien prix, forfait ou abonnement. Le build inclut les ressources utilisées par la galerie et ses démos actuelles. Les anciennes réalisations restent dans l’historique Git.
- Les modules d’interaction des démos et du devis sont chargés à l’ouverture de leurs écrans. Les filaments et le reflet utilisent le même moteur d’animation. Helvetica reste la police déclarée, avec Arial en seconde option et aucun fichier de police téléchargé.

Mesures de laboratoire sur l’accueil, trois chargements à cache désactivé par version dans Edge, 390 × 844 px, densité 2, débit descendant 1,6 Mbit/s, latence 150 ms, CPU ralenti quatre fois. Les deux versions ont été servies par le même type de serveur local. Le LCP est calculé sur le texte de présentation et le total inclut le document, les ressources et les en-têtes mesurés par le navigateur.

| Mesure | Avant | Après |
| --- | ---: | ---: |
| LCP médian | 3,35 s | 1,36 s |
| LCP, plage des trois essais | 1,72 à 3,64 s | 1,18 à 1,66 s |
| CLS, trois essais | 0 | 0 |
| Octets transférés, médiane | 109 761 | 108 777 |
| Modules démo et devis sur l’accueil | 6 045 octets | 0 octet |

Les mesures de terrain et le rapport Core Web Vitals restent à consulter dans la propriété Search Console.

## Vérification et configuration Keywest

Les règles exactes sont générées depuis `src/config.mjs`. Le modèle `deploy/nginx/helvnet.conf` est celui du vhost Keywest. Il maintient les certificats, le chemin ACME et les en-têtes en place. Il sert directement les cinq fichiers canoniques, ce qui évite une boucle lors des redirections de `index.html`.

Depuis une copie du dépôt contenant le commit à publier, créer l’archive de livraison.

```bash
npm run build
revision=$(git rev-parse HEAD)
bundle=$(mktemp -d)
cp -r dist "$bundle"
node scripts/nginx-config.mjs site "/var/www/helvnet/releases/$revision" > "$bundle/helvnet.conf"
node scripts/nginx-config.mjs redirects > "$bundle/helvnet-redirects.conf"
tar -czf "helvnet-$revision.tar.gz" -C "$bundle" dist helvnet.conf helvnet-redirects.conf
sha256sum "helvnet-$revision.tar.gz"
```

Sur Keywest, transférer l’archive et `deploy/nginx/activate.sh`. Relever la révision actuellement active dans la directive `root` de `/etc/nginx/sites-available/helvnet`. Exécuter sous `sudo` avec l’archive, la révision à publier, la révision active attendue et le SHA256 calculé.

```bash
sudo bash activate.sh "helvnet-$revision.tar.gz" "$revision" "$revision_active" "$sha256"
```

Le script sauvegarde la configuration active, installe `helvnet.conf` dans `/etc/nginx/sites-available/helvnet` et `helvnet-redirects.conf` dans `/etc/nginx/snippets/helvnet-redirects.conf`, puis valide Nginx avant de le recharger. Il vérifie les réponses HTTPS sur Keywest et restaure les deux fichiers si la validation échoue. Utiliser les fichiers Nginx générés pour cette version. Le précédent outil de publication tirait ses règles du fichier Netlify `dist/_redirects`.

Commandes de contrôle par GET. Sur Windows, utiliser `curl.exe` et remplacer `/dev/null` par `NUL`.

```bash
curl -sS -D - -o /dev/null https://helvnet.ch/services
curl -sS -L -D - -o /dev/null http://www.helvnet.ch/services/
curl -sS -L -D - -o /dev/null 'https://helvnet.ch/contact?axe=ia'
curl -sS -D - -o /dev/null https://helvnet.ch/realisations/cafe-brunch/boissons
curl -sS -D - -o /dev/null https://helvnet.ch/projets/nh-installation/
curl -sS -D - -o /dev/null https://helvnet.ch/verification-seo-page-inconnue-2026/
curl -fsS https://helvnet.ch/robots.txt
curl -fsS https://helvnet.ch/sitemap.xml
```

Les chemins peuvent être contrôlés localement sur le port de `npm run preview`. Les variantes de domaine nécessitent le vhost Nginx. Le test isolé sur Keywest a utilisé un certificat de test explicitement approuvé par le client et des ports de boucle locale. Les corps des cinq réponses ont été comparés aux fichiers générés, ainsi que ceux du logo, du sitemap, de `robots.txt` et d’une 404. Le chemin ACME a aussi été testé.

## Google Search Console après déploiement

1. Dans la propriété de `helvnet.ch`, soumettre `https://helvnet.ch/sitemap.xml` dans **Sitemaps**. Vérifier la lecture et les cinq URL découvertes. [Créer et envoyer un sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=fr)
2. Inspecter `https://helvnet.ch/`, `https://helvnet.ch/developpement-web/`, `https://helvnet.ch/applications-sur-mesure/`, `https://helvnet.ch/automatisation-ia/` et `https://helvnet.ch/contact/`. Tester l’URL active et demander l’indexation des pages modifiées. À la prochaine exploration, vérifier aussi la canonique choisie par Google dans la version indexée. [Inspection d’URL](https://support.google.com/webmasters/answer/9012289?hl=fr)
3. Si l’un de ces résultats est **encore visible et doit disparaître rapidement**, confirmer sa 404 après la mise en ligne puis utiliser **Supprimer uniquement cette URL** sur l’adresse exacte affichée. Les entrées prioritaires à contrôler dans les anciens sitemaps ou générations sont `https://helvnet.ch/realisations/cafe-brunch/`, `https://helvnet.ch/realisations/restaurant-grill/`, `https://helvnet.ch/realisations/nh-installation/`, `https://helvnet.ch/realisations/kebab-paradise/`, `https://helvnet.ch/projets/nh-installation/` et `https://helvnet.ch/projets/kebab-paradise/`. Pour une carte de café encore affichée, inspecter sa forme exacte, par exemple `https://helvnet.ch/realisations/cafe-brunch/boissons.html`. Laisser Google constater les 404. Réserver le masquage temporaire à ces résultats confirmés. [Outil de suppression](https://support.google.com/webmasters/answer/9689846?hl=fr)
4. Au prochain passage, comparer l’état d’indexation des cinq pages et des anciennes URL, puis vérifier l’actualisation des titres et extraits. Dans **Performances**, filtrer par page et suivre séparément les impressions et clics du Web, des applications et de l’automatisation IA. Comparer deux périodes équivalentes après réexploration.

La soumission, les demandes d’indexation, le contrôle de la canonique choisie, les mesures de terrain et le masquage éventuel exigent l’accès à la propriété. Aucun export Search Console n’était disponible pour établir quels anciens résultats sont encore indexés.

## Fichiers modifiés

- `src/config.mjs` et `src/offerings.mjs` pour les métadonnées, le texte des prestations et les règles de redirection.
- `src/pages.mjs`, `src/demo-views.mjs` et `src/assets/styles.css` pour le contenu HTML, les liens, la page d’erreur et l’adaptation des titres.
- `src/assets/experience.js` pour la navigation et le chargement à la demande. `src/assets/logo-square.png` reprend le logo public de la marque pour le JSON-LD.
- `src/build.mjs` et `scripts/preview.mjs` pour la génération et la prévisualisation.
- `deploy/nginx/helvnet.conf` et `scripts/nginx-config.mjs` pour le vhost et le fichier de redirections Keywest.
- `deploy/nginx/activate.sh` pour installer la livraison et sauvegarder la configuration active.
