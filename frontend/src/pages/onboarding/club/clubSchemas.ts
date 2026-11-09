import * as Yup from "yup";
import { hasActiveContact } from "./clubForm";
import type { ClubForm } from "./clubForm";

const PHONE_CHARS = /^\+?[\d\s.\-()]+$/;
const digitsOf = (value: string) => value.replace(/\D/g, "");

const clubStep = Yup.object({
  clubName: Yup.string().trim().min(2, "Le nom du club doit faire au moins 2 caractères.").max(80, "80 caractères maximum.").required("Indique le nom de ton club."),
  disciplines: Yup.array().of(Yup.string().required()).min(1, "Choisis au moins une discipline."),
  city: Yup.string().trim().required("Indique ta ville."),
  postalCode: Yup.string().matches(/^\d{5}$/, "Le code postal doit contenir 5 chiffres.").required("Indique ton code postal."),
  federations: Yup.array().of(Yup.string().required()).min(1, "Choisis au moins une option (ou « Non affilié »)."),
});

const managerStep = Yup.object({
  firstName: Yup.string().trim().required("Indique ton prénom."),
  lastName: Yup.string().trim().required("Indique ton nom."),
  email: Yup.string().trim().email("Cette adresse e-mail n'est pas valide.").required("Indique ton adresse e-mail."),
  phone: Yup.string()
    .trim()
    .test("phone", "Ce numéro de téléphone n'est pas valide.", (value) => {
      if (!value) return true; // facultatif
      const digits = digitsOf(value).length;
      return PHONE_CHARS.test(value) && digits >= 9 && digits <= 15;
    }),
  password: Yup.string().min(8, "Le mot de passe doit faire au moins 8 caractères.").required("Choisis un mot de passe."),
  sharingConsent: Yup.boolean().oneOf(
    [true],
    "Coche cette case pour continuer : sans ton accord, les autres clubs ne pourraient pas te contacter.",
  ),
});

const contactStep = Yup.object({
  contacts: Yup.object().test(
    "at-least-one",
    "Garde au moins un moyen de contact actif : sans lui, l'autre club ne pourrait pas te joindre.",
    (contacts, ctx) => hasActiveContact({ ...(ctx.parent as ClubForm), contacts: contacts as ClubForm["contacts"] }),
  ),
  acceptedTerms: Yup.boolean().oneOf([true], "Accepte les conditions pour créer le compte."),
});

/** Schéma de validation de chaque étape (index 0 = étape 1). */
export const STEP_SCHEMAS = [clubStep, managerStep, contactStep];

/** Champs de chaque étape, pour les marquer « touchés » au clic sur « Suivant ». */
export const STEP_FIELDS: (keyof ClubForm)[][] = [
  ["clubName", "disciplines", "city", "postalCode", "federations"],
  ["firstName", "lastName", "email", "phone", "password", "sharingConsent"],
  ["contacts", "acceptedTerms"],
];
