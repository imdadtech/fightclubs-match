import type { ClubForm } from "./clubForm";

export interface StepProps {
  form: ClubForm;
  /** Erreurs à afficher (champs déjà touchés ou étape soumise), indexées par champ. */
  errors: Partial<Record<keyof ClubForm, string>>;
  /**
   * Met à jour des champs. Avec `{ touch: true }` (choix, case à cocher), les champs modifiés sont aussi marqués
   * touchés, sans seconde validation : elle porterait sur les anciennes valeurs et écraserait la bonne.
   */
  update: (patch: Partial<ClubForm>, options?: { touch?: boolean }) => void;
  /** Marque des champs comme touchés au blur pour afficher leurs erreurs (valide les valeurs courantes). */
  touch: (...fields: (keyof ClubForm)[]) => void;
}
