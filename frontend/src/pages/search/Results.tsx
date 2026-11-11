import { Link, Navigate } from "react-router-dom";
import Chip from "../../components/atoms/Chip";
import OpponentCard from "../../components/molecules/OpponentCard";
import PageHeader from "../../components/molecules/PageHeader";
import StateMessage from "../../components/molecules/StateMessage";
import { useAsync } from "../../hooks/useAsync";
import {
  DISCIPLINES,
  fighterName,
  formatWeight,
  formatWeights,
  monthLabel,
  monthName,
  searchOpponents,
  searchQuery,
  upcomingMonths,
} from "../../lib/fighters";
import ClubShell from "./ClubShell";
import { useSearch } from "./SearchContext";

const label = "text-[12px] font-bold tracking-[0.08em] text-ink-muted uppercase";

function Results() {
  const { criteria, setCriteria } = useSearch();
  const search = useAsync(
    () => (criteria ? searchOpponents(criteria) : Promise.reject(new Error("no criteria"))),
    criteria ? searchQuery(criteria) : "none",
  );
  if (!criteria) return <Navigate to="/adversaires" replace />;

  const own = search.status === "done" ? search.data.fighter : undefined;
  // Disponibilité : le mois souhaité et le suivant ; aucun actif = tous les mois.
  const base = criteria.month || upcomingMonths(1)[0];
  const availability = [base, upcomingMonths(13).find((m) => m > base) ?? base];
  const weightOptions = [...new Set([...(own?.weightClassesKg ?? []), ...criteria.weights])].sort((a, b) => a - b);
  const total = search.status === "done" ? search.data.total : undefined;

  const disciplineChips = DISCIPLINES.map((d) => (
    <Chip key={d.value} active={criteria.discipline === d.value} onClick={() => setCriteria({ ...criteria, discipline: d.value })}>
      {d.label}
    </Chip>
  ));
  const weightChips = weightOptions.map((w) => (
    <Chip
      key={w}
      active={criteria.weights.includes(w)}
      onClick={() => {
        const weights = criteria.weights.includes(w) ? criteria.weights.filter((x) => x !== w) : [...criteria.weights, w];
        if (weights.length > 0) setCriteria({ ...criteria, weights });
      }}
    >
      {formatWeight(w)}
    </Chip>
  ));
  const monthChips = availability.map((m) => (
    <Chip key={m} active={criteria.month === m} onClick={() => setCriteria({ ...criteria, month: criteria.month === m ? "" : m })}>
      {monthName(m).replace(/^./, (c) => c.toUpperCase())}
    </Chip>
  ));

  const ownSummary = own && (
    <>
      <strong>{fighterName(own)}</strong> · {formatWeights(own.weightClassesKg)} · {own.age} ans · {own.fights} combat
      {own.fights > 1 ? "s" : ""}
    </>
  );

  return (
    <ClubShell>
      <PageHeader title="Trouver un adversaire" subtitle="Les combattants des autres clubs qui peuvent boxer contre le tien." subtitleDesktopOnly />

      <div className="flex flex-col gap-3.5 min-[900px]:flex-row min-[900px]:items-start min-[900px]:gap-7">
        {/* Mobile : bloc « Pour ton combattant » puis filtres en défilement horizontal */}
        <div className="flex flex-col gap-3.5 min-[900px]:box-border min-[900px]:w-62.5 min-[900px]:flex-none min-[900px]:gap-5 min-[900px]:rounded-lg min-[900px]:bg-surface-raised min-[900px]:p-5 min-[900px]:shadow-soft">
          <div className="flex items-center gap-2.5 rounded-md border-t-4 border-corner-red bg-red-tint px-3 py-2.5 min-[900px]:flex-col min-[900px]:items-stretch min-[900px]:gap-1.5 min-[900px]:px-3.5 min-[900px]:py-3">
            <div className="min-w-0 text-[14px] leading-5">
              <span className="text-[12px] font-bold tracking-[0.08em] text-red-deep uppercase min-[900px]:block">Pour ton combattant</span>
              <br className="min-[900px]:hidden" />
              {ownSummary}
            </div>
            <Link
              to="/adversaires"
              className="ml-auto inline-flex min-h-11 flex-none items-center text-[14px] font-bold text-red-deep underline min-[900px]:hidden"
            >
              Modifier la recherche
            </Link>
          </div>

          <div className="flex flex-col gap-2 min-[900px]:gap-5">
            <FilterRow title="Discipline">{disciplineChips}</FilterRow>
            <FilterRow title="Catégorie de poids" mobileTitle="Catégorie de poids et disponibilité" extraMobile={monthChips}>
              {weightChips}
            </FilterRow>
            <FilterRow title="Disponibilité" desktopOnly>{monthChips}</FilterRow>
          </div>
          <Link
            to="/adversaires"
            className="hidden min-h-11 items-center text-[15px] font-bold text-red-deep no-underline min-[900px]:inline-flex"
          >
            Modifier la recherche
          </Link>
        </div>

        <div className="flex min-w-0 flex-col gap-3 min-[900px]:flex-1 min-[900px]:gap-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[15px] font-bold min-[900px]:text-[17px]">
              {total === undefined ? "Recherche en cours…" : `${total} combattant${total > 1 ? "s" : ""} compatible${total > 1 ? "s" : ""}`}
            </span>
            <span className="text-[12px] font-medium text-ink-muted min-[900px]:text-[13px]">Triés par compatibilité</span>
          </div>
          {search.status === "error" && <StateMessage alert>Impossible de charger les résultats. Réessaie dans un instant.</StateMessage>}
          {search.status === "done" && search.data.total === 0 && (
            <StateMessage>
              {`Aucun combattant ne correspond${criteria.month ? ` pour ${monthLabel(criteria.month)}` : ""}. Modifie la recherche pour élargir tes critères.`}
            </StateMessage>
          )}
          {search.status === "done" &&
            search.data.results.map((r, i) => <OpponentCard key={r.fighter.id} result={r} featured={i === 0} />)}
        </div>
      </div>
    </ClubShell>
  );
}

function FilterRow({
  title,
  mobileTitle,
  extraMobile,
  desktopOnly,
  children,
}: {
  title: string;
  mobileTitle?: string;
  extraMobile?: React.ReactNode;
  desktopOnly?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 min-[900px]:gap-2.5 ${desktopOnly ? "hidden min-[900px]:flex" : ""}`}>
      <span className={label}>
        {mobileTitle ? (
          <>
            <span className="min-[900px]:hidden">{mobileTitle}</span>
            <span className="hidden min-[900px]:inline">{title}</span>
          </>
        ) : (
          title
        )}
      </span>
      <div className="flex gap-2 overflow-x-auto pb-0.5 min-[900px]:flex-wrap min-[900px]:overflow-visible min-[900px]:pb-0">
        {children}
        {extraMobile && <span className="contents min-[900px]:hidden">{extraMobile}</span>}
      </div>
    </div>
  );
}

export default Results;
