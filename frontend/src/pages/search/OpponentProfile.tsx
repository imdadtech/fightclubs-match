import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Button, { ButtonLink } from "../../components/atoms/Buttons";
import BackLink from "../../components/molecules/BackLink";
import PageHeader from "../../components/molecules/PageHeader";
import StateMessage from "../../components/molecules/StateMessage";
import { ApiError } from "../../lib/api";
import { useAsync } from "../../hooks/useAsync";
import {
  compatibilityLabel,
  createProposal,
  fighterName,
  formatHeight,
  formatWeight,
  formatWeights,
  getOpponent,
  monthName,
} from "../../lib/fighters";
import type { Fighter, OpponentDetail } from "../../lib/fighters";
import ClubShell from "./ClubShell";
import { useSearch } from "./SearchContext";

function Side({ tone, label, fighter }: { tone: "red" | "blue"; label: string; fighter: Fighter }) {
  const red = tone === "red";
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col gap-0.5 rounded-2xl border-t-4 p-3 min-[900px]:p-4 ${
        red ? "border-corner-red bg-red-tint" : "border-corner-blue bg-blue-tint"
      }`}
    >
      <span className={`text-[12px] font-bold tracking-[0.08em] uppercase ${red ? "text-red-deep" : "text-corner-blue"}`}>{label}</span>
      <span className="font-display text-[20px] leading-6 font-black min-[900px]:text-[24px] min-[900px]:leading-7">{fighterName(fighter)}</span>
      <span className="text-[12px] leading-4 text-ink-muted min-[900px]:text-[13px] min-[900px]:leading-4.5">{fighter.club.name}</span>
    </div>
  );
}

const record = (f: Fighter) => `${f.wins} V · ${f.losses} D`;

/** Phrase de synthèse construite avec les vraies données des deux combattants. */
function summary(d: OpponentDetail, month: string): string {
  const parts: string[] = [];
  if (d.fighter.weightClassesKg.includes(d.commonWeightKg)) parts.push("Même catégorie de poids possible");
  if (d.fighter.discipline === d.opponent.discipline) parts.push("même discipline");
  if (Math.abs(d.fighter.fights - d.opponent.fights) <= 4) parts.push("expérience proche");
  const months = d.opponent.availableMonths.filter((m) => d.fighter.availableMonths.includes(m) || m === month);
  const text = parts.length ? `${parts.join(", ")}.` : "Les profils sont compatibles.";
  return months.length ? `${text} Disponible en ${months.map(monthName).join(" et ")}.` : text;
}

function OpponentProfile() {
  const { id = "" } = useParams();
  const { criteria } = useSearch();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();
  const detail = useAsync(
    () => (criteria ? getOpponent(id, criteria.fighterId) : Promise.reject(new Error("no criteria"))),
    `${id}|${criteria?.fighterId}`,
  );
  if (!criteria) return <Navigate to="/adversaires" replace />;

  const propose = async () => {
    if (detail.status !== "done") return;
    setSending(true);
    setError(undefined);
    try {
      await createProposal({
        fromFighterId: detail.data.fighter.id,
        toFighterId: detail.data.opponent.id,
        weightClassKg: detail.data.commonWeightKg,
        desiredMonth: criteria.month || undefined,
      });
      navigate("/notifications", { state: { box: "sent" } });
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === "already_proposed"
          ? "Tu as déjà proposé ce combat."
          : "La proposition n'a pas pu être envoyée. Réessaie dans un instant.",
      );
      setSending(false);
    }
  };

  const pass = <ButtonLink to="/adversaires/resultats" variant="secondary" size="lg" flat className="px-5 min-[900px]:px-7">Passer</ButtonLink>;
  const propose1 = (extra: string) => (
    <Button size="lg" className={extra} disabled={detail.status !== "done" || sending} onClick={propose}>
      Proposer ce combat
    </Button>
  );
  const errorText = error && <p role="alert" className="m-0 text-[14px] leading-5 font-bold text-red-deep">{error}</p>;

  if (detail.status !== "done") {
    return (
      <ClubShell compactTop mobileGap="gap-4">
        <BackLink to="/adversaires/resultats">Résultats</BackLink>
        <PageHeader title="Fiche adversaire" desktopOnly />
        {detail.status === "loading" ? (
          <StateMessage>Chargement de la fiche…</StateMessage>
        ) : (
          <StateMessage alert>
            {detail.error instanceof ApiError && detail.error.status === 404
              ? "Cette fiche n'existe plus. Reviens aux résultats."
              : "Impossible de charger la fiche. Réessaie dans un instant."}
          </StateMessage>
        )}
      </ClubShell>
    );
  }

  const { fighter: own, opponent, commonWeightKg, compatibility } = detail.data;
  const rows: [string, string, string][] = [
    [formatWeights(own.weightClassesKg), "Catégories", formatWeights(opponent.weightClassesKg)],
    [`${own.age} ans`, "Âge", `${opponent.age} ans`],
    [formatHeight(own.heightCm), "Taille", formatHeight(opponent.heightCm)],
    [String(own.fights), "Combats", String(opponent.fights)],
    [record(own), "Palmarès", record(opponent)],
  ];

  return (
    <ClubShell
      compactTop
      mobileGap="gap-4"
      mobileActions={
        <div className="flex flex-col gap-2">
          {errorText}
          <div className="flex gap-2.5">
            {pass}
            {propose1("flex-1")}
          </div>
        </div>
      }
      desktopActions={
        <>
          {errorText}
          {pass}
          {propose1("px-9")}
        </>
      }
    >
      <BackLink to="/adversaires/resultats">Résultats</BackLink>
      <PageHeader title="Fiche adversaire" desktopOnly />

      <div className="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-start min-[900px]:gap-7">
        <div className="flex min-w-0 flex-col gap-4 min-[900px]:flex-1 min-[900px]:gap-5">
          <div className="flex items-stretch gap-2 min-[900px]:gap-3">
            <Side tone="red" label="Ton côté" fighter={own} />
            <div className="grid size-9 flex-none place-items-center self-center rounded-full bg-ink font-display text-[14px] font-black text-on-ink min-[900px]:size-10">
              VS
            </div>
            <Side tone="blue" label="Adversaire" fighter={opponent} />
          </div>

          <div className="flex flex-col gap-2.5 rounded-lg bg-surface-raised p-4 shadow-soft min-[900px]:gap-3 min-[900px]:p-5.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] font-bold tracking-[0.08em] text-ink-muted uppercase">Compatibilité</span>
              <span className={`text-[13px] font-bold min-[900px]:text-[14px] ${compatibility === "very" ? "text-success" : "text-ink"}`}>
                {compatibilityLabel(compatibility)}
              </span>
            </div>
            <div className="flex items-baseline gap-2 min-[900px]:gap-2.5">
              <span className="font-display text-[36px] leading-10 font-black min-[900px]:text-[48px] min-[900px]:leading-13">
                {formatWeight(commonWeightKg)}
              </span>
              <span className="text-[14px] font-semibold text-ink-muted min-[900px]:text-[16px]">catégorie commune</span>
            </div>
            <p className="m-0 text-[14px] leading-5 text-ink-muted min-[900px]:text-[15px] min-[900px]:leading-5.5">
              {summary(detail.data, criteria.month)}
            </p>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface-raised min-[900px]:flex-1">
          <div className="grid grid-cols-[1fr_auto_1fr] bg-surface-sunken px-4 py-2.5 text-[12px] font-bold tracking-[0.08em] uppercase min-[900px]:px-5.5 min-[900px]:py-3">
            <span className="text-red-deep">{own.firstName}</span>
            <span className="text-center text-ink-muted">Comparatif</span>
            <span className="text-right text-corner-blue">{opponent.firstName}</span>
          </div>
          {rows.map(([mine, name, theirs], i) => (
            <div
              key={name}
              className={`grid grid-cols-[1fr_auto_1fr] px-4 py-[11px] text-[15px] font-bold min-[900px]:px-5.5 min-[900px]:py-3.5 min-[900px]:text-[17px] ${i > 0 ? "border-t border-line" : ""}`}
            >
              <span>{mine}</span>
              <span className="text-[13px] font-medium text-ink-muted min-[900px]:text-[14px]">{name}</span>
              <span className="text-right">{theirs}</span>
            </div>
          ))}
        </div>
      </div>
    </ClubShell>
  );
}

export default OpponentProfile;
