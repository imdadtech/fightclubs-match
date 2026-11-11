import { disciplineLabel, fighterInitials, fighterName, formatWeightsShort, isAvailable } from "../../lib/fighters";
import type { Fighter } from "../../lib/fighters";

/**
 * Carte d'un combattant du club (liste « Mes combattants »).
 * Mobile : une ligne (avatar, infos avec disciplines, statut à droite).
 * Desktop : deux lignes (avatar + infos, puis disciplines et statut).
 */
function FighterCard({ fighter }: { fighter: Fighter }) {
  const available = isAvailable(fighter);
  const fights = `${fighter.totalFights} combat${fighter.totalFights > 1 ? "s" : ""}`;
  const info = `${formatWeightsShort(fighter.weightClassesKg)} · ${fighter.age} ans · ${fights}`;
  const disciplines = fighter.records.map((r) => disciplineLabel(r.discipline)).join(" · ");
  const statusClasses = available ? "text-success" : "text-ink-muted";
  const status = available ? "✓ Disponible" : "Non disponible";

  return (
    <article className="flex flex-col rounded-lg bg-surface-raised p-3.5 shadow-soft min-[900px]:gap-3.5 min-[900px]:p-5">
      <div className="flex items-center gap-3 min-[900px]:gap-3.5">
        <div className="grid size-11 flex-none place-items-center rounded-full border-2 border-corner-red bg-red-tint font-display text-[16px] font-black text-red-deep min-[900px]:size-13 min-[900px]:text-[18px]">
          {fighterInitials(fighter)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[18px] leading-5.5 font-extrabold min-[900px]:text-[20px] min-[900px]:leading-6">
            {fighterName(fighter)}
          </div>
          <div className="text-[13px] leading-4.5 text-ink-muted min-[900px]:text-[14px] min-[900px]:leading-5">
            {info}
            <span className="min-[900px]:hidden"> · {disciplines}</span>
          </div>
        </div>
        <span className={`flex-none text-[12px] font-bold min-[900px]:hidden ${statusClasses}`}>{status}</span>
      </div>
      <div className="hidden flex-wrap items-center justify-between gap-x-3 gap-y-1 min-[900px]:flex">
        <span className="text-[14px] font-semibold">{disciplines}</span>
        <span className={`text-[13px] font-bold ${statusClasses}`}>{status}</span>
      </div>
    </article>
  );
}

export default FighterCard;
