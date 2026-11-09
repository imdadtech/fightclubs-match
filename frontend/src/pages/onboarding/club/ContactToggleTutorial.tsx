import Button from "../../../components/atoms/Buttons";
import { useSeenOnce } from "../../../hooks/useSeenOnce";

const STORAGE_KEY = "fightclubs:tuto-contact-toggle-seen";

/** Petit tuto affiché une seule fois : à quoi servent les interrupteurs de contact. */
function ContactToggleTutorial({ className = "" }: { className?: string }) {
  const [seen, markSeen] = useSeenOnce(STORAGE_KEY);
  if (seen) return null;

  return (
    <div
      role="note"
      className={`flex flex-col gap-1.5 rounded-2xl border-2 border-ink bg-tape-tint px-3.5 py-3 ${className}`}
    >
      <p className="m-0 text-[15px] leading-5 font-bold">À quoi servent les interrupteurs ?</p>
      <p className="m-0 text-[14px] leading-5">
        Ils choisissent comment l'autre club te joint une fois le combat accepté. Un moyen activé est partagé, un moyen
        désactivé reste caché. Garde-en au moins un actif.
      </p>
      <Button variant="subtle" className="min-h-11 self-start" onClick={markSeen}>
        Compris
      </Button>
    </div>
  );
}

export default ContactToggleTutorial;
