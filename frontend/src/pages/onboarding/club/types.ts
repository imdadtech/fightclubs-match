import type { ClubForm } from "./clubForm";

export interface StepProps {
  form: ClubForm;
  /** Erreurs à afficher (champs déjà touchés ou étape soumise), indexées par champ. */
  errors: Partial<Record<keyof ClubForm, string>>;
  update: (patch: Partial<ClubForm>) => void;
  /** Marque des champs comme touchés (à appeler au blur ou après un choix) pour afficher leurs erreurs. */
  touch: (...fields: (keyof ClubForm)[]) => void;
}
