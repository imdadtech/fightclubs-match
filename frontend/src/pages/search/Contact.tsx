import { useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../components/atoms/Buttons";
import BackLink from "../../components/molecules/BackLink";
import PageHeader from "../../components/molecules/PageHeader";
import StateMessage from "../../components/molecules/StateMessage";
import { useAsync } from "../../hooks/useAsync";
import { ApiError } from "../../lib/api";
import {
  confirmProposal,
  disciplineLabel,
  fighterName,
  formatWeight,
  getContact,
  monthLabel,
  placeOf,
  sidesOf,
} from "../../lib/fighters";
import type { ContactInfo } from "../../lib/fighters";
import ClubShell from "./ClubShell";

const eyebrow = "text-[12px] font-bold tracking-[0.08em] text-ink-muted uppercase";
/** « 0612345601 » → « 06 12 34 56 78 » (les autres formats sont laissés tels quels). */
const formatPhone = (v: string) => (/^0\d{9}$/.test(v) ? v.replace(/(\d{2})(?=\d)/g, "$1 ") : v);
const CAPTION = "Le combat est confirmé quand les deux clubs l'ont déclaré.";

function ContactRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const [copied, setCopied] = useState(false);
  const shown = label.startsWith("E-mail") ? value : formatPhone(value);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Presse-papiers indisponible : la valeur reste affichée, on peut la sélectionner.
    }
  };
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl bg-surface-raised px-3.5 py-3 min-[900px]:gap-3.5 min-[900px]:px-5 min-[900px]:py-4 ${
        highlight ? "border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]" : "border border-line"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className={`text-[12px] font-bold min-[900px]:text-[13px] ${highlight ? "text-success" : "text-ink-muted"}`}>{label}</div>
        <div
          className={`leading-5.5 wrap-anywhere min-[900px]:leading-6.5 ${
            highlight ? "text-[16px] font-bold min-[900px]:text-[18px]" : "text-[15px] font-semibold"
          }`}
        >
          {shown}
        </div>
      </div>
      <Button size="sm" variant={highlight ? "primary" : "secondary"} flat className="px-3.5 min-[900px]:min-h-12 min-[900px]:px-5 min-[900px]:text-[15px]" onClick={copy}>
        {copied ? "Copié" : "Copier"}
      </Button>
    </div>
  );
}

