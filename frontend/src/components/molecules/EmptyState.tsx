/** Illustration « ring vide » : un combattant en pointillés à ajouter entre les cordes. */
function EmptyRingIllustration() {
  return (
    <svg
      viewBox="0 0 220 140"
      className="h-auto w-[200px] min-[900px]:w-[240px]"
      aria-hidden="true"
      fill="none"
    >
      {/* Tapis */}
      <rect
        x="14"
        y="108"
        width="192"
        height="12"
        rx="6"
        fill="var(--color-surface-sunken)"
        stroke="var(--color-ink)"
        strokeWidth="2"
      />
      {/* Poteaux */}
      <path
        d="M30 108V34M190 108V34"
        stroke="var(--color-ink)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Cordes */}
      <path
        d="M30 46H190"
        stroke="var(--color-red-deep)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M30 66H190"
        stroke="var(--color-ink)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M30 86H190"
        stroke="var(--color-red-deep)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Combattant à venir */}
      <circle
        cx="110"
        cy="58"
        r="22"
        fill="var(--color-surface-raised)"
        stroke="var(--color-line-strong)"
        strokeWidth="2.5"
        strokeDasharray="5 5"
      />
      {/* Plus */}
      <circle
        cx="110"
        cy="58"
        r="12"
        fill="var(--color-red-deep)"
        stroke="var(--color-ink)"
        strokeWidth="2"
      />
      <path
        d="M110 52v12M104 58h12"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** État vide : illustration, titre court et phrase qui dit quoi faire. */
function EmptyState({ title, children }: { title: string; children: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-2xl  px-6 py-8 text-center min-[900px]:gap-4 min-[900px]:py-12"
    >
      <EmptyRingIllustration />
      <h2 className="m-0 font-display text-[20px] leading-6 font-black min-[900px]:text-[24px] min-[900px]:leading-7">
        {title}
      </h2>
      <p className="m-0 max-w-[34ch] text-[15px] leading-5.5 text-ink-muted">
        {children}
      </p>
    </div>
  );
}

export default EmptyState;
