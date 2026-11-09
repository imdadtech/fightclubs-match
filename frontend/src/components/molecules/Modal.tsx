import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Barre d'actions en bas (boutons). */
  footer: ReactNode;
}

/** Modale basée sur <dialog> natif : focus piégé, Échap, retour du focus à la fermeture. */
function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        // Clic sur le fond (hors du contenu) : fermer.
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(640px,calc(100vw-32px))] rounded-3xl border-2 border-ink bg-surface-raised p-0 text-ink shadow-[6px_6px_0_0_var(--color-ink)] backdrop:bg-ink/60"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <h2 className="m-0 border-b border-line px-5 pt-5 pb-3 font-display text-[24px] leading-7 font-black">{title}</h2>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-5 py-4">{footer}</div>
      </div>
    </dialog>
  );
}

export default Modal;
