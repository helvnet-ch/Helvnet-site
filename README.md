# Helvnet

Vitrine de Diego Vicente, développeur en Suisse romande. Une galerie interactive présente les sites web, les applications et les intégrations IA.

## Prévisualiser

PowerShell avec Node.js 22 ou une version plus récente.

```powershell
npm.cmd run preview
```

[Ouvrir la prévisualisation](http://127.0.0.1:4173/). La commande génère cinq pages statiques dans `dist/` avant de démarrer le serveur.

## Parcours

- Les flèches, les noms sous la galerie et le glissement horizontal changent de service. Les filaments de la sphère ondulent et la sphère se resserre en traversant une traînée avant de se reformer dans la couleur suivante. L’animation se met en pause quand l’onglet est masqué et respecte le réglage de mouvement réduit.
- La molette verticale ouvre le service puis avance entre sa présentation, sa démo et ses capacités. La sphère accompagne le passage entre les écrans et se reflète sur le sol vert. Sur téléphone, le bouton d’exploration et le glissement vers le haut ouvrent le service. Les onglets restent accessibles à chaque étape.
- Chaque service possède une adresse directe. Les exemples illustrent un formulaire responsive, une demande affectée à un créneau et une fiche préparée depuis un e-mail.
- Le bouton « Demander un devis » présélectionne le service courant. Le visiteur peut ouvrir un brouillon dans sa messagerie ou copier le texte.

## Sources

- `src/pages.mjs` construit l’accueil, les menus, les pages de service et le devis.
- `src/offerings.mjs` contient les intitulés, les textes et les routes des trois domaines.
- `src/assets/experience.js` pilote les écrans, les gestes et l’historique. `src/assets/energy-orb.js` dessine la sphère, sa traînée et leur reflet. `src/assets/scene-motion.js` calcule les positions dans le décor et les trajectoires entre les écrans.
- `src/demo-views.mjs` et `src/assets/examples.js` contiennent les trois exemples fictifs. Ils fonctionnent dans le navigateur.
- `src/config.mjs` centralise le domaine, le destinataire des devis et les redirections.
