import { useNavigate } from "react-router-dom";
import Button from "../../components/atoms/Buttons";
import ChipGroup from "../../components/molecules/form/ChipGroup";
import SelectField from "../../components/molecules/form/SelectField";
import TextField from "../../components/molecules/form/TextField";
import EmptyState from "../../components/molecules/EmptyState";
import PageHeader from "../../components/molecules/PageHeader";
import StateMessage from "../../components/molecules/StateMessage";
import { useAsync } from "../../hooks/useAsync";
import {
  DISCIPLINES,
  WEIGHT_CLASSES_KG,
  criteriaForFighter,
  disciplineLabel,
  fightsRangeError,
  fighterName,
  formatWeight,
  formatWeights,
  monthLabel,
  searchOpponents,
  searchQuery,
  upcomingMonths,
} from "../../lib/fighters";
import type { Discipline, SearchCriteria } from "../../lib/fighters";
import ClubShell from "./ClubShell";
import { useSearch } from "./SearchContext";

const plural = (n: number) => `${n} combattant${n > 1 ? "s" : ""}`;
const months = upcomingMonths();
const FIELD = "min-[900px]:gap-2";

function Criteria() {
  const { load, fighters, criteria, setCriteria } = useSearch();
  const navigate = useNavigate();
  const rangeError = criteria ? fightsRangeError(criteria) : undefined;
  const search = useAsync(
    () => (criteria && !rangeError ? searchOpponents(criteria) : Promise.resolve(null)),
    criteria ? searchQuery(criteria) : "none",
    250,
  );

  if (load.status !== "ready" || !criteria) {
    return (
      <ClubShell>
        <PageHeader title="Trouver un adversaire" />
        {load.status === "ready" ? (
          <EmptyState title="Ton ring est vide">
            Ton club n'a pas encore de combattant. Ajoutes-en un pour chercher un adversaire.
          </EmptyState>
        ) : (
          <StateMessage alert={load.status === "error"}>
            {load.status === "loading"
              ? "Chargement de tes combattants…"
              : "Impossible de charger tes combattants. Recharge la page."}
          </StateMessage>
        )}
      </ClubShell>
    );
  }

  const update = (patch: Partial<SearchCriteria>) => setCriteria({ ...criteria, ...patch });
  const count = search.status === "done" && search.data ? search.data.total : undefined;
  const disabledReason = rangeError
    ? rangeError
    : count === 0
      ? "Aucun combattant ne correspond : élargis tes critères."
      : undefined;
  const canSearch = !rangeError && count !== undefined && count > 0;
  const submit = () => navigate("/adversaires/resultats");
  const weightOptions = [...new Set([...WEIGHT_CLASSES_KG, ...criteria.weights])].sort((a, b) => a - b);

  return (
    <ClubShell
      mobileActionsClassName="pb-3"
      mobileActions={
        <div className="flex flex-col gap-1.5">
          <Button size="lg" disabled={!canSearch} onClick={submit}>
            {count === undefined ? "Voir les combattants" : `Voir ${plural(count)}`}
          </Button>
          {disabledReason && <p className="m-0 text-center text-[12px] leading-4 text-ink-muted">{disabledReason}</p>}
        </div>
      }
    >
      <PageHeader
        title="Trouver un adversaire"
        subtitle={
          <>
            Décris le combat que tu cherches.
            <span className="hidden min-[900px]:inline"> On te montre les combattants des autres clubs qui correspondent.</span>
          </>
        }
      />
      <div className="flex flex-col gap-3.5 min-[900px]:flex-row min-[900px]:items-start min-[900px]:gap-7">
        <form
          onSubmit={(e) => e.preventDefault()}
          className={
            "flex flex-col gap-3.5 min-[900px]:box-border min-[900px]:min-w-0 min-[900px]:flex-1 min-[900px]:grid min-[900px]:grid-cols-2 " +
            "min-[900px]:gap-x-4 min-[900px]:gap-y-5 min-[900px]:rounded-[28px] min-[900px]:border-2 min-[900px]:border-ink " +
            "min-[900px]:bg-surface-raised min-[900px]:p-7 min-[900px]:shadow-[6px_6px_0_0_var(--color-ink)]"
          }
        >
          <SelectField
            label="Ton combattant"
            className={`${FIELD} min-[900px]:col-span-2`}
            value={criteria.fighterId}
            onChange={(e) => {
              const fighter = fighters.find((f) => f.id === e.target.value);
              if (fighter) setCriteria(criteriaForFighter(fighter, criteria.month));
            }}
          >
            {fighters.map((f) => (
              <option key={f.id} value={f.id}>
                {`${fighterName(f)} · ${formatWeights(f.weightClassesKg)} · ${f.fights} combat${f.fights > 1 ? "s" : ""}`}
              </option>
            ))}
          </SelectField>

          <DisciplineChips value={criteria.discipline} onChange={(discipline) => update({ discipline })} className="min-[900px]:col-span-2" />

          <ChipGroup
            className="min-[900px]:col-span-2"
            labelGap="gap-1.5 min-[900px]:gap-2"
            label="Catégories de poids"
            hint="(plusieurs choix)"
            options={weightOptions.map(formatWeight)}
            value={criteria.weights.map(formatWeight)}
            onChange={(labels) => {
              const weights = weightOptions.filter((w) => labels.includes(formatWeight(w)));
              if (weights.length > 0) update({ weights });
            }}
          />

          <SelectField
            label="Date souhaitée"
            className={`${FIELD} min-[900px]:col-span-2`}
            value={criteria.month}
            onChange={(e) => update({ month: e.target.value })}
          >
            <option value="">Peu importe</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </SelectField>

          <div className="grid grid-cols-2 gap-x-2.5 gap-y-3.5 min-[900px]:col-span-2 min-[900px]:grid-cols-subgrid min-[900px]:gap-x-4 min-[900px]:gap-y-5">
            <TextField className={FIELD} label="Combats minimum" inputMode="numeric" value={criteria.minFights} onChange={(e) => update({ minFights: e.target.value })} />
            <TextField className={FIELD} label="Combats maximum" inputMode="numeric" value={criteria.maxFights} placeholder="Sans limite" error={rangeError} onChange={(e) => update({ maxFights: e.target.value })} />
            <TextField className={FIELD} label="Victoires minimum" inputMode="numeric" value={criteria.minWins} onChange={(e) => update({ minWins: e.target.value })} />
            <TextField className={FIELD} label="Défaites maximum" inputMode="numeric" value={criteria.maxLosses} placeholder="Peu importe" onChange={(e) => update({ maxLosses: e.target.value })} />
          </div>
        </form>

        <aside className="hidden w-75 flex-none flex-col gap-4 min-[900px]:flex">
          <div className="flex items-center gap-3.5 rounded-2xl border-t-4 border-corner-blue bg-blue-tint p-4">
            <span className="font-display text-[40px] leading-10 font-black text-corner-blue">{count ?? "–"}</span>
            <span className="text-[14px] leading-5 font-semibold">
              {count === 1 ? "combattant compatible" : "combattants compatibles"} avec ces critères.
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-2.5">
            <Button size="lg" className="min-h-14 px-8" disabled={!canSearch} onClick={submit}>
              Rechercher
            </Button>
            {disabledReason && <p className="m-0 text-[13px] leading-4.5 font-bold text-red-deep">{disabledReason}</p>}
          </div>
          <p className="m-0 text-[13px] leading-4.5 text-ink-muted">
            Les catégories de poids sont indicatives : la grille officielle sera définie plus tard avec les organisateurs.
          </p>
        </aside>
      </div>
    </ClubShell>
  );
}

function DisciplineChips({ value, onChange, className }: { value: Discipline; onChange: (d: Discipline) => void; className?: string }) {
  return (
    <ChipGroup
      className={className}
      labelGap="gap-1.5 min-[900px]:gap-2"
      label="Discipline"
      options={DISCIPLINES.map((d) => d.label)}
      value={[disciplineLabel(value)]}
      onChange={(labels) => {
        const picked = DISCIPLINES.find((d) => labels.includes(d.label) && d.value !== value);
        if (picked) onChange(picked.value);
      }}
    />
  );
}

export default Criteria;
