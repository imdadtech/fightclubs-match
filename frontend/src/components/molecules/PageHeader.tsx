import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  /** Sous-titre ; `desktopOnly` le masque sur mobile. */
  subtitle?: ReactNode;
  subtitleDesktopOnly?: boolean;
  /** Titre masqué sur mobile (la fiche n'a qu'un lien retour). */
  desktopOnly?: boolean;
  children?: ReactNode;
}

function PageHeader({ title, subtitle, subtitleDesktopOnly, desktopOnly, children }: PageHeaderProps) {
  return (
    <div className={desktopOnly ? "hidden min-[900px]:block" : undefined}>
      <h1 className="m-0 font-display text-[30px] leading-8 font-black tracking-[-0.01em] min-[900px]:text-[44px] min-[900px]:leading-11 min-[900px]:tracking-[-0.02em]">
        {title}
      </h1>
      {subtitle && (
        <p
          className={
            "mt-1.5 mb-0 text-[14px] leading-5 text-ink-muted min-[900px]:mt-2 min-[900px]:text-[17px] min-[900px]:leading-normal " +
            (subtitleDesktopOnly ? "hidden min-[900px]:block" : "")
          }
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

export default PageHeader;
