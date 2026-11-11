import type { Discipline, FighterInput, Sex } from "../../lib/fighters";

export interface RecordFields {
  fights: string;
  wins: string;
}

/** Saisie du formulaire « fiche combattant » (les nombres restent des chaînes tant qu'on tape). */
export interface FighterForm {
  firstName: string;
  lastName: string;
  /** « 1999-09-02 » (champ date natif) */
  birthDate: string;
  sex: Sex;
  weights: number[];
  height: string;
  disciplines: Discipline[];
  /** Un palmarès par discipline cochée. */
  records: Partial<Record<Discipline, RecordFields>>;
  /** Parcours par lien : le combattant accepte que son club utilise sa fiche. */
  consent: boolean;
}

export const initialFighterForm: FighterForm = {
  firstName: "",
  lastName: "",
  birthDate: "",
  sex: "MALE",
  weights: [],
  height: "",
  disciplines: [],
  records: {},
  consent: false,
};

export type FighterFormErrors = Partial<
  Record<"firstName" | "lastName" | "birthDate" | "weights" | "height" | "disciplines" | "consent", string>
> &
  Partial<Record<`fights:${Discipline}` | `wins:${Discipline}`, string>>;

export const EMPTY_RECORD: RecordFields = { fights: "0", wins: "0" };

const toInt = (value: string) => (value.trim() === "" ? 0 : Number.parseInt(value, 10));

/** Même plage que l'API : entre 10 et 80 ans, pas de date dans le futur. */
function validBirthDate(value: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const born = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(born.getTime())) return false;
  const age = (now.getTime() - born.getTime()) / (365.25 * 24 * 3600 * 1000);
  return age >= 10 && age <= 80;
}

/** Étape 1 : prénom, nom, date de naissance, au moins une catégorie de poids ; la taille est facultative. */
export function validateIdentity(form: FighterForm): FighterFormErrors {
  const errors: FighterFormErrors = {};
  if (!form.firstName.trim()) errors.firstName = "Indique le prénom.";
  if (!form.lastName.trim()) errors.lastName = "Indique le nom.";
  if (!form.birthDate) errors.birthDate = "Indique la date de naissance.";
  else if (!validBirthDate(form.birthDate)) errors.birthDate = "Cette date de naissance n'est pas valide.";
  if (form.weights.length === 0) errors.weights = "Choisis au moins une catégorie de poids.";
  if (form.height.trim() !== "") {
    const height = Number(form.height);
    if (!Number.isInteger(height) || height < 100 || height > 250) errors.height = "La taille doit être entre 100 et 250 cm.";
  }
  return errors;
}

/** Étape 2 : au moins une discipline, des victoires qui ne dépassent pas les combats ; consentement si demandé. */
export function validateProfile(form: FighterForm, requireConsent: boolean): FighterFormErrors {
  const errors: FighterFormErrors = {};
  if (form.disciplines.length === 0) errors.disciplines = "Choisis au moins une discipline.";
  for (const discipline of form.disciplines) {
    const record = form.records[discipline] ?? EMPTY_RECORD;
    if (toInt(record.wins) > toInt(record.fights)) {
      errors[`wins:${discipline}`] = "Les victoires ne peuvent pas dépasser le nombre de combats.";
    }
  }
  if (requireConsent && !form.consent) errors.consent = "Coche cette case pour envoyer ta fiche.";
  return errors;
}

/** Corps attendu par l'API (`POST /fighters` ou `POST /invites/:token`). */
export function toFighterInput(form: FighterForm): FighterInput {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    birthDate: form.birthDate,
    sex: form.sex,
    weightClassesKg: [...form.weights].sort((a, b) => a - b),
    heightCm: form.height.trim() === "" ? null : Number(form.height),
    records: form.disciplines.map((discipline) => {
      const record = form.records[discipline] ?? EMPTY_RECORD;
      return { discipline, fights: toInt(record.fights), wins: toInt(record.wins) };
    }),
  };
}