function Contact() {
  const { id = "" } = useParams();
  const info = useAsync(() => getContact(id), id);
  const [confirmed, setConfirmed] = useState<ContactInfo>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  if (info.status !== "done") {
    return (
      <ClubShell compactTop>
        <BackLink to="/notifications">Notifications</BackLink>
        <PageHeader title="Contact" desktopOnly />
        {info.status === "loading" ? (
          <StateMessage>Chargement…</StateMessage>
        ) : (
          <StateMessage alert>
            {info.error instanceof ApiError && info.error.status === 403
              ? "Les coordonnées sont débloquées quand le combat est accepté."
              : "Impossible de charger les coordonnées. Réessaie dans un instant."}
          </StateMessage>
        )}
      </ClubShell>
    );
  }

  const { proposal, club, contact, confirmation } = confirmed ?? info.data;
  const { mine, other } = sidesOf(proposal);
  const noContact = !contact.whatsapp && !contact.email && !contact.phone;
  const both = confirmation.mine && confirmation.theirs;

  const confirm = async () => {
    setBusy(true);
    setError(undefined);
    try {
      setConfirmed(await confirmProposal(proposal.id));
    } catch {
      setError("La confirmation n'a pas pu être envoyée. Réessaie dans un instant.");
    } finally {
      setBusy(false);
    }
  };
  const confirmLabel = both ? "Combat confirmé" : confirmation.mine ? "Tu as confirmé" : "Confirmer le combat";
  const confirmButton = (
    <Button variant="confirm" size="lg" disabled={busy || confirmation.mine} onClick={confirm} className="min-[900px]:px-9">
      {confirmLabel}
    </Button>
  );
  const errorText = error && <p role="alert" className="m-0 text-[14px] leading-5 font-bold text-red-deep">{error}</p>;
  const state = (ok: boolean, yes: string, no: string) => (ok ? yes : no);

  return (
    <ClubShell
      compactTop
      hideTabs
      mobileActions={
        <div className="flex flex-col gap-1.5">
          {confirmButton}
          {errorText}
          <span className="text-center text-[12px] leading-4 text-ink-muted">{CAPTION}</span>
        </div>
      }
      desktopActions={
        <>
          {errorText}
          <span className="text-[13px] leading-4.5 text-ink-muted">{CAPTION}</span>
          {confirmButton}
        </>
      }
    >
      <BackLink to="/notifications">Notifications</BackLink>
      <div className="flex items-center gap-3 rounded-2xl border-t-4 border-success bg-success-tint p-3.5 min-[900px]:-mt-2 min-[900px]:gap-4 min-[900px]:px-5.5 min-[900px]:py-4.5">
        <span className="grid size-8 flex-none place-items-center rounded-full bg-success text-[18px] font-extrabold text-on-success min-[900px]:size-10 min-[900px]:text-[22px]" aria-hidden="true">
          ✓
        </span>
        <div>
          <h1 className="m-0 font-display text-[20px] leading-6 font-black min-[900px]:text-[28px] min-[900px]:leading-8">Combat accepté</h1>
          <div className="text-[14px] leading-5 min-[900px]:text-[16px] min-[900px]:leading-6">Les coordonnées de {club.name} sont débloquées.</div>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 min-[900px]:flex-row min-[900px]:items-start min-[900px]:gap-7">
        <div className="flex min-w-0 flex-col gap-3.5 min-[900px]:flex-1 min-[900px]:gap-5">
          <div className="flex flex-col gap-2.5 rounded-lg bg-surface-raised p-3.5 shadow-soft min-[900px]:p-5.5">
            <div className="flex items-center gap-2 font-display text-[17px] font-extrabold min-[900px]:gap-2.5 min-[900px]:text-[22px]">
              <span className="text-red-deep">{fighterName(mine)}</span>
              <span className="text-[12px] text-ink-muted min-[900px]:text-[13px]">VS</span>
              <span className="text-corner-blue">{fighterName(other)}</span>
            </div>
            <div className="text-[14px] leading-5 text-ink-muted min-[900px]:text-[15px] min-[900px]:leading-5.5">
              {[disciplineLabel(proposal.from.discipline), formatWeight(proposal.weightClassKg), proposal.desiredMonth && monthLabel(proposal.desiredMonth), placeOf(club)]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 rounded-2xl border-l-[6px] border-tape bg-tape-tint px-3.5 py-3 min-[900px]:px-5 min-[900px]:py-4">
            <div className="text-[14px] font-bold min-[900px]:text-[15px]">Confirmation des deux clubs</div>
            <div className="text-[13px] leading-4.5 min-[900px]:text-[14px] min-[900px]:leading-5.5">
              <strong>{mine.club.name}</strong> : {state(confirmation.mine, "déclaré", "à confirmer")}
              <br />
              <strong>{club.name}</strong> : {state(confirmation.theirs, "déclaré", "en attente")}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2.5 min-[900px]:flex-1 min-[900px]:gap-3">
          <span className={eyebrow}>Contacter {club.name}</span>
          {noContact && (
            <StateMessage>Ce club n'a partagé aucune coordonnée. Reviens plus tard ou passe par ta fédération.</StateMessage>
          )}
          {contact.whatsapp && <ContactRow highlight label="WhatsApp · préféré" value={contact.whatsapp} />}
          {contact.email && <ContactRow label="E-mail" value={contact.email} />}
          {contact.phone && <ContactRow label="Téléphone" value={contact.phone} />}
        </div>
      </div>
    </ClubShell>
  );
}

export default Contact;
