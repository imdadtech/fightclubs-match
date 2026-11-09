## Principes

- Montre le combat avant l'outil. Chaque écran dit d'abord qui affronte qui, à quel poids, quand et où, ensuite seulement les filtres et les réglages.
- Traite l'adversaire en face-à-face. Ton club et ton combattant sont en **coin rouge** (`corner-red`), l'autre club et l'adversaire proposé sont en **coin bleu** (`corner-blue`). Le bleu ne sert à rien d'autre.
- Réserve la **tape jaune** (`tape`) à l'urgence : un combat à moins de 3 semaines, une annonce prioritaire. Si tout est jaune, rien n'est urgent.
- La plateforme met en relation, puis s'efface. Elle ne remplace pas la discussion : après acceptation, renvoie vers WhatsApp, l'e-mail ou le téléphone du club.

## Voix et contenu

- Tutoie l'utilisateur : « Ton annonce est envoyée à 14 clubs. » Le milieu du combat se tutoie. Le vouvoiement reste possible plus tard pour les fédérations.
- Écris en français, phrases courtes, verbes d'action sur les boutons : « Accepter », « Proposer un combattant », « Confirmer le combat ».
- Emploie le vocabulaire du métier : adversaire, carte, gala, annonce, palmarès, poids de convention, bourse, allonge, reprises. Pas d'anglicismes là où le terme existe (« annonce », pas « post »).
- Majuscule à la première lettre seulement (« Annonces reçues »). Capitales réservées au style `label`.
- Typographie française : espace insécable avant `: ; ? !` et autour des guillemets « », « 70 kg », « 14 déc. », « 3 semaines ». Heures au format « 20 h 30 ». Montants « 300 € ».
- Écris les résultats comme sur un palmarès : « 10 combats : 8 V, 2 D, 0 N ».
- Pas d'emoji, pas de points d'exclamation décoratifs. Une erreur dit ce qui s'est passé et quoi faire : « Ce club n'a pas encore renseigné de WhatsApp. Utilise son e-mail. »
- Les exemples : « Boxing Club Belleville cherche un boxeur de 70 kg pour le 14 décembre à Lyon. »

## Fondations visuelles

- **Fonds.** Pose les pages sur `canvas`, les cartes sur `surface-raised`, les zones en creux sur `surface-sunken`. Texte courant en `ink`, secondaire en `ink-muted`.
- **Couleur.** Un seul accent d'action : `corner-red` avec `on-red`. Un texte rouge sur fond clair passe en `red-deep`. Les états se lisent aussi par un mot ou une icône, jamais par la couleur seule : « Confirmé » avec une coche sur `success-tint`, « Urgent » avec la bande `tape`.
- **Typographie.** Titres et chiffres dans `display` (Archivo, graisses 800 et 900, capitales possibles pour `display-xl`) ; texte dans `sans` (Hanken Grotesk). Style `label` pour les libellés en capitales ; `stat-xl` et `stat-md` pour les chiffres (poids, score, victoires), toujours en chiffres tabulaires.
- **Les cordes.** Trois traits arrondis parallèles (`corner-red`, `ink`, `corner-blue`, 4 px d'épaisseur, 6 px d'écart) servent de séparateur sous un titre d'affiche. Un par page au maximum.
- **Bordures et ombres.** Les éléments qui doivent ressortir (boutons, annonces urgentes, cartes de gala) portent une bordure `ink` de 2 px et `shadow-poster`. Les cartes de liste utilisent `shadow-soft` sans bordure épaisse. `shadow-lift` au survol.
- **Rayons.** Boutons et puces en `radius-pill`, cartes en `radius-lg`, champs en `radius-md`, pastilles de statut en `radius-sm`.
- **Espacement.** Grille de 4 px. Padding de carte `space-4` sur mobile, `space-5` au-dessus. Gouttière de page 16 px minimum.
- **Focus.** Anneau plein de 3 px en `ink`, à 3 px du bord, sur tout élément interactif.
- **Images.** Pas de visages ni de mascotte dans les cartes. Un combattant sans photo prend un monogramme sur `surface-sunken`. Les photos de gala, quand elles existent, sont recadrées en `radius-lg`.
- **Mobile d'abord.** Une colonne à 400 px ; les cartes se mettent côte à côte à partir de 720 px.

## Icônes

Utilise des icônes au trait de 2 px, extrémités arrondies, 20 px par défaut, couleur `currentColor`. Aucune icône de gant de boxe dans le logo ni dans l'interface : les repères de ring passent par la couleur, la typographie et les cordes. Aucun emoji.

## Composants

- `Button` : actions principales, secondaires et urgentes.
- `FilterChips` : discipline, catégorie de poids et disponibilité.
- `FighterCard` : fiche combattant et comparaison « tale of the tape » entre ton combattant et l'adversaire proposé.
- `MatchScore` : score de compatibilité, détaillé par critère.
- `AnnouncementNotice` : annonce reçue dans l'onglet notifications, avec réponse en un geste.
- `ContactUnlock` : coordonnées verrouillées, puis débloquées après acceptation.