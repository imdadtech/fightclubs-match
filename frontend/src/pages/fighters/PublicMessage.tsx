import type { ReactNode } from "react";
import AppLogo from "../../components/atoms/AppLogo";

interface PublicMessageProps {
  /** `success` : pastille verte avec ✓ (fiche envoyée) ; `neutral` : message seul (lien invalide). */
  tone: "success" | "neutral";
  title: string;
  children: ReactNode;
}

/** Écran plein page du parcours par lien (confirmation, lien expiré…), sans navigation. */
function PublicMessage({ tone, title, children }: PublicMessageProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <div className="flex-none px-4 pt-5 min-[900px]:px-12 min-[900px]:py-10">
        <AppLogo className="text-[22px] min-[900px]:text-[26px]" />
      </div>
      <main className="flex flex-1 flex-col items-start gap-4 px-4 pt-14 min-[900px]:justify-center min-[900px]:gap-5 min-[900px]:pt-0 min-[900px]:pr-12 min-[900px]:pb-40 min-[900px]:pl-40">
        {tone === "success" && (
          <span
            aria-hidden="true"
            className="grid size-16 place-items-center rounded-full bg-success text-[32px] font-extrabold text-on-success min-[900px]:size-20 min-[900px]:text-[40px]"
          >
            ✓
          </span>
        )}
        <h1 className="m-0 font-display text-[32px] leading-[34px] font-black min-[900px]:max-w-180 min-[900px]:text-[64px] min-[900px]:leading-16 min-[900px]:tracking-[-0.02em]">
          {title}
        </h1>
        <p role="status" className="m-0 text-[16px] leading-6 text-ink-muted min-[900px]:max-w-130 min-[900px]:text-[18px] min-[900px]:leading-7">
          {children}
        </p>
      </main>
    </div>
  );
}

export default PublicMessage;
