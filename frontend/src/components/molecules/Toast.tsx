import { useEffect } from "react";

type ToastProps = {
  message: string;
  onClose: () => void;
  /** Durée d'affichage en ms avant fermeture automatique. */
  duration?: number;
};

/** Notification éphémère, en bas de l'écran. Se ferme seule ou au clic sur « Fermer ». */
function Toast({ message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        role="alert"
        className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl border-2 border-ink bg-surface-raised px-4 py-3 shadow-[4px_4px_0_0_var(--color-ink)]"
      >
        <p className="m-0 flex-1 text-[15px] leading-5 font-bold text-ink">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 cursor-pointer bg-transparent p-0 text-[14px] font-bold text-red-deep underline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

export default Toast;
