import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  active: boolean;
  children: string;
}

/** Puce de choix : active = fond ink, coche en préfixe ; inactive = fond blanc, bordure line-strong. */
function Chip({ active, children, className = "", type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={
        "min-h-11 flex-none cursor-pointer rounded-pill border-2 px-4 font-sans text-[14px] font-semibold " +
        "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink " +
        (active ? "border-ink bg-ink text-canvas" : "border-line-strong bg-surface-raised text-ink") +
        (className ? ` ${className}` : "")
      }
      {...props}
    >
      {active ? `✓ ${children}` : children}
    </button>
  );
}

export default Chip;
