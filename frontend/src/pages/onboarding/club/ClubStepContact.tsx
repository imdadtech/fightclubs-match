import { useId, useState } from "react";
import type { MouseEvent } from "react";
import ToggleRow from "../../../components/molecules/form/ToggleRow";
import TermsModal from "./TermsModal";
import type { LegalDoc } from "./TermsModal";
import ContactToggleTutorial from "./ContactToggleTutorial";
import type { StepProps } from "./types";

const linkClasses =
  "cursor-pointer bg-transparent p-0 font-sans text-[14px] font-bold text-red-deep underline underline-offset-2 " +
  "hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink";

function ClubStepContact({ form, update, errors, touch }: StepProps) {
  const termsId = useId();
  const [legalOpen, setLegalOpen] = useState<LegalDoc | null>(null);
  const setContact = (key: keyof StepProps["form"]["contacts"], value: boolean) =>
    {
      update({ contacts: { ...form.contacts, [key]: value } });
      touch("contacts");
    };

  const hasPhone = form.phone.trim() !== "";
  const canWhatsapp = hasPhone && form.phoneHasWhatsapp;

  // Le lien est dans le <label> : on empêche le clic de cocher la case.
  const openLegal = (e: MouseEvent<HTMLButtonElement>, doc: LegalDoc) => {
    e.preventDefault();
    setLegalOpen(doc);
  };

  return (
    <>
      <ContactToggleTutorial className="col-span-2" />
      <ToggleRow
        className="col-span-2 min-[900px]:col-span-1"
        title="WhatsApp"
        subtitle={canWhatsapp ? form.phone : "Indique un numéro avec WhatsApp"}
        disabled={!canWhatsapp}
        checked={form.contacts.whatsapp}
        onChange={(v) => setContact("whatsapp", v)}
      />
      <ToggleRow
        className="col-span-2 min-[900px]:col-span-1"
        title="E-mail"
        subtitle={form.email || "Non communiqué"}
        checked={form.contacts.email}
        onChange={(v) => setContact("email", v)}
      />
      <ToggleRow
        className="col-span-2 min-[900px]:col-span-1"
        title="Téléphone"
        subtitle={hasPhone ? form.phone : "Indique un numéro"}
        disabled={!hasPhone}
        checked={form.contacts.phone}
        onChange={(v) => setContact("phone", v)}
      />
      {errors.contacts ? (
        <p role="alert" className="col-span-2 m-0 text-[14px] leading-5 font-bold text-red-deep">
          {errors.contacts}
        </p>
      ) : (
        <div className="hidden min-[900px]:block" />
      )}
      <label
        htmlFor={termsId}
        className="col-span-2 flex min-h-11 cursor-pointer items-start gap-3 text-[14px] leading-5 font-medium"
      >
        <input
          id={termsId}
          type="checkbox"
          checked={form.acceptedTerms}
          aria-invalid={!!errors.acceptedTerms}
          onChange={(e) => {
            update({ acceptedTerms: e.target.checked });
            touch("acceptedTerms");
          }}
          className="m-0 size-6 min-h-6 flex-none p-0 accent-corner-red"
        />
        <span>
          J'accepte les{" "}
          <button type="button" className={linkClasses} onClick={(e) => openLegal(e, "terms")}>
            conditions d'utilisation
          </button>{" "}
          et la{" "}
          <button type="button" className={linkClasses} onClick={(e) => openLegal(e, "privacy")}>
            politique de confidentialité
          </button>
          .
        </span>
      </label>
      {errors.acceptedTerms && (
        <p role="alert" className="col-span-2 m-0 pl-9 text-[14px] leading-5 font-bold text-red-deep">
          {errors.acceptedTerms}
        </p>
      )}
      <TermsModal
        open={legalOpen}
        onClose={() => setLegalOpen(null)}
        onAccept={() => {
          update({ acceptedTerms: true });
          touch("acceptedTerms");
          setLegalOpen(null);
        }}
      />
    </>
  );
}

export default ClubStepContact;
