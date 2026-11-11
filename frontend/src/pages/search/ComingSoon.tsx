import PageHeader from "../../components/molecules/PageHeader";
import StateMessage from "../../components/molecules/StateMessage";
import ClubShell from "./ClubShell";

/** Écrans de la navigation pas encore construits (Annonces, Profil). */
function ComingSoon({ title }: { title: string }) {
  return (
    <ClubShell>
      <PageHeader title={title} />
      <StateMessage>Cet écran arrive bientôt.</StateMessage>
    </ClubShell>
  );
}

export default ComingSoon;
