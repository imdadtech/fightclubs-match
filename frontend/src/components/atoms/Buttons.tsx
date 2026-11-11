import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { Link } from "react-router-dom";

export type ButtonVariant = "primary" | "secondary" | "urgent" | "subtle" | "confirm" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface StyleOptions {
  /** primary : une seule par écran. urgent : une seule par écran. */
  variant?: ButtonVariant;
  /**
   * sm : 44 px, texte 14 px, ombre 3 px (boutons de carte).
   * lg : 52 px, texte 16 px (barre d'actions des formulaires).
   */
  size?: ButtonSize;
  /** Sans ombre dure ni déplacement (ex. « Précédent » dans l'onboarding). */
  flat?: boolean;
  disabled?: boolean;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Omit<StyleOptions, "disabled"> {}

const base =
  "inline-flex items-center justify-center font-sans no-underline " +
  "cursor-pointer select-none transition-[transform,box-shadow] duration-100 " +
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink";

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-[14px]",
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
const raisedSmall =
  "shadow-[3px_3px_0_0_var(--color-ink)] " +
  "hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_0_var(--color-ink)] " +
  "active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--color-ink)]";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-corner-red text-on-red font-bold",
  secondary: "bg-surface-raised text-ink font-bold",
  urgent: "bg-tape text-on-tape font-bold",
  // Confirmation d'un combat déjà accepté (même forme que le principal).
  confirm: "bg-success text-on-success font-bold",
  subtle: "bg-transparent text-red-deep underline underline-offset-4 hover:decoration-2",
  // Refus discret des cartes de notification : pilule à bordure line-strong, sans ombre.
  ghost: "rounded-pill border-2 border-line-strong bg-surface-raised text-ink font-semibold",
};

// Désactivé : fond sunken, bordure line-strong, sans ombre ni déplacement.
const disabledSolid =
  "rounded-pill border-2 border-line-strong bg-surface-sunken text-ink-muted " +
  "shadow-none cursor-not-allowed";
const disabledSubtle = "text-ink-muted underline underline-offset-4 cursor-not-allowed";

/** Classes d'un bouton : partagées par `Button` (action) et `ButtonLink` (navigation). */
export function buttonClasses({ variant = "primary", size = "md", flat = false, disabled }: StyleOptions) {
  const subtle = variant === "subtle";
  const ghost = variant === "ghost";
  const shadow = flat || ghost ? "" : size === "sm" ? raisedSmall : raised;
  const style = disabled
    ? subtle
      ? disabledSubtle
      : disabledSolid
    : subtle || ghost
      ? variants[variant]
      : `${solid} ${variants[variant]} ${shadow}`;
  const sizeClass = subtle ? "px-1 py-1 text-body-strong" : sizes[size];
  return `${base} ${sizeClass} ${style}`;
}

function Button({
  variant,
  size,
  flat,
  type = "button",
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${buttonClasses({ variant, size, flat, disabled })} ${className}`.trim()}
      {...props}
    />
  );
}

export type ButtonLinkProps = ComponentProps<typeof Link> & Omit<StyleOptions, "disabled">;

/** Lien qui a l'apparence d'un bouton (navigation vers un autre écran). */
export function ButtonLink({ variant, size, flat, className = "", ...props }: ButtonLinkProps) {
  return <Link className={`${buttonClasses({ variant, size, flat })} ${className}`.trim()} {...props} />;
}

export default Button;
