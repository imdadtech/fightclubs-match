export interface ClubForm {
  clubName: string;
  disciplines: string[];
  city: string;
  postalCode: string;
  federations: string[];
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  phoneHasWhatsapp: boolean;
  contacts: { whatsapp: boolean; email: boolean; phone: boolean };
  acceptedTerms: boolean;
  sharingConsent: boolean;
}

export const DISCIPLINES = ["Boxe anglaise", "Muay-thaï", "Kick-boxing", "K-1", "MMA"];
export const FEDERATIONS = ["FFB", "FFKMDA", "Autre", "Non affilié"];

export const initialClubForm: ClubForm = {
  clubName: "",
  disciplines: [],
  city: "",
  postalCode: "",
  federations: [],
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  phoneHasWhatsapp: false,
  contacts: { whatsapp: false, email: false, phone: false },
  acceptedTerms: false,
  sharingConsent: false,
};

/** Au moins un moyen de contact doit être actif (et utilisable) pour organiser un combat. */
export function hasActiveContact(form: ClubForm): boolean {
  // Formik transmet "" comme undefined à Yup : ne pas supposer que phone est une chaîne.
  const hasPhone = (form.phone ?? "").trim() !== "";
  return (
    form.contacts.email ||
    (form.contacts.phone && hasPhone) ||
    (form.contacts.whatsapp && hasPhone && form.phoneHasWhatsapp)
  );
}
