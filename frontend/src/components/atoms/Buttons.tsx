import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { Link } from "react-router-dom";
import { buttonClasses } from "./buttonClasses";
import type { StyleOptions } from "./buttonClasses";

export type { ButtonSize, ButtonVariant } from "./buttonClasses";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Omit<StyleOptions, "disabled"> {}

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
