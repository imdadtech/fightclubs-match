import { z } from "zod";
import { Discipline, Federation } from "../../generated/prisma/enums.js";

const PHONE_CHARS = /^\+?[\d\s.\-()]+$/;

const phone = z
  .string()
  .trim()
  .refine((v) => {
    const digits = v.replace(/\D/g, "").length;
    return PHONE_CHARS.test(v) && digits >= 9 && digits <= 15;
  }, "Numéro de téléphone invalide.");

export const clubSignupSchema = z
  .object({
    club: z.object({
      name: z.string().trim().min(2).max(80),
      city: z.string().trim().min(1),
      postalCode: z.string().regex(/^\d{5}$/, "Le code postal doit contenir 5 chiffres."),
      disciplines: z.array(z.enum(Discipline)).min(1),
      federations: z.array(z.enum(Federation)).min(1),
    }),
    manager: z.object({
      firstName: z.string().trim().min(1),
      lastName: z.string().trim().min(1),
      email: z.string().trim().toLowerCase().pipe(z.email()),
      password: z.string().min(8).max(72), // bcrypt ignore au-delà de 72 octets
      phone: phone.optional(),
      phoneHasWhatsapp: z.boolean().default(false),
      contacts: z.object({ email: z.boolean(), phone: z.boolean() }),
      sharingConsent: z.literal(true),
      acceptedTerms: z.literal(true),
    }),
  })
  .superRefine(({ manager: m }, ctx) => {
    const issue = (path: string[], message: string) => ctx.addIssue({ code: "custom", path: ["manager", ...path], message });
    if (m.phoneHasWhatsapp && !m.phone) issue(["phoneHasWhatsapp"], "WhatsApp nécessite un numéro de téléphone.");
    if (m.contacts.phone && !m.phone) issue(["contacts", "phone"], "Le canal téléphone nécessite un numéro.");
    if (!m.contacts.email && !m.contacts.phone)
      issue(["contacts"], "Au moins un moyen de contact doit être actif.");
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(72),
});
