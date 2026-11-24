# Helvnet

Vitrine de Diego Vicente, développeur en Suisse romande. Une galerie interactive présente les sites web, les applications et les intégrations IA.

## Prévisualiser

PowerShell avec Node.js 22 ou une version plus récente.

```powershell
npm.cmd run preview
```

[Ouvrir la prévisualisation](http://127.0.0.1:4173/). La commande génère cinq pages statiques dans `dist/` avant de démarrer le serveur.

## Parcours

- Les flèches, les noms sous la galerie et le glissement horizontal font tourner trois volumes de filaments. Les filaments s’étirent dans le sens du déplacement, puis se relâchent. L’animation se met en pause quand l’onglet est masqué et respecte le réglage de mouvement réduit.
- La molette verticale ouvre le service puis avance entre sa présentation, sa démo et ses capacités. La sculpture accompagne le passage entre les écrans et conserve son reflet. Sur téléphone, le bouton d’exploration et le glissement vers le haut ouvrent le service.
- Chaque service possède une adresse directe. Les exemples illustrent un formulaire responsive, une demande affectée à un créneau et une fiche préparée depuis un e-mail.
- Le bouton « Demander un devis » présélectionne le service courant. Le visiteur peut ouvrir un brouillon dans sa messagerie ou copier le texte.

## Sources

- `src/pages.mjs` construit l’accueil, les menus, les pages de service et le devis.
- `src/offerings.mjs` contient les intitulés, les textes et les routes des trois domaines.
- `src/assets/experience.js` pilote les écrans, les gestes et l’historique. `src/assets/energy-orb.js` dessine les filaments, leur déformation et leur reflet. `src/assets/scene-motion.js` calcule leur vitesse et leur trajectoire entre les écrans.
- `src/demo-views.mjs` et `src/assets/examples.js` contiennent les trois exemples fictifs. Ils fonctionnent dans le navigateur.
- `src/config.mjs` centralise le domaine, le destinataire des devis et les redirections.

## Hébergement et référencement

[Audit SEO et mise en ligne sur Keywest](docs/audit-seo.md).
