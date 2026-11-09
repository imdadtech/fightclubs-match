import { useFormik } from "formik";
import { useState } from "react";
import { Link } from "react-router-dom";
import AppLogo from "../../../components/atoms/AppLogo";
import Button from "../../../components/atoms/Buttons";
import StepIndicator from "../../../components/molecules/StepIndicator";
import ClubStepClub from "./ClubStepClub";
import ClubStepContact from "./ClubStepContact";
import ClubStepManager from "./ClubStepManager";
import type { StepProps } from "./types";
import { initialClubForm } from "./clubForm";
import type { ClubForm } from "./clubForm";
import { STEP_FIELDS, STEP_SCHEMAS } from "./clubSchemas";

const STEPS = [
  {
    title: "Ton club",
    subtitle:
      "Crée la page de ton club pour recevoir les annonces des autres clubs.",
    Component: ClubStepClub,
  },
  {
    title: "Responsable du compte",
    subtitle: "La personne qui gère le compte du club.",
    Component: ClubStepManager,
  },
  {
    title: "Contact pour organiser le combat",
    subtitle: "Choisis comment l'autre club te joint.",
    Component: ClubStepContact,
  },
];

const backClasses =
  "inline-flex min-h-11 cursor-pointer items-center gap-1 bg-transparent p-0 font-sans " +
  "text-[15px] font-bold text-ink no-underline min-[900px]:text-[16px] " +
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink";

function BackIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ClubOnboarding() {
  const [step, setStep] = useState(1);
  const isLast = step === STEPS.length;

  const formik = useFormik<ClubForm>({
    initialValues: initialClubForm,
    // Chaque étape ne valide que ses propres champs.
    validationSchema: STEP_SCHEMAS[step - 1],
    onSubmit: () => {
      // L'envoi au backend reste à brancher.
    },
  });
  const { values: form, touched, errors } = formik;

  const update = (patch: Partial<ClubForm>) => formik.setValues((v) => ({ ...v, ...patch }));
  const touch = (...fields: (keyof ClubForm)[]) => {
    for (const field of fields) formik.setFieldTouched(field, true, true);
  };
  // Seules les erreurs des champs déjà touchés sont affichées.
  const visibleErrors: StepProps["errors"] = {};
  for (const key of Object.keys(errors) as (keyof ClubForm)[]) {
    const error = errors[key];
    if (touched[key] && typeof error === "string") visibleErrors[key] = error;
  }

  const { title, subtitle, Component } = STEPS[step - 1];
  const goToStep = (next: number) => {
    formik.setTouched({}, false);
    formik.setErrors({});
    setStep(next);
  };

  const handleNext = async () => {
    const stepErrors = await formik.validateForm();
    if (Object.keys(stepErrors).length > 0) {
      await formik.setTouched(
        Object.fromEntries(STEP_FIELDS[step - 1].map((field) => [field, true])),
        false,
      );
      // Amène le premier champ en erreur à l'écran.
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        }),
      );
      return;
    }
    if (isLast) formik.submitForm();
    else goToStep(step + 1);
  };
  const isFirst = step === 1;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink min-[900px]:grid min-[900px]:grid-cols-[480px_1fr]">
      <div className="flex flex-col items-start px-4 pt-4 min-[900px]:gap-5 min-[900px]:px-12 min-[900px]:py-10">
        <div className="flex flex-col items-start">
          <AppLogo className="text-[22px] min-[900px]:text-[26px]" />
          {isFirst ? (
            <Link to="/onboarding" className={backClasses}>
              <BackIcon />
              Retour
            </Link>
          ) : (
            <button
              type="button"
              className={backClasses}
              onClick={() => goToStep(step - 1)}
            >
              <BackIcon />
              Retour
            </button>
          )}
        </div>

        <div className="mt-3 flex w-full flex-col gap-3.5 min-[900px]:mt-9 min-[900px]:gap-5">
          <StepIndicator step={step} />
          <div className="flex flex-col gap-2 min-[900px]:gap-5">
            <h1 className="m-0 font-display text-[28px] leading-[30px] font-black min-[900px]:text-[48px] min-[900px]:leading-[48px] min-[900px]:tracking-[-0.02em] min-[900px]:text-balance">
              {title}
            </h1>
            <p className="m-0 text-[15px] leading-[22px] text-ink-muted min-[900px]:max-w-85 min-[900px]:text-[17px] min-[900px]:leading-[26px]">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col min-[900px]:justify-center min-[900px]:py-12 min-[900px]:pr-16">
        <div className="flex flex-1 flex-col min-[900px]:flex-none min-[900px]:gap-6 min-[900px]:rounded-3xl min-[900px]:border-2 min-[900px]:border-ink min-[900px]:bg-surface-raised min-[900px]:p-8 min-[900px]:shadow-[6px_6px_0_0_var(--color-ink)]">
          <div className="flex-1 px-4 pt-3.5 min-[900px]:flex-none min-[900px]:p-0">
            <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] content-start gap-x-2.5 gap-y-3.5 min-[900px]:gap-4">
              <Component form={form} update={update} errors={visibleErrors} touch={touch} />
            </div>
          </div>

          <div className="sticky bottom-0 flex flex-col gap-2.5 border-t border-line bg-surface-raised px-4 pt-3 pb-5 min-[900px]:static min-[900px]:border-0 min-[900px]:bg-transparent min-[900px]:p-0">
            <div className="flex gap-2.5 min-[900px]:items-center min-[900px]:justify-end min-[900px]:gap-3">
              {!isFirst && (
                <Button
                  variant="secondary"
                  size="lg"
                  flat
                  className="flex-none px-[22px] min-[900px]:px-7"
                  onClick={() => goToStep(step - 1)}
                >
                  Précédent
                </Button>
              )}
              <Button
                size="lg"
                className="flex-1 px-8 min-[900px]:flex-none"
                onClick={handleNext}
              >
                {isLast ? "Créer le compte du club" : "Suivant"}
              </Button>
            </div>
            {isFirst && (
              <span className="text-center text-[14px] text-ink-muted min-[900px]:hidden">
                Tu as déjà un compte ?{" "}
                <Link
                  to="/login"
                  className="font-bold text-red-deep underline hover:text-ink"
                >
                  Se connecter
                </Link>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClubOnboarding;
