# Ajouter un combattant — handoff design → React

Objectif : reproduire **pixel perfect** les écrans de création d'une fiche combattant, en mobile (390 px) et desktop (1280 px). Il y a **deux parcours** qui aboutissent à la même fiche :

1. **Le club saisit la fiche** (espace club connecté) : `Combattants` → `AjoutCombattant` (étape 1/2) → `AjoutCombattant2` (étape 2/2) → retour à `Combattants`.
2. **Le combattant remplit sa fiche via un lien** (page publique, sans compte) : lien « Ou envoie un lien au combattant » → `Combattant` (1/2) → `Combattant2` (2/2) → `Combattant3` (confirmation).

Hypothèses produit : pas de compte combattant en v1, catégories de poids indicatives (grille officielle définie plus tard avec les organisateurs), plusieurs disciplines possibles, palmarès par discipline, France uniquement. La spec fonctionnelle fait foi pour le comportement ; ce dossier fait foi pour le rendu.

## Contenu
- `sources/` : 12 écrans HTML. Toutes les valeurs (px, couleurs, espacements) sont dans les attributs `style="..."` et le bloc `<style>`. Ignorer `<x-dc>`, `<helmet>`, `support.js` et le `<script type="text/x-dc">` (outillage du canvas, sans effet visuel).
- `screenshots/` : rendu de référence de chaque écran (PNG @2x) à comparer au rendu React.
- `tokens.css` : variables CSS (couleurs, polices, rayons, ombres), à utiliser à la place des hex en dur.

| Étape | Mobile (390×844) | Desktop (1280×880) |
| --- | --- | --- |
| Liste des combattants du club | `Combattants` | `CombattantsDesktop` |
| Club : étape 1/2 « Nouveau combattant » | `AjoutCombattant` | `AjoutCombattantDesktop` |
| Club : étape 2/2 « Profil sportif » | `AjoutCombattant2` | `AjoutCombattantDesktop2` |
| Lien : étape 1/2 « Qui es-tu ? » | `Combattant` | `CombattantDesktop` |
| Lien : étape 2/2 « Ton profil sportif » (multi-disciplines, palmarès par discipline, consentement) | `Combattant2` | `CombattantDesktop2` |
| Lien : confirmation | `Combattant3` | `CombattantDesktop3` |

## Règles de reproduction
1. Reprendre les valeurs numériques des sources telles quelles (tailles, paddings, gaps, line-height, rayons, bordures). Ne rien arrondir.
2. Remplacer les hex en dur par les variables de `tokens.css` (même valeur).
3. Polices : Archivo (titres, logo, graisse 800-900) et Hanken Grotesk (texte, 400-700) via Google Fonts.
4. Pas de bibliothèque UI : composants maison, CSS Modules ou le système de style déjà présent.
5. Les données (Yanis M., Rayan K., Boxing Club Belleville…) sont des exemples : elles viennent de l'API.

## Mise en page
- **Mobile, espace club** (`Combattants`, `AjoutCombattant*`) : logo « FightClubs » en haut, puis lien « ← Mes combattants » (formulaires) ; barre d'action blanche en bas (bordure haute 1 px `--line`) ; `Combattants` a en plus la barre d'onglets (Profil actif : bordure haute 3 px `--red`).
- **Mobile, parcours lien** : logo seul, sans navigation ; bandeau rouge clair en haut (`--red-tint`, bordure haute 4 px `--red`) « {club} te demande de compléter ta fiche de combattant. Pas de compte à créer. »
- **Desktop, espace club** : barre latérale 260 px (blanc, bordure droite 1 px `--line`, logo, 4 liens, nom du club en bas ; lien actif fond `--red-tint`, texte `--red-deep`, 700) + contenu (padding 40 px 56 px, h1 44 px). Les formulaires sont en deux colonnes : titre, étape et texte à gauche, carte de formulaire à droite.
- **Desktop, parcours lien** : pas de barre latérale ; grille `480px 1fr` : colonne gauche (logo, « Retour », bandeau, progression, titre), colonne droite : carte de formulaire.
- **Carte de formulaire desktop** : fond blanc, bordure 2 px `--ink`, rayon 28 px, ombre dure 6 px, grille 2 colonnes, boutons alignés à droite en bas de carte.
- Le point de bascule mobile/desktop n'est pas dessiné : proposer ~900 px.

