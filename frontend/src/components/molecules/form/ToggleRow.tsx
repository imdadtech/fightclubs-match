interface ToggleRowProps {
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

function ToggleRow({ title, subtitle, checked, onChange, className = "", disabled = false }: ToggleRowProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-line bg-surface-raised px-3.5 py-3 ${disabled ? "opacity-60" : ""} ${className}`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[15px] leading-5 font-bold">{title}</div>
        <div className="text-[12px] leading-4 text-ink-muted">{subtitle}</div>
      </div>
      <button
        type="button"
        role="switch"
        disabled={disabled}
        aria-checked={checked}
        aria-label={`${title} : ${checked ? "activé" : "désactivé"}`}
        onClick={() => onChange(!checked)}
        className={
          "relative h-7 w-12 flex-none cursor-pointer disabled:cursor-not-allowed rounded-pill " +
          "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink " +
          (checked && !disabled ? "bg-success" : "bg-line-strong")
        }
      >
        <span
          className={`absolute top-[3px] size-[22px] rounded-full bg-surface-raised ${
            checked ? "right-[3px]" : "left-[3px]"
          }`}
        />
      </button>
    </div>
  );
}

export default ToggleRow;
