import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import AppLogo from "../atoms/AppLogo";
import { BellIcon, MegaphoneIcon, ProfileIcon, SearchIcon } from "../atoms/NavIcons";

const links = [
  { to: "/adversaires", label: "Adversaires", icon: <SearchIcon /> },
  { to: "/annonces", label: "Annonces", icon: <MegaphoneIcon /> },
  { to: "/notifications", label: "Notifications", icon: <BellIcon /> },
  { to: "/profil", label: "Profil", icon: <ProfileIcon /> },
];

const focus = "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink";

interface AppShellProps {
  children: ReactNode;
  /** Nom du club affiché en bas de la barre latérale. */
  clubName?: string;
  /** Écart entre les blocs sur mobile (défaut 14 px). */
  mobileGap?: "gap-3.5" | "gap-4";
  /** Haut du contenu mobile : 20 px, ou 12 px quand l'écran commence par un lien retour. */
  compactTop?: boolean;
  /** Barre d'action mobile (blanche, bordure haute) ; elle remplace la barre d'onglets si `hideTabs`. */
  mobileActions?: ReactNode;
  mobileActionsClassName?: string;
  hideTabs?: boolean;
  /** Barre d'action desktop, au bas du contenu. */
  desktopActions?: ReactNode;
  /** Logo en tête du contenu sur mobile (écrans de la fiche combattant). */
  mobileLogo?: boolean;
}

/**
 * Cadre des écrans du club connecté.
 * Mobile (< 900 px) : contenu défilant + barre d'action + onglets en bas.
 * Desktop : barre latérale de 260 px + contenu.
 */
function AppShell({
  children,
  clubName,
  mobileGap = "gap-3.5",
  compactTop,
  mobileActions,
  mobileActionsClassName = "pb-4",
  hideTabs,
  desktopActions,
  mobileLogo,
}: AppShellProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas text-ink min-[900px]:flex-row">
      <aside className="hidden w-65 flex-none flex-col gap-6 border-r border-line bg-surface-raised px-5 py-8 min-[900px]:flex">
        <AppLogo className="pl-3.5 text-[24px]" />
        <nav className="flex flex-col gap-1.5" aria-label="Navigation principale">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-md px-3.5 text-[16px] no-underline ${focus} ` +
                (isActive ? "bg-red-tint font-bold text-red-deep hover:text-red-deep" : "font-semibold text-ink hover:text-ink")
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>
        {clubName && <div className="mt-auto px-3.5 text-[13px] leading-4.5 text-ink-muted">{clubName}</div>}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <main
          className={
            `flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 ${mobileGap} ${compactTop ? "pt-3" : "pt-5"} ` +
            "min-[900px]:gap-6 min-[900px]:px-14 min-[900px]:pt-10 min-[900px]:pb-6"
          }
        >
          {mobileLogo && <AppLogo className="flex-none text-[22px] min-[900px]:hidden" />}
          {children}
        </main>

        {mobileActions && (
          <div className={`flex-none border-t border-line bg-surface-raised px-4 pt-3 min-[900px]:hidden ${mobileActionsClassName}`}>
            {mobileActions}
          </div>
        )}
        {desktopActions && (
          <div className="mx-14 mb-10 hidden items-center justify-end gap-3.5 border-t border-line pt-4 min-[900px]:flex">
            {desktopActions}
          </div>
        )}

        {!hideTabs && (
          <nav
            className="flex flex-none border-t border-line bg-surface-raised pb-1 min-[900px]:hidden"
            aria-label="Navigation principale"
          >
            {links.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex min-h-15 flex-1 flex-col items-center justify-center gap-1 text-[12px] no-underline ${focus} ` +
                  (isActive
                    ? "-mt-px border-t-[3px] border-corner-red font-bold text-ink hover:text-ink"
                    : "font-semibold text-ink-muted hover:text-ink-muted")
                }
              >
                {icon}
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

export default AppShell;
