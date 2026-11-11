import { ButtonLink } from "../atoms/Buttons";
import { compatibilityLabel, fighterInitials, fighterName, formatWeight } from "../../lib/fighters";
import type { OpponentResult } from "../../lib/fighters";

/** Carte d'un combattant dans les résultats. `featured` : bouton rouge (meilleur résultat). */
function OpponentCard({ result, featured }: { result: OpponentResult; featured: boolean }) {
  const { fighter, commonWeightKg, compatibility } = result;
  const verdict = (
    <>
      <div className="font-display text-[24px] leading-8 font-black min-[900px]:text-[28px] min-[900px]:leading-9">
        {formatWeight(commonWeightKg)}
      </div>
      <div className={`text-[12px] font-bold ${compatibility === "very" ? "text-success" : "text-ink"}`}>
        {compatibilityLabel(compatibility)}
      </div>
    </>
  );
  const age = `${fighter.age} ans · ${fighter.fights} combat${fighter.fights > 1 ? "s" : ""}`;
  const button = (
    <ButtonLink
      to={`/adversaires/${fighter.id}`}
      size="sm"
      variant={featured ? "primary" : "secondary"}
      className="flex-none min-[900px]:min-h-12 min-[900px]:px-5.5 min-[900px]:text-[15px]"
    >
      Voir la fiche
    </ButtonLink>
  );

  return (
    <article className="flex flex-col gap-2.5 rounded-lg bg-surface-raised p-3.5 shadow-soft min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-4 min-[900px]:px-5 min-[900px]:py-4.5">
      <div className="flex items-center gap-3 min-[900px]:min-w-0 min-[900px]:flex-1 min-[900px]:gap-4">
        <div className="grid size-11 flex-none place-items-center rounded-full border-2 border-corner-blue bg-blue-tint font-display text-[16px] font-black text-corner-blue min-[900px]:size-13 min-[900px]:text-[18px]">
          {fighterInitials(fighter)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[18px] leading-5.5 font-extrabold min-[900px]:text-[20px] min-[900px]:leading-6">
            {fighterName(fighter)}
          </div>
          <div className="text-[13px] leading-4.5 text-ink-muted min-[900px]:truncate min-[900px]:leading-5">
            {fighter.club.name} · {fighter.club.city}
          </div>
          <div className="mt-1 hidden text-[13px] font-semibold whitespace-nowrap min-[900px]:block">{age}</div>
        </div>
        <div className="flex-none text-right min-[900px]:hidden">{verdict}</div>
      </div>
      <div className="hidden min-w-28 flex-none text-right min-[900px]:block">{verdict}</div>
      <div className="flex items-center justify-between gap-2 min-[900px]:contents">
        <span className="text-[13px] font-semibold min-[900px]:hidden">{age}</span>
        {button}
      </div>
    </article>
  );
}

export default OpponentCard;