## Composants à factoriser
- **Chip** (choix multiple) : hauteur min 44 px, padding 0 16 px, pilule, 600 14 px. Actif : fond et bordure `--ink`, texte `--canvas`, préfixe « ✓ ». Inactif : fond blanc, bordure 2 px `--line-strong`.
- **Champ** (input / select) : hauteur min 48 px, padding 0 14 px, rayon 12 px, bordure 2 px `--line-strong`, 500 16 px. Libellé 13 px 700 au-dessus (gap 6 px). Deux champs côte à côte : flex 1, gap 10 px.
- **Barre de progression** : segments flex 1, hauteur 6 px, rayon 3 px, gap 6 px ; fait `--red`, à venir `--line` ; libellé « Étape N sur 2 » en 12 px 700 majuscules, `--ink-muted`.
- **Bloc palmarès** (un par discipline cochée, étape 2 club) : carte blanche, rayon 16 px, bordure 1 px `--line`, padding 14 px, titre Archivo 800 16 px « Palmarès · {discipline} », deux champs « Combats amateurs » / « Victoires ».
- **Étape 2 du lien** : mêmes champs que l'étape 2 club (disciplines multiples, un bloc palmarès par discipline cochée) avec en plus la case de consentement. Sur mobile, la zone de contenu défile (`overflow-y: auto`) entre l'en-tête et la barre d'action.
- **Case de consentement** (parcours lien, étape 2) : case 24×24 `accent-color: --red`, texte 14 px, zone cliquable min 44 px.
- **Carte combattant** (liste) : fond blanc, rayon 20 px, ombre douce `0 1px 0 --line, 0 10px 24px -12px rgba(36,22,15,.25)`, avatar rond aux initiales (44 px mobile / 52 px desktop, fond `--red-tint`, bordure 2 px `--red`), nom Archivo 800, infos en `--ink-muted`, statut « ✓ Disponible » (`--success`) ou « Non disponible » (`--ink-muted`). Desktop : grille 3 colonnes, gap 20 px.
- **Bouton principal** : min 52 px, pilule, fond `--red`, texte blanc 700 16 px, bordure 2 px `--ink`, ombre `4px 4px 0 0 --ink`. **Secondaire** (« Précédent ») : fond blanc, texte `--ink`, sans ombre, padding 0 22 px. Dans une barre à deux boutons, le principal prend l'espace restant.
- **Écran de confirmation** : pastille ronde 64 px `--success` avec ✓ blanc, h1 Archivo 900 32 px, texte 16 px `--ink-muted`.

## Comportements non visibles dans les maquettes
- Étape 1 → 2 : validation des champs obligatoires avant « Suivant » (prénom, nom, date de naissance, au moins une catégorie de poids) ; « Précédent » garde les valeurs saisies.
- Étape 2 club : un bloc palmarès apparaît ou disparaît quand on coche ou décoche une discipline ; au moins une discipline requise.
- « Ajouter le combattant » : crée la fiche et revient à la liste, qui affiche le nouveau combattant.
- « Envoyer ma fiche » : désactivé tant que la case de consentement n'est pas cochée.
- Victoires ne peut pas dépasser le nombre de combats (message d'erreur à définir ; proposer `--red-deep` pour texte et bordure).
- Pas d'états vides ni d'erreurs dessinés (club sans combattant, lien expiré) : voir la spec.
- Aucune donnée de contact du combattant n'est demandée.

## Écarts connus entre les maquettes
- `CombattantDesktop` : le lien « Retour » pointe vers l'inscription ; il n'a pas de cible logique pour une page publique (à supprimer ou à remplacer). Le mobile n'a pas de lien « Retour ».
- La liste mobile et la liste desktop n'affichent pas les mêmes infos (disciplines : dans la ligne d'infos en mobile, sur une ligne dédiée en desktop) : c'est voulu, ne pas harmoniser.
- Le bouton « Ajouter un combattant » est en barre basse en mobile et en haut à droite en desktop.

## Prompt conseillé pour Claude dans VS Code
> Lis la spec, puis `README.md`, `tokens.css`, chaque fichier de `sources/` et chaque capture de `screenshots/`. Implémente les deux parcours « Ajouter un combattant » (club connecté et lien combattant) en React, responsive mobile/desktop, en reprenant exactement les valeurs des sources. Factorise les composants listés dans le README. Ensuite lance l'app, fais une capture à 390 px et à 1280 px de chaque écran et corrige les écarts avec les PNG.
