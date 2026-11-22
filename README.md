# Helvnet

Vitrine de l’atelier informatique de Diego en Suisse romande. Le traceur de Gruyère ouvre sur le développement web, les applications sur mesure et l’automatisation avec l’IA.

## Prévisualiser en local

Utilisez Node.js 22 ou une version plus récente. Depuis le dossier du projet, lancez la commande suivante dans PowerShell.

```powershell
npm.cmd run preview
```

La commande génère les pages puis démarre le serveur. [Ouvrir la prévisualisation](http://127.0.0.1:4173/)

`npm.cmd run build` génère les sept pages et l’estampe SVG dans `dist/`. Pour Netlify, `netlify.toml` déclare la commande et le dossier à publier. La compilation génère le sitemap et les redirections des anciennes adresses.

## Essayer la démonstration

1. Dans l’automatisation, validez l’exemple « Deux places » pour la séance du jeudi à 18 h.
2. Ouvrez l’horaire public pour voir « Complet », puis le registre pour retrouver la séance à 6/6.
3. Annulez l’inscription dans le registre. La séance revient à 4/6 et l’horaire affiche à nouveau deux places.

La salle et les messages sont fictifs. Les exemples utilisent des extractions préparées. Les corrections, le contrôle de capacité et les inscriptions s’exécutent dans le navigateur. Les trois vues conservent les modifications dans le même onglet pendant les changements de page et les rechargements. « Recommencer la démo » rétablit l’état initial.

## Modifier le site

- `src/terrain.mjs` génère le champ de hauteur, les courbes de niveau et le tracé rouge. `src/engraving.mjs` produit la scène et le fichier à emporter à partir de ces coordonnées.
- `src/assets/demo-model.js` porte les règles communes de disponibilité, de validation et d’annulation. `src/demo-views.mjs` construit les trois interfaces.
- `src/projects.mjs` et `src/assets/projets/` contiennent les textes et captures authentiques des deux réalisations. [NH Installation](https://nh-installation.ch/) · [Kebab Paradise](https://kebab-paradise.ch/)
- `src/config.mjs` centralise le domaine, le destinataire des devis et les redirections.

## Réception des devis

Le bouton prépare un brouillon dans la messagerie du visiteur, à destination de `contact@helvnet.ch`. L’adresse figure dans la configuration de l’ancienne vitrine. Vérifiez la réception de cette boîte avant la mise en ligne.
