# Onboarding club — handoff design → React

Objectif : reproduire **pixel perfect** le parcours d'inscription d'un club (3 étapes), en mobile (390 px) et desktop (1280 px).

## Contenu
- `sources/` : les 6 écrans en HTML. **Source de vérité** : chaque valeur (px, couleurs, espacements) est dans les attributs `style="..."` et le bloc `<style>`. Ignorer `<x-dc>`, `<helmet>`, `support.js` et le `<script type="text/x-dc">` (outillage du canvas, sans effet visuel).
  - Mobile : `Club` (étape 1), `Club2` (étape 2), `Club3` (étape 3)
  - Desktop : `ClubDesktop`, `ClubDesktop2`, `ClubDesktop3`
- `screenshots/` : rendu de référence de chaque écran (PNG @2x) pour comparer.
- `tokens.css` : variables CSS (couleurs, polices, rayons, ombres). À importer et à utiliser à la place des valeurs en dur.

## Règles
1. Reprendre les valeurs numériques des `sources/` telles quelles : tailles, paddings, gaps, line-height, letter-spacing, rayons, épaisseurs de bordure. Ne rien arrondir ni « améliorer ».
2. Remplacer les hex en dur par les variables de `tokens.css` (même valeur).
3. Polices : Archivo (titres, logo, graisse 900) et Hanken Grotesk (texte). Charger via Google Fonts (cf. `tokens.css`).
4. Pas de bibliothèque UI : composants maison, CSS Modules ou le système déjà présent dans le projet.
5. Comparer chaque écran au PNG correspondant (même largeur de viewport, pixel ratio 2) et corriger les écarts.

## Responsive
- Mobile : largeur de référence **390 px**, hauteur 844 px. Pile verticale : en-tête, indicateur d'étape, titre, champs ; barre d'actions collée en bas (fond blanc, bordure haute 1 px `--line`, bouton pleine largeur 52 px).
- Desktop : largeur de référence **1280 px**. Colonne gauche (logo, lien Retour, indicateur d'étape, grand titre + sous-titre) et colonne droite = carte formulaire blanche (bordure 2 px `--ink`, ombre dure 6 px, rayon ~28 px, bouton Suivant aligné à droite).
- Le breakpoint entre les deux n'est pas dessiné : proposer ~900 px (desktop au-dessus, mobile en dessous), et valider avec l'utilisateur.

## Comportement
- Une seule étape visible à la fois : state `step` (1 à 3), boutons **Précédent** / **Suivant** (Précédent absent à l'étape 1).
- Indicateur : 3 segments (6 px de haut, rayon 3 px), segment actif `--red`, les autres `--line`, libellé « Étape N sur 3 » en 12 px, majuscules, letter-spacing .08em.
- Étape 1 : nom du club, disciplines (chips multi-sélection), ville, code postal, fédérations (chips multi-sélection). Chip actif : fond `--ink`, texte `--canvas`, préfixe « ✓ » ; inactif : fond blanc, bordure `--line-strong`.
- Étape 2 et 3 : voir `sources/Club2` et `Club3` (étape 3 = « Contact pour organiser le combat »).
- Lien « Retour » à l'étape 1 → écran de choix du profil ; liens et données d'exemple sont des maquettes, à remplacer par le vrai routage et le vrai état.
- Périmètre v1 : France uniquement, pas de messagerie interne, pas de compte combattant.

## Prompt conseillé pour Claude dans VS Code
> Lis `README.md`, `tokens.css`, puis chaque fichier de `sources/` et chaque capture de `screenshots/`. Implémente le parcours d'onboarding club en React (un composant par étape + un composant de page qui gère le step), responsive mobile/desktop, en reprenant exactement les valeurs des sources. Ensuite lance l'app, fais une capture à 390 px et à 1280 px et corrige les écarts avec les PNG.
