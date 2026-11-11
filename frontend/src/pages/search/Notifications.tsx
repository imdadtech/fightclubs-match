import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button, { ButtonLink } from "../../components/atoms/Buttons";
import Chip from "../../components/atoms/Chip";
import PageHeader from "../../components/molecules/PageHeader";
import StateMessage from "../../components/molecules/StateMessage";
import { useAsync } from "../../hooks/useAsync";
import {
  acceptProposal,
  declineProposal,
  disciplineLabel,
  fighterName,
  formatWeight,
  listProposals,
  monthLabel,
  placeOf,
  relativeTime,
  sidesOf,
} from "../../lib/fighters";
import type { Proposal } from "../../lib/fighters";
import ClubShell from "./ClubShell";

type Box = "received" | "sent";

const eyebrow = "flex justify-between gap-2 text-[12px] font-bold tracking-[0.08em] uppercase";
const title = "font-display font-extrabold";
const STATUS = { PENDING: "en attente", ACCEPTED: "acceptée", DECLINED: "déclinée" } as const;

/** « Boxe anglaise · Décembre 2026 · Lyon (69) · −71 kg » */
const details = (p: Proposal) =>
  [disciplineLabel(p.from.discipline), p.desiredMonth && monthLabel(p.desiredMonth), placeOf(p.from.club), formatWeight(p.weightClassKg)]
    .filter(Boolean)
    .join(" · ");

function Notifications() {
  const location = useLocation();
  const navigate = useNavigate();
  const [box, setBox] = useState<Box>((location.state as { box?: Box } | null)?.box ?? "received");
  const received = useAsync(() => listProposals("received"), "received");
  const sent = useAsync(() => listProposals("sent"), "sent");
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();

  const active = box === "received" ? received : sent;
  const pendingCount = received.status === "done" ? received.data.filter((p) => p.status === "PENDING").length : undefined;

  const answer = async (p: Proposal, accept: boolean) => {
    setBusy(p.id);
    setError(undefined);
    try {
      await (accept ? acceptProposal(p.id) : declineProposal(p.id));
      if (accept) navigate(`/notifications/${p.id}`);
      else received.reload();
    } catch {
      setError("Ta réponse n'a pas pu être envoyée. Réessaie dans un instant.");
    } finally {
      setBusy(undefined);
    }
  };

  const list = active.status === "done" ? active.data : [];
  const firstPending = list.find((p) => p.direction === "received" && p.status === "PENDING")?.id;

  return (
    <ClubShell>
      <PageHeader title="Notifications" />
      <div className="flex gap-2">
        <Chip active={box === "received"} onClick={() => setBox("received")} className="min-[900px]:px-4.5">
          {`Propositions reçues${pendingCount ? ` · ${pendingCount}` : ""}`}
        </Chip>
        <Chip active={box === "sent"} onClick={() => setBox("sent")} className="min-[900px]:px-4.5">
          Mes propositions
        </Chip>
      </div>

      {error && <StateMessage alert>{error}</StateMessage>}
      {active.status === "loading" && <StateMessage>Chargement…</StateMessage>}
      {active.status === "error" && <StateMessage alert>Impossible de charger tes notifications. Recharge la page.</StateMessage>}
      {active.status === "done" && list.length === 0 && (
        <StateMessage>
          {box === "received" ? "Aucune proposition reçue pour le moment." : "Tu n'as encore proposé aucun combat. Cherche un adversaire pour en proposer un."}
        </StateMessage>
      )}

      <div className="flex flex-col gap-3.5 min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:gap-5">
        {list.map((p) => {
          const { mine, other } = sidesOf(p);
          const pending = p.status === "PENDING";

          if (p.direction === "received" && pending) {
            const first = p.id === firstPending;
            return (
              <article
                key={p.id}
                className="flex flex-col gap-2 rounded-lg border-t-4 border-corner-red bg-red-tint p-3.5 min-[900px]:gap-2.5 min-[900px]:p-5"
              >
                <div className={`${eyebrow} text-red-deep`}>
                  <span>Nouveau</span>
                  <span className="text-ink-muted">{relativeTime(p.createdAt)}</span>
                </div>
                <div className={`${title} text-[18px] leading-5.5 min-[900px]:text-[20px] min-[900px]:leading-6`}>
                  {other.club.name} propose un combat
                </div>
                <div className="text-[14px] leading-5 text-ink-muted min-[900px]:text-[15px] min-[900px]:leading-5.5">{details(p)}</div>
                <div className="flex items-center gap-2 self-start rounded-md bg-surface-raised px-2.5 py-2 text-[13px] font-semibold min-[900px]:px-3 min-[900px]:text-[14px]">
                  <span className="size-2.5 flex-none rounded-full bg-corner-red" />
                  {fighterName(mine)} correspond : catégorie {formatWeight(p.weightClassKg)}
                </div>
                <div className="mt-1 flex flex-wrap gap-2 min-[900px]:mt-1.5 min-[900px]:gap-2.5">
                  <Button size="sm" variant={first ? "primary" : "secondary"} flat disabled={busy === p.id} onClick={() => answer(p, true)} className="flex-1 min-[900px]:min-h-12 min-[900px]:flex-none min-[900px]:px-6 min-[900px]:text-[16px]">
                    Accepter
                  </Button>
                  <ButtonLink to="/adversaires" size="sm" variant="secondary" flat className="flex-1 min-[900px]:min-h-12 min-[900px]:flex-none min-[900px]:px-6 min-[900px]:text-[16px]">
                    Proposer un autre
                  </ButtonLink>
                  <Button size="sm" variant="ghost" disabled={busy === p.id} onClick={() => answer(p, false)} className="px-3 min-[900px]:min-h-12 min-[900px]:px-5 min-[900px]:text-[15px]">
                    Décliner
                  </Button>
                </div>
              </article>
            );
          }

          return (
            <article key={p.id} className="flex flex-col gap-1.5 rounded-lg border border-line bg-surface-raised p-3.5 min-[900px]:gap-2.5 min-[900px]:p-5">
              <div className={`${eyebrow} text-ink-muted`}>
                <span>
                  {p.direction === "received" ? "Répondue" : "Envoyée"} · {STATUS[p.status]}
                </span>
                <span>{relativeTime(p.respondedAt ?? p.createdAt)}</span>
              </div>
              <div className={`${title} text-[16px] leading-5 min-[900px]:text-[20px] min-[900px]:leading-6`}>
                {p.direction === "received"
                  ? `${other.club.name} cherche un ${formatWeight(p.weightClassKg)}`
                  : `${fighterName(mine)} propose un combat à ${other.club.name}`}
              </div>
              {p.status === "ACCEPTED" && (
                <div className="mt-1">
                  <ButtonLink to={`/notifications/${p.id}`} size="sm" variant="secondary" flat className="min-[900px]:min-h-12 min-[900px]:px-6 min-[900px]:text-[15px]">
                    Voir les coordonnées
                  </ButtonLink>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </ClubShell>
  );
}

export default Notifications;
