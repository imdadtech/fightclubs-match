# FightClubs Match

Frontend : `frontend/` (React + Vite + Tailwind v4). Les tokens de design sont dans `frontend/src/index.css` (`@theme`). Voir aussi `README.md`.

## Design : bouton (`frontend/src/components/atoms/Buttons.tsx`)

Le bouton déclenche une action : pilule à bordure `ink` de 2 px et ombre dure `shadow-poster`, qui s'enfonce au clic.

### Libellé
- Libellé verbal court : « Accepter le combat », « Proposer un combattant ».
- Le contexte de l'action va dans le texte autour, pas dans le bouton.

### Variantes
| Variante | Style | Usage |
|---|---|---|
| Principal | `corner-red` + `on-red` | **Une seule par écran** : l'action qui avance le combat (accepter, proposer, confirmer). |
| Secondaire | `surface-raised` + `ink` | Alternatives qui ne conduisent pas directement à un combat. |
| Urgent | `tape` + `on-tape` | Répondre à une annonce marquée urgente. **Pas plus d'un par écran.** |
| Discret | texte `red-deep` souligné, sans bordure | « Décliner », « Annuler ». |
| Désactivé | `surface-sunken`, bordure `line-strong`, sans ombre | Dire dans la phrase voisine pourquoi. |

### Interactions
- Survol : décalage de 1 px vers le haut et la gauche.
- Appui : décalage de 2 px vers le bas et la droite, ombre plus courte.
- Focus clavier : anneau `ink` de 3 px, à 3 px du bord.

### Interdits
- Jamais deux boutons rouges côte à côte.
- Ne pas utiliser `corner-blue` pour une action (le bleu désigne l'adversaire, rien d'autre).

## Design : champ mot de passe (`frontend/src/components/molecules/form/TextField.tsx`)

- Tout champ `type="password"` doit avoir une icône œil pour afficher/masquer la valeur.
- Toujours passer par `TextField` : il l'ajoute automatiquement. Ne jamais utiliser un `<input type="password">` brut.

## Consentement au partage des données personnelles

- Prénom, nom, e-mail et téléphone d'un entraîneur ou d'un promoteur ne servent qu'à permettre aux autres clubs de le contacter : l'inscription l'explique et demande une case de consentement obligatoire (`ConsentCheckbox`).
- Tant que la case n'est pas cochée, « Suivant » n'avance pas et un message dit pourquoi, à côté de la case.
- S'applique aussi à l'onboarding promoteur (`/onboarding/individual`) quand il sera créé.

## Backend : architecture (`backend/`)

Node + Express + Prisma (PostgreSQL) + TypeScript, en ESM (imports relatifs avec extension `.js`).

- **Architecture par modules** : un dossier par ressource dans `src/modules/<module>/` (ex. `auth/`, `user/`, `club/`), qui regroupe tout ce qui la concerne. Ne pas créer de dossiers globaux `routes/` ou `controllers/`.
- Dans un module, **routes et controllers sont toujours dans des fichiers séparés** :
  - `<module>.routes.ts` : déclare chemin, méthode et middlewares (`requireAuth`…), puis délègue au controller. Aucune logique.
  - `<module>.controller.ts` : une fonction exportée par action `(req, res)` : validation, appels Prisma, réponse HTTP.
  - `<module>.schemas.ts` : schémas de validation zod, jamais inline dans un controller ou une route.
  - Les helpers propres au module (ex. `session.ts` dans `auth/`) restent dans son dossier.
- Un module peut importer un autre module uniquement via ses exports (ex. `requireAuth` depuis `modules/auth/session.js`).
- Hors modules : `src/db/` (client Prisma), `src/types/` (déclarations TypeScript globales), `src/generated/` (client Prisma généré, ne pas modifier). Chaque routeur est monté dans `src/index.ts`.
- Pour un nouveau module, créer `src/modules/<module>/` avec ces fichiers, sans tout regrouper dans un seul.
