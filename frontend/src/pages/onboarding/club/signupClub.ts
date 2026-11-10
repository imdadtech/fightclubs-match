import { api } from "../../../lib/api";
import type { ClubForm } from "./clubForm";

// Libellé affiché dans le formulaire → valeur de l'enum côté API.
const DISCIPLINE_VALUES: Record<string, string> = {
  "Boxe anglaise": "BOXE_ANGLAISE",
  "Muay-thaï": "MUAY_THAI",
  "Kick-boxing": "KICK_BOXING",
  "K-1": "K1",
  MMA: "MMA",
};

const FEDERATION_VALUES: Record<string, string> = {
  FFB: "FFB",
  FFKMDA: "FFKMDA",
  Autre: "AUTRE",
  "Non affilié": "NON_AFFILIE",
};

/** Corps attendu par `POST /auth/signup/club`. */
export function toSignupPayload(form: ClubForm) {
  const phone = form.phone.trim();
  return {
    club: {
      name: form.clubName.trim(),
      city: form.city.trim(),
      postalCode: form.postalCode,
      disciplines: form.disciplines.map((d) => DISCIPLINE_VALUES[d]),
      federations: form.federations.map((f) => FEDERATION_VALUES[f]),
    },
    manager: {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: phone === "" ? undefined : phone,
      phoneHasWhatsapp: phone !== "" && form.phoneHasWhatsapp,
      contacts: form.contacts,
      sharingConsent: form.sharingConsent,
      acceptedTerms: form.acceptedTerms,
    },
  };
}

/** Crée le club et son responsable ; l'API ouvre aussi la session (cookie). */
export function signupClub(form: ClubForm) {
  return api<unknown>("/auth/signup/club", { method: "POST", body: toSignupPayload(form) });
}
