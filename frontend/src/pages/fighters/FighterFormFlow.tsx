import { useState } from "react";
import type { ReactNode } from "react";
import AppLogo from "../../components/atoms/AppLogo";
import Button from "../../components/atoms/Buttons";
import { ChevronLeftIcon } from "../../components/atoms/NavIcons";
import BackLink from "../../components/molecules/BackLink";
import ChipGroup from "../../components/molecules/form/ChipGroup";
import ConsentCheckbox from "../../components/molecules/form/ConsentCheckbox";
import RecordCard from "../../components/molecules/form/RecordCard";
import SelectField from "../../components/molecules/form/SelectField";
import TextField from "../../components/molecules/form/TextField";
import StepIndicator from "../../components/molecules/StepIndicator";
import { ApiError } from "../../lib/api";
import { DISCIPLINES, SEXES, WEIGHT_CLASSES_KG, disciplineLabel, formatWeight } from "../../lib/fighters";
import type { Discipline, FighterInput, Sex } from "../../lib/fighters";
import ClubShell from "../search/ClubShell";
import { EMPTY_RECORD, initialFighterForm, toFighterInput, validateIdentity, validateProfile } from "./fighterForm";
import type { FighterForm } from "./fighterForm";

interface FighterFormFlowProps {
  /** `club` : le club connecté saisit la fiche. `link` : le combattant la remplit via un lien (page publique). */
  variant: "club" | "link";
  /** Nom du club : bandeau et consentement du parcours par lien. */
  clubName?: string;
  /** Envoie la fiche. Doit lever une erreur si l'envoi échoue. */
  onSubmit: (input: FighterInput) => Promise<void>;
}

const COPY = {
  club: {
    step1: { title: "Nouveau combattant", subtitle: "Renseigne les informations de ton combattant." },
    step2: { title: "Profil sportif", subtitle: "Ces informations servent à trouver des adversaires compatibles." },
    submit: "Ajouter le combattant",
  },
  link: {
    step1: {
      title: "Qui es-tu ?",
      subtitle: "Ton club utilise ces informations pour te proposer des adversaires de ton gabarit.",
    },
    step2: { title: "Ton profil sportif", subtitle: "Ces informations servent à trouver des adversaires compatibles." },
    submit: "Envoyer ma fiche",
  },
} as const;

const WEIGHT_OPTIONS = WEIGHT_CLASSES_KG.map(formatWeight);
const DISCIPLINE_OPTIONS = DISCIPLINES.map((d) => d.label);

function submitErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "invite_used" || error.code === "invite_expired" || error.code === "invite_not_found") {
      return "Ce lien n'est plus valable. Demande un nouveau lien à ton club.";
    }
    if (error.status === 400) return "Certaines informations ne sont pas valides. Vérifie les deux étapes.";
  }
  return "Le serveur ne répond pas. Réessaie dans un instant.";
}

