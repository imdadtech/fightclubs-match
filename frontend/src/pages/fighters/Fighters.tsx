import { useState } from "react";
import Button, { ButtonLink } from "../../components/atoms/Buttons";
import EmptyState from "../../components/molecules/EmptyState";
import FighterCard from "../../components/molecules/FighterCard";
import Modal from "../../components/molecules/Modal";
import PageHeader from "../../components/molecules/PageHeader";
import StateMessage from "../../components/molecules/StateMessage";
import { createInvite } from "../../lib/fighters";
import { useAuth } from "../auth/useAuth";
import ClubShell from "../search/ClubShell";
import { useSearch } from "../search/useSearch";

type Invite = { status: "creating" } | { status: "error" } | { status: "ready"; url: string };

const linkButton =
  "inline-flex min-h-11 cursor-pointer items-center self-start bg-transparent p-0 font-sans text-[15px] font-bold " +
  "text-red-deep hover:text-ink min-[900px]:text-[16px] " +
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink";

const NEW_FIGHTER = "/profil/combattants/nouveau";

/** « Mes combattants » : la liste des fiches du club, l'ajout, et le lien à envoyer à un combattant. */
function Fighters() {
  const { load, fighters } = useSearch();
  const { auth } = useAuth();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [copied, setCopied] = useState(false);

  const clubName = (auth.status === "signed-in" && auth.user.club?.name) || fighters[0]?.club.name;
  const count = `${fighters.length} combattant${fighters.length > 1 ? "s" : ""}`;
  const subtitle = load.status === "ready" ? [clubName, count].filter(Boolean).join(" · ") : clubName;

  const openInvite = () => {
    setCopied(false);
    setInvite({ status: "creating" });
    createInvite().then(
      ({ url }) => setInvite({ status: "ready", url }),
      () => setInvite({ status: "error" }),
    );
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Presse-papiers indisponible : le lien reste sélectionnable dans le champ.
      document.querySelector<HTMLInputElement>("#invite-url")?.select();
    }
  };

  return (
    <ClubShell
      mobileLogo
      mobileActions={
        <ButtonLink to={NEW_FIGHTER} size="lg" className="w-full">
          Ajouter un combattant
        </ButtonLink>
      }
    >
      <div className="min-[900px]:flex min-[900px]:items-end min-[900px]:justify-between min-[900px]:gap-6">
        <PageHeader title="Mes combattants" subtitle={subtitle} />
        <div className="hidden flex-none min-[900px]:block">
          <ButtonLink to={NEW_FIGHTER} size="lg" className="px-8">
            Ajouter un combattant
          </ButtonLink>
        </div>
      </div>

      {load.status === "loading" && <StateMessage>Chargement de tes combattants…</StateMessage>}
      {load.status === "error" && <StateMessage alert>Impossible de charger tes combattants. Recharge la page.</StateMessage>}
      {load.status === "ready" && fighters.length === 0 && (
        <EmptyState title="Ton ring est vide">
          Ajoute ton premier combattant, ou envoie-lui un lien pour qu'il remplisse sa fiche.
        </EmptyState>
      )}
      {fighters.length > 0 && (
        <div className="flex flex-col gap-3.5 min-[900px]:grid min-[900px]:grid-cols-3 min-[900px]:gap-5">
          {fighters.map((fighter) => (
            <FighterCard key={fighter.id} fighter={fighter} />
          ))}
        </div>
      )}

      <button type="button" className={linkButton} onClick={openInvite}>
        Ou envoie un lien au combattant
      </button>

      <Modal
        open={invite !== null}
        onClose={() => setInvite(null)}
        title="Lien pour le combattant"
        footer={
          <>
            <Button variant="secondary" onClick={() => setInvite(null)}>
              Fermer
            </Button>
            {invite?.status === "ready" && <Button onClick={() => void copy(invite.url)}>{copied ? "Lien copié ✓" : "Copier le lien"}</Button>}
          </>
        }
      >
        {invite?.status === "creating" && <StateMessage>Création du lien…</StateMessage>}
        {invite?.status === "error" && <StateMessage alert>Impossible de créer le lien. Réessaie dans un instant.</StateMessage>}
        {invite?.status === "ready" && (
          <div className="flex flex-col gap-3">
            <p className="m-0 text-[15px] leading-5.5 text-ink-muted">
              Envoie ce lien à ton combattant : il remplit sa fiche sans créer de compte. Le lien ne fonctionne qu'une fois et expire dans 14 jours.
            </p>
            <input id="invite-url" readOnly aria-label="Lien à envoyer" value={invite.url} onFocus={(e) => e.currentTarget.select()} />
          </div>
        )}
      </Modal>
    </ClubShell>
  );
}

export default Fighters;
