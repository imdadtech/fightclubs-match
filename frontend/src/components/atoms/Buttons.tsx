import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "urgent" | "subtle";
export type ButtonSize = "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary : une seule par écran. urgent : une seule par écran. */
  variant?: ButtonVariant;
  /** lg : hauteur 52 px, texte 16 px (barre d'actions des formulaires). */
  size?: ButtonSize;
  /** Sans ombre dure ni déplacement (ex. « Précédent » dans l'onboarding). */
  flat?: boolean;
}

const base =
  "inline-flex items-center justify-center font-sans " +
  "cursor-pointer select-none transition-[transform,box-shadow] duration-100 " +
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink";

const sizes: Record<ButtonSize, string> = {
  md: "px-5 py-3 text-body-strong",
  lg: "min-h-13 text-[16px] font-bold",
};

// Boutons à bordure ink 2 px + ombre dure ; survol : 1 px haut/gauche,
// appui : 2 px bas/droite avec une ombre plus courte.
const solid = "rounded-pill border-2 border-ink";
const raised =
  "shadow-poster " +
  "hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_0_var(--color-ink)] " +
  "active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_var(--color-ink)]";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-corner-red text-on-red",
  secondary: "bg-surface-raised text-ink",
  urgent: "bg-tape text-on-tape",
  subtle: "bg-transparent text-red-deep underline underline-offset-4 hover:decoration-2",
};

// Désactivé : fond sunken, bordure line-strong, sans ombre ni déplacement.
const disabledSolid =
  "rounded-pill border-2 border-line-strong bg-surface-sunken text-ink-muted " +
  "shadow-none cursor-not-allowed";
const disabledSubtle = "text-ink-muted underline underline-offset-4 cursor-not-allowed";

function Button({
  variant = "primary",
  size = "md",
  flat = false,
  type = "button",
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const subtle = variant === "subtle";
  const style = disabled
    ? subtle
      ? disabledSubtle
      : disabledSolid
    : subtle
      ? variants.subtle
      : `${solid} ${variants[variant]} ${flat ? "" : raised}`;
  const sizeClass = subtle ? "px-1 py-1 text-body-strong" : sizes[size];

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${sizeClass} ${style} ${className}`.trim()}
      {...props}
    />
  );
}

export default Button;
