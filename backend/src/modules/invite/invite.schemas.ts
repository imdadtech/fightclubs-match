import { z } from "zod";
import { fighterInputSchema } from "../fighter/fighter.schemas.js";

/** Fiche remplie par le combattant via le lien : même saisie que côté club, plus son consentement. */
export const inviteSubmissionSchema = fighterInputSchema.extend({
  consent: z.literal(true, "Le consentement est obligatoire."),
});
