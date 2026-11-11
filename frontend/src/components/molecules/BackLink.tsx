import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "../atoms/NavIcons";

/** Retour à l'écran précédent du parcours (« Résultats », « Notifications »). `flush` : sans remontée de 12 px sur desktop. */
function BackLink({ to, children, flush }: { to: string; children: string; flush?: boolean }) {
  return (
    <Link
      to={to}
      className={
        "inline-flex min-h-11 items-center gap-1.5 self-start text-[15px] font-bold text-ink no-underline " +
        `hover:text-ink ${flush ? "" : "min-[900px]:-mt-3"} min-[900px]:text-[16px] ` +
        "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
      }
    >
      <ChevronLeftIcon />
      {children}
    </Link>
  );
}

export default BackLink;
