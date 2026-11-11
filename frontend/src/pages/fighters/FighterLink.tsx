import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAsync } from "../../hooks/useAsync";
import { ApiError } from "../../lib/api";
import { getInvite, submitInvite } from "../../lib/fighters";
import FighterFormFlow from "./FighterFormFlow";
import PublicMessage from "./PublicMessage";

/** Page publique (sans compte) : le combattant remplit sa fiche via le lien envoyé par son club. */
function FighterLink() {
  const { token = "" } = useParams();
  const invite = useAsync(() => getInvite(token), token);
  const [sent, setSent] = useState<{ firstName: string; clubName: string } | null>(null);

  if (sent) {
    return (
      <PublicMessage tone="success" title={`Merci ${sent.firstName}, ta fiche est envoyée`}>
        {sent.clubName} la reçoit et pourra te proposer des combats. Tu peux fermer cette page.
      </PublicMessage>
    );
  }
  if (invite.status === "loading") {
    return (
      <PublicMessage tone="neutral" title="Un instant…">
        Chargement de ta fiche.
      </PublicMessage>
    );
  }
  if (invite.status === "error") {
    const status = invite.error instanceof ApiError ? invite.error.status : 0;
    if (status === 404) {
      return (
        <PublicMessage tone="neutral" title="Ce lien n'existe pas">
          Vérifie l'adresse, ou demande un nouveau lien à ton club.
        </PublicMessage>
      );
    }
    if (status === 410) {
      return (
        <PublicMessage tone="neutral" title="Ce lien n'est plus valable">
          Il a déjà été utilisé ou il a expiré. Demande un nouveau lien à ton club.
        </PublicMessage>
      );
    }
    return (
      <PublicMessage tone="neutral" title="Impossible de charger la page">
        Réessaie dans un instant.
      </PublicMessage>
    );
  }

  return (
    <FighterFormFlow
      variant="link"
      clubName={invite.data.clubName}
      onSubmit={async (input) => setSent(await submitInvite(token, input))}
    />
  );
}

export default FighterLink;
