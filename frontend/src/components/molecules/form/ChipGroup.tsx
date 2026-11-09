interface ChipGroupProps {
  label: string;
  hint?: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  /** Message d'erreur de validation. */
  error?: string;
}

function ChipGroup({ label, hint, options, value, onChange, className = "", error }: ChipGroupProps) {
  const toggle = (option: string) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <span className="text-[13px] font-bold">
        {label}
        {hint && <span className="font-medium text-ink-muted"> {hint}</span>}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(option)}
              className={
                "min-h-11 cursor-pointer rounded-pill border-2 px-4 font-sans text-[14px] font-semibold " +
                "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink " +
                (selected
                  ? "border-ink bg-ink text-canvas"
                  : "border-line-strong bg-surface-raised text-ink")
              }
            >
              {selected ? `✓ ${option}` : option}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="m-0 text-[14px] leading-5 font-bold text-red-deep">
          {error}
        </p>
      )}
    </div>
  );
}

export default ChipGroup;