/** Formulaire en deux étapes (identité, puis profil sportif), partagé par le parcours club et le parcours par lien. */
function FighterFormFlow({ variant, clubName, onSubmit }: FighterFormFlowProps) {
  const isLink = variant === "link";
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FighterForm>(initialFighterForm);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Les erreurs n'apparaissent qu'après un clic sur « Suivant » / « Envoyer » qui échoue.
  const errors = showErrors ? (step === 1 ? validateIdentity(form) : validateProfile(form, isLink)) : {};
  const copy = COPY[variant][step === 1 ? "step1" : "step2"];

  const update = (patch: Partial<FighterForm>) => setForm((f) => ({ ...f, ...patch }));
  const revealFirstError = () =>
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')
        ?.scrollIntoView({ block: "center", behavior: "smooth" }),
    );

  const goTo = (next: 1 | 2) => {
    setStep(next);
    setShowErrors(false);
    setSubmitError(null);
  };

  const next = () => {
    if (Object.keys(validateIdentity(form)).length > 0) {
      setShowErrors(true);
      revealFirstError();
      return;
    }
    goTo(2);
  };

  const submit = async () => {
    if (Object.keys(validateProfile(form, isLink)).length > 0) {
      setShowErrors(true);
      revealFirstError();
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(toFighterInput(form));
    } catch (error) {
      setSubmitError(submitErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDisciplines = (labels: string[]) => {
    const disciplines = DISCIPLINES.filter((d) => labels.includes(d.label)).map((d) => d.value);
    const records = Object.fromEntries(disciplines.map((d) => [d, form.records[d] ?? EMPTY_RECORD]));
    update({ disciplines, records });
  };

  const identityFields = (
    <>
      <TextField label="Prénom" type="text" autoComplete="off" value={form.firstName} error={errors.firstName} onChange={(e) => update({ firstName: e.target.value })} />
      <TextField label="Nom" type="text" autoComplete="off" value={form.lastName} error={errors.lastName} onChange={(e) => update({ lastName: e.target.value })} />
      <TextField label="Date de naissance" type="date" value={form.birthDate} error={errors.birthDate} onChange={(e) => update({ birthDate: e.target.value })} />
      <SelectField label="Sexe" value={form.sex} onChange={(e) => update({ sex: e.target.value as Sex })}>
        {SEXES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </SelectField>
      <ChipGroup
        className="col-span-2"
        label="Catégories de poids possibles"
        hint="(plusieurs choix)"
        options={WEIGHT_OPTIONS}
        value={form.weights.map(formatWeight)}
        error={errors.weights}
        onChange={(labels) => update({ weights: WEIGHT_CLASSES_KG.filter((w) => labels.includes(formatWeight(w))) })}
      />
      <span className="col-span-2 -mt-1.5 text-[12px] leading-4 text-ink-muted min-[900px]:order-last min-[900px]:mt-0">
        La grille officielle sera définie plus tard avec les organisateurs.
      </span>
      <TextField
        className="col-span-2 min-[900px]:col-span-1"
        label="Taille (cm)"
        type="text"
        inputMode="numeric"
        value={form.height}
        error={errors.height}
        onChange={(e) => update({ height: e.target.value.replace(/\D/g, "").slice(0, 3) })}
      />
    </>
  );

  const profileFields = (
    <>
      <ChipGroup
        className="col-span-2"
        label="Disciplines pratiquées"
        hint="(plusieurs choix)"
        options={DISCIPLINE_OPTIONS}
        value={form.disciplines.map(disciplineLabel)}
        error={errors.disciplines}
        onChange={toggleDisciplines}
      />
      {form.disciplines.map((discipline: Discipline) => {
        const record = form.records[discipline] ?? EMPTY_RECORD;
        return (
          <RecordCard
            key={discipline}
            className="col-span-2"
            discipline={disciplineLabel(discipline)}
            fights={record.fights}
            wins={record.wins}
            winsError={errors[`wins:${discipline}`]}
            onChange={(patch) => update({ records: { ...form.records, [discipline]: { ...record, ...patch } } })}
          />
        );
      })}
      {isLink && (
        <ConsentCheckbox className="col-span-2" checked={form.consent} error={errors.consent} onChange={(consent) => update({ consent })}>
          J'accepte que {clubName ?? "mon club"} utilise ces informations pour me proposer des combats.
        </ConsentCheckbox>
      )}
    </>
  );

  const fields = step === 1 ? identityFields : profileFields;

  const actions = (
    <>
      {submitError && (
        <p role="alert" className="m-0 text-[14px] leading-5 font-bold text-red-deep">
          {submitError}
        </p>
      )}
      <div className="flex gap-2.5 min-[900px]:items-center min-[900px]:justify-end min-[900px]:gap-3">
        {step === 2 && (
          <Button variant="secondary" size="lg" flat className="flex-none px-5.5 min-[900px]:px-7" onClick={() => goTo(1)}>
            Précédent
          </Button>
        )}
        {step === 1 ? (
          <Button size="lg" className="flex-1 px-0 min-[900px]:flex-none min-[900px]:px-8" onClick={next}>
            Suivant
          </Button>
        ) : (
          <Button size="lg" className="flex-1 px-0 min-[900px]:flex-none min-[900px]:px-8" disabled={submitting || (isLink && !form.consent)} onClick={() => void submit()}>
            {submitting ? "Envoi…" : COPY[variant].submit}
          </Button>
        )}
      </div>
    </>
  );

  const stepper = <StepIndicator step={step} total={2} />;
  const gridClasses =
    "grid grid-cols-[repeat(2,minmax(0,1fr))] content-start gap-x-2.5 gap-y-3.5 min-[900px]:gap-x-4 min-[900px]:gap-y-4";
  const card =
    "min-[900px]:box-border min-[900px]:flex min-[900px]:flex-col min-[900px]:gap-6 min-[900px]:rounded-3xl min-[900px]:border-2 min-[900px]:border-ink min-[900px]:bg-surface-raised min-[900px]:p-8 min-[900px]:shadow-[6px_6px_0_0_var(--color-ink)]";

  if (!isLink) {
    return (
      <ClubShell
        hideTabs
        compactTop
        mobileActionsClassName="pb-5"
        mobileActions={<div className="flex flex-col gap-2.5">{actions}</div>}
      >
        {/* Mobile : logo puis lien retour, collés l'un à l'autre. */}
        <div className="flex flex-col items-start pt-1 min-[900px]:contents">
          <AppLogo className="text-[22px] min-[900px]:hidden" />
          <BackLink to="/profil" flush>
            Mes combattants
          </BackLink>
        </div>
        <div className="-mt-0.5 flex flex-col gap-3.5 min-[900px]:mt-0 min-[900px]:flex-row min-[900px]:items-start min-[900px]:gap-14">
          <Heading variant="club" stepper={stepper} title={copy.title} subtitle={copy.subtitle} />
          <div className={`min-w-0 min-[900px]:flex-1 ${card}`}>
            <div className={gridClasses}>{fields}</div>
            <div className="hidden flex-col gap-2.5 min-[900px]:flex">{actions}</div>
          </div>
        </div>
      </ClubShell>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink min-[900px]:grid min-[900px]:grid-cols-[480px_1fr]">
      <div className="flex flex-col items-start gap-3.5 px-4 pt-5 min-[900px]:gap-5 min-[900px]:px-12 min-[900px]:py-10">
        <div className="flex flex-col items-start">
          <AppLogo className="text-[22px] min-[900px]:text-[26px]" />
          {step === 2 && <BackButton onClick={() => goTo(1)} />}
        </div>
        <div className="flex w-full flex-col gap-3.5 min-[900px]:mt-9 min-[900px]:gap-5">
          <div className="rounded-2xl border-t-4 border-corner-red bg-red-tint px-3.5 py-3 text-[14px] leading-5 min-[900px]:max-w-85">
            <strong>{clubName}</strong> te demande de compléter ta fiche de combattant. Pas de compte à créer.
          </div>
          <Heading variant="link" stepper={stepper} title={copy.title} subtitle={copy.subtitle} />
        </div>
      </div>
      <div className="flex flex-1 flex-col min-[900px]:items-stretch min-[900px]:justify-center min-[900px]:py-12 min-[900px]:pr-16">
        <div className={`flex flex-1 flex-col min-[900px]:flex-none ${card}`}>
          <div className="flex-1 px-4 pt-3.5 min-[900px]:flex-none min-[900px]:p-0">
            <div className={gridClasses}>{fields}</div>
          </div>
          <div className="sticky bottom-0 flex flex-col gap-2.5 border-t border-line bg-surface-raised px-4 pt-3 pb-5 min-[900px]:static min-[900px]:border-0 min-[900px]:bg-transparent min-[900px]:p-0">
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}

/** « Retour » du parcours par lien : revient à l'étape 1 (sans cible logique hors du formulaire). */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hidden min-h-11 cursor-pointer items-center gap-1 bg-transparent p-0 font-sans text-[16px] font-bold text-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink min-[900px]:inline-flex"
    >
      <ChevronLeftIcon />
      Retour
    </button>
  );
}

interface HeadingProps {
  variant: "club" | "link";
  stepper: ReactNode;
  title: string;
  subtitle: string;
}

/** Progression, titre et sous-titre de l'étape. */
function Heading({ variant, stepper, title, subtitle }: HeadingProps) {
  const club = variant === "club";
  return (
    <div className={club ? "flex flex-col gap-3.5 min-[900px]:w-75 min-[900px]:flex-none min-[900px]:gap-5" : "flex flex-col gap-3.5 min-[900px]:gap-5"}>
      {stepper}
      <div className="flex flex-col gap-2 min-[900px]:gap-5">
        <h1
          className={
            "m-0 font-display text-[28px] leading-7.5 font-black " +
            (club
              ? "min-[900px]:text-[44px] min-[900px]:leading-11 min-[900px]:tracking-[-0.02em]"
              : "min-[900px]:text-[48px] min-[900px]:leading-12 min-[900px]:tracking-[-0.02em] min-[900px]:text-balance")
          }
        >
          {title}
        </h1>
        <p className="m-0 text-[15px] leading-5.5 text-ink-muted min-[900px]:max-w-85 min-[900px]:text-[17px] min-[900px]:leading-6.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default FighterFormFlow;
