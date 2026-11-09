import { useId } from "react";
import ConsentCheckbox from "../../../components/molecules/form/ConsentCheckbox";
import TextField from "../../../components/molecules/form/TextField";
import type { StepProps } from "./types";

function ClubStepManager({ form, update, errors, touch }: StepProps) {
  const whatsappId = useId();
  const hasPhone = form.phone.trim() !== "";

  return (
    <>
      <TextField
        label="Prénom"
        type="text"
        value={form.firstName}
        error={errors.firstName}
        onBlur={() => touch("firstName")}
        onChange={(e) => update({ firstName: e.target.value })}
      />
      <TextField
        label="Nom"
        type="text"
        value={form.lastName}
        error={errors.lastName}
        onBlur={() => touch("lastName")}
        onChange={(e) => update({ lastName: e.target.value })}
      />
      <TextField
        className="col-span-2"
        label="Adresse e-mail"
        type="email"
        value={form.email}
        error={errors.email}
        onBlur={() => touch("email")}
        onChange={(e) => {
          const email = e.target.value;
          // Première saisie : le canal devient partageable par défaut.
          const firstInput = form.email.trim() === "" && email.trim() !== "";
          update({
            email,
            ...(firstInput && { contacts: { ...form.contacts, email: true } }),
          });
        }}
      />
      <TextField
        className="col-span-2"
        label="Numéro de téléphone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={form.phone}
        error={errors.phone}
        onBlur={() => touch("phone")}
        onChange={(e) => {
          const phone = e.target.value;
          const cleared = phone.trim() === "";
          const firstInput = !hasPhone && !cleared;
          update({
            phone,
            ...(cleared && {
              phoneHasWhatsapp: false,
              contacts: { ...form.contacts, whatsapp: false, phone: false },
            }),
            ...(firstInput && { contacts: { ...form.contacts, phone: true } }),
          });
        }}
      />
      <label
        htmlFor={whatsappId}
        className="col-span-2 flex min-h-11 cursor-pointer items-center gap-3 text-[14px] leading-5 font-medium"
      >
        <input
          id={whatsappId}
          type="checkbox"
          checked={form.phoneHasWhatsapp}
          disabled={!hasPhone}
          onChange={(e) =>
            update({
              phoneHasWhatsapp: e.target.checked,
              contacts: { ...form.contacts, whatsapp: e.target.checked },
            })
          }
          className="m-0 size-6 min-h-6 flex-none p-0 accent-corner-red"
        />
        <span>Ce numéro a un compte WhatsApp</span>
      </label>
      <TextField
        className="col-span-2"
        label="Mot de passe (8 caractères minimum)"
        type="password"
        value={form.password}
        error={errors.password}
        onBlur={() => touch("password")}
        onChange={(e) => update({ password: e.target.value })}
      />
      <ConsentCheckbox
        className="col-span-2"
        checked={form.sharingConsent}
        onChange={(sharingConsent) => {
          update({ sharingConsent });
          touch("sharingConsent");
        }}
        error={errors.sharingConsent}
      >
        Mon prénom, mon nom, mon e-mail et mon numéro de téléphone servent uniquement à permettre aux autres clubs de me
        contacter. J'accepte qu'ils soient partagés avec eux.
      </ConsentCheckbox>
    </>
  );
}

export default ClubStepManager;
