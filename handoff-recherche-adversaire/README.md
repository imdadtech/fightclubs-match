# Recherche d'adversaire — handoff design → React

Objectif : reproduire **pixel perfect** le parcours « Recherche d'adversaire » (critères → résultats → fiche → proposition → notification → contact débloqué), en mobile (390 px) et desktop (1280 px).
La spec fonctionnelle (règles de matching, données, critères d'acceptation, questions ouvertes) est fournie à part : **elle fait foi pour le comportement, ce dossier fait foi pour le rendu.**

## Contenu
- `sources/` : 10 écrans en HTML. Chaque valeur (px, couleurs, espacements) est dans les attributs `style="..."` et le bloc `<style>`. Ignorer `<x-dc>`, `<helmet>`, `support.js` et le `<script type="text/x-dc">` (outillage du canvas, sans effet visuel).
- `screenshots/` : rendu de référence de chaque écran (PNG @2x), à comparer au rendu React (même largeur de viewport, pixel ratio 2).
- `tokens.css` : variables CSS (couleurs, polices, rayons, ombres) à importer et à utiliser à la place des hex en dur.

| Écran | Mobile (390×844) | Desktop (1280×880) |
| --- | --- | --- |
| Critères de recherche | `RechercheCriteres` | `RechercheCriteresDesktop` |
| Résultats | `Recherche` | `RechercheDesktop` |
| Fiche adversaire | `Fiche` | `FicheDesktop` |
| Notifications (réception de la proposition) | `Notifications` | `NotificationsDesktop` |
| Contact débloqué | `Contact` | `ContactDesktop` |

## Règles de reproduction
1. Reprendre les valeurs numériques des sources telles quelles : tailles, paddings, gaps, line-height, letter-spacing, rayons, bordures. Ne rien arrondir ni « améliorer ».
2. Remplacer les hex en dur par les variables de `tokens.css` (même valeur).
3. Polices : Archivo (titres, logo, grands chiffres, graisse 800-900) et Hanken Grotesk (texte, 400-700), via Google Fonts (cf. `tokens.css`).
4. Pas de bibliothèque UI : composants maison, CSS Modules ou le système de style déjà présent dans le projet.
5. Les données des sources (Yanis M., Karim B., « 24 combattants », etc.) sont des exemples : elles viennent de l'API, pas du code.

## Mise en page
- **Mobile** : colonne unique, hauteur fixe 844 px dans la maquette ; en vrai la zone de contenu défile entre l'en-tête et la barre du bas. Barre d'onglets basse (Adversaires, Annonces, Notifications, Profil), onglet actif : bordure haute 3 px `--red`, texte `--ink`. Les écrans à action (Critères, Fiche, Contact) ont une barre d'action blanche collée au-dessus de la navigation ou en bas, bordure haute 1 px `--line`.
- **Desktop** : barre latérale de 260 px (fond blanc, bordure droite 1 px `--line`, logo, 4 liens, nom du club en bas) + contenu (padding 40 px 56 px, titre h1 44 px). Lien actif : fond `--red-tint`, texte `--red-deep`, graisse 700. Le point de bascule mobile/desktop n'est pas dessiné : proposer ~900 px.
- **Écrans à formulaire** (Critères desktop) : carte blanche, bordure 2 px `--ink`, rayon 28 px, ombre dure 6 px, grille 2 colonnes (gap 20 px / 16 px). Colonne de droite de 300 px : compteur bleu, bouton « Rechercher », note.

## Composants à factoriser
- **Chip** (choix) : hauteur min 44 px, padding 0 16 px, rayon pilule, texte 600 14 px. Actif : fond et bordure `--ink`, texte `--canvas`, préfixe « ✓ ». Inactif : fond blanc, bordure 2 px `--line-strong`.
- **Champ** (input / select) : hauteur min 48 px, padding 0 14 px, rayon 12 px, bordure 2 px `--line-strong`, texte 500 16 px. Libellé 13 px graisse 700 au-dessus (gap 6 px mobile, 8 px desktop). Placeholder : couleur par défaut du navigateur (« Peu importe », « Sans limite »).
- **Bouton principal** : hauteur min 52 px (56 px dans la colonne de droite desktop), pilule, fond `--red`, texte blanc 700 16 px, bordure 2 px `--ink`, ombre `4px 4px 0 0 --ink`. **Bouton secondaire** : fond blanc, texte `--ink`, sans ombre (ombre 3 px sur les petits boutons « Voir la fiche »). **Bouton de confirmation** : même forme, fond `--success`.
- **Carte combattant (résultat)** : fond blanc, rayon 20 px, ombre douce `0 1px 0 --line, 0 10px 24px -12px rgba(36,22,15,.25)`. Avatar rond aux initiales (44 px mobile, 52 px desktop, fond `--blue-tint`, bordure 2 px `--blue`), nom Archivo 800, club en `--ink-muted` 13 px, catégorie commune en Archivo 900 (24 px mobile, 28 px desktop), verdict 12 px 700 (vert `--success` avec « ✓ » pour « Très compatible », `--ink` pour « Compatible »), bouton « Voir la fiche ». La première carte a le bouton rouge, les suivantes le bouton secondaire (maquette : mise en avant du meilleur résultat).
- **Face-à-face** (Fiche) : deux blocs égaux, « Ton côté » (`--red-tint`, bordure haute 4 px `--red`) et « Adversaire » (`--blue-tint`, bordure haute 4 px `--blue`), pastille « VS » ronde `--ink` au centre.
- **Tableau comparatif** (Fiche) : grille `1fr auto 1fr`, en-tête `--sunken`, lignes séparées par 1 px `--line`, valeurs 700, libellé central 500 `--ink-muted`.
- **Compteur** (Critères desktop, Annonce) : bloc `--blue-tint`, bordure haute 4 px `--blue`, grand chiffre Archivo 900 en `--blue`.
- **Notification urgente** : carte avec bandeau `--tape` (texte majuscules 12 px 800) et bordure 2 px `--ink`, ombre dure. **Nouvelle** : fond `--red-tint`, bordure haute `--red`. **Répondue** : fond blanc, bordure 1 px `--line`.

## Comportements non visibles dans les maquettes
- Le compteur « N combattants » et le libellé du bouton (« Voir N combattants » en mobile, « Rechercher » en desktop) se mettent à jour à chaque changement de critère.
- Choisir un combattant pré-remplit discipline et catégories de poids.
- Champ facultatif vide = pas de limite ; un minimum supérieur au maximum affiche une erreur sous le champ (le style d'erreur n'est pas dessiné : reprendre `--red-deep` pour le texte et la bordure du champ, à valider).
- Les états vides (aucun résultat, club sans combattant) ne sont pas dessinés : voir la spec.
- Aucune coordonnée (WhatsApp, e-mail, téléphone) avant l'acceptation du combat.

## Navigation
- L'onglet « Adversaires » de la barre du bas ouvre l'écran de **critères** ; le bouton principal des critères ouvre les résultats.
- Les résultats (mobile) ont un lien « Modifier la recherche » dans le bloc « Pour ton combattant », qui ramène aux critères (en desktop : dans le panneau de gauche).

## Points à noter
- Le panneau de filtres des résultats montre des filtres de disponibilité (Décembre, Janvier) : ils reprennent la « date souhaitée » des critères.
- La barre latérale desktop de l'espace club (Mes combattants, Ajouter un combattant) n'est pas dans ce dossier.

## Prompt conseillé pour Claude dans VS Code
> Lis la spec « Recherche d'adversaire », puis `README.md`, `tokens.css`, chaque fichier de `sources/` et chaque capture de `screenshots/`. Implémente le parcours en React, responsive mobile/desktop, en reprenant exactement les valeurs des sources. Factorise les composants listés dans le README. Ensuite lance l'app, fais une capture à 390 px et à 1280 px de chaque écran et corrige les écarts avec les PNG.
