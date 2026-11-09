import { useState } from "react";
import Button from "../../../components/atoms/Buttons";
import Modal from "../../../components/molecules/Modal";
import { PrivacyText, TermsText } from "./LegalTexts";

export type LegalDoc = "terms" | "privacy";

interface TermsModalProps {
  /** Document à afficher en premier ; null = modale fermée. */
  open: LegalDoc | null;
  onClose: () => void;
  onAccept: () => void;
}

const TABS: { id: LegalDoc; label: string }[] = [
  { id: "terms", label: "Conditions d'utilisation" },
  { id: "privacy", label: "Politique de confidentialité" },
];

function TermsModal({ open, onClose, onAccept }: TermsModalProps) {
  // L'onglet suit le lien cliqué ; l'utilisateur peut ensuite changer d'onglet.
  const [tab, setTab] = useState<LegalDoc>("terms");
  const [lastOpen, setLastOpen] = useState<LegalDoc | null>(null);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setTab(open);
  }

  return (
    <Modal
      open={open !== null}
      onClose={onClose}
      title="Conditions et confidentialité"
      footer={
        <>
          <Button variant="subtle" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={onAccept}>Accepter</Button>
        </>
      }
    >
      <div role="tablist" className="mb-4 flex flex-wrap gap-2">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={
              "min-h-11 cursor-pointer rounded-pill border-2 border-ink px-4 text-[14px] font-bold " +
              "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink " +
              (tab === id ? "bg-ink text-surface-raised" : "bg-surface-raised text-ink")
            }
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{tab === "terms" ? <TermsText /> : <PrivacyText />}</div>
    </Modal>
  );
}

export default TermsModal;
